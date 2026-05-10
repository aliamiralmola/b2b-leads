'use client';

import * as React from 'react';

/**
 * GlobalLoadingIndicator
 * 
 * Intercepts external link clicks and nav-button interactions and shows
 * a premium animated progress bar + spinning ring at the top of the screen.
 * 
 * Usage: Mount this once in the root layout. It auto-attaches to:
 *   - <a target="_blank"> links (external ones)
 *   - Next.js navigation (via `popstate` + `pushState` shim)
 */
export function GlobalLoadingIndicator() {
    const [loading, setLoading] = React.useState(false);
    const timerRef = React.useRef<NodeJS.Timeout | null>(null);

    const startLoading = React.useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setLoading(true);
        // Auto-hide after 4s as a safety fallback
        timerRef.current = setTimeout(() => setLoading(false), 4000);
    }, []);

    const stopLoading = React.useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setLoading(false), 300);
    }, []);

    React.useEffect(() => {
        // Intercept external link clicks
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const anchor = target.closest('a');
            if (anchor && anchor.target === '_blank' && anchor.href) {
                startLoading();
                // Stop indicator after a brief moment (new tab opens instantly)
                setTimeout(() => stopLoading(), 1500);
            }
        };

        // Intercept Next.js client-side navigation
        const originalPushState = history.pushState.bind(history);
        history.pushState = function (...args) {
            startLoading();
            originalPushState(...args);
        };

        const handlePopState = () => {
            startLoading();
            setTimeout(() => stopLoading(), 600);
        };

        const handleRouteComplete = () => stopLoading();

        document.addEventListener('click', handleClick);
        window.addEventListener('popstate', handlePopState);
        // Listen for page becoming fully visible (after navigation)
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') stopLoading();
        });

        return () => {
            document.removeEventListener('click', handleClick);
            window.removeEventListener('popstate', handlePopState);
            // Restore original pushState
            history.pushState = originalPushState;
        };
    }, [startLoading, stopLoading]);

    if (!loading) return null;

    return (
        <>
            {/* Top progress bar */}
            <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px] overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-[loading-bar_1.5s_ease-in-out_infinite]"
                    style={{ backgroundSize: '200% 100%' }}
                />
            </div>

            {/* Spinning ring overlay indicator (bottom-right corner) */}
            <div className="fixed bottom-6 right-6 z-[9999] pointer-events-none">
                <div className="relative flex items-center justify-center">
                    {/* Outer glow ring */}
                    <div className="absolute h-12 w-12 rounded-full bg-indigo-500/20 animate-ping" />
                    {/* Spinning arc */}
                    <div className="h-10 w-10 rounded-full border-[3px] border-indigo-500/20 border-t-indigo-500 animate-spin" />
                    {/* Center dot */}
                    <div className="absolute h-2.5 w-2.5 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50 animate-pulse" />
                </div>
            </div>

            {/* Keyframes injected via style tag */}
            <style>{`
                @keyframes loading-bar {
                    0% { background-position: 200% center; }
                    100% { background-position: -200% center; }
                }
            `}</style>
        </>
    );
}
