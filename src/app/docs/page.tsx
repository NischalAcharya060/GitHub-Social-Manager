"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Info,
  AlertTriangle,
  Lock,
  ChevronRight,
  ChevronDown,
  BookOpen,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { GithubIcon } from "@/components/GithubIcon";

export default function DocsPage() {
  const [copiedScope, setCopiedScope] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const copyToClipboard = (text: string, type: "scope" | "url") => {
    navigator.clipboard.writeText(text);
    if (type === "scope") {
      setCopiedScope(true);
      setTimeout(() => setCopiedScope(false), 2000);
    } else {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const navLinks = [
    { href: "#overview", label: "1. Overview & Authentication" },
    { href: "#method-oauth", label: "2. Method 1: 1-Click GitHub OAuth" },
    { href: "#method-pat", label: "3. Method 2: Personal Access Token" },
    { href: "#pat-classic-steps", label: "   • Classic Token (Recommended)" },
    { href: "#pat-fine-grained-steps", label: "   • Fine-Grained Token" },
    { href: "#rate-limits", label: "4. Rate Limits & Anti-Throttling" },
    { href: "#security-privacy", label: "5. Security & Token Storage" },
    { href: "#faq", label: "6. Frequently Asked Questions" },
  ];

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--bg)] text-[var(--text)] selection:bg-[var(--brand-soft)]">
      {/* Top Header */}
      <header className="sticky top-0 z-30 h-16 bg-[var(--surface-glass)] backdrop-blur-xl border-b border-[var(--border)] px-4 sm:px-8 lg:px-12">
        <div className="mx-auto flex h-full w-full max-w-[1600px] items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <BrandLogo className="w-7 h-7 shadow-sm group-hover:scale-105 transition-transform" />
              <span className="font-semibold text-sm text-[var(--text)]">
                GitHub Social Manager
              </span>
            </Link>
            <span className="text-[var(--text-faint)]">/</span>
            <span className="text-xs text-[var(--text-muted)] font-medium flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[var(--info)]" />
              Documentation
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="app-btn app-btn-primary"
            >
              <span>Launch App / Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <a
              href="https://github.com/NischalAcharya060/GitHub-Social-Manager"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] rounded-lg transition-colors border border-[var(--border)]"
              title="View GitHub Repository"
            >
              <GithubIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Documentation Shell */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-8 gap-8 lg:gap-12">
        {/* Left Table of Contents (Desktop Sticky) */}
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3 shadow-sm">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              On This Page
            </h4>
            <nav className="space-y-1 text-xs font-medium">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block py-1.5 text-[var(--text-muted)] hover:text-[var(--info)] hover:translate-x-1 transition-all truncate"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="pt-3 border-t border-[var(--border)]">
              <a
                href="https://github.com/settings/tokens/new?scopes=user:follow,read:user&description=GitHub+Social+Manager"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-[11px] font-semibold text-[var(--info)] hover:text-[var(--info)] bg-[var(--surface-2)] hover:bg-[var(--border)] border border-[var(--border)] rounded-lg transition-colors"
              >
                <span>Generate Token Directly</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </aside>

        {/* Documentation Content */}
        <main id="main-content" className="min-w-0 flex-1 space-y-10 outline-none" tabIndex={-1}>
          {/* Breadcrumb & Title */}
          <div>
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-2">
              <Link href="/" className="hover:text-[var(--info)] transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3 h-3 text-[var(--text-faint)]" />
              <span className="text-[var(--text-soft)]">Authentication &amp; User Guide</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">
              Authentication &amp; Token Setup Guide
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-2 leading-relaxed">
              GitHub Social Manager requires authorized access to query your followers and execute
              follow/unfollow operations through GitHub&apos;s official REST API. Follow this guide to
              authenticate with 1-click OAuth or generate a secure Personal Access Token (PAT).
            </p>
          </div>

          {/* Quick Navigation Accordion (Mobile & Tablet) */}
          <div className="block lg:hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 sm:p-4">
            <details className="group">
              <summary className="flex cursor-pointer items-center justify-between text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text)]">
                <span>On This Page · Table of Contents</span>
                <ChevronDown className="h-4 w-4 text-[var(--text-faint)] transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <nav className="mt-3 space-y-1 border-t border-[var(--border)] pt-2.5 text-xs font-medium">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="block py-1.5 text-[var(--text-muted)] transition-colors hover:text-[var(--info)]"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </details>
          </div>

          {/* Section 1: Overview */}
          <section id="overview" className="space-y-4 pt-4 border-t border-[var(--border)] scroll-mt-24">
            <h2 className="text-xl font-bold text-[var(--text)] flex items-center gap-2">
              <span className="text-[var(--info)]">1.</span> Overview &amp; Authentication Methods
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-soft)] leading-relaxed">
              To inspect who doesn&apos;t follow you back or follow back your supporters, GitHub Social
              Manager provides two official authentication routes:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
                  <GithubIcon className="w-4 h-4 text-[var(--brand)]" />
                  1-Click GitHub OAuth
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Best for regular users. Simply click &quot;Continue with GitHub&quot;, authorize the app
                  once, and you are signed in without dealing with tokens.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
                  <KeyRound className="w-4 h-4 text-[var(--info)]" />
                  Personal Access Token (PAT)
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Best for developers or private instances. Paste your own token with the <code className="text-[var(--brand)] bg-[var(--bg)] px-1 py-0.5 rounded">user:follow</code> scope for immediate access.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: OAuth Login */}
          <section id="method-oauth" className="space-y-4 pt-6 border-t border-[var(--border)] scroll-mt-24">
            <h2 className="text-xl font-bold text-[var(--text)] flex items-center gap-2">
              <span className="text-[var(--info)]">2.</span> Method 1: Sign in with GitHub OAuth
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-soft)] leading-relaxed">
              If GitHub OAuth is configured on your deployment (or when visiting the hosted version),
              signing in takes one click:
            </p>

            <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
              <ol className="list-decimal list-inside space-y-2 text-xs text-[var(--text-soft)] leading-relaxed">
                <li>
                  Go to the{" "}
                  <Link href="/" className="text-[var(--info)] hover:underline font-semibold">
                    Login Portal
                  </Link>
                  .
                </li>
                <li>
                  Click the green button: <strong>&quot;Continue with GitHub&quot;</strong>.
                </li>
                <li>
                  GitHub will present an authorization screen asking to grant access to:
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1 text-[var(--text-muted)]">
                    <li>Follow and unfollow users (<code className="text-[var(--brand)]">user:follow</code>)</li>
                    <li>Read your public user profile data (<code className="text-[var(--brand)]">read:user</code>)</li>
                  </ul>
                </li>
                <li>Click <strong>&quot;Authorize&quot;</strong>. You will be redirected immediately to your dashboard.</li>
              </ol>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--surface-2)]/50 border border-[var(--border)] flex items-start gap-3">
              <Info className="w-4 h-4 text-[var(--info)] shrink-0 mt-0.5" />
              <div className="text-xs text-[var(--text-muted)] leading-relaxed">
                <strong className="text-[var(--text)] block mb-0.5">Note for Self-Hosters:</strong>
                If running locally and you see &quot;OAuth App Not Configured&quot;, you can either set your OAuth Client ID &amp; Secret in <code className="text-[var(--text-soft)]">.env.local</code> or sign in immediately using Method 2 below.
              </div>
            </div>
          </section>

          {/* Section 3: Personal Access Token */}
          <section id="method-pat" className="space-y-4 pt-6 border-t border-[var(--border)] scroll-mt-24">
            <h2 className="text-xl font-bold text-[var(--text)] flex items-center gap-2">
              <span className="text-[var(--info)]">3.</span> Method 2: Sign in with a Personal Access Token
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-soft)] leading-relaxed">
              A GitHub Personal Access Token (PAT) functions like a password specifically scoped to
              allow follower management without sharing your GitHub account password.
            </p>

            {/* Direct 1-Click Generation Box */}
            <div className="p-5 rounded-xl bg-gradient-to-r from-[var(--surface)] to-[var(--surface-2)] border border-[var(--brand-line)] shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--brand)]">
                <Sparkles className="w-4 h-4" />
                Fastest Method: Pre-Configured Token Link
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                We have prepared a pre-configured link that automatically opens GitHub with the exact
                required scopes (<code className="text-[var(--brand)]">user:follow</code> and <code className="text-[var(--brand)]">read:user</code>) pre-checked and named &quot;GitHub Social Manager&quot;:
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href="https://github.com/settings/tokens/new?scopes=user:follow,read:user&description=GitHub+Social+Manager"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="app-btn app-btn-primary"
                >
                  <span>Generate Pre-Configured Token on GitHub</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      "https://github.com/settings/tokens/new?scopes=user:follow,read:user&description=GitHub+Social+Manager",
                      "url"
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--text-soft)] border border-[var(--border)] text-xs font-medium rounded-lg transition-colors"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-[var(--brand)]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl ? "Link Copied" : "Copy Link"}</span>
                </button>
              </div>
            </div>

            {/* Step-by-Step Classic Token */}
            <div id="pat-classic-steps" className="space-y-3 pt-2">
              <h3 className="text-base font-bold text-[var(--text)]">
                Manual Step-by-Step Guide (Classic Token)
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                If you prefer to configure the token manually, follow these steps:
              </p>

              <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--text)]">
                    <span className="w-5 h-5 rounded-full bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[11px] text-[var(--info)]">
                      1
                    </span>
                    Navigate to Developer Settings
                  </div>
                  <p className="text-xs text-[var(--text-muted)] ml-7">
                    On GitHub, click your profile picture in the top-right corner &gt; <strong>Settings</strong>. Scroll down on the left sidebar to the very bottom and click <strong>Developer Settings</strong> (or visit <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-[var(--info)] hover:underline">github.com/settings/tokens</a>).
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--text)]">
                    <span className="w-5 h-5 rounded-full bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[11px] text-[var(--info)]">
                      2
                    </span>
                    Select Personal Access Tokens &gt; Tokens (classic)
                  </div>
                  <p className="text-xs text-[var(--text-muted)] ml-7">
                    Click <strong>Generate new token</strong> &gt; <strong>Generate new token (classic)</strong>. You may be prompted to enter your GitHub password or 2FA code.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--text)]">
                    <span className="w-5 h-5 rounded-full bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[11px] text-[var(--info)]">
                      3
                    </span>
                    Configure Note and Expiration
                  </div>
                  <p className="text-xs text-[var(--text-muted)] ml-7">
                    - <strong>Note</strong>: Enter <code className="text-[var(--text)] bg-[var(--bg)] px-1 py-0.5 rounded">GitHub Social Manager</code>.<br />
                    - <strong>Expiration</strong>: Choose your desired expiration (e.g. 30 days, 90 days, or No expiration).
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--text)]">
                    <span className="w-5 h-5 rounded-full bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[11px] text-[var(--info)]">
                      4
                    </span>
                    Select Required Scopes
                  </div>
                  <p className="text-xs text-[var(--text-muted)] ml-7 mb-2">
                    Scroll down through the scopes list and check the box for:
                  </p>
                  <div className="ml-7 p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-[var(--brand)] block">
                        user:follow
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)]">
                        Follow and unfollow users (also includes read:user permissions)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("user:follow", "scope")}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs text-[var(--text-soft)] bg-[var(--surface-2)] hover:bg-[var(--border)] border border-[var(--border)] rounded transition-colors"
                    >
                      {copiedScope ? <Check className="w-3.5 h-3.5 text-[var(--brand)]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedScope ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--text)]">
                    <span className="w-5 h-5 rounded-full bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[11px] text-[var(--info)]">
                      5
                    </span>
                    Generate and Copy Token
                  </div>
                  <p className="text-xs text-[var(--text-muted)] ml-7">
                    Scroll to the bottom of the page and click <strong>Generate token</strong>. Copy your new token immediately (it looks like <code className="text-[var(--text)] font-mono text-[11px]">ghp_xxxxxxxxxxxx</code>). GitHub will not display it again once you navigate away!
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--text)]">
                    <span className="w-5 h-5 rounded-full bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[11px] text-[var(--info)]">
                      6
                    </span>
                    Paste in GitHub Social Manager
                  </div>
                  <p className="text-xs text-[var(--text-muted)] ml-7">
                    Switch to the <strong>Personal Access Token</strong> tab on the login screen, paste your token, and click <strong>Sign In with Token</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Fine-Grained Tokens Info */}
            <div id="pat-fine-grained-steps" className="space-y-3 pt-4">
              <h3 className="text-base font-bold text-[var(--text)]">
                Using Fine-Grained Personal Access Tokens (Beta)
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                If your organization or preference requires Fine-Grained tokens (<code className="text-[var(--text)] font-mono">github_pat_xxxx</code>):
              </p>
              <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2 text-xs text-[var(--text-soft)] leading-relaxed">
                <p>1. Go to <strong>Developer Settings &gt; Personal access tokens &gt; Fine-grained tokens</strong>.</p>
                <p>2. Click <strong>Generate new token</strong>.</p>
                <p>3. Under <strong>Repository access</strong>, select &quot;Public Repositories (read-only)&quot; or &quot;Only select repositories&quot;.</p>
                <p>4. Under <strong>Account permissions</strong>, locate <strong>Followers</strong> and set Access to <strong>Read and write</strong>.</p>
                <p>5. Click <strong>Generate token</strong> and paste it into the application.</p>
              </div>
            </div>
          </section>

          {/* Section 4: Rate Limits */}
          <section id="rate-limits" className="space-y-4 pt-6 border-t border-[var(--border)] scroll-mt-24">
            <h2 className="text-xl font-bold text-[var(--text)] flex items-center gap-2">
              <span className="text-[var(--info)]">4.</span> Rate Limits &amp; Anti-Throttling Safeguards
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-soft)] leading-relaxed">
              GitHub imposes rate limits on authenticated API calls:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase block">Hourly Quota</span>
                <span className="text-lg font-bold font-mono text-[var(--text)] mt-1 block">5,000 reqs</span>
                <span className="text-[11px] text-[var(--text-muted)] mt-0.5 block">Per authenticated user</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase block">Pagination Efficiency</span>
                <span className="text-lg font-bold font-mono text-[var(--info)] mt-1 block">100 / page</span>
                <span className="text-[11px] text-[var(--text-muted)] mt-0.5 block">Fetches up to 3,000 in seconds</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase block">Safe Batch Delay</span>
                <span className="text-lg font-bold font-mono text-[var(--brand)] mt-1 block">1.5s delay</span>
                <span className="text-[11px] text-[var(--text-muted)] mt-0.5 block">Prevents HTTP 429 throttling</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2">
              <h3 className="text-xs font-bold text-[var(--text)] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[var(--brand)]" />
                How GitHub Social Manager Protects Your Account
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                GitHub detects abnormal bursts of social actions (rapid mass follow or unfollow). To keep your account completely safe:
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs text-[var(--text-soft)] ml-2">
                <li>Actions are executed sequentially, never in simultaneous uncontrolled floods.</li>
                <li>The bulk execution engine enforces customizable delay intervals (Safe 1.5s, Balanced 0.8s, Fast 0.3s).</li>
                <li>You can click <strong>&quot;Stop / Cancel&quot;</strong> at any time to pause or halt pending requests immediately.</li>
              </ul>
            </div>
          </section>

          {/* Section 5: Security & Privacy */}
          <section id="security-privacy" className="space-y-4 pt-6 border-t border-[var(--border)] scroll-mt-24">
            <h2 className="text-xl font-bold text-[var(--text)] flex items-center gap-2">
              <span className="text-[var(--info)]">5.</span> Security &amp; Token Storage Architecture
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-soft)] leading-relaxed">
              We treat security and credential hygiene with paramount importance:
            </p>

            <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
              <div className="flex items-start gap-3">
                <Lock className="w-4 h-4 text-[var(--brand)] shrink-0 mt-1" />
                <div className="text-xs leading-relaxed">
                  <strong className="text-[var(--text)] block font-semibold mb-0.5">
                    AES-256-GCM Encrypted HTTP-Only Cookies
                  </strong>
                  <span className="text-[var(--text-muted)]">
                    When you authenticate, your token is sealed server-side using AES-256-GCM authenticated encryption with a random IV and authentication tag. It is stored solely in an <code className="text-[var(--text)]">httpOnly</code>, <code className="text-[var(--text)]">SameSite=Lax</code> browser cookie. JavaScript running in the browser cannot read or extract your token.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-[var(--border)]">
                <CheckCircle2 className="w-4 h-4 text-[var(--info)] shrink-0 mt-1" />
                <div className="text-xs leading-relaxed">
                  <strong className="text-[var(--text)] block font-semibold mb-0.5">
                    Zero Database Retention
                  </strong>
                  <span className="text-[var(--text-muted)]">
                    We do not store your tokens, followers list, or GitHub passwords in any persistent database. When you click <strong>Sign Out</strong>, the session cookie is wiped immediately.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-[var(--border)]">
                <AlertTriangle className="w-4 h-4 text-[var(--warning)] shrink-0 mt-1" />
                <div className="text-xs leading-relaxed">
                  <strong className="text-[var(--text)] block font-semibold mb-0.5">
                    Revoking Access
                  </strong>
                  <span className="text-[var(--text-muted)]">
                    You retain 100% control over access. You can revoke any Personal Access Token or OAuth authorized application at any moment directly in your{" "}
                    <a
                      href="https://github.com/settings/tokens"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--info)] hover:underline"
                    >
                      GitHub Developer Settings
                    </a>
                    .
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 6: FAQ */}
          <section id="faq" className="space-y-4 pt-6 border-t border-[var(--border)] scroll-mt-24">
            <h2 className="text-xl font-bold text-[var(--text)] flex items-center gap-2">
              <span className="text-[var(--info)]">6.</span> Frequently Asked Questions (FAQ)
            </h2>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-1.5">
                <h4 className="text-xs sm:text-sm font-semibold text-[var(--text)]">
                  Why does the app need the &quot;user:follow&quot; scope?
                </h4>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  GitHub&apos;s REST API separates reading followers (<code className="text-[var(--text)]">read:user</code>) from modifying who you follow (<code className="text-[var(--text)]">user:follow</code>). To allow you to unfollow non-followers or follow back candidates from the interface, GitHub requires this exact scope.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-1.5">
                <h4 className="text-xs sm:text-sm font-semibold text-[var(--text)]">
                  Will unfollowing accounts notify them?
                </h4>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  No. GitHub does not send email notifications or alerts when someone unfollows an account.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-1.5">
                <h4 className="text-xs sm:text-sm font-semibold text-[var(--text)]">
                  I received &quot;Invalid Personal Access Token&quot; on login. What should I check?
                </h4>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Ensure you copied the entire token without extra leading or trailing spaces. Also confirm the token has not expired and that the <code className="text-[var(--brand)]">user:follow</code> scope checkbox was enabled when the token was created.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-1.5">
                <h4 className="text-xs sm:text-sm font-semibold text-[var(--text)]">
                  How many accounts can I unfollow or follow at once?
                </h4>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  You can process all eligible accounts. For large batches (50+ accounts), we strongly recommend using the <strong>Safe (1.5s delay)</strong> speed preset in the confirmation dialog to respect GitHub&apos;s secondary rate limits.
                </p>
              </div>
            </div>
          </section>

          {/* Bottom CTA Box */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-[var(--surface)] to-[var(--surface-2)] border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
            <div>
              <h3 className="text-base font-bold text-[var(--text)]">
                Ready to manage your GitHub social graph?
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Audit non-followers and manage follow-backs in seconds.
              </p>
            </div>

            <Link
              href="/"
              className="app-btn app-btn-primary shrink-0"
            >
              <span>Go to Login &amp; Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-[var(--border)] bg-[var(--surface)] py-8 text-center text-xs text-[var(--text-muted)]">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center justify-between gap-4 px-4 sm:px-8 lg:px-12 md:flex-row">
          <div className="flex items-center gap-2">
            <BrandLogo className="w-5 h-5" />
            <span className="font-semibold text-[var(--text)]">GitHub Social Manager</span>
            <span>• MIT Licensed</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-[var(--text)] transition-colors">
              App
            </Link>
            <Link href="/docs" className="hover:text-[var(--text)] transition-colors">
              Docs
            </Link>
            <a
              href="https://github.com/NischalAcharya060/GitHub-Social-Manager"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--text)] transition-colors"
            >
              GitHub Repository
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
