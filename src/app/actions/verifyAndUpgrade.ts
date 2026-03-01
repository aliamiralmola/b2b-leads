"use server";

import { createClient } from "@/utils/supabase/server";
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

export async function verifyAndUpgrade(txHash: string, planType: string) {
    const supabase = await createClient();

    // 1. Verify Authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, message: "Unauthorized. Please log in." };
    }

    const creditsToAdd = PLAN_CREDITS[planType];
    const planPrice = PLAN_PRICES[planType];
    const adminWallet = process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS?.toLowerCase();

    if (!creditsToAdd || !planPrice) {
        return { success: false, message: "Invalid plan type." };
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
        const { data: profile } = await supabase.from('profiles').select('credits').eq('id', user.id).single();
        const newBalance = (profile?.credits || 0) + creditsToAdd;

        const { error: updateError } = await supabase
            .from('profiles')
            .update({ credits: newBalance })
            .eq('id', user.id);

        if (updateError) {
            return { success: false, message: "Failed to allocate credits." };
        }

        // 6. Handle Affiliate
        const cookieStore = await cookies();
        const referralCookie = cookieStore.get('referral');
        if (referralCookie?.value) {
            const { data: affiliate } = await supabase.from('affiliates').select('*').eq('referral_code', referralCookie.value).single();
            if (affiliate) {
                const commission = amountReceived * 0.5;
                await supabase.from('affiliates').update({
                    earnings: (affiliate.earnings || 0) + commission,
                    signups_count: (affiliate.signups_count || 0) + 1
                }).eq('id', affiliate.id);
            }
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
