"use client";

import React, { useRef } from "react";
import Link from "next/link";
import {
  Users,
  UserMinus,
  UserPlus,
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Activity,
  Search,
  Sparkles,
  Star,
} from "lucide-react";
import { GITHUB_REPO_URL } from "@/lib/ui";
import { BrandLogo } from "./BrandLogo";
import { LoginView } from "./LoginView";

interface LandingViewProps {
  isOAuthConfigured: boolean;
  onLoginSuccess: () => void;
  oauthError?: string | null;
}

const FEATURES = [
  {
    icon: UserMinus,
    title: "Spot non-followers",
    description:
      "Instantly compute Following − Followers to surface inactive or one-way connections.",
    tone: "danger" as const,
  },
  {
    icon: UserPlus,
    title: "Reciprocate follows",
    description:
      "Find developers who follow you that you haven't followed yet, then connect in one click.",
    tone: "brand" as const,
  },
  {
    icon: ShieldCheck,
    title: "Rate-limit safe",
    description:
      "Sequential actions with configurable delays keep your account clear of HTTP 429 throttling.",
    tone: "info" as const,
  },
  {
    icon: Lock,
    title: "Encrypted sessions",
    description:
      "Credentials are sealed in HTTP-only cookies with AES-256-GCM. No tokens in local storage.",
    tone: "brand" as const,
  },
  {
    icon: Search,
    title: "Instant filtering",
    description:
      "Search thousands of accounts by handle, then select a page or every matching result.",
    tone: "info" as const,
  },
  {
    icon: Zap,
    title: "Full control",
    description:
      "Live progress, an activity feed, and instant cancellation during any bulk operation.",
    tone: "warning" as const,
  },
];

const STEPS = [
  {
    number: "01",
    title: "Authenticate",
    description: "Sign in with GitHub OAuth or a scoped personal access token in seconds.",
  },
  {
    number: "02",
    title: "Index & compare",
    description: "We query the official REST API and split your graph into actionable groups.",
  },
  {
    number: "03",
    title: "Review & execute",
    description: "Inspect, search and safely run single or bulk actions with live progress.",
  },
];

export function LandingView({
  isOAuthConfigured,
  onLoginSuccess,
  oauthError,
}: LandingViewProps) {
  const loginSectionRef = useRef<HTMLDivElement>(null);

  const scrollToLogin = () => {
    loginSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface-glass)] backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] w-full max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-8 lg:px-12">
          <Link href="/" className="group flex min-w-0 items-center gap-2.5">
            <BrandLogo className="h-8 w-8 shrink-0 transition-transform duration-200 group-hover:scale-105" />
            <span className="truncate text-sm font-semibold tracking-tight text-[var(--text)]">
              GitHub Social Manager
            </span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2" aria-label="Main navigation">
            <a
              href="#features"
              className="hidden rounded-lg px-3 py-2 text-[13px] font-medium text-[var(--text-muted)] transition-colors hover:bg-white/5 hover:text-[var(--text)] md:inline-flex"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="hidden rounded-lg px-3 py-2 text-[13px] font-medium text-[var(--text-muted)] transition-colors hover:bg-white/5 hover:text-[var(--text)] md:inline-flex"
            >
              How it works
            </a>
            <Link
              href="/docs"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium text-[var(--text-muted)] transition-colors hover:bg-white/5 hover:text-[var(--text)]"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Docs</span>
            </Link>
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Star GitHub Social Manager on GitHub"
              title="Star on GitHub"
              className="app-btn app-btn-outline h-9 px-2.5 sm:px-3"
            >
              <Star className="h-3.5 w-3.5 text-[var(--warning)]" />
              <span className="hidden text-xs font-semibold lg:inline">Star on GitHub</span>
            </a>
            <button type="button" onClick={scrollToLogin} className="app-btn app-btn-primary ml-1">
              Sign in
            </button>
          </nav>
        </div>
      </header>

      <main id="main-content" className="flex-1 outline-none">
        {/* Hero */}
        <section className="relative mx-auto flex min-h-[calc(100dvh-68px)] w-full max-w-[1600px] flex-col justify-center px-4 py-16 sm:px-8 sm:py-20 lg:px-12">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--brand-soft)] opacity-60 blur-[140px]" />
          <div className="relative grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-12">
            <div className="animate-rise lg:col-span-7">
              <div className="app-chip app-chip-brand">
                <Sparkles className="h-3.5 w-3.5" />
                Private by design · Official GitHub REST API
              </div>

              <h1 className="hero-headline mt-6 text-[clamp(2.25rem,5vw,3.75rem)] font-bold leading-[1.08] tracking-[-0.04em] text-[var(--text)]">
                Clean up your following list.
                <br />
                <span className="bg-gradient-to-r from-[var(--brand-bright)] via-[var(--brand)] to-[var(--info)] bg-clip-text text-transparent">
                  Grow real connections.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-[var(--text-soft)]">
                See who doesn&apos;t follow you back, find supporters you haven&apos;t followed yet, and
                act with rate-limited precision — without exposing your credentials.
              </p>

              <div className="mt-7 grid max-w-xl grid-cols-1 gap-x-5 gap-y-2.5 sm:grid-cols-2">
                {[
                  "One-click unfollow cleanup",
                  "Effortless follow-backs",
                  "Sequential throttling engine",
                  "AES-256-GCM sessions",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-[13px] text-[var(--text-soft)]">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </span>
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button type="button" onClick={scrollToLogin} className="app-btn app-btn-primary h-12 px-5 text-sm">
                  Audit my profile
                  <ArrowRight className="h-4 w-4" />
                </button>
                <Link href="/docs" className="app-btn app-btn-outline h-12 px-5 text-sm">
                  <BookOpen className="h-4 w-4 text-[var(--info)]" />
                  Setup guide
                </Link>
              </div>
            </div>

            <div
              ref={loginSectionRef}
              className="animate-rise delay-2 relative scroll-mt-24 lg:col-span-5"
            >
              <div className="pointer-events-none absolute -inset-8 rounded-[40px] bg-[var(--info-soft)] opacity-50 blur-3xl" />
              <div className="relative mx-auto w-full max-w-md lg:ml-auto lg:mr-0">
                <div className="mb-3 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-faint)]">
                  <span className="h-px w-8 bg-[var(--border)]" />
                  Access portal
                  <span className="h-px w-8 bg-[var(--border)]" />
                </div>
                <LoginView
                  isOAuthConfigured={isOAuthConfigured}
                  onLoginSuccess={onLoginSuccess}
                  oauthError={oauthError}
                  compact
                />
              </div>
            </div>
          </div>
        </section>

        {/* Product preview */}
        <section id="preview" className="mx-auto w-full max-w-[1600px] px-4 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24 lg:px-12">
          <div className="mb-9 text-center">
            <p className="eyebrow-blue">Inside the app</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[var(--text)] sm:text-3xl">
              Clarity at every step
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-[13px] leading-relaxed text-[var(--text-muted)]">
              A focused dashboard that puts your social graph, risks and next actions in one place.
            </p>
          </div>

          <div className="app-panel overflow-hidden shadow-[var(--shadow-lg)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] bg-white/[0.02] px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--danger)]/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--warning)]/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--brand)]/70" />
                <span className="ml-3 font-mono text-[11px] text-[var(--text-faint)]">
                  social-manager / dashboard
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                <Activity className="h-3.5 w-3.5 text-[var(--info)]" />
                <span className="font-mono">4,980 / 5,000 API requests</span>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  { label: "Followers", value: "128", tone: "text-[var(--text)]", icon: Users },
                  { label: "Following", value: "94", tone: "text-[var(--text)]", icon: Users },
                  { label: "Not following back", value: "19", tone: "text-[var(--danger)]", icon: UserMinus },
                  { label: "Follow back", value: "9", tone: "text-[var(--brand)]", icon: UserPlus },
                ].map((stat, index) => (
                  <div
                    key={stat.label}
                    className={`animate-rise delay-${index + 1} app-panel-inset p-4`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-faint)]">
                        {stat.label}
                      </p>
                      <stat.icon className={`h-3.5 w-3.5 ${stat.tone}`} />
                    </div>
                    <p className={`mt-3 font-mono text-2xl font-semibold tabular-nums ${stat.tone}`}>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="app-panel-inset flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[13px] font-semibold text-[var(--text)]">Unfollow non-followers</p>
                    <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                      19 accounts eligible for review
                    </p>
                  </div>
                  <span className="app-btn app-btn-danger pointer-events-none h-9">Review</span>
                </div>
                <div className="app-panel-inset flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[13px] font-semibold text-[var(--text)]">Follow back supporters</p>
                    <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                      9 new accounts follow you
                    </p>
                  </div>
                  <span className="app-btn app-btn-primary pointer-events-none h-9">Follow back</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-24 border-t border-[var(--border)] py-20">
          <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-8 lg:px-12">
            <div className="mb-10 text-center">
              <p className="eyebrow">Built for trust</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-[var(--text)] sm:text-3xl">
                Everything you need to audit your graph
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-[13px] leading-relaxed text-[var(--text-muted)]">
                Purpose-built to protect your account, respect API limits and keep credentials secure.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature, index) => (
                <article
                  key={feature.title}
                  className={`app-panel app-panel-hover animate-rise delay-${(index % 3) + 1} p-5`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                      feature.tone === "danger"
                        ? "border-[var(--danger-line)] bg-[var(--danger-soft)] text-[var(--danger)]"
                        : feature.tone === "info"
                          ? "border-[var(--info-line)] bg-[var(--info-soft)] text-[var(--info)]"
                          : feature.tone === "warning"
                            ? "border-[var(--warning-line)] bg-[var(--warning-soft)] text-[var(--warning)]"
                            : "border-[var(--brand-line)] bg-[var(--brand-soft)] text-[var(--brand)]"
                    }`}
                  >
                    <feature.icon className="h-[18px] w-[18px]" />
                  </div>
                  <h3 className="section-title mt-4">{feature.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-muted)]">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-24 border-t border-[var(--border)] py-20">
          <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-8 lg:px-12">
            <div className="mb-10 text-center">
              <p className="eyebrow-blue">Three simple steps</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-[var(--text)] sm:text-3xl">
                From sign-in to a cleaner graph
              </h2>
            </div>

            <div className="relative grid grid-cols-1 gap-5 md:grid-cols-3">
              <div className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-[var(--border-strong)] to-transparent md:block" />
              {STEPS.map((step, index) => (
                <div key={step.number} className={`animate-rise delay-${index + 1} app-panel p-5`}>
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--brand-line)] bg-[var(--brand-soft)] font-mono text-sm font-bold text-[var(--brand)]">
                    {step.number}
                  </div>
                  <h3 className="section-title mt-4">{step.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-muted)]">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <button type="button" onClick={scrollToLogin} className="app-btn app-btn-primary h-12 px-6 text-sm">
                Get started now
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="mx-auto w-full max-w-[1600px] px-4 pb-20 sm:px-8 lg:px-12">
          <div className="app-panel relative mx-auto w-full overflow-hidden px-6 py-12 text-center sm:px-12">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_top,rgba(87,217,138,0.16),transparent_70%)]" />
            <div className="relative">
              <h2 className="text-2xl font-bold tracking-tight text-[var(--text)] sm:text-3xl">
                Ready for a cleaner social graph?
              </h2>
              <p className="mx-auto mt-3 max-w-md text-[13px] leading-relaxed text-[var(--text-muted)]">
                Sign in and get a complete picture of your GitHub connections in seconds.
              </p>
              <button
                type="button"
                onClick={scrollToLogin}
                className="app-btn app-btn-primary mx-auto mt-6 h-12 px-6 text-sm"
              >
                Audit my profile
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--bg-deep)]/40 py-8">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center justify-between gap-4 px-4 text-xs text-[var(--text-faint)] sm:flex-row sm:px-8 lg:px-12">
          <div className="flex items-center gap-2">
            <BrandLogo className="h-5 w-5" />
            <span className="font-semibold text-[var(--text-soft)]">GitHub Social Manager</span>
            <span>· MIT licensed</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-5">
            <a href="#features" className="transition-colors hover:text-[var(--text)]">
              Features
            </a>
            <Link href="/docs" className="transition-colors hover:text-[var(--text)]">
              Documentation
            </Link>
            <a
              href="https://github.com/NischalAcharya060/GitHub-Social-Manager"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[var(--text)]"
            >
              Repository
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
