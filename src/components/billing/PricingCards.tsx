"use client";

import { Check, Zap, Target, Shield, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PLANS as BASE_PLANS } from "@/lib/plans";

const PLAN_ICONS: Record<string, any> = {
    Starter: Zap,
    Growth: Target,
    Scale: Rocket,
    Enterprise: Shield
};

const PLAN_COLORS: Record<string, string> = {
    Starter: "text-blue-400",
    Growth: "text-indigo-400",
    Scale: "text-purple-400",
    Enterprise: "text-emerald-400"
};

const PLAN_BG_COLORS: Record<string, string> = {
    Starter: "bg-blue-400/10",
    Growth: "bg-indigo-400/10",
    Scale: "bg-purple-400/10",
    Enterprise: "bg-emerald-400/10"
};

interface PricingCardsProps {
    onSelectPlan: (planName: string, price: number) => void;
    billingCycle?: 'monthly' | 'annual';
}

export function PricingCards({ onSelectPlan, billingCycle = 'monthly' }: PricingCardsProps) {
    const plans = BASE_PLANS.map(plan => {
        const monthlyPrice = Number(plan.price);
        const price = billingCycle === 'annual'
            ? Math.floor(monthlyPrice * 0.8) // 20% discount
            : monthlyPrice;

        return {
            ...plan,
            displayPrice: price,
            icon: PLAN_ICONS[plan.name] || Zap,
            color: PLAN_COLORS[plan.name] || "text-indigo-400",
            bgColor: PLAN_BG_COLORS[plan.name] || "bg-indigo-400/10",
            popular: plan.name === "Growth"
        };
    });

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {plans.map((plan) => (
                <Card
                    key={plan.name}
                    className={`relative bg-card border-border flex flex-col transition-all hover:border-primary/20 hover:translate-y-[-4px] overflow-hidden ${plan.popular ? 'ring-2 ring-primary border-transparent' : ''}`}
                >
                    {plan.popular && (
                        <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-tighter px-3 py-1 rounded-bl-lg">
                            Best Value
                        </div>
                    )}

                    <CardHeader>
                        <div className={`w-12 h-12 rounded-xl ${plan.bgColor} flex items-center justify-center mb-4`}>
                            <plan.icon className={`w-6 h-6 ${plan.color}`} />
                        </div>
                        <CardTitle className="text-xl font-bold text-white">{plan.name}</CardTitle>
                        <CardDescription className="text-gray-400 text-sm min-h-[40px]">
                            {plan.description}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="flex-1 space-y-6">
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black text-white">${plan.displayPrice}</span>
                            <span className="text-gray-500 font-medium">/{billingCycle === 'annual' ? 'year' : 'month'}</span>
                        </div>

                        <div className="space-y-3">
                            {plan.features.map((feature) => (
                                <div key={feature} className="flex items-start gap-3 text-sm text-gray-300">
                                    <div className="mt-1 bg-white/5 rounded-full p-0.5">
                                        <Check className="w-3 h-3 text-emerald-400" />
                                    </div>
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>

                    <CardFooter className="pt-6 border-t border-white/5">
                        <Button
                            onClick={() => onSelectPlan(plan.name, plan.displayPrice)}
                            className={`w-full h-12 font-bold rounded-xl transition-all ${plan.popular ? 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}
                        >
                            Subscribe Now
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
