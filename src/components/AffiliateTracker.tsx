"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function AffiliateTracker() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const ref = searchParams.get("ref");
        if (ref) {
            console.log("AffiliateTracker: Found ref in URL:", ref);

            // 1. Save to Cookie (Backup to middleware)
            document.cookie = `affiliate_code=${ref}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax; ${window.location.protocol === 'https:' ? 'Secure' : ''}`;

            // 2. Save to LocalStorage (Persistent backup)
            localStorage.setItem("affiliate_code", ref);

            // 3. Save to SessionStorage (Session backup)
            sessionStorage.setItem("affiliate_code", ref);
        }
    }, [searchParams]);

    return null;
}
