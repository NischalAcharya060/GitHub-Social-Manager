"use client";

import React from "react";
import {
  RefreshCw,
  LogOut,
  ExternalLink,
  Shield,
  Activity,
  Clock,
  KeyRound,
  CheckCircle2,
  Calendar,
  FolderGit2,
  Users,
  UserCheck,
  LockKeyhole,
} from "lucide-react";
import { GitHubUser } from "@/lib/session";
import { RateLimitInfo } from "@/lib/github";
import { UserAvatar } from "./UserAvatar";

interface SettingsViewProps {
  user: GitHubUser;
  rateLimit: RateLimitInfo | null;
  syncedAt: string;
  authType: "oauth" | "token";
  whitelistCount: number;
  cooldownSeconds?: number;
  onRefresh: () => void;
  isSyncing: boolean;
  onLogout: () => void;
}

export function SettingsView({
  user,
  rateLimit,
  syncedAt,
  authType,
  whitelistCount,
  cooldownSeconds = 0,
  onRefresh,
  isSyncing,
  onLogout,
}: SettingsViewProps) {
  const joinedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown";

  const lastSyncFormatted = syncedAt
    ? new Date(syncedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : "Not yet synced";

  const formatResetTime = (timestamp?: number) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const quotaPercent = rateLimit
    ? Math.min(100, Math.max(0, Math.round((rateLimit.remaining / rateLimit.limit) * 100)))
    : 0;

  return (
    <div className="animate-rise max-w-5xl space-y-6">
      {/* Header */}
      <div className="border-b border-[var(--border)] pb-5">
        <span className="eyebrow">Preferences</span>
        <h1 className="page-title mt-1.5">Settings &amp; synchronization</h1>
        <p className="mt-1.5 text-[13px] text-[var(--text-muted)]">
          Manage your connection, monitor API quota and review how your data is handled.
        </p>
      </div>

      {/* Account */}
      <section className="app-panel p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-faint)]">
            Connected account
          </p>
          <span className="app-chip app-chip-info font-mono">
            <KeyRound className="h-3 w-3" />
            {authType === "oauth" ? "GitHub OAuth" : "Access token"}
          </span>
        </div>

        <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <UserAvatar
              src={user.avatar_url}
              name={user.login}
              className="h-16 w-16 text-xl shadow-[var(--shadow-md)]"
              loading="eager"
            />
            <div className="min-w-0">
              <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-[var(--text)]">
                <span className="truncate">{user.name || `@${user.login}`}</span>
                <a
                  href={user.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open @${user.login} on GitHub`}
                  className="text-[var(--text-faint)] transition-colors hover:text-[var(--info)]"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </h2>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">@{user.login}</p>
              {user.bio && (
                <p className="mt-2 line-clamp-2 max-w-md text-[13px] leading-relaxed text-[var(--text-soft)]">
                  {user.bio}
                </p>
              )}
            </div>
          </div>

          <button type="button" onClick={onLogout} className="app-btn app-btn-outline self-start text-[var(--danger)] sm:self-center">
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-[var(--border-subtle)] pt-5 sm:grid-cols-4">
          <InfoTile icon={Users} label="Followers" value={user.followers.toLocaleString()} />
          <InfoTile icon={UserCheck} label="Following" value={user.following.toLocaleString()} />
          <InfoTile icon={FolderGit2} label="Repositories" value={user.public_repos.toLocaleString()} />
          <div className="app-panel-inset px-3.5 py-3">
            <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[var(--text-faint)]">
              <Calendar className="h-3 w-3" /> Joined
            </p>
            <p className="mt-1 truncate text-xs font-medium text-[var(--text)]" title={joinedDate}>
              {joinedDate}
            </p>
          </div>
        </div>
      </section>

      {/* Sync + quota */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="app-panel flex flex-col p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand)]">
                <Clock className="h-4 w-4" />
              </span>
              <div>
                <h3 className="section-title">Synchronization</h3>
                <p className="text-[11px] text-[var(--text-muted)]">Local graph index</p>
              </div>
            </div>
            <span className="app-chip app-chip-brand">
              <CheckCircle2 className="h-3 w-3" />
              Active
            </span>
          </div>

          <p className="mt-4 text-[13px] leading-relaxed text-[var(--text-muted)]">
            Your follower graph is indexed locally for instant search and filtering. A full sync
            refreshes every account from GitHub.
          </p>

          <div className="app-panel-inset mt-4 space-y-2 px-4 py-3 text-xs">
            <div className="flex justify-between gap-3">
              <span className="text-[var(--text-muted)]">Last full sync</span>
              <span className="font-mono text-[var(--text)]">{lastSyncFormatted}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-[var(--text-muted)]">Data status</span>
              <span className="font-medium text-[var(--brand)]">Up to date</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isSyncing || cooldownSeconds > 0}
            className="app-btn app-btn-secondary mt-auto w-full"
            title={
              cooldownSeconds > 0
                ? "Sync cooldown active to protect your GitHub API rate limit."
                : "Force full re-sync with GitHub"
            }
            aria-label={
              isSyncing
                ? "Fetching complete data"
                : cooldownSeconds > 0
                  ? "Sync cooldown active"
                  : "Force full re-sync"
            }
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin text-[var(--info)]" : ""}`} />
            {isSyncing
              ? "Fetching complete data…"
              : cooldownSeconds > 0
                ? `Cooldown (${Math.floor(cooldownSeconds / 60)}:${(cooldownSeconds % 60)
                    .toString()
                    .padStart(2, "0")})`
                : "Force full re-sync"}
          </button>
        </div>

        <div className="app-panel flex flex-col p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--info-soft)] text-[var(--info)]">
              <Activity className="h-4 w-4" />
            </span>
            <div>
              <h3 className="section-title">API rate limit</h3>
              <p className="text-[11px] text-[var(--text-muted)]">GitHub REST quota</p>
            </div>
          </div>

          <p className="mt-4 text-[13px] leading-relaxed text-[var(--text-muted)]">
            Authenticated requests are limited per hour. We monitor your quota to keep bulk actions
            within GitHub&apos;s limits.
          </p>

          {rateLimit ? (
            <div className="app-panel-inset mt-4 space-y-3 px-4 py-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-muted)]">Remaining requests</span>
                <span className="font-mono font-semibold tabular-nums text-[var(--text)]">
                  {rateLimit.remaining.toLocaleString()} / {rateLimit.limit.toLocaleString()}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    quotaPercent < 15
                      ? "bg-[var(--danger)]"
                      : quotaPercent < 40
                        ? "bg-[var(--warning)]"
                        : "bg-[var(--info)]"
                  }`}
                  style={{ width: `${quotaPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-[var(--text-faint)]">
                <span>Resets at</span>
                <span className="font-mono text-[var(--text-soft)]">
                  {formatResetTime(rateLimit.reset)}
                </span>
              </div>
            </div>
          ) : (
            <div className="app-panel-inset mt-4 px-4 py-3 text-xs text-[var(--text-muted)]">
              Quota details refresh after your next API call.
            </div>
          )}

          <div className="mt-auto flex items-center gap-2 pt-4 text-[11px] text-[var(--text-faint)]">
            <Shield className="h-3.5 w-3.5 text-[var(--brand)]" />
            Automatic throttling protects against HTTP 429 errors.
          </div>
        </div>
      </section>

      {/* Whitelist & Graph Protection */}
      <section className="app-panel p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--brand-line)] bg-[var(--brand-soft)] text-[var(--brand)]">
              <Shield className="h-5 w-5" />
            </span>
            <div>
              <h3 className="section-title">Whitelist &amp; Graph Protection</h3>
              <p className="text-[11px] text-[var(--text-muted)]">
                Permanent shielding for friends, bots, and organizations
              </p>
            </div>
          </div>
          <span className="app-chip app-chip-brand">
            <CheckCircle2 className="h-3 w-3" />
            Active
          </span>
        </div>

        <p className="mt-3 text-[13px] leading-relaxed text-[var(--text-muted)]">
          Protected accounts are permanently shielded and will never be unfollowed during cleanup or batch operations.
        </p>

        <div className="app-panel-inset mt-4 flex items-center justify-between px-4 py-3 text-xs">
          <span className="text-[var(--text-muted)]">Shielded accounts</span>
          <span className="font-mono font-semibold tabular-nums text-[var(--brand)]">
            {whitelistCount.toLocaleString()} accounts protected
          </span>
        </div>
      </section>

      {/* Security */}
      <section className="app-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:p-6">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--brand-line)] bg-[var(--brand-soft)] text-[var(--brand)]">
          <LockKeyhole className="h-5 w-5" />
        </span>
        <div>
          <h3 className="section-title">Security &amp; token storage</h3>
          <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-[var(--text-muted)]">
            Your GitHub credentials are never stored in plain text, databases, or client-side storage.
            Requests are authenticated with secure, encrypted HTTP-only cookies using AES-256-GCM.
            No scrapers, no background bots, no unauthorized access.
          </p>
        </div>
      </section>
    </div>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="app-panel-inset px-3.5 py-3">
      <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[var(--text-faint)]">
        <Icon className="h-3 w-3" /> {label}
      </p>
      <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-[var(--text)]">{value}</p>
    </div>
  );
}
