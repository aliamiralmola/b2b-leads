'use client';

import * as React from 'react';
import {
    X, Globe, Phone, Mail, MapPin, Star, Bookmark,
    ExternalLink, MessageCircle, Linkedin, Target, ShieldCheck,
    ArrowUpRight, Info, Zap, Loader2
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Instagram, Facebook, Twitter } from 'lucide-react'; // Added new icons

interface LeadDetailModalProps {
    lead: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onBookmark?: (lead: any) => void;
    isBookmarked?: boolean;
    websiteStatus?: 'active' | 'inactive' | 'checking' | 'unknown';
}

export function LeadDetailModal({ lead, open, onOpenChange, onBookmark, isBookmarked, websiteStatus }: LeadDetailModalProps) {
    const [isLoadingWhatsApp, setIsLoadingWhatsApp] = React.useState(false);
    const [isLoadingLinkedIn, setIsLoadingLinkedIn] = React.useState(false);
    const [localAiInsight, setLocalAiInsight] = React.useState(lead?.ai_insight || "");

    React.useEffect(() => {
        if (lead) {
            setLocalAiInsight(lead.ai_insight);
        }
    }, [lead]);

    if (!lead) return null;

    // Use strictly the verified email from our backend scraper. No guessing.
    const realEmail = lead.email || null;
    const isEmailReal = !!realEmail;

    const handleWhatsApp = () => {
        if (!lead.phone) return;
        const phone = lead.phone.replace(/\D/g, '');
        window.open(`https://wa.me/${phone}`, '_blank');
    };

    const handleLinkedIn = () => {
        if (lead.socials?.linkedin) {
            window.open(lead.socials.linkedin, '_blank');
        } else {
            const query = encodeURIComponent(`${lead.name} ${lead.address || ''}`);
            window.open(`https://www.linkedin.com/search/results/all/?keywords=${query}`, '_blank');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-card border-border p-0 overflow-hidden rounded-3xl shadow-2xl">
                <div className="relative h-32 bg-gradient-to-r from-indigo-600 to-purple-600">
                    <button
                        onClick={() => onOpenChange(false)}
                        className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-all z-10"
                    >
                        <X className="h-4 w-4" />
                    </button>
                    <div className="absolute -bottom-10 left-8 p-1 rounded-2xl bg-card border-4 border-card shadow-xl">
                        <div className="h-20 w-20 rounded-xl bg-muted flex items-center justify-center">
                            <Target className="h-10 w-10 text-indigo-500" />
                        </div>
                    </div>
                </div>

                <div className="pt-14 px-8 pb-8 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div>
                            <DialogTitle className="text-2xl font-black text-foreground">{lead.name}</DialogTitle>
                            <p className="text-muted-foreground flex items-center gap-1.5 mt-1 text-sm">
                                <MapPin className="h-3.5 w-3.5" /> {lead.address}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {onBookmark && (
                                <Button
                                    variant="outline"
                                    onClick={() => onBookmark(lead)}
                                    className={`rounded-xl border-border hover:bg-muted font-bold ${isBookmarked ? 'text-emerald-500' : ''}`}
                                >
                                    <Bookmark className={`h-4 w-4 mr-2 ${isBookmarked ? 'fill-emerald-500' : ''}`} />
                                    {isBookmarked ? 'Saved' : 'Save Lead'}
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-muted/30 border border-border rounded-2xl space-y-3">
                            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Contact Information</h4>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3 text-sm text-foreground">
                                        <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                                            <Phone className="h-4 w-4 text-indigo-400" />
                                        </div>
                                        {lead.phone || 'N/A'}
                                    </div>
                                    {lead.phone && (
                                        <button onClick={() => copyToClipboard(lead.phone)} className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ArrowUpRight className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center justify-between group">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-3 text-sm text-foreground">
                                            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                                <Mail className="h-4 w-4 text-emerald-400" />
                                            </div>
                                            <span className={`${!isEmailReal ? 'opacity-70 text-muted-foreground' : ''}`}>{isEmailReal ? realEmail : 'No Verified Email Found'}</span>
                                        </div>
                                    </div>
                                    {isEmailReal && (
                                        <button onClick={() => copyToClipboard(realEmail)} className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ArrowUpRight className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3 text-sm text-foreground">
                                        <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center relative">
                                            <Globe className="h-4 w-4 text-blue-400" />
                                            {websiteStatus === 'active' && <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-500 border border-card shadow-lg shadow-emerald-500/40" />}
                                            {websiteStatus === 'inactive' && <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 border border-card" />}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm text-foreground">{lead.website ? 'Visit Website' : 'N/A'}</span>
                                            {websiteStatus === 'active' && <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Server Reachable</span>}
                                            {websiteStatus === 'inactive' && <span className="text-[8px] font-black text-red-400 uppercase tracking-widest">Unreachable</span>}
                                        </div>
                                    </div>
                                    {lead.website && (
                                        <a href={lead.website} target="_blank" rel="noreferrer" className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Additional info dynamically displaying scraped social media footprints if found */}
                        {(lead.socials?.instagram || lead.socials?.facebook || lead.socials?.twitter) && (
                            <div className="p-4 bg-muted/30 border border-border rounded-2xl space-y-3 md:col-span-2">
                                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Verified Social Presence</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {lead.socials?.instagram && (
                                        <a href={lead.socials.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 rounded-xl hover:bg-muted/80 transition-colors border border-transparent hover:border-border group">
                                            <div className="h-8 w-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
                                                <Instagram className="h-4 w-4 text-pink-500" />
                                            </div>
                                            <span className="text-sm text-foreground font-medium group-hover:text-pink-500 transition-colors truncate">Instagram</span>
                                        </a>
                                    )}
                                    {lead.socials?.facebook && (
                                        <a href={lead.socials.facebook} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 rounded-xl hover:bg-muted/80 transition-colors border border-transparent hover:border-border group">
                                            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                <Facebook className="h-4 w-4 text-blue-500" />
                                            </div>
                                            <span className="text-sm text-foreground font-medium group-hover:text-blue-500 transition-colors truncate">Facebook</span>
                                        </a>
                                    )}
                                    {lead.socials?.twitter && (
                                        <a href={lead.socials.twitter} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 rounded-xl hover:bg-muted/80 transition-colors border border-transparent hover:border-border group">
                                            <div className="h-8 w-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
                                                <Twitter className="h-4 w-4 text-sky-500" />
                                            </div>
                                            <span className="text-sm text-foreground font-medium group-hover:text-sky-500 transition-colors truncate">X (Twitter)</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="p-4 bg-muted/30 border border-border rounded-2xl space-y-3">
                            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Lead Details</h4>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Reputation Score</span>
                                    <div className="flex items-center gap-1.5">
                                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                        <span className="text-sm font-black text-foreground">{lead.rating || '0.0'}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Verification Status</span>
                                    {lead.is_verified ? (
                                        <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold bg-emerald-400/10 px-2 py-0.5 rounded-full">
                                            <ShieldCheck className="h-3.5 w-3.5" />
                                            Verified
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-bold bg-muted px-2 py-0.5 rounded-full">
                                            <Info className="h-3.5 w-3.5" />
                                            Unverified
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {lead.is_verified && <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-500 bg-emerald-500/10">High Intent</Badge>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 bg-indigo-600/5 border border-indigo-600/20 rounded-2xl space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center animate-pulse">
                                <Info className="h-3.5 w-3.5 text-indigo-50" />
                            </div>
                            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Generated Description (Demo)</h4>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed italic font-medium">
                            {localAiInsight || (lead.rating > 4 ?
                                `Highly-rated business in the area. Strong digital presence suggests high conversion potential for B2B services.` :
                                `${lead.name} represents a standard B2B prospect. Digital footprint indicates an online presence.`)}
                        </p>
                    </div>

                    <div className="flex items-center justify-center gap-4 pt-2">
                        <button
                            onClick={handleWhatsApp}
                            disabled={!lead.phone}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all group min-w-[140px] justify-center disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            <MessageCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-bold uppercase tracking-widest">WhatsApp</span>
                        </button>
                        <button
                            onClick={handleLinkedIn}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all group min-w-[140px] justify-center`}
                        >
                            <Linkedin className="h-5 w-5 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-bold uppercase tracking-widest">LinkedIn</span>
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
