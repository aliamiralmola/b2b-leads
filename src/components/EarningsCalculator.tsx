"use client";
import { useState, ChangeEvent } from "react";

export function EarningsCalculator() {
    const [users, setUsers] = useState(100);
    const planPrice = 99;
    const commissionRate = 0.5;
    const earnings = users * planPrice * commissionRate;

    return (
        <div className="max-w-2xl mx-auto p-8 md:p-12 rounded-3xl bg-zinc-900 border border-emerald-500/20 backdrop-blur-sm relative overflow-hidden">
            {/* Background glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -z-10" />
            <h3 className="text-3xl font-bold text-white mb-2 text-center">Calculate Your Earnings</h3>
            <p className="text-zinc-400 mb-10 text-center">Slide to see how much you could earn with our 50% recurring commission.</p>

            <div className="mb-12">
                <input
                    type="range"
                    min="1"
                    max="500"
                    value={users}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setUsers(parseInt(e.target.value))}
                    className="w-full h-3 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    style={{
                        background: `linear-gradient(to right, #10b981 0%, #10b981 ${(users / 500) * 100}%, #27272a ${(users / 500) * 100}%, #27272a 100%)`
                    }}
                />
                <style jsx>{`
                    input[type='range']::-webkit-slider-thumb {
                        appearance: none;
                        width: 24px;
                        height: 24px;
                        background: white;
                        border: 3px solid #10b981;
                        border-radius: 50%;
                        cursor: pointer;
                        box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
                    }
                    input[type='range']::-moz-range-thumb {
                        width: 24px;
                        height: 24px;
                        background: white;
                        border: 3px solid #10b981;
                        border-radius: 50%;
                        cursor: pointer;
                        box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
                    }
                `}</style>
                <div className="flex justify-between text-zinc-400 text-sm mt-6 font-medium">
                    <span>1 user</span>
                    <span className="text-emerald-400 px-4 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">{users} users</span>
                    <span>500 users</span>
                </div>
            </div>

            <div className="text-center p-6 bg-black/40 rounded-2xl border border-white/5">
                <p className="text-zinc-300 text-lg mb-3">
                    If you bring <span className="text-white font-bold">{users}</span> users on the $99 plan, you earn:
                </p>
                <div className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 drop-shadow-sm mb-4">
                    ${earnings.toLocaleString()}{" "}
                    <span className="text-2xl text-zinc-500 font-medium">/ month</span>
                </div>
                <div className="inline-block bg-emerald-500/10 text-emerald-400 text-sm px-3 py-1 rounded-md font-medium">
                    = ${(earnings * 12).toLocaleString()} / year
                </div>
            </div>
        </div>
    );
}
