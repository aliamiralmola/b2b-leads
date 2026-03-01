"use client";

import { Check, Zap, Target, Shield, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export const PLANS = [
    {
        name: "Starter",
        price: 19,
        credits: "250",
        description: "Perfect for beginners exploring lead extraction.",
        features: [
            "250 Lead Credits",
            "Google Maps Scraper",
            "Basic AI Insights",
            "CSV Export",
            "Email Support"
        ],
        icon: Zap,
        color: "text-blue-400",
        bgColor: "bg-blue-400/10",
        borderColor: "border-blue-400/20"
    },
    {
        name: "Growth",
        price: 49,
        credits: "1,000",
        description: "Ideal for growing businesses and agencies.",
        features: [
            "1,000 Lead Credits",
            "Faster Extraction Speed",
            "Advanced AI Insights",
            "Unlimited CSV Exports",
            "Priority Email Support"
        ],
        icon: Target,
        color: "text-indigo-400",
        bgColor: "bg-indigo-400/10",
        borderColor: "border-indigo-400/20",
        popular: true
    },
    {
        name: "Scale",
        price: 99,
        credits: "2,500",
        description: "Built for teams scaling their outreach.",
        features: [
            "2,500 Lead Credits",
            "Premium Extraction Engine",
            "Full AI Enrichment",
            "Team Collaboration",
            "Dedicated Account Manager"
        ],
        icon: Rocket,
        color: "text-purple-400",
        bgColor: "bg-purple-400/10",
        borderColor: "border-purple-400/20"
    },
    {
        name: "Enterprise",
        price: 199,
        credits: "5,000",
        description: "Maximum power for large-scale operations.",
        features: [
            "5,000 Lead Credits",
            "Lightning Speed Extraction",
            "Custom AI Workflows",
            "API Access",
            "24/7 VIP Support"
        ],
        icon: Shield,
        color: "text-emerald-400",
        bgColor: "bg-emerald-400/10",
        borderColor: "border-emerald-400/20"
    }
];

interface PricingCardsProps {
    onSelectPlan: (planName: string, price: number) => void;
}

export function PricingCards({ onSelectPlan }: PricingCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {PLANS.map((plan) => (
                <Card
                    key={plan.name}
                    className={`relative bg-[#0c0c0c] border-white/5 flex flex-col transition-all hover:border-white/20 hover:translate-y-[-4px] overflow-hidden ${plan.popular ? 'ring-2 ring-indigo-600 border-transparent' : ''}`}
                >
                    {plan.popular && (
                        <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-tighter px-3 py-1 rounded-bl-lg">
                            Most Popular
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
                            <span className="text-4xl font-black text-white">${plan.price}</span>
                            <span className="text-gray-500 font-medium">/month</span>
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
                            onClick={() => onSelectPlan(plan.name, plan.price)}
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
