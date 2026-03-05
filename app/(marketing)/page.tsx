"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Clock,
  TrendingDown,
  RefreshCw,
  Zap,
  TrendingUp,
  Shield,
  BarChart3,
  ClipboardList,
  Link2,
  KeyRound,
  SlidersHorizontal,
  Rocket,
  Check,
  Play,
  Menu,
  X,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Dashboard Mockup (static visual)                                   */
/* ------------------------------------------------------------------ */

function DashboardMockup({ className }: { className?: string }) {
  const chartPoints = [
    20, 28, 24, 32, 30, 38, 35, 42, 38, 45, 40, 48, 44, 50, 46, 52, 48, 55,
    50, 58, 52, 56, 54, 60, 56, 62, 58, 64, 60, 66,
  ];
  const revenuePoints = chartPoints.map((p) => p * 1.9 + 10);

  const toPath = (points: number[], height: number) => {
    const maxVal = Math.max(...revenuePoints);
    return points
      .map((p, i) => {
        const x = (i / (points.length - 1)) * 100;
        const y = height - (p / maxVal) * (height - 16);
        return `${i === 0 ? "M" : "L"}${x},${y}`;
      })
      .join(" ");
  };

  return (
    <div className={className}>
      {/* Browser chrome */}
      <div className="rounded-xl border border-[#2A2A30] bg-[#0D0D0F] shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-2 border-b border-[#2A2A30] px-4 py-2.5">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-[#EF4444]/60" />
            <div className="h-3 w-3 rounded-full bg-[#FBBF24]/60" />
            <div className="h-3 w-3 rounded-full bg-[#22C55E]/60" />
          </div>
          <div className="ml-3 flex-1 rounded-md bg-[#1A1A1F] px-3 py-1">
            <span className="text-[11px] text-[#6B7280]">app.royaltyads.com</span>
          </div>
        </div>

        {/* Demo banner */}
        <div className="border-b border-[#D4A84B]/30 bg-[#D4A84B]/10 px-4 py-1.5">
          <p className="text-[10px] font-medium text-[#D4A84B]">
            Demo mode — connect Amazon Ads API in Settings to go live
          </p>
        </div>

        {/* Dashboard content */}
        <div className="p-4">
          <div className="mb-3">
            <h3 className="font-sans text-sm font-semibold text-[#F5F5F5]">
              Dashboard
            </h3>
            <p className="text-[10px] text-[#6B7280]">
              Hourly automation outcomes and campaign efficiency snapshot.
            </p>
          </div>

          {/* KPI cards */}
          <div className="mb-4 grid grid-cols-4 gap-2">
            {[
              { label: "Total Spend", value: "$662.10", color: "text-[#F5F5F5]" },
              { label: "Total Revenue", value: "$2,060.97", color: "text-[#F5F5F5]" },
              { label: "Blended ACoS", value: "32.13%", color: "text-[#FBBF24]" },
              { label: "ROAS", value: "3.11x", color: "text-[#22C55E]" },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="rounded-lg border border-[#2A2A30] bg-[#141418] p-2.5"
              >
                <p className="text-[9px] text-[#6B7280]">{kpi.label}</p>
                <p className={`font-mono text-sm font-semibold ${kpi.color}`}>
                  {kpi.value}
                </p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="rounded-lg border border-[#2A2A30] bg-[#141418] p-3">
            <p className="mb-1 text-[10px] font-medium text-[#F5F5F5]">
              Spend vs Revenue
            </p>
            <p className="mb-2 text-[9px] text-[#6B7280]">
              Daily trend over the last 30 days
            </p>
            <svg viewBox="0 0 100 50" className="h-20 w-full">
              <path
                d={toPath(chartPoints, 50)}
                fill="none"
                stroke="#F97316"
                strokeWidth="1"
              />
              <path
                d={toPath(revenuePoints, 50)}
                fill="none"
                stroke="#22C55E"
                strokeWidth="1"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section animation hook                                             */
/* ------------------------------------------------------------------ */

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

function AnimatedSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(15px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  FAQ Accordion                                                      */
/* ------------------------------------------------------------------ */

const faqItems = [
  {
    q: "How does RoyaltyAds connect to my Amazon Ads account?",
    a: "You provide API credentials (client ID, client secret, and refresh token) from your Amazon Advertising console. We use read/write access to manage bids and budgets on your behalf. Your credentials are encrypted at rest and in transit.",
  },
  {
    q: "Will RoyaltyAds overspend my budget?",
    a: "No. Budget guardrails are a core feature. You set daily and campaign-level spend caps, and the system will never exceed them. If a campaign is approaching its limit, bids are automatically reduced.",
  },
  {
    q: "How often does the optimization run?",
    a: "Every hour. We pull the latest performance data from Amazon's reporting API and adjust bids, budgets, and keywords based on current performance against your targets.",
  },
  {
    q: "Does this work for all KDP book categories?",
    a: "Yes. RoyaltyAds works with any Sponsored Products campaigns on Amazon, regardless of book category — fiction, non-fiction, children's, educational, low-content, and more.",
  },
  {
    q: "Can I see what changes RoyaltyAds makes?",
    a: "Every automated action is logged in the Activity Log with full context — what changed, why it changed, and the performance data that triggered the decision. Nothing is a black box.",
  },
  {
    q: "What if I want to override an automated decision?",
    a: "You always have manual control. Pause automation on any campaign, adjust targets, or override specific bids at any time. RoyaltyAds respects your manual changes.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes. 14-day free trial with full access to all features. No credit card required to start.",
  },
  {
    q: "What about Sponsored Brands and Sponsored Display?",
    a: "Currently, RoyaltyAds focuses on Sponsored Products campaigns. Sponsored Brands and Display support is on our roadmap.",
  },
];

function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-[700px]">
      {faqItems.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i} className="border-b border-[#2A2A30]">
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex w-full items-center justify-between py-5 text-left"
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${i}`}
            >
              <span className="pr-4 text-[16px] font-medium text-[#F5F5F5]">
                {item.q}
              </span>
              <ChevronDown
                className="h-5 w-5 shrink-0 text-[#6B7280] transition-transform duration-300"
                style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}
              />
            </button>
            <div
              id={`faq-answer-${i}`}
              className="grid transition-all duration-300 ease-in-out"
              style={{
                gridTemplateRows: isOpen ? "1fr" : "0fr",
              }}
            >
              <div className="overflow-hidden">
                <p className="pb-5 text-[15px] leading-[1.7] text-[#9CA3AF]">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Navbar                                                             */
/* ------------------------------------------------------------------ */

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const navLinks = [
    { label: "Features", id: "features" },
    { label: "Pricing", id: "pricing" },
    { label: "FAQ", id: "faq" },
  ];

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 h-16 transition-all duration-300 ${
        scrolled
          ? "border-b border-[#2A2A30] bg-[#0D0D0F]/95 backdrop-blur-sm"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className="font-mono text-xl font-semibold text-[#D4A84B]"
          style={{ textShadow: "0 0 20px rgba(212,168,75,0.2)" }}
        >
          RoyaltyAds
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="text-sm text-[#9CA3AF] transition-colors hover:text-[#F5F5F5]"
            >
              {link.label}
            </button>
          ))}
          <Link
            href="/login"
            className="rounded-lg border border-[#2A2A30] px-4 py-2 text-sm text-[#9CA3AF] transition-colors hover:border-[#3A3A42] hover:text-[#F5F5F5]"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-[#D4A84B] px-4 py-2 text-sm font-medium text-[#0D0D0F] transition-colors hover:bg-[#E0B85C]"
          >
            Get Started &rarr;
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-[#9CA3AF] md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-b border-[#2A2A30] bg-[#0D0D0F] px-6 py-4 md:hidden">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="block w-full py-3 text-left text-sm text-[#9CA3AF] transition-colors hover:text-[#F5F5F5]"
            >
              {link.label}
            </button>
          ))}
          <div className="mt-3 flex flex-col gap-2">
            <Link
              href="/login"
              className="rounded-lg border border-[#2A2A30] px-4 py-2 text-center text-sm text-[#9CA3AF]"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-[#D4A84B] px-4 py-2 text-center text-sm font-medium text-[#0D0D0F]"
            >
              Get Started &rarr;
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  Avatar circles                                                     */
/* ------------------------------------------------------------------ */

function AvatarGroup() {
  const avatars = [
    { initials: "JM", bg: "bg-emerald-600" },
    { initials: "SK", bg: "bg-blue-600" },
    { initials: "AL", bg: "bg-purple-600" },
    { initials: "RD", bg: "bg-orange-600" },
    { initials: "TC", bg: "bg-rose-600" },
  ];

  return (
    <div className="flex items-center">
      {avatars.map((a, i) => (
        <div
          key={i}
          className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#0D0D0F] text-[10px] font-semibold text-white ${a.bg}`}
          style={{ marginLeft: i > 0 ? -8 : 0 }}
        >
          {a.initials}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Landing Page                                                  */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0D0D0F]">
      <Navbar />

      {/* ─── HERO ─── */}
      <section className="relative flex min-h-[calc(100vh-64px)] items-center overflow-hidden pt-16">
        {/* Background effects */}
        <div
          className="pointer-events-none absolute right-0 top-0 h-[600px] w-[600px]"
          style={{
            background:
              "radial-gradient(circle at center, rgba(212,168,75,0.04) 0%, transparent 70%)",
          }}
        />

        <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 lg:grid-cols-[55%_45%]">
          {/* Left column */}
          <div className="flex flex-col justify-center">
            {/* Pill badge */}
            <div
              className="transition-all duration-500"
              style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? "translateY(0)" : "translateY(20px)",
              }}
            >
              <span className="inline-block rounded-full border border-[#D4A84B]/40 bg-[#D4A84B]/10 px-4 py-1.5 text-[13px] text-[#D4A84B]">
                Now in Beta — Join 200+ KDP Publishers
              </span>
            </div>

            {/* Headline */}
            <h1
              className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-[#F5F5F5] sm:text-5xl lg:text-[56px]"
              style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? "translateY(0)" : "translateY(20px)",
                transition: "opacity 0.5s ease 0.15s, transform 0.5s ease 0.15s",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                letterSpacing: "-0.02em",
              }}
            >
              Amazon Ads on{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #D4A84B, #F0D78C)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Autopilot
              </span>
              .<br />
              You Focus on Publishing.
            </h1>

            {/* Subheadline */}
            <p
              className="mt-5 max-w-[520px] text-lg leading-[1.6] text-[#9CA3AF]"
              style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? "translateY(0)" : "translateY(20px)",
                transition: "opacity 0.5s ease 0.3s, transform 0.5s ease 0.3s",
              }}
            >
              RoyaltyAds automates bid adjustments, budget allocation, and keyword
              harvesting for your KDP campaigns — optimizing hourly so you don&apos;t
              have to.
            </p>

            {/* CTAs */}
            <div
              className="mt-8 flex flex-wrap items-center gap-4"
              style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? "translateY(0)" : "translateY(20px)",
                transition: "opacity 0.5s ease 0.45s, transform 0.5s ease 0.45s",
              }}
            >
              <Link
                href="/signup"
                className="rounded-lg bg-[#D4A84B] px-8 py-4 text-base font-medium text-[#0D0D0F] transition-all hover:scale-[1.02] hover:bg-[#E0B85C]"
              >
                Start Free Trial &rarr;
              </Link>
              <button className="flex items-center gap-2 rounded-lg border border-[#2A2A30] px-6 py-4 text-base text-[#9CA3AF] transition-all hover:border-[#3A3A42] hover:text-white">
                <Play className="h-4 w-4" />
                Watch Demo
              </button>
            </div>

            {/* Micro social proof */}
            <div
              className="mt-8 flex flex-wrap items-center gap-3"
              style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? "translateY(0)" : "translateY(20px)",
                transition: "opacity 0.5s ease 0.6s, transform 0.5s ease 0.6s",
              }}
            >
              <AvatarGroup />
              <span className="text-sm text-[#6B7280]">
                200+ publishers{" "}
                <span className="mx-1.5 text-[#3A3A42]">&middot;</span>
                <span className="font-mono text-[#22C55E]">3.11x</span> avg ROAS
                <span className="mx-1.5 text-[#3A3A42]">&middot;</span>
                Saves 15hrs/week
              </span>
            </div>
          </div>

          {/* Right column — dashboard mockup */}
          <div
            className="hidden items-center justify-center lg:flex"
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible
                ? "perspective(1200px) rotateY(-8deg) rotateX(2deg) translateX(0)"
                : "perspective(1200px) rotateY(-8deg) rotateX(2deg) translateX(40px)",
              transition: "opacity 0.8s ease 0.8s, transform 0.8s ease 0.8s",
            }}
          >
            <DashboardMockup className="w-full max-w-[520px]" />
          </div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF BAR ─── */}
      <section className="border-b border-t border-[#2A2A30] bg-[#141418]">
        <div className="mx-auto flex h-20 max-w-5xl items-center justify-center gap-8 px-6 md:gap-12">
          <span className="text-xs text-[#6B7280]">Trusted by publishers on</span>
          {["AMAZON ADS", "KINDLE DIRECT PUBLISHING", "AMAZON ATTRIBUTION"].map(
            (name) => (
              <span
                key={name}
                className="hidden font-mono text-xs uppercase tracking-widest text-[#6B7280]/40 transition-colors hover:text-[#6B7280]/70 sm:block"
              >
                {name}
              </span>
            ),
          )}
        </div>
      </section>

      {/* ─── PROBLEM → SOLUTION ─── */}
      <section id="features" className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          {/* Problem */}
          <AnimatedSection className="text-center">
            <h2 className="text-3xl font-bold text-[#F5F5F5] sm:text-4xl">
              Managing Amazon Ads Manually is Killing Your Margins
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[#9CA3AF]">
              You&apos;re spending hours adjusting bids, monitoring budgets, and
              harvesting keywords — time you should spend finding your next
              bestseller.
            </p>
          </AnimatedSection>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Clock,
                title: "15+ hrs/week",
                desc: "Manual bid adjustments eat your publishing time",
                color: "text-[#EF4444]",
              },
              {
                icon: TrendingDown,
                title: "Wasted ad spend",
                desc: "Without hourly optimization, you're overpaying for every click",
                color: "text-[#FBBF24]",
              },
              {
                icon: RefreshCw,
                title: "Reactive, not proactive",
                desc: "By the time you spot a problem, you've already overspent",
                color: "text-[#EF4444]",
              },
            ].map((card, i) => (
              <AnimatedSection key={card.title} delay={i * 100}>
                <div className="rounded-xl border border-[#2A2A30] bg-[#1A1A1F] p-7">
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                  <h3 className="mt-4 text-lg font-semibold text-[#F5F5F5]">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#9CA3AF]">
                    {card.desc}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* Divider */}
          <div className="my-16 flex justify-center">
            <div className="h-12 w-px bg-gradient-to-b from-[#2A2A30] to-[#D4A84B]/40" />
          </div>

          {/* Solution */}
          <AnimatedSection className="text-center">
            <h2 className="text-3xl font-bold text-[#F5F5F5] sm:text-4xl">
              RoyaltyAds Handles It All — Every Hour, Automatically
            </h2>
          </AnimatedSection>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Zap,
                title: "Hourly bid optimization",
                desc: "Bids adjust automatically based on real performance data",
              },
              {
                icon: TrendingUp,
                title: "Budget guardrails",
                desc: "Never overspend. Daily and campaign-level caps protect your margins",
              },
              {
                icon: Shield,
                title: "Proactive keyword harvesting",
                desc: "New converting search terms added automatically, wasters negated",
              },
            ].map((card, i) => (
              <AnimatedSection key={card.title} delay={i * 100}>
                <div className="rounded-xl border border-[#2A2A30] border-l-[3px] border-l-[#D4A84B] bg-[#1A1A1F] p-7">
                  <card.icon className="h-6 w-6 text-[#D4A84B]" />
                  <h3 className="mt-4 text-lg font-semibold text-[#F5F5F5]">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#9CA3AF]">
                    {card.desc}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRODUCT SCREENSHOT ─── */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <AnimatedSection>
            <h2 className="text-3xl font-bold text-[#F5F5F5] sm:text-4xl">
              Your Campaigns. Optimized 24/7.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[#9CA3AF]">
              See exactly what&apos;s happening across your entire KDP portfolio —
              spend, revenue, ROAS, and every automated action.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={200} className="mt-12">
            <DashboardMockup className="mx-auto max-w-[1100px]" />
          </AnimatedSection>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              "Real-time ROAS tracking",
              "30-day spend vs revenue trends",
              "Campaign-level controls",
            ].map((label, i) => (
              <AnimatedSection key={label} delay={400 + i * 100}>
                <p className="text-sm text-[#6B7280]">{label}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES GRID ─── */}
      <section id="features-detail" className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <AnimatedSection className="text-center">
            <h2 className="text-3xl font-bold text-[#F5F5F5] sm:text-4xl">
              Everything You Need to Scale KDP Ads Profitably
            </h2>
          </AnimatedSection>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Zap,
                title: "Automated Bidding",
                desc: "Bids adjust hourly based on ACoS targets, dayparting patterns, and conversion velocity.",
              },
              {
                icon: Shield,
                title: "Budget Guardrails",
                desc: "Set daily and campaign-level spend caps. Never wake up to a budget blowout.",
              },
              {
                icon: KeyRound,
                title: "Keyword Harvesting",
                desc: "Converting search terms auto-promoted to exact match. Wasting terms auto-negated.",
              },
              {
                icon: BarChart3,
                title: "Campaign Analytics",
                desc: "Spend, revenue, ACoS, ROAS — at portfolio, campaign, and keyword level.",
              },
              {
                icon: ClipboardList,
                title: "Activity Log",
                desc: "Every automated action logged with full rationale. Always know what changed and why.",
              },
              {
                icon: Link2,
                title: "Attribution Tracking",
                desc: "Track external traffic (Facebook, Google) to Amazon sales with one-click attribution links.",
              },
            ].map((feature, i) => (
              <AnimatedSection key={feature.title} delay={i * 100}>
                <div className="group rounded-xl border border-[#2A2A30] bg-[#1A1A1F] p-7 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#3A3A42]">
                  <feature.icon className="h-6 w-6 text-[#D4A84B]" />
                  <h3 className="mt-4 text-lg font-semibold text-[#F5F5F5]">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-[#9CA3AF]">
                    {feature.desc}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <AnimatedSection className="text-center">
            <h2 className="text-3xl font-bold text-[#F5F5F5] sm:text-4xl">
              Live in Under 5 Minutes
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[#9CA3AF]">
              No code. No complex setup. Connect your Amazon Ads account and
              RoyaltyAds takes over.
            </p>
          </AnimatedSection>

          <div className="relative mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
            {/* Connecting line (desktop) */}
            <div className="absolute left-[16.67%] right-[16.67%] top-10 hidden h-px bg-gradient-to-r from-[#2A2A30] via-[#D4A84B]/30 to-[#2A2A30] md:block" />

            {[
              {
                step: "\u2460",
                icon: KeyRound,
                title: "Connect",
                desc: "Link your Amazon Ads account with read/write API access. Takes 60 seconds.",
              },
              {
                step: "\u2461",
                icon: SlidersHorizontal,
                title: "Configure",
                desc: "Set your target ACoS, budget limits, and keyword rules. We provide smart defaults.",
              },
              {
                step: "\u2462",
                icon: Rocket,
                title: "Automate",
                desc: "RoyaltyAds optimizes bids, budgets, and keywords every hour. You monitor results.",
              },
            ].map((step, i) => (
              <AnimatedSection key={step.title} delay={i * 150} className="text-center">
                <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-[#2A2A30] bg-[#141418]">
                  <step.icon className="h-8 w-8 text-[#D4A84B]/80" />
                </div>
                <span className="font-mono text-2xl text-[#D4A84B]">{step.step}</span>
                <h3 className="mt-2 text-lg font-semibold text-[#F5F5F5]">
                  {step.title}
                </h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-[#9CA3AF]">
                  {step.desc}
                </p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <AnimatedSection className="text-center">
            <h2 className="text-3xl font-bold text-[#F5F5F5] sm:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[#9CA3AF]">
              No percentage of ad spend. No hidden fees. Just a flat monthly rate.
            </p>
          </AnimatedSection>

          <div className="mt-12 grid items-start gap-6 md:grid-cols-3">
            {[
              {
                name: "Starter",
                price: "$49",
                popular: false,
                features: [
                  "Up to 5 campaigns",
                  "Daily optimization",
                  "Basic analytics",
                  "Email support",
                ],
                cta: "Start Free Trial",
              },
              {
                name: "Professional",
                price: "$99",
                popular: true,
                features: [
                  "Unlimited campaigns",
                  "Hourly optimization",
                  "Keyword harvesting",
                  "Budget guardrails",
                  "Attribution tracking",
                  "Activity log",
                  "Priority support",
                ],
                cta: "Start Free Trial",
              },
              {
                name: "Enterprise",
                price: "Custom",
                popular: false,
                features: [
                  "Everything in Professional",
                  "Dedicated support",
                  "Custom automation rules",
                  "API access",
                  "Multi-account management",
                ],
                cta: "Contact Us",
              },
            ].map((plan, i) => (
              <AnimatedSection key={plan.name} delay={i * 100}>
                <div
                  className={`relative rounded-2xl border bg-[#1A1A1F] p-8 transition-all duration-200 hover:scale-[1.01] ${
                    plan.popular
                      ? "border-2 border-[#D4A84B] py-10"
                      : "border-[#2A2A30]"
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#D4A84B] px-3 py-1 text-xs font-semibold text-[#0D0D0F]">
                      POPULAR
                    </span>
                  )}
                  <h3 className="text-lg font-semibold text-[#F5F5F5]">{plan.name}</h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="font-mono text-4xl font-semibold text-[#F5F5F5]">
                      {plan.price}
                    </span>
                    {plan.price !== "Custom" && (
                      <span className="text-sm text-[#6B7280]">/month</span>
                    )}
                  </div>

                  <ul className="mt-6 space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#22C55E]" />
                        <span className="text-sm text-[#9CA3AF]">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/signup"
                    className={`mt-8 block w-full rounded-lg py-3 text-center text-sm font-medium transition-all ${
                      plan.popular
                        ? "bg-[#D4A84B] text-[#0D0D0F] hover:bg-[#E0B85C]"
                        : "border border-[#2A2A30] text-[#9CA3AF] hover:border-[#3A3A42] hover:text-[#F5F5F5]"
                    }`}
                  >
                    {plan.cta} &rarr;
                  </Link>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <AnimatedSection className="text-center">
            <h2 className="text-3xl font-bold text-[#F5F5F5] sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </AnimatedSection>
          <AnimatedSection delay={200} className="mt-12">
            <FaqAccordion />
          </AnimatedSection>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="relative py-20 md:py-28">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(212,168,75,0.04) 0%, transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <AnimatedSection>
            <h2 className="text-3xl font-bold text-[#F5F5F5] sm:text-[44px] sm:leading-[1.15]">
              Stop Managing Ads.
              <br />
              Start Scaling Revenue.
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-lg text-[#9CA3AF]">
              Join 200+ KDP publishers who automated their Amazon Ads with
              RoyaltyAds.
            </p>
            <Link
              href="/signup"
              className="mt-8 inline-block rounded-lg bg-[#D4A84B] px-10 py-[18px] text-base font-medium text-[#0D0D0F] transition-all hover:scale-[1.02] hover:bg-[#E0B85C]"
            >
              Start Your Free Trial &rarr;
            </Link>
            <p className="mt-4 text-[13px] text-[#6B7280]">
              14-day free trial &middot; No credit card required &middot; Cancel
              anytime
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-[#2A2A30] bg-[#141418]">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div>
              <span
                className="font-mono text-lg font-semibold text-[#D4A84B]"
                style={{ textShadow: "0 0 20px rgba(212,168,75,0.15)" }}
              >
                RoyaltyAds
              </span>
              <p className="mt-2 text-sm text-[#6B7280]">Amazon KDP automation</p>
            </div>

            {/* Product */}
            <div>
              <h4 className="mb-3 text-sm font-medium text-[#F5F5F5]">Product</h4>
              <ul className="space-y-2">
                {["Features", "Pricing", "Changelog", "Roadmap"].map((link) => (
                  <li key={link}>
                    <span className="cursor-pointer text-sm text-[#9CA3AF] transition-colors hover:text-[#F5F5F5]">
                      {link}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="mb-3 text-sm font-medium text-[#F5F5F5]">Resources</h4>
              <ul className="space-y-2">
                {["Blog", "Help Center", "API Docs", "Status Page"].map((link) => (
                  <li key={link}>
                    <span className="cursor-pointer text-sm text-[#9CA3AF] transition-colors hover:text-[#F5F5F5]">
                      {link}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="mb-3 text-sm font-medium text-[#F5F5F5]">Legal</h4>
              <ul className="space-y-2">
                {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
                  (link) => (
                    <li key={link}>
                      <span className="cursor-pointer text-sm text-[#9CA3AF] transition-colors hover:text-[#F5F5F5]">
                        {link}
                      </span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-[#2A2A30] pt-6">
            <p className="text-center text-sm text-[#6B7280]">
              &copy; 2025 RoyaltyAds. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
