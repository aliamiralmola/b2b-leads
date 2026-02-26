import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function Navbar() {
    return (
        <header className="fixed top-0 w-full z-50 border-b border-white/10 bg-background/60 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
                <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
                    <Image src="/logo.png" alt="b2bleads logo" width={32} height={32} className="object-contain" />
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        b2bleads
                    </span>
                </Link>

                <nav className="hidden md:flex gap-8">
                    <Link href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-white">
                        Features
                    </Link>
                    <Link href="#pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-white">
                        Pricing
                    </Link>
                    <Link href="#testimonials" className="text-sm font-medium text-muted-foreground transition-colors hover:text-white">
                        Testimonials
                    </Link>
                </nav>

                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="hidden sm:block text-sm font-medium text-muted-foreground transition-colors hover:text-white">
                        Sign In
                    </Link>
                    <Button variant="gradient" asChild className="rounded-full px-6">
                        <Link href="/dashboard">Get Started Free</Link>
                    </Button>
                </div>
            </div>
        </header>
    );
}
