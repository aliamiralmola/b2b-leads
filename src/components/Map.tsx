"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPinOff } from 'lucide-react';

// Fix for default marker icons in Leaflet with Next.js
const icon = L.icon({
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
    const map = useMap();
    map.setView(center, zoom);
    return null;
}

interface MapProps {
    leads: any[];
}

export default function Map({ leads }: MapProps) {
    // Default center if no leads
    const defaultCenter: [number, number] = [20, 0];
    const defaultZoom = 2;

    // Calculate center based on leads if they have lat/lng
    const leadsWithCoords = leads.filter(l => l.lat && l.lng);
    const center: [number, number] = leadsWithCoords.length > 0
        ? [leadsWithCoords[0].lat, leadsWithCoords[0].lng]
        : defaultCenter;
    const zoom = leadsWithCoords.length > 0 ? 12 : defaultZoom;

    return (
        <div className="h-full w-full rounded-2xl overflow-hidden border border-border">
            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%", zIndex: 10 }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {leadsWithCoords.map((lead, idx) => (
                    <Marker
                        key={idx}
                        position={[lead.lat, lead.lng]}
                        icon={icon}
                    >
                        <Popup>
                            <div className="p-1">
                                <h3 className="font-bold text-sm">{lead.name}</h3>
                                <p className="text-xs text-muted-foreground">{lead.address}</p>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="text-xs font-bold text-amber-500">★ {lead.rating}</span>
                                    <span className="text-xs text-muted-foreground">({lead.reviews} reviews)</span>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
                {leadsWithCoords.length > 0 && <ChangeView center={center} zoom={zoom} />}
            </MapContainer>
            {leads.length > 0 && leadsWithCoords.length === 0 && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-[1000]">
                    <div className="p-4 bg-muted/50 rounded-full mb-4">
                        <MapPinOff className="w-8 h-8 text-muted-foreground opacity-50" />
                    </div>
                    <h3 className="text-sm font-black text-foreground uppercase tracking-widest">No Location Data Available</h3>
                    <p className="text-xs text-muted-foreground mt-2 max-w-[250px] text-center">The current leads do not have geocoordinates to display on the map.</p>
                </div>
            )}
        </div>
    );
}
