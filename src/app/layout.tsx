import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
