'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, User, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface AvatarUploadProps {
    currentAvatarUrl?: string;
    userId: string;
}

export function AvatarUpload({ currentAvatarUrl, userId }: AvatarUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();
    const router = useRouter();

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error('File size must be less than 2MB.');
            return;
        }

        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}-${Math.random()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            // 1. Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // 3. Update Profile
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', userId);

            if (updateError) throw updateError;

            toast.success('Avatar updated successfully!');
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || 'Failed to upload avatar.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col md:flex-row items-center gap-8 mb-4">
            <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-indigo-500/10 border-2 border-indigo-500/20 flex items-center justify-center overflow-hidden transition-all group-hover:border-indigo-500/40">
                    {currentAvatarUrl ? (
                        <img src={currentAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-10 h-10 text-indigo-400" />
                    )}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer border-none"
                    >
                        <Camera className="w-6 h-6 text-white" />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleUpload}
                        disabled={isUploading}
                    />
                </div>
                {isUploading && (
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                )}
            </div>
            <div className="space-y-1 text-center md:text-left">
                <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">Profile Picture</h4>
                <p className="text-xs text-muted-foreground">JPG, GIF or PNG. Max size of 2MB.</p>
                <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 border-border text-foreground hover:bg-accent text-[10px] font-black uppercase tracking-widest h-8"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                >
                    {isUploading ? "Uploading..." : "Upload New"}
                </Button>
            </div>
        </div>
    );
}
