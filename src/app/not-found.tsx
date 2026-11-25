"use client";

import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  ArrowLeft,
  BookOpen,
  ExternalLink,
  ShieldCheck,
  UserMinus,
  UserPlus,
  Terminal,
  AlertTriangle,
} from "lucide-react";
import { motion } from "motion/react";
import { BrandLogo } from "@/components/BrandLogo";
import { TiltCard } from "@/components/TiltCard";
import { GITHUB_REPO_URL } from "@/lib/ui";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-[var(--bg)] text-[var(--text)]">
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface-glass)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="group flex items-center gap-3 transition-opacity hover:opacity-90"
            aria-label="GitHub Social Manager home"
          >
            <BrandLogo className="h-8 w-8 transition-transform group-hover:scale-105" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-semibold tracking-tight text-[var(--text)]">
                  GitHub Social Manager
                </span>
                <span className="app-chip !py-0.2 !px-1.5 !text-[10px] font-mono text-[var(--brand)]">
                  v1.2
                </span>
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2.5">
            <Link
              href="/docs"
              className="app-btn app-btn-ghost text-xs text-[var(--text-muted)] hover:text-[var(--text)]"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Documentation</span>
            </Link>
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="app-btn app-btn-outline text-xs"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
        {/* Subtle Ambient Background Gradients */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[500px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(87,217,138,0.06),transparent_65%)] blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-1/4 top-1/3 -z-10 h-[400px] w-[400px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(116,177,255,0.05),transparent_65%)] blur-2xl"
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-2xl"
        >
          <TiltCard
            maxTilt={3}
            glowColor="rgba(87, 217, 138, 0.12)"
            className="app-panel rounded-2xl border-[var(--border-strong)] p-6 sm:p-10 shadow-2xl"
          >
            {/* Watermark 404 in background */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-4 top-2 select-none font-mono text-8xl font-black tracking-tighter text-white/[0.03] sm:text-9xl"
            >
              404
            </div>

            <div className="relative">
              {/* Status Eyebrow Badge */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--warning-line)] bg-[var(--warning-soft)] px-3 py-1 text-xs font-semibold text-[var(--warning)]">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  404 · Detached HEAD
                </span>
                <span className="app-chip font-mono text-[11px] text-[var(--text-faint)]">
                  ERR_ROUTE_NOT_FOUND
                </span>
              </div>

              {/* Title & Description */}
              <h1 className="mt-4 text-2xl font-bold tracking-tight text-[var(--text)] sm:text-3xl">
                Page not found in this graph
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)] sm:text-[15px]">
                The URL you requested does not match any route in the GitHub Social Manager
                workspace. It may have been relocated, deleted, or was never indexed.
              </p>

              {/* Developer Terminal Snippet */}
              <div className="mt-6 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-deep)] shadow-inner">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-white/[0.02] px-3.5 py-2 text-xs text-[var(--text-faint)]">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-3.5 w-3.5 text-[var(--brand)]" />
                    <span className="font-mono text-[11px]">router.git — social-manager</span>
                  </div>
                  <span className="font-mono text-[10px]">status: 404</span>
                </div>
                <div className="p-3.5 font-mono text-xs leading-relaxed">
                  <div className="text-[var(--text-muted)]">
                    <span className="text-[var(--brand)]">$</span> git checkout origin/requested-route
                  </div>
                  <div className="mt-1 text-[var(--danger)]">
                    fatal: pathspec did not match any files or endpoints known to router
                  </div>
                  <div className="mt-1 text-[var(--text-faint)]">
                    # Hint: return to the main dashboard or inspect available guides
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/" className="app-btn app-btn-primary h-10 px-4 text-sm font-semibold">
                  <LayoutDashboard className="h-4 w-4" />
                  Return to Dashboard
                </Link>

                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="app-btn app-btn-secondary h-10 px-3.5 text-sm"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Go Back
                </button>

                <Link href="/docs" className="app-btn app-btn-outline h-10 px-3.5 text-sm">
                  <BookOpen className="h-4 w-4" />
                  Documentation
                </Link>
              </div>

              {/* Quick Navigation Directory */}
              <div className="mt-8 border-t border-[var(--border)] pt-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-faint)]">
                  Explore common destinations
                </p>
                <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  <Link
                    href="/"
                    className="group flex items-center gap-2.5 rounded-lg border border-[var(--border-subtle)] bg-white/[0.015] p-2.5 text-xs transition-colors hover:border-[var(--brand-line)] hover:bg-[var(--brand-soft)]/20"
                  >
                    <UserMinus className="h-4 w-4 text-[var(--danger)]" />
                    <div>
                      <div className="font-medium text-[var(--text)] group-hover:text-[var(--brand)]">
                        Cleanup Queue
                      </div>
                      <div className="text-[11px] text-[var(--text-faint)]">Non-followers</div>
                    </div>
                  </Link>

                  <Link
                    href="/"
                    className="group flex items-center gap-2.5 rounded-lg border border-[var(--border-subtle)] bg-white/[0.015] p-2.5 text-xs transition-colors hover:border-[var(--brand-line)] hover:bg-[var(--brand-soft)]/20"
                  >
                    <UserPlus className="h-4 w-4 text-[var(--brand)]" />
                    <div>
                      <div className="font-medium text-[var(--text)] group-hover:text-[var(--brand)]">
                        Follow Backs
                      </div>
                      <div className="text-[11px] text-[var(--text-faint)]">Reciprocal list</div>
                    </div>
                  </Link>

                  <Link
                    href="/"
                    className="group flex items-center gap-2.5 rounded-lg border border-[var(--border-subtle)] bg-white/[0.015] p-2.5 text-xs transition-colors hover:border-[var(--brand-line)] hover:bg-[var(--brand-soft)]/20"
                  >
                    <ShieldCheck className="h-4 w-4 text-[var(--brand)]" />
                    <div>
                      <div className="font-medium text-[var(--text)] group-hover:text-[var(--brand)]">
                        Protected List
                      </div>
                      <div className="text-[11px] text-[var(--text-faint)]">Never unfollow</div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </TiltCard>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-6 text-center text-xs text-[var(--text-faint)]">
        <p>
          GitHub Social Manager · Rate-limited and shielded against mass unfollows.
        </p>
      </footer>
    </div>
  );
}
