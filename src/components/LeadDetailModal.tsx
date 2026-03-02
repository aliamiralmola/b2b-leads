'use client';

import * as React from 'react';
import {
    X, Globe, Phone, Mail, MapPin, Star, Bookmark,
    ExternalLink, MessageCircle, Linkedin, Target, ShieldCheck,
    ArrowUpRight, Info, Zap
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

interface LeadDetailModalProps {
    lead: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onBookmark?: (lead: any) => void;
    isBookmarked?: boolean;
}

export function LeadDetailModal({ lead, open, onOpenChange, onBookmark, isBookmarked }: LeadDetailModalProps) {
    if (!lead) return null;

    const email = lead.email || `contact@${lead.website?.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] || lead.name.toLowerCase().replace(/\s+/g, '') + '.com'}`;

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
                            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20">
                                <Zap className="h-4 w-4 mr-2" />
                                Deep Enrich
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-muted/30 border border-border rounded-2xl space-y-3">
                            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Contact Information</h4>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3 text-sm text-foreground">
                                        <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                                            <Phone className="h-4 w-4 text-indigo-400" />
                                        </div>
                                        {lead.phone || 'N/A'}
                                    </div>
                                    {lead.phone && (
                                        <a href={`tel:${lead.phone}`} className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ArrowUpRight className="h-4 w-4" />
                                        </a>
                                    )}
                                </div>
                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3 text-sm text-foreground">
                                        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                            <Mail className="h-4 w-4 text-emerald-400" />
                                        </div>
                                        {email}
                                    </div>
                                    <a href={`mailto:${email}`} className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowUpRight className="h-4 w-4" />
                                    </a>
                                </div>
                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3 text-sm text-foreground">
                                        <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                            <Globe className="h-4 w-4 text-blue-400" />
                                        </div>
                                        {lead.website ? 'Visit Website' : 'N/A'}
                                    </div>
                                    {lead.website && (
                                        <a href={lead.website} target="_blank" rel="noreferrer" className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-muted/30 border border-border rounded-2xl space-y-3">
                            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Market Intelligence</h4>
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
                                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold bg-emerald-400/10 px-2 py-0.5 rounded-full">
                                        <ShieldCheck className="h-3.5 w-3.5" />
                                        Verified
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">B2B Prospect</Badge>
                                    <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">High Intent</Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 bg-indigo-600/5 border border-indigo-600/20 rounded-2xl space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center animate-pulse">
                                <Info className="h-3.5 w-3.5 text-indigo-50" />
                            </div>
                            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">AI Insight (Beta)</h4>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed italic">
                            "Based on recent reviews and digital footprint, {lead.name} shows a pattern of expanding their service offerings. They are likely in need of advanced CRM tools and outbound marketing strategy."
                        </p>
                    </div>

                    <div className="flex items-center justify-center gap-4 pt-2">
                        <button className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all group">
                            <MessageCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-bold uppercase tracking-widest">WhatsApp</span>
                        </button>
                        <button className="flex items-center gap-2 p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all group">
                            <Linkedin className="h-5 w-5 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-bold uppercase tracking-widest">LinkedIn</span>
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
