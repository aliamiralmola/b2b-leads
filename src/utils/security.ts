import { headers } from "next/headers";

export async function verifyOrigin() {
    const headersList = await headers();
    const origin = headersList.get("origin");
    const host = headersList.get("host");

    // In production, ensure origin matches the host
    // Note: host doesn't include protocol, origin does.
    if (process.env.NODE_ENV === "production" && origin) {
        const url = new URL(origin);
        if (url.host !== host) {
            throw new Error("CSRF Protection: Origin mismatch.");
        }
    }
}
