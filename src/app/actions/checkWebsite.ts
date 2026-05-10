"use server";

export async function checkWebsiteAvailability(url: string): Promise<boolean> {
    if (!url) return false;

    let target = url;
    if (!target.startsWith('http')) {
        target = `http://${target}`;
    }

    try {
        const parsedUrl = new URL(target);
        if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
            return false;
        }

        const hostname = parsedUrl.hostname;

        // SSRF Protection: Block localhost, private IPs, and AWS metadata
        const blockedPatterns = [
            /^localhost$/i,
            /^127\.\d+\.\d+\.\d+$/,
            /^169\.254\.\d+\.\d+$/,
            /^10\.\d+\.\d+\.\d+$/,
            /^192\.168\.\d+\.\d+$/,
            /^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/,
            /\[::1\]/,
            /0\.0\.0\.0/
        ];

        if (blockedPatterns.some(pattern => pattern.test(hostname))) {
            console.warn(`SSRF Blocked: Attempted access to restricted hostname: ${hostname}`);
            return false;
        }

    } catch (error) {
        return false; // Invalid URL
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

        const response = await fetch(target, {
            method: 'HEAD',
            signal: controller.signal,
            cache: 'no-store'
        });

        clearTimeout(timeoutId);
        return response.ok;
    } catch (error) {
        console.warn(`Website check failed for ${url}:`, error);
        return false;
    }
}
