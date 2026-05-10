"use server";

import { createClient } from "@/utils/supabase/server";
import { verifyOrigin } from "@/utils/security";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ethers } from "ethers";

// Polygon RPC
const RPC_URL = "https://polygon-rpc.com/";

// Standard ERC20 ABI to decode transfer events
const ERC20_ABI = [
    "event Transfer(address indexed from, address indexed to, uint256 value)"
];

// USDT Contract on Polygon
const USDT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F".toLowerCase();
const USDT_DECIMALS = 6;

const PLAN_CREDITS: Record<string, number> = {
    "Starter": 250,
    "Growth": 1000,
    "Scale": 2500,
    "Enterprise": 5000
};

const PLAN_PRICES: Record<string, number> = {
    "Starter": 19,
    "Growth": 49,
    "Scale": 99,
    "Enterprise": 199
};

const AFFILIATE_COMMISSION_PERCENT = 0.40; // 40% commission recurring

export async function verifyAndUpgrade(txHash: string, planType: string, billingCycle: 'monthly' | 'annual' = 'monthly') {
    await verifyOrigin();
    const supabase = await createClient();

    // 1. Verify Authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, message: "Unauthorized. Please log in." };
    }

    // 1.2 Rate Limiting (Prevent brute-force)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count: attemptCount, error: countError } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gt('created_at', tenMinutesAgo);

    if (!countError && attemptCount !== null && attemptCount >= 5) {
        return { success: false, message: "Too many verification attempts. Please wait." };
    }

    const creditsToAdd = PLAN_CREDITS[planType];
    let planPrice = PLAN_PRICES[planType];

    // Apply 20% discount for annual billing (price is per month, total paid is 12 * month * 0.8)
    if (billingCycle === 'annual') {
        planPrice = Math.floor(planPrice * 12 * 0.8);
    }
    const adminWallet = process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS?.toLowerCase();

    if (!creditsToAdd || !planPrice) {
        return { success: false, message: "Invalid plan type." };
    }

    // 1.5 Validate txHash format
    const txHashRegex = /^0x[a-fA-F0-9]{64}$/;
    if (!txHashRegex.test(txHash)) {
        return { success: false, message: "Invalid transaction hash format." };
    }

    if (!adminWallet) {
        return { success: false, message: "System misconfiguration: Admin wallet not set." };
    }

    try {
        // 2. On-Chain Verification
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const receipt = await provider.getTransactionReceipt(txHash);

        if (!receipt || receipt.status !== 1) {
            return { success: false, message: "Transaction failed or not found on-chain." };
        }

        // Parse logs for USDT transfer
        const iface = new ethers.Interface(ERC20_ABI);
        let usdtReceived = 0n;

        for (const log of receipt.logs) {
            if (log.address.toLowerCase() === USDT_ADDRESS) {
                try {
                    const parsedLog = iface.parseLog({ topics: log.topics as string[], data: log.data });
                    if (parsedLog && parsedLog.name === "Transfer") {
                        const toAddress = parsedLog.args[1].toLowerCase();
                        if (toAddress === adminWallet) {
                            usdtReceived += BigInt(parsedLog.args[2]);
                        }
                    }
                } catch (e) { /* ignore non-transfer logs */ }
            }
        }

        const amountReceived = Number(ethers.formatUnits(usdtReceived, USDT_DECIMALS));

        // 3. Tolerance Logic
        // 2% for <= $100, 1% for > $100
        const tolerancePercent = planPrice <= 100 ? 0.02 : 0.01;
        const minAllowed = planPrice * (1 - tolerancePercent);

        if (amountReceived < minAllowed) {
            return {
                success: false,
                message: `Insufficient amount received. Expected ~$${planPrice}, but found $${amountReceived.toFixed(2)}.`
            };
        }

        // 4. Log Payment
        const { error: paymentError } = await supabase
            .from('payments')
            .insert({
                user_id: user.id,
                tx_hash: txHash,
                amount: amountReceived,
                plan_name: planType,
                status: 'completed'
            });

        if (paymentError) {
            if (paymentError.code === '23505') {
                return { success: false, message: "This transaction has already been claimed." };
            }
            return { success: false, message: "Failed to log payment. Please contact support." };
        }

        // 5. Update Credits & User Tier
        // Fetch current profile
        // Atomic increment to prevent race conditions
        const { error: updateError } = await supabase
            .rpc('increment_credits', {
                user_id: user.id,
                credits_to_add: creditsToAdd
            });

        // Fallback if RPC doesn't exist
        if (updateError) {
            console.error("Atomic credits increment failed:", updateError);
            const { data: profile } = await supabase.from('profiles').select('credits').eq('id', user.id).single();
            const newBalance = (profile?.credits || 0) + creditsToAdd;
            await supabase
                .from('profiles')
                .update({ credits: newBalance })
                .eq('id', user.id);
        }

        if (updateError) {
            return { success: false, message: "Failed to allocate credits." };
        }

        // 6. Handle Affiliate (Robust Recurring Logic)
        const getAffiliateId = async () => {
            // 1. Check if user is already linked in profile (Recurring)
            const { data: profile } = await supabase.from('profiles').select('referred_by').eq('id', user.id).single();
            if (profile?.referred_by) return profile.referred_by;

            // 2. Check for cookie (First-time purchase)
            const cookieStore = await cookies();
            const referralCookie = cookieStore.get('affiliate_code');
            if (referralCookie?.value) {
                const { data: affiliate } = await supabase.from('affiliates').select('id').eq('referral_code', referralCookie.value).single();
                if (affiliate) {
                    // Permanently link this user to the affiliate for recurring payouts
                    await supabase.from('profiles').update({ referred_by: affiliate.id }).eq('id', user.id);
                    return affiliate.id;
                }
            }
            return null;
        };

        const affiliateId = await getAffiliateId();

        if (affiliateId) {
            const commission = amountReceived * AFFILIATE_COMMISSION_PERCENT;

            // Atomic update for earnings
            const { error: affiliateUpdateError } = await supabase.rpc('record_affiliate_conversion', {
                aff_id: affiliateId,
                commission_amount: commission
            });

            if (affiliateUpdateError) {
                // Fallback manual increment
                const { data: affiliate } = await supabase.from('affiliates').select('earnings').eq('id', affiliateId).single();
                if (affiliate) {
                    await supabase.from('affiliates').update({
                        earnings: (affiliate.earnings || 0) + commission
                    }).eq('id', affiliateId);
                }
            }

            // Record the specific referral payment in the history
            await supabase.from('referrals').insert({
                affiliate_id: affiliateId,
                referred_user_id: user.id,
                referred_email: user.email,
                plan_name: planType,
                amount_paid: amountReceived,
                commission: commission,
                status: 'Active'
            });
        }

        revalidatePath('/dashboard');
        revalidatePath('/dashboard/billing');

        return {
            success: true,
            message: `Successfully upgraded to ${planType}! ${creditsToAdd} credits added.`
        };

    } catch (error) {
        console.error("Verification error:", error);
        return { success: false, message: "An error occurred verifying the transaction." };
    }
}
