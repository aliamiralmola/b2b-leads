import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/components/providers/Web3Provider";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: 'B2B Leads - AI-Powered Google Maps Scraper',
  description: 'Extract high-quality B2B leads from Google Maps in seconds. Get emails, phone numbers, and AI insights to close more deals.',
  openGraph: {
    title: 'B2B Leads - AI-Powered Google Maps Scraper',
    description: 'Extract high-quality B2B leads from Google Maps in seconds. Get emails, phone numbers, and AI insights to close more deals.',
    url: 'https://b2bleads.ai',
    siteName: 'B2B Leads',
    images: [
      {
        url: 'https://b2bleads.ai/og-image.png',
        width: 1200,
        height: 630,
        alt: 'B2B Leads - AI-Powered Google Maps Scraper',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'B2B Leads - AI-Powered Google Maps Scraper',
    description: 'Extract high-quality B2B leads from Google Maps in seconds.',
    images: ['https://b2bleads.ai/og-image.png'],
  },
  keywords: [
    'B2B Leads Extraction', 'Google Maps Scraper', 'Lead Generation Software', 'LinkedIn Email Finder',
    'Local SEO Leads', 'Sales Prospecting Tool', 'Bulk Email Extraction', 'Business Contact Finder',
    'Scrape Google Places', 'Verified B2B Emails', 'Dubai Business Leads', 'USA Local Leads',
    'Marketing Agency Tools', 'Cold Outbound Automation', 'High-Paying Clients Finder'
  ]
};

import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AffiliateTracker } from "@/components/AffiliateTracker";
import { GlobalLoadingIndicator } from "@/components/GlobalLoadingIndicator";
import { Suspense } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Web3Provider>
            <Suspense fallback={null}>
              <AffiliateTracker />
            </Suspense>
            <GlobalLoadingIndicator />
            {children}
            <Toaster position="top-center" richColors />
          </Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
