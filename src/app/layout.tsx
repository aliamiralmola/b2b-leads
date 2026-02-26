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
  keywords: [
    'b2b local lead generation', 'google maps scraper for agencies', 'extract plumbers emails',
    'real estate lead finder dubai', 'dentist contact extraction tool', 'hvac lead generation software',
    'b2b data enrichment api', 'automated lead generation software', 'linkedin email extractor',
    'find local business owners', 'scrape roofing contractors google maps', 'restaurant owner emails usa',
    'b2b sales prospecting tool', 'generate leads for marketing agencies', 'ecommerce decision makers contact',
    'software companies email list', 'financial advisors lead generation', 'insurance agents scraper',
    'gym owners contact list', 'cleaning services email extractor', 'construction company leads',
    'lawyers and attorneys email database', 'accountants local search scraper', 'b2b cold email lists',
    'auto repair shops lead finder', 'chiropractors email scraping tool', 'logistics companies leads list',
    'manufacturing businesses contacts', 'wholesale distributors email scraper', 'plumbing contractors database',
    'electricians local lead generation', 'landscaping businesses contact info', 'roofers email addresses',
    'solar companies lead generation', 'property management companies list', 'real estate agents emails',
    'medical spas contact extraction', 'plastic surgeons lead finder', 'veterinarians email list',
    'pet groomers scraper', 'daycare centers lead generation', 'private schools email database',
    'car dealerships contact details', 'trucking companies lead scraper', 'freight brokers email list',
    'it services companies leads', 'web design agencies email finder', 'seo agencies contact extraction',
    'digital marketing agencies leads', 'staffing agencies email scraper', 'recruitment companies leads',
    'event planners contact list', 'caterers email addresses', 'florists local search scraper'
  ]
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
