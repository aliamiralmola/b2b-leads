'use client';

import * as React from 'react';
import {
    Bell, CheckCircle2, Zap, Users, Info,
    X, Trash2, ExternalLink, Clock
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'ai';
    time: string;
    read: boolean;
}

export function Notifications() {
    const [notifications, setNotifications] = React.useState<Notification[]>([
        {
            id: '1',
            title: 'Search Completed',
            message: 'Your search for "Real Estate Agents in Dubai" is finished. 142 leads found.',
            type: 'success',
            time: '2 mins ago',
            read: false
        },
        {
            id: '2',
            title: 'AI Enrichment Ready',
            message: 'We\'ve automatically enriched 50 leads with deep insights.',
            type: 'ai',
            time: '1 hour ago',
            read: false
        },
        {
            id: '3',
            title: 'Team Invitation',
            message: 'Sarah has joined your workspace as an Editor.',
            type: 'info',
            time: '3 hours ago',
            read: true
        }
    ]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const deleteNotification = (id: string) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className="relative p-2 rounded-xl hover:bg-muted transition-all group"
                    aria-label={`${unreadCount} unread notifications`}
                >
                    <Bell className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-indigo-600 rounded-full border-2 border-background flex items-center justify-center text-[8px] font-black text-indigo-50">
                            {unreadCount}
                        </span>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-card border-border p-0 overflow-hidden rounded-2xl shadow-2xl">
                <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                    <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                        Notifications
                        {unreadCount > 0 && <Badge variant="secondary" className="rounded-md text-[10px] py-0">{unreadCount} New</Badge>}
                    </h3>
                    <button
                        onClick={markAllRead}
                        className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest transition-colors"
                    >
                        Mark all as read
                    </button>
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-12 text-center space-y-3">
                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto opacity-20">
                                <Bell className="h-6 w-6" />
                            </div>
                            <p className="text-xs text-muted-foreground">No new notifications</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {notifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={`p-4 hover:bg-muted/50 transition-colors group relative ${!n.read ? 'bg-indigo-600/[0.02]' : ''}`}
                                >
                                    <div className="flex gap-4">
                                        <div className={`mt-1 h-8 w-8 rounded-lg shrink-0 flex items-center justify-center ${n.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                                            n.type === 'ai' ? 'bg-purple-500/10 text-purple-400' :
                                                'bg-indigo-500/10 text-indigo-400'
                                            }`}>
                                            {n.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> :
                                                n.type === 'ai' ? <Zap className="h-4 w-4" /> :
                                                    <Info className="h-4 w-4" />}
                                        </div>
                                        <div className="space-y-1 pr-4">
                                            <h4 className={`text-xs font-bold leading-none ${!n.read ? 'text-foreground' : 'text-muted-foreground'}`}>{n.title}</h4>
                                            <p className="text-[11px] text-muted-foreground leading-relaxed">{n.message}</p>
                                            <div className="flex items-center gap-2 pt-1">
                                                <Clock className="h-3 w-3 text-muted-foreground/50" />
                                                <span className="text-[10px] text-muted-foreground/50">{n.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => deleteNotification(n.id)}
                                        className="absolute top-4 right-4 p-1 rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400 transition-all"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {notifications.length > 0 && (
                    <div className="p-3 border-t border-border bg-muted/30 text-center">
                        <button className="text-[10px] font-black text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors flex items-center justify-center gap-2 w-full">
                            View All Activity <ExternalLink className="h-3 w-3" />
                        </button>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
