"use server";

import { createClient } from "@/utils/supabase/server";
import { verifyOrigin } from "@/utils/security";
import { ethers } from "ethers";
import { revalidatePath } from "next/cache";

// Polygon RPC
const RPC_URL = "https://polygon-rpc.com/";

// Standard ERC20 ABI to decode transfer events
const ERC20_ABI = [
    "event Transfer(address indexed from, address indexed to, uint256 value)"
];

// USDT Contract on Polygon
const USDT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F".toLowerCase();

// Polygon USDT has 6 decimals
const USDT_DECIMALS = 6;

// How many credits per $1 USD
const CREDITS_PER_USD = 10;

export async function verifyCrossChainPayment(txHash: string) {
    await verifyOrigin();
    const supabase = await createClient();

    // 1. Verify Authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, message: "Unauthorized. Please log in." };
    }

    // 1.2 Rate Limiting
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count: attemptCount, error: countError } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gt('created_at', tenMinutesAgo);

    if (!countError && attemptCount !== null && attemptCount >= 5) {
        return { success: false, message: "Too many verification attempts. Please wait." };
    }

    // 2. Ensure we have the admin wallet address configured
    const adminWallet = (process.env.ADMIN_WALLET_ADDRESS || process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS)?.toLowerCase();
    if (!adminWallet) {
        return { success: false, message: "System misconfiguration: Admin wallet not set." };
    }

    // 2.5 Validate txHash format
    const txHashRegex = /^0x[a-fA-F0-9]{64}$/;
    if (!txHashRegex.test(txHash)) {
        return { success: false, message: "Invalid transaction hash format." };
    }

    try {
        // 3. Connect to Polygon RPC
        const provider = new ethers.JsonRpcProvider(RPC_URL);

        // 4. Fetch Transaction Receipt
        const receipt = await provider.getTransactionReceipt(txHash);

        if (!receipt) {
            return { success: false, message: "Transaction not found on Polygon network." };
        }

        if (receipt.status !== 1) {
            return { success: false, message: "Transaction failed on the network." };
        }

        // 5. Parse Logs to find the USDT Transfer to Admin Wallet
        const iface = new ethers.Interface(ERC20_ABI);
        let usdtReceived = 0n;

        for (const log of receipt.logs) {
            // Check if log is from the USDT contract
            if (log.address.toLowerCase() === USDT_ADDRESS) {
                try {
                    const parsedLog = iface.parseLog({
                        topics: log.topics as string[],
                        data: log.data
                    });

                    if (parsedLog && parsedLog.name === "Transfer") {
                        const toAddress = parsedLog.args[1].toLowerCase();

                        // Check if the transfer was to the admin wallet
                        if (toAddress === adminWallet) {
                            usdtReceived += BigInt(parsedLog.args[2]);
                        }
                    }
                } catch (e) {
                    // Ignore logs that don't parse as Transfer events
                }
            }
        }

        if (usdtReceived === 0n) {
            return { success: false, message: "No USDT received to the admin wallet." };
        }

        // 6. Calculate USD Value and Credits
        // USDT on Polygon has 6 decimals
        const usdValue = Number(ethers.formatUnits(usdtReceived, USDT_DECIMALS));
        const creditsToAdd = Math.floor(usdValue * CREDITS_PER_USD);

        if (creditsToAdd <= 0) {
            return { success: false, message: "Transaction amount too small for credits." };
        }

        // 7. Log Payment in Database
        const { error: paymentError } = await supabase
            .from('payments')
            .insert({
                user_id: user.id,
                tx_hash: txHash,
                amount: usdValue,
                plan_name: 'Crypto Top-up',
                status: 'completed'
            });

        if (paymentError) {
            if (paymentError.code === '23505') { // Postgres Unique Violation
                return { success: false, message: "This transaction has already been claimed." };
            }
            console.error("Payment logging error:", paymentError);
            return { success: false, message: "Failed to log payment." };
        }

        // 8. Fetch and Update User Profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('credits')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            return { success: false, message: "User profile not found." };
        }

        const newBalance = profile.credits + creditsToAdd;
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ credits: newBalance })
            .eq('id', user.id);

        if (updateError) {
            return { success: false, message: "Failed to allocate credits." };
        }

        revalidatePath('/dashboard');
        return {
            success: true,
            message: `Successfully processed! Added ${creditsToAdd} credits for $${usdValue.toFixed(2)} USD.`,
            creditsAdded: creditsToAdd,
            usdValue
        };

    } catch (error) {
        console.error("Verification error:", error);
        return { success: false, message: "An error occurred verifying the transaction." };
    }
}
