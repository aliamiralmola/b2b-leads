'use client';

import * as React from 'react';
import {
    MessageSquare,
    Send,
    X,
    Smile,
    ThumbsUp,
    ThumbsDown,
    Loader2,
    Headset
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function SupportWidgets() {
    const [isChatOpen, setIsChatOpen] = React.useState(false);
    const [isFeedbackOpen, setIsFeedbackOpen] = React.useState(false);
    const [chatMessage, setChatMessage] = React.useState('');
    const [isSending, setIsSending] = React.useState(false);

    const handleSendChat = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatMessage.trim()) return;

        setIsSending(true);
        // Mock sending
        setTimeout(() => {
            toast.success("Support ticket created! We'll reply via email.");
            setChatMessage('');
            setIsSending(false);
            setIsChatOpen(false);
        }, 1500);
    };

    const handleFeedback = (type: 'positive' | 'negative') => {
        toast.success(`Thanks for your ${type} feedback! We're improving.`);
        setIsFeedbackOpen(false);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
            {/* Feedback Menu */}
            {isFeedbackOpen && (
                <div className="bg-card border border-border p-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 duration-300 w-64 mb-2">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-bold text-foreground">How is your experience?</span>
                        <button onClick={() => setIsFeedbackOpen(false)} className="text-muted-foreground hover:text-foreground">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => handleFeedback('positive')}
                            className="flex flex-col items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all group"
                        >
                            <ThumbsUp className="h-6 w-6 text-emerald-400 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-bold text-emerald-400/80">LOVING IT</span>
                        </button>
                        <button
                            onClick={() => handleFeedback('negative')}
                            className="flex flex-col items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-all group"
                        >
                            <ThumbsDown className="h-6 w-6 text-rose-400 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-bold text-rose-400/80">COULD IMPROVE</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Chat Window */}
            {isChatOpen && (
                <div className="bg-card border border-border rounded-2xl shadow-2xl w-80 md:w-96 overflow-hidden flex flex-col mb-2 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-indigo-600 p-6">
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30 backdrop-blur-md">
                                    <Headset className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-black text-lg leading-none">Support Chat</h3>
                                    <p className="text-indigo-200 text-xs mt-1">Status: Online</p>
                                </div>
                            </div>
                            <button onClick={() => setIsChatOpen(false)} className="text-indigo-200 hover:text-white">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    <div className="h-64 p-6 overflow-y-auto bg-background flex flex-col gap-4">
                        <div className="bg-muted border border-border p-4 rounded-2xl rounded-tl-none max-w-[85%] self-start">
                            <p className="text-sm text-muted-foreground">
                                Hi there! 👋 Need help with your search or billing? Send us a message and we'll get back to you within 30 minutes.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSendChat} className="p-4 bg-muted border-t border-border flex gap-2">
                        <input
                            type="text"
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 bg-background border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                        />
                        <button
                            type="submit"
                            disabled={isSending}
                            className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center hover:bg-indigo-500 transition-all disabled:opacity-50"
                        >
                            {isSending ? <Loader2 className="h-4 w-4 text-white animate-spin" /> : <Send className="h-4 w-4 text-white" />}
                        </button>
                    </form>
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-3">
                <Button
                    variant="outline"
                    onClick={() => setIsFeedbackOpen(!isFeedbackOpen)}
                    className="h-12 px-6 rounded-full bg-card/80 backdrop-blur-md border border-border text-muted-foreground hover:text-foreground hover:border-indigo-500/50 flex items-center gap-2 group shadow-xl"
                >
                    <Smile className="h-5 w-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                    <span className="hidden md:inline font-bold text-xs uppercase tracking-widest">Feedback</span>
                </Button>

                <Button
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    className="h-12 w-12 md:w-auto md:px-6 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center md:justify-start gap-2 group shadow-2xl shadow-indigo-600/30"
                >
                    <MessageSquare className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    <span className="hidden md:inline font-bold text-xs uppercase tracking-widest">Live Support</span>
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-emerald-500 border-2 border-background rounded-full" />
                </Button>
            </div>
        </div>
    );
}
