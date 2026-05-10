"use server";

import { City } from "country-state-city";

export async function getCitiesByCountry(countryCode: string) {
    if (!countryCode) return [];

    // This runs on the server, so it won't send the entire world's city database to the browser
    const cities = City.getCitiesOfCountry(countryCode.toUpperCase()) || [];

    // Return only unique city names sorted alphabetically
    return Array.from(new Set(cities.map(c => c.name))).sort();
}
