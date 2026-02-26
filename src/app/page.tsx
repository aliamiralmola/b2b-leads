import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Linkedin, Sparkles, CheckCircle2, ArrowRight, DollarSign } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-zinc-50 font-sans selection:bg-indigo-500/30">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur supports-[backdrop-filter]:bg-black/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="b2bleads logo" width={32} height={32} className="object-contain" />
            <span className="font-bold text-xl tracking-tight text-white">b2bleads</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/affiliates" className="text-emerald-400 hover:text-emerald-300 transition-colors font-semibold flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" /> Affiliates
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="hidden md:inline-flex text-zinc-300 hover:text-white hover:bg-white/10" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all hover:shadow-[0_0_25px_rgba(79,70,229,0.6)]" asChild>
              <Link href="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 blur-[100px] rounded-full mix-blend-screen" />
          </div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <Badge variant="outline" className="mb-8 border-indigo-500/30 bg-indigo-500/10 text-indigo-300 py-1.5 px-4 backdrop-blur-sm">
              <Sparkles className="w-3 h-3 mr-2 inline-block" />
              New: AI-Powered Enrichment
            </Badge>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 max-w-5xl mx-auto bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/60">
              Find Your Next High-Paying Client in Seconds
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              AI-powered lead extraction from Google Maps and LinkedIn. Get verified emails and phone numbers instantly, and fill your pipeline on autopilot.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-14 px-8 text-base bg-indigo-600 hover:bg-indigo-700 text-white border-0 w-full sm:w-auto shadow-[0_0_30px_-5px_rgba(79,70,229,0.6)] transition-all hover:shadow-[0_0_50px_-10px_rgba(79,70,229,0.8)]" asChild>
                <Link href="/login">
                  Start for Free <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-base border-white/10 text-white hover:bg-white/5 w-full sm:w-auto backdrop-blur-sm" asChild>
                <Link href="#pricing">View Pricing</Link>
              </Button>
            </div>

            <div className="mt-20 flex items-center justify-center gap-8 text-sm text-zinc-500 font-medium flex-wrap">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-500" /> No credit card required</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-500" /> 10 Free Leads</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-500" /> Cancel anytime</div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 bg-zinc-950 border-y border-white/5 relative">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-white">Everything you need to scale outbound</h2>
              <p className="text-zinc-400 max-w-2xl mx-auto text-lg flex-wrap">Powerful extraction tools designed specifically for B2B growth teams and agencies.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Feature 1 */}
              <Card className="bg-black/50 backdrop-blur border-white/10 hover:border-indigo-500/50 transition-colors duration-500 group">
                <CardHeader>
                  <div className="w-14 h-14 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:bg-indigo-500/20 group-hover:scale-110 transition-all duration-500">
                    <MapPin className="h-7 w-7 text-indigo-400" />
                  </div>
                  <CardTitle className="text-2xl text-white">Google Maps Scraping</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-400 leading-relaxed text-lg">
                    Extract local businesses in high detail. Get names, websites, phone numbers, and reviews across any geography in minutes.
                  </p>
                </CardContent>
              </Card>

              {/* Feature 2 */}
              <Card className="bg-black/50 backdrop-blur border-white/10 hover:border-blue-500/50 transition-colors duration-500 group">
                <CardHeader>
                  <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:bg-blue-500/20 group-hover:scale-110 transition-all duration-500">
                    <Linkedin className="h-7 w-7 text-blue-400" />
                  </div>
                  <CardTitle className="text-2xl text-white">LinkedIn Extraction</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-400 leading-relaxed text-lg">
                    Target decision-makers with precision. Scrape Sales Navigator searches to build hyper-targeted B2B contact lists.
                  </p>
                </CardContent>
              </Card>

              {/* Feature 3 */}
              <Card className="bg-black/50 backdrop-blur border-white/10 hover:border-purple-500/50 transition-colors duration-500 group">
                <CardHeader>
                  <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:bg-purple-500/20 group-hover:scale-110 transition-all duration-500">
                    <Sparkles className="h-7 w-7 text-purple-400" />
                  </div>
                  <CardTitle className="text-2xl text-white">AI Lead Qualification</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-400 leading-relaxed text-lg">
                    Automatically score and enrich leads. Our AI determines intent and finds verified personal work emails effortlessly.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-32 relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute bottom-0 right-0 w-[800px] h-[600px] opacity-10 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-tl from-indigo-500 to-transparent blur-[120px] rounded-full mix-blend-screen" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-white">Simple, transparent pricing</h2>
              <p className="text-zinc-400 max-w-2xl mx-auto text-lg">Start for free, upgrade when you need more leads.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {/* Starter Plan */}
              <Card className="bg-zinc-950/80 backdrop-blur border-white/10 relative flex flex-col p-4 md:p-6">
                <CardHeader>
                  <CardTitle className="text-2xl text-white font-bold">Starter</CardTitle>
                  <CardDescription className="text-zinc-400 text-base mt-2">Perfect for trying out the platform.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 mt-4">
                  <div className="mb-8 flex items-end gap-2 flex-wrap">
                    <span className="text-5xl font-extrabold text-white tracking-tight">$19</span>
                    <span className="text-2xl text-zinc-500 line-through font-semibold mb-1">$39</span>
                    <span className="text-zinc-500 text-lg font-medium mb-1">/mo</span>
                  </div>
                  <ul className="space-y-4">
                    {['250 Leads/mo', 'CSV Export', 'Google Maps Scraping'].map((feature, i) => (
                      <li key={i} className="flex items-start text-zinc-300 text-base">
                        <CheckCircle2 className="h-5 w-5 text-indigo-500 mr-3 flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-6">
                  <Button className="w-full h-12 text-base bg-white text-black hover:bg-zinc-200 transition-colors font-semibold">Get Started</Button>
                </CardFooter>
              </Card>

              {/* Growth Plan */}
              <Card className="bg-zinc-950/80 backdrop-blur border-white/10 relative flex flex-col p-4 md:p-6">
                <CardHeader>
                  <CardTitle className="text-2xl text-white font-bold">Growth</CardTitle>
                  <CardDescription className="text-zinc-400 text-base mt-2">For individuals scaling outreach.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 mt-4">
                  <div className="mb-8 flex items-end gap-2 flex-wrap">
                    <span className="text-5xl font-extrabold text-white tracking-tight">$49</span>
                    <span className="text-2xl text-zinc-500 line-through font-semibold mb-1">$99</span>
                    <span className="text-zinc-500 text-lg font-medium mb-1">/mo</span>
                  </div>
                  <ul className="space-y-4">
                    {['1000 Leads/mo', 'CSV Export', 'Google Maps Scraping', 'Priority Support'].map((feature, i) => (
                      <li key={i} className="flex items-start text-zinc-300 text-base">
                        <CheckCircle2 className="h-5 w-5 text-indigo-500 mr-3 flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-6">
                  <Button className="w-full h-12 text-base bg-white text-black hover:bg-zinc-200 transition-colors font-semibold">Get Growth</Button>
                </CardFooter>
              </Card>

              {/* Scale Plan */}
              <Card className="bg-black border-indigo-500 relative flex flex-col p-4 md:p-6 shadow-[0_0_30px_-5px_rgba(79,70,229,0.3)] transform lg:-translate-y-4">
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <Badge className="bg-indigo-500 text-white hover:bg-indigo-600 border-0 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider shadow-lg">Most Popular • Save 50%</Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl text-white font-bold">Scale</CardTitle>
                  <CardDescription className="text-indigo-200/70 text-base mt-2">For growing agencies & teams.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 mt-4">
                  <div className="mb-8 flex items-end gap-2 flex-wrap">
                    <span className="text-5xl font-extrabold text-white tracking-tight">$99</span>
                    <span className="text-2xl text-zinc-500 line-through font-semibold mb-1">$199</span>
                    <span className="text-zinc-500 text-lg font-medium mb-1">/mo</span>
                  </div>
                  <ul className="space-y-4">
                    {['2500 Leads/mo', 'CSV Export', 'Google Maps Scraping', 'Priority Support', 'Access to New Features'].map((feature, i) => (
                      <li key={i} className="flex items-start text-zinc-300 text-base">
                        <CheckCircle2 className="h-5 w-5 text-indigo-400 mr-3 flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-6">
                  <Button className="w-full h-12 text-base bg-indigo-600 hover:bg-indigo-500 text-white border-0 shadow-[0_0_20px_rgba(79,70,229,0.5)] transition-all font-semibold hover:shadow-[0_0_30px_rgba(79,70,229,0.8)]">Get Scale</Button>
                </CardFooter>
              </Card>

              {/* Enterprise Plan */}
              <Card className="bg-zinc-950/80 backdrop-blur border-white/10 relative flex flex-col p-4 md:p-6">
                <CardHeader>
                  <CardTitle className="text-2xl text-white font-bold">Enterprise</CardTitle>
                  <CardDescription className="text-zinc-400 text-base mt-2">Maximum volume and priority.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 mt-4">
                  <div className="mb-8 flex items-end gap-2 flex-wrap">
                    <span className="text-5xl font-extrabold text-white tracking-tight">$199</span>
                    <span className="text-2xl text-zinc-500 line-through font-semibold mb-1">$399</span>
                    <span className="text-zinc-500 text-lg font-medium mb-1">/mo</span>
                  </div>
                  <ul className="space-y-4">
                    {['5000 Leads/mo', 'CSV Export', 'Google Maps Scraping', '24/7 Priority Support', 'Dedicated Account Manager'].map((feature, i) => (
                      <li key={i} className="flex items-start text-zinc-300 text-base">
                        <CheckCircle2 className="h-5 w-5 text-indigo-500 mr-3 flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-6">
                  <Button className="w-full h-12 text-base bg-white text-black hover:bg-zinc-200 transition-colors font-semibold">Get Enterprise</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Affiliate Teaser Banner */}
      <section className="relative py-16 border-t border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/40 via-black to-teal-950/30 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500 to-transparent blur-[80px] rounded-full mix-blend-screen" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 mb-4 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 text-emerald-400 text-sm font-semibold">
            <DollarSign className="w-3.5 h-3.5" /> Partner Program
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-4">
            Want to earn money?
          </h2>
          <p className="text-zinc-400 text-lg mb-8 max-w-xl mx-auto">
            Join our Affiliate Program and earn{" "}
            <span className="text-emerald-400 font-semibold">50% recurring commission forever</span>{" "}
            — for every customer you refer.
          </p>
          <Link
            href="/affiliates"
            className="inline-flex items-center gap-2 h-12 px-8 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-base transition-all shadow-[0_0_25px_-5px_rgba(16,185,129,0.5)] hover:shadow-[0_0_40px_-5px_rgba(16,185,129,0.7)]"
          >
            Learn More About Affiliates <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="b2bleads logo" width={32} height={32} className="object-contain" />
              <span className="font-bold text-2xl tracking-tight text-white">b2bleads</span>
            </div>

            <div className="flex gap-8 text-sm font-medium text-zinc-400 flex-wrap justify-center">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/refund" className="hover:text-white transition-colors">Refund Policy</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link>
            </div>
          </div>

          <div className="text-center text-zinc-600 text-sm">
            &copy; {new Date().getFullYear()} b2bleads. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
