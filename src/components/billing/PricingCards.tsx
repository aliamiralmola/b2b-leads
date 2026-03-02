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
    Starter: "text-blue-500 dark:text-blue-400",
    Growth: "text-indigo-500 dark:text-indigo-400",
    Scale: "text-purple-500 dark:text-purple-400",
    Enterprise: "text-emerald-500 dark:text-emerald-400"
};

const PLAN_BG_COLORS: Record<string, string> = {
    Starter: "bg-blue-500/10 dark:bg-blue-400/20",
    Growth: "bg-indigo-500/10 dark:bg-indigo-400/20",
    Scale: "bg-purple-500/10 dark:bg-purple-400/20",
    Enterprise: "bg-emerald-500/10 dark:bg-emerald-400/20"
};

const PLAN_BORDERS: Record<string, string> = {
    Starter: "border-blue-500/20 dark:border-blue-400/30",
    Growth: "border-indigo-500/30 dark:border-indigo-400/40",
    Scale: "border-purple-500/20 dark:border-purple-400/30",
    Enterprise: "border-emerald-500/20 dark:border-emerald-400/30"
};

interface PricingCardsProps {
    onSelectPlan: (plan: { name: string; price: number }) => void;
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
            color: PLAN_COLORS[plan.name] || "text-indigo-500",
            bgColor: PLAN_BG_COLORS[plan.name] || "bg-indigo-500/10",
            borderColor: PLAN_BORDERS[plan.name] || "border-indigo-500/20",
            popular: plan.name === "Growth"
        };
    });

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full stagger">
            {plans.map((plan) => (
                <Card
                    key={plan.name}
                    className={`relative bg-card dark:bg-card/50 border-border border-2 flex flex-col transition-all hover-lift overflow-hidden animate-fade-up ${plan.borderColor} ${plan.popular ? 'ring-2 ring-primary/50 shadow-2xl shadow-primary/10' : ''}`}
                >
                    {plan.popular && (
                        <div className="absolute top-0 right-0 bg-gradient-to-l from-primary to-indigo-600 text-primary-foreground text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-xl shadow-lg">
                            Best Value
                        </div>
                    )}

                    <CardHeader className="pb-4">
                        <div className={`w-14 h-14 rounded-2xl ${plan.bgColor} flex items-center justify-center mb-6 shadow-inner`}>
                            <plan.icon className={`w-7 h-7 ${plan.color} drop-shadow-sm`} />
                        </div>
                        <CardTitle className="text-2xl font-black text-foreground tracking-tight drop-shadow-sm">{plan.name}</CardTitle>
                        <CardDescription className="text-muted-foreground text-sm font-medium leading-relaxed min-h-[44px] mt-2">
                            {plan.description}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="flex-1 space-y-8 pt-2">
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-5xl font-black text-foreground tracking-tighter">${plan.displayPrice}</span>
                            <span className="text-muted-foreground font-bold text-sm uppercase tracking-widest opacity-60">/{billingCycle === 'annual' ? 'year' : 'month'}</span>
                        </div>

                        <div className="space-y-4">
                            {plan.features.map((feature) => (
                                <div key={feature} className="flex items-start gap-3.5 text-sm font-semibold text-muted-foreground group/item">
                                    <div className={`mt-0.5 rounded-full p-1 transition-colors ${plan.bgColor}`}>
                                        <Check className={`w-3 h-3 ${plan.color}`} strokeWidth={4} />
                                    </div>
                                    <span className="group-hover/item:text-foreground transition-colors duration-200">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>

                    <CardFooter className="pt-8 pb-8 border-t border-border/50 bg-muted/30 dark:bg-white/[0.02]">
                        <Button
                            onClick={() => onSelectPlan({ name: plan.name, price: plan.displayPrice })}
                            className={`w-full h-14 font-black text-sm uppercase tracking-widest rounded-2xl transition-all duration-300 btn-press ${plan.popular
                                ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20'
                                : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border shadow-sm'}`}
                        >
                            Get Started
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
