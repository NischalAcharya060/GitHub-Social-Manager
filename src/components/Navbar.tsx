"use client";

import React from "react";
import {
  RefreshCw,
  LogOut,
  ExternalLink,
  Menu,
  Activity,
  LayoutDashboard,
  UserMinus,
  UserCheck,
  Settings as SettingsIcon,
  ChevronRight,
  Star,
} from "lucide-react";
import { GitHubUser } from "@/lib/session";
import { RateLimitInfo } from "@/lib/github";
import { TabType } from "@/types";
import { GITHUB_REPO_URL } from "@/lib/ui";
import { UserAvatar } from "./UserAvatar";

interface NavbarProps {
  currentTab: TabType;
  user: GitHubUser | null;
  rateLimit: RateLimitInfo | null;
  isSyncing: boolean;
  onSync: () => void;
  onLogout: () => void;
  onToggleSidebar: () => void;
}

const TAB_META: Record<
  TabType,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  dashboard: { label: "Overview", icon: LayoutDashboard },
  "not-following-back": { label: "Not Following Back", icon: UserMinus },
  "follow-back": { label: "Follow Back", icon: UserCheck },
  settings: { label: "Settings", icon: SettingsIcon },
};

export function Navbar({
  currentTab,
  user,
  rateLimit,
  isSyncing,
  onSync,
  onLogout,
  onToggleSidebar,
}: NavbarProps) {
  const { label, icon: TabIcon } = TAB_META[currentTab];
  const quotaPercent = rateLimit
    ? Math.min(100, Math.max(0, Math.round((rateLimit.remaining / rateLimit.limit) * 100)))
    : null;

  return (
    <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface-glass)] px-4 backdrop-blur-xl sm:px-8 lg:px-12">
      {/* Left: menu + breadcrumb */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-[var(--radius-sm)] p-2 text-[var(--text-muted)] transition-colors hover:bg-white/5 hover:text-[var(--text)] md:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex min-w-0 items-center gap-2 text-sm">
          <span className="hidden text-[var(--text-faint)] sm:inline">Workspace</span>
          <ChevronRight className="hidden h-3.5 w-3.5 text-[var(--text-faint)] sm:inline" />
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand)]">
              <TabIcon className="h-3.5 w-3.5" />
            </span>
            <span className="truncate font-semibold tracking-tight text-[var(--text)]">{label}</span>
          </div>
        </div>
      </div>

      {/* Right: status + actions */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
        {rateLimit && (
          <div
            className="hidden items-center gap-2.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-deep)]/50 px-3 py-1.5 sm:flex"
            title={`GitHub API quota: ${rateLimit.remaining.toLocaleString()} of ${rateLimit.limit.toLocaleString()} requests remaining`}
          >
            <Activity className="h-3.5 w-3.5 text-[var(--info)]" />
            <div>
              <div className="flex items-baseline gap-1 font-mono text-[11px] tabular-nums">
                <span className="font-semibold text-[var(--text)]">
                  {rateLimit.remaining.toLocaleString()}
                </span>
                <span className="text-[var(--text-faint)]">/ {rateLimit.limit.toLocaleString()}</span>
              </div>
              <div className="mt-1 h-[3px] w-16 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    (quotaPercent ?? 0) < 15
                      ? "bg-[var(--danger)]"
                      : (quotaPercent ?? 0) < 40
                        ? "bg-[var(--warning)]"
                        : "bg-[var(--info)]"
                  }`}
                  style={{ width: `${quotaPercent ?? 0}%` }}
                />
              </div>
            </div>
          </div>
        )}

        <a
          href={GITHUB_REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="app-btn app-btn-outline h-10 px-2.5 sm:px-3"
          aria-label="Star GitHub Social Manager on GitHub"
          title="Star on GitHub"
        >
          <Star className="h-3.5 w-3.5 text-[var(--warning)]" />
          <span className="hidden sm:inline">Star</span>
        </a>

        <button
          type="button"
          onClick={onSync}
          disabled={isSyncing}
          className="app-btn app-btn-secondary h-10 px-3"
          aria-label={isSyncing ? "Syncing GitHub data" : "Sync GitHub data"}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin text-[var(--info)]" : ""}`} />
          <span className="hidden sm:inline">{isSyncing ? "Syncing" : "Sync"}</span>
        </button>

        {user && (
          <a
            href={user.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 rounded-[var(--radius-sm)] border border-transparent px-1.5 py-1 transition-colors hover:border-[var(--border)] hover:bg-white/[0.035]"
            aria-label={`Open @${user.login} on GitHub`}
          >
            <UserAvatar
              src={user.avatar_url}
              name={user.login}
              className="h-7 w-7 text-[10px]"
              loading="eager"
            />
            <span className="hidden text-xs font-medium text-[var(--text-soft)] transition-colors group-hover:text-[var(--text)] lg:inline">
              @{user.login}
            </span>
            <ExternalLink className="hidden h-3 w-3 text-[var(--text-faint)] group-hover:text-[var(--info)] lg:inline" />
          </a>
        )}

        <button
          type="button"
          onClick={onLogout}
          className="rounded-[var(--radius-sm)] border border-transparent p-2 text-[var(--text-muted)] transition-colors hover:border-[var(--danger-line)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
