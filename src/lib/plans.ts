export const PLANS = [
    {
        id: "starter",
        name: "Starter",
        price: 19,
        originalPrice: 39,
        credits: 250,
        description: "Perfect for testing the waters.",
        features: ["250 Leads/mo", "CSV Export", "Google Maps Scraping"]
    },
    {
        id: "growth",
        name: "Growth",
        price: 49,
        originalPrice: 99,
        credits: 1000,
        description: "Great for small agencies and freelancers.",
        features: ["1000 Leads/mo", "CSV Export", "Google Maps Scraping", "Priority Support"]
    },
    {
        id: "scale",
        name: "Scale",
        price: 99,
        originalPrice: 199,
        credits: 2500,
        description: "For businesses scaling their outreach.",
        features: ["2500 Leads/mo", "CSV Export", "Google Maps Scraping", "Priority Support", "Access to New Features"],
        popular: true
    },
    {
        id: "enterprise",
        name: "Enterprise",
        price: 199,
        originalPrice: 399,
        credits: 5000,
        description: "Maximum power for high-volume sales teams.",
        features: ["5000 Leads/mo", "CSV Export", "Google Maps Scraping", "24/7 Priority Support", "Dedicated Account Manager"]
    }
];

export const FREE_TRIAL_CREDITS = 10;
