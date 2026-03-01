import { verifyCrossChainPayment } from './src/app/actions/verifyCrossChainPayment';

// Note: To successfully run this script, we would need a real transaction hash on Polygon
// where USDT was transferred to the admin wallet. 
// For safety, this simply executes the function to check if it throws early errors
// or handles a fake hash properly.

async function testCryptoPayment() {
    console.log("Starting test-crypto-payment...");

    // Using a dummy hash to see how it handles failure gracefully
    const dummyHash = "0x1234567890123456789012345678901234567890123456789012345678901234";

    try {
        console.log("Verifying dummy hash...");
        const result = await verifyCrossChainPayment(dummyHash);

        console.log("Test execution completed.");
        console.log("Result:", result);

        // We expect success: false since it's a fake hash
        if (!result.success && result.message === "Transaction not found on Polygon network.") {
            console.log("✅ Expected behavior: Handled invalid transaction hash gracefully.");
        } else if (!result.success && result.message.includes("Unauthorized")) {
            console.log("✅ Expected behavior: Handled unauthorized (no Supabase session in script execution) gracefully.");
        } else {
            console.log("⚠️ Unexpected behavior:", result);
        }

    } catch (e) {
        console.error("Test failed with exception:", e);
    }
}

testCryptoPayment();
