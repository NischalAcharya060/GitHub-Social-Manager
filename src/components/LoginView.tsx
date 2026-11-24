"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  KeyRound,
  ArrowRight,
  ExternalLink,
  Info,
  Loader2,
  BookOpen,
  ShieldCheck,
  LockKeyhole,
} from "lucide-react";
import { GithubIcon } from "./GithubIcon";
import { BrandLogo } from "./BrandLogo";
import { useToast } from "./Toast";
import { cn } from "@/lib/ui";

interface LoginViewProps {
  isOAuthConfigured: boolean;
  onLoginSuccess: () => void;
  oauthError?: string | null;
  compact?: boolean;
}

export function LoginView({
  isOAuthConfigured,
  onLoginSuccess,
  oauthError,
  compact = false,
}: LoginViewProps) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<"pat" | "oauth">(isOAuthConfigured ? "oauth" : "pat");
  const [patToken, setPatToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(oauthError || null);

  const handlePatLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!patToken.trim()) {
      setErrorMsg("Please enter your GitHub Personal Access Token.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: patToken.trim() }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Authentication failed. Invalid token.");
      }

      showToast("success", "Signed in successfully", `Welcome @${data.user.login}!`);
      onLoginSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to sign in";
      setErrorMsg(message);
      showToast("error", "Sign in failed", message);
    } finally {
      setIsLoading(false);
    }
  };

  const cardContent = (
    <div className="app-panel w-full overflow-hidden">
      <div className="border-b border-[var(--border-subtle)] px-5 pt-5 sm:px-6">
        <div className="flex gap-1" role="tablist" aria-label="Sign-in method">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "oauth"}
            onClick={() => {
              setActiveTab("oauth");
              setErrorMsg(null);
            }}
            className={cn(
              "relative flex flex-1 items-center justify-center gap-2 px-2 pb-3.5 text-[13px] font-semibold transition-colors",
              activeTab === "oauth"
                ? "text-[var(--text)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-soft)]"
            )}
          >
            <GithubIcon className="h-4 w-4" />
            GitHub OAuth
            {activeTab === "oauth" && (
              <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-[var(--brand)]" />
            )}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "pat"}
            onClick={() => {
              setActiveTab("pat");
              setErrorMsg(null);
            }}
            className={cn(
              "relative flex flex-1 items-center justify-center gap-2 px-2 pb-3.5 text-[13px] font-semibold transition-colors",
              activeTab === "pat"
                ? "text-[var(--text)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-soft)]"
            )}
          >
            <KeyRound className="h-4 w-4" />
            Access Token
            {activeTab === "pat" && (
              <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-[var(--brand)]" />
            )}
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {errorMsg && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2.5 rounded-[var(--radius-sm)] border border-[var(--danger-line)] bg-[var(--danger-soft)] px-3.5 py-3 text-xs leading-relaxed text-[var(--danger)]"
          >
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {activeTab === "oauth" ? (
          <div className="space-y-4">
            <div>
              <h2 className="section-title">One-click access</h2>
              <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--text-muted)]">
                Authorize with GitHub and we&apos;ll handle the rest. No token creation, no copy and
                paste.
              </p>
            </div>

            {isOAuthConfigured ? (
              <a
                href="/api/auth/github"
                className="app-btn app-btn-primary h-12 w-full text-sm"
              >
                <GithubIcon className="h-4 w-4" />
                Continue with GitHub
                <ArrowRight className="ml-auto h-4 w-4" />
              </a>
            ) : (
              <div className="app-panel-inset space-y-3 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text)]">
                  <Info className="h-4 w-4 text-[var(--info)]" />
                  OAuth isn&apos;t configured here
                </div>
                <p className="text-[13px] leading-relaxed text-[var(--text-muted)]">
                  Add your OAuth credentials to <code className="text-[var(--brand)]">.env.local</code>,
                  or sign in instantly with a personal access token.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("pat")}
                  className="app-btn app-btn-outline w-full"
                >
                  Use a personal access token
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-white/[0.02] px-3 py-2.5 text-[11px] text-[var(--text-faint)]">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[var(--brand)]" />
              Scoped to <span className="font-mono text-[var(--text-soft)]">user:follow</span> and{" "}
              <span className="font-mono text-[var(--text-soft)]">read:user</span> only.
            </div>
          </div>
        ) : (
          <form onSubmit={handlePatLogin} className="space-y-4">
            <div>
              <h2 className="section-title">Use your own token</h2>
              <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--text-muted)]">
                Paste a token with the <span className="font-mono text-[var(--brand)]">user:follow</span>{" "}
                scope. It never leaves your encrypted session.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="pat-token" className="app-label mb-0">
                  Personal access token
                </label>
                <Link
                  href="/docs#method-pat"
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--info)] transition-colors hover:text-[var(--text)]"
                >
                  Need help?
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
              <div className="relative mt-2">
                <input
                  id="pat-token"
                  type={showToken ? "text" : "password"}
                  value={patToken}
                  onChange={(event) => setPatToken(event.target.value)}
                  placeholder="ghp_xxxxxxxxxxxx"
                  autoComplete="off"
                  spellCheck={false}
                  required
                  className="app-input h-12 pr-16 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowToken((value) => !value)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2.5 py-1.5 text-[11px] font-semibold text-[var(--text-muted)] transition-colors hover:bg-white/5 hover:text-[var(--text)]"
                  aria-label={showToken ? "Hide token" : "Show token"}
                >
                  {showToken ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="app-panel-inset space-y-2 p-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-muted)]">Required scope</span>
                <span className="rounded-md border border-[var(--brand-line)] bg-[var(--brand-soft)] px-2 py-0.5 font-mono text-[10px] text-[var(--brand)]">
                  user:follow
                </span>
              </div>
              <a
                href="https://github.com/settings/tokens/new?scopes=user:follow,read:user&description=GitHub+Social+Manager"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--info)] transition-colors hover:text-[var(--text)]"
              >
                Generate a pre-scoped token on GitHub
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="app-btn app-btn-primary h-12 w-full text-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Validating with GitHub…
                </>
              ) : (
                <>
                  <LockKeyhole className="h-4 w-4" />
                  Sign in with token
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-6 border-t border-[var(--border-subtle)] pt-4 text-center">
          <Link
            href="/docs"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] transition-colors hover:text-[var(--info)]"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Read the setup guide
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );

  if (compact) return cardContent;

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute left-1/2 top-[-14rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[var(--brand-soft)] blur-[100px]" />
      <div className="relative w-full max-w-[430px]">
        <div className="mb-7 text-center">
          <div className="mb-4 inline-flex">
            <BrandLogo className="h-14 w-14 drop-shadow-[0_10px_30px_rgba(87,217,138,0.22)]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">
            GitHub Social Manager
          </h1>
          <p className="mt-2 text-[13px] text-[var(--text-muted)]">
            Audit non-followers and grow real mutual connections.
          </p>
        </div>
        {cardContent}
      </div>
    </div>
  );
}
