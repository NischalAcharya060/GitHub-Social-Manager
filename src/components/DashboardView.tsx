"use client";

import React from "react";
import {
  Users,
  UserCheck,
  UserMinus,
  UserPlus,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Clock,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { SyncData, TabType } from "@/types";
import { GitHubAccountItem } from "@/lib/github";
import { UserAvatar } from "./UserAvatar";

interface DashboardViewProps {
  data: SyncData;
  onNavigateTab: (tab: TabType) => void;
  onTriggerBulkAction: (action: "follow" | "unfollow", targets: GitHubAccountItem[]) => void;
  onRefresh: () => void;
  isSyncing: boolean;
}

export function DashboardView({
  data,
  onNavigateTab,
  onTriggerBulkAction,
  onRefresh,
  isSyncing,
}: DashboardViewProps) {
  const { user, totalFollowers, totalFollowing, notFollowingBack, followBackCandidates, syncedAt } =
    data;

  const notFollowingBackCount = notFollowingBack.length;
  const followBackCount = followBackCandidates.length;
  const mutualRatio =
    totalFollowing > 0
      ? Math.round(((totalFollowing - notFollowingBackCount) / totalFollowing) * 100)
      : 100;

  const formatSyncTime = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "Recently";
    }
  };

  return (
    <div className="animate-rise space-y-6">
      {/* Welcome header */}
      <section className="app-panel relative overflow-hidden p-5 sm:p-6">
        <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[var(--brand-soft)] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 left-1/3 h-64 w-64 rounded-full bg-[var(--info-soft)] blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="relative shrink-0">
              <UserAvatar
                src={user.avatar_url}
                name={user.login}
                className="h-14 w-14 text-lg shadow-[var(--shadow-md)] sm:h-16 sm:w-16"
                loading="eager"
              />
              <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-[3px] border-[var(--surface)] bg-[var(--brand)]" />
            </div>
            <div className="min-w-0">
              <span className="eyebrow flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" />
                Command center
              </span>
              <h1 className="page-title mt-1.5 truncate">
                Welcome back, {user.name || `@${user.login}`}
              </h1>
              <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-[var(--text-muted)]">
                Here&apos;s the current state of your GitHub graph. Review one-way connections and
                reconnect with supporters.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2.5">
            <div className="app-chip">
              <Clock className="h-3.5 w-3.5 text-[var(--text-faint)]" />
              Synced at {formatSyncTime(syncedAt)}
            </div>
            <button
              type="button"
              onClick={onRefresh}
              disabled={isSyncing}
              className="app-btn app-btn-secondary"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin text-[var(--info)]" : ""}`}
              />
              {isSyncing ? "Updating…" : "Sync now"}
            </button>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section aria-label="Account metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total followers"
          value={totalFollowers}
          hint="Developers following you"
          icon={Users}
          tone="info"
          index={1}
        />
        <MetricCard
          label="Total following"
          value={totalFollowing}
          hint="Developers you follow"
          icon={UserCheck}
          tone="neutral"
          index={2}
        />
        <MetricCard
          label="Not following back"
          value={notFollowingBackCount}
          hint="One-way connections to review"
          icon={UserMinus}
          tone="danger"
          index={3}
          onClick={() => onNavigateTab("not-following-back")}
        />
        <MetricCard
          label="Follow back candidates"
          value={followBackCount}
          hint="Supporters waiting for you"
          icon={UserPlus}
          tone="brand"
          index={4}
          onClick={() => onNavigateTab("follow-back")}
        />
      </section>

      {/* Main actions */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2" aria-label="Recommended actions">
        <ActionCard
          tone="danger"
          icon={UserMinus}
          title="Unfollow non-followers"
          description="Clean up your following list by removing one-way connections that no longer reciprocate."
          count={notFollowingBackCount}
          countLabel="accounts eligible"
          accounts={notFollowingBack}
          emptyMessage={`All ${totalFollowing.toLocaleString()} accounts you follow follow you back.`}
          onReview={() => onNavigateTab("not-following-back")}
          onRun={() => onTriggerBulkAction("unfollow", notFollowingBack)}
          index={1}
        />
        <ActionCard
          tone="brand"
          icon={UserPlus}
          title="Follow back supporters"
          description="Return the favour to developers who already follow you and grow real mutual connections."
          count={followBackCount}
          countLabel="accounts waiting"
          accounts={followBackCandidates}
          emptyMessage="You have already followed back every one of your followers."
          onReview={() => onNavigateTab("follow-back")}
          onRun={() => onTriggerBulkAction("follow", followBackCandidates)}
          index={2}
        />
      </section>

      {/* Insight + safety */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-[1.35fr_1fr]">
        <div className="app-panel p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Graph health</p>
              <h3 className="section-title mt-1.5">Mutual connection rate</h3>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Share of accounts you follow that also follow you back.
              </p>
            </div>
            <span className="font-mono text-2xl font-semibold tabular-nums text-[var(--text)]">
              {mutualRatio}%
            </span>
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--brand)] to-[var(--info)] transition-all duration-700"
              style={{ width: `${mutualRatio}%` }}
            />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <div className="app-panel-inset px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-wider text-[var(--text-faint)]">Mutual</p>
              <p className="mt-0.5 font-mono font-semibold tabular-nums text-[var(--brand)]">
                {(totalFollowing - notFollowingBackCount).toLocaleString()}
              </p>
            </div>
            <div className="app-panel-inset px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-wider text-[var(--text-faint)]">One-way</p>
              <p className="mt-0.5 font-mono font-semibold tabular-nums text-[var(--danger)]">
                {notFollowingBackCount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="app-panel flex flex-col justify-between gap-4 p-5 sm:p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--info-line)] bg-[var(--info-soft)] text-[var(--info)]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="section-title">Safe by design</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-muted)]">
              Every action runs sequentially through GitHub&apos;s official REST API with throttling,
              progress tracking, and instant cancellation.
            </p>
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--border-subtle)] pt-4 text-[11px] text-[var(--text-faint)]">
            <CheckCircle2 className="h-3.5 w-3.5 text-[var(--brand)]" />
            No scrapers, no credential storage, no surprises.
          </div>
        </div>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

type Tone = "brand" | "danger" | "info" | "neutral";

const TONE_STYLES: Record<Tone, { icon: string; accent: string }> = {
  brand: { icon: "bg-[var(--brand-soft)] text-[var(--brand)]", accent: "bg-[var(--brand)]" },
  danger: { icon: "bg-[var(--danger-soft)] text-[var(--danger)]", accent: "bg-[var(--danger)]" },
  info: { icon: "bg-[var(--info-soft)] text-[var(--info)]", accent: "bg-[var(--info)]" },
  neutral: {
    icon: "bg-white/[0.05] text-[var(--text-soft)]",
    accent: "bg-[var(--text-faint)]",
  },
};

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  tone,
  index,
  onClick,
}: {
  label: string;
  value: number;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: Tone;
  index: number;
  onClick?: () => void;
}) {
  const styles = TONE_STYLES[tone];
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
          {label}
        </p>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${styles.icon}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-4">
        <p className="font-mono text-[28px] font-semibold leading-none tabular-nums tracking-tight text-[var(--text)]">
          {value.toLocaleString()}
        </p>
        <p className="mt-2 text-[11px] text-[var(--text-faint)]">{hint}</p>
      </div>
      {onClick && (
        <span className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-tl-lg bg-white/[0.03] text-[var(--text-faint)] transition-all group-hover:bg-[var(--brand-soft)] group-hover:text-[var(--brand)]">
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      )}
      <span
        className={`absolute inset-x-5 top-0 h-px opacity-0 transition-opacity duration-300 ${styles.accent} group-hover:opacity-70`}
      />
    </>
  );

  const classes = `animate-rise delay-${index} app-panel app-panel-hover group relative overflow-hidden p-5 text-left`;

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={classes}>
        {content}
      </button>
    );
  }

  return <div className={classes}>{content}</div>;
}

function ActionCard({
  tone,
  icon: Icon,
  title,
  description,
  count,
  countLabel,
  accounts,
  emptyMessage,
  onReview,
  onRun,
  index,
}: {
  tone: "brand" | "danger";
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  count: number;
  countLabel: string;
  accounts: GitHubAccountItem[];
  emptyMessage: string;
  onReview: () => void;
  onRun: () => void;
  index: number;
}) {
  const styles = TONE_STYLES[tone];

  return (
    <article className={`animate-rise delay-${index} app-panel flex flex-col p-5 sm:p-6`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}>
            <Icon className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0">
            <h3 className="section-title">{title}</h3>
            <p className="mt-1 max-w-sm text-xs leading-relaxed text-[var(--text-muted)]">
              {description}
            </p>
          </div>
        </div>
        <span
          className={`app-chip shrink-0 ${tone === "danger" ? "app-chip-danger" : "app-chip-brand"} font-mono tabular-nums`}
        >
          {count} {countLabel}
        </span>
      </div>

      <div className="mt-5 flex-1">
        {count > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-faint)]">
                Preview
              </p>
              <button
                type="button"
                onClick={onReview}
                className="text-[11px] font-medium text-[var(--info)] transition-colors hover:text-[var(--text)]"
              >
                View all
              </button>
            </div>
            <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {accounts.slice(0, 4).map((account) => (
                <div
                  key={account.id}
                  className="app-panel-inset flex items-center gap-2.5 px-3 py-2 text-xs"
                >
                  <UserAvatar src={account.avatar_url} name={account.login} className="h-6 w-6" />
                  <span className="min-w-0 flex-1 truncate font-medium text-[var(--text-soft)]">
                    @{account.login}
                  </span>
                  <a
                    href={account.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open @${account.login} on GitHub`}
                    className="text-[var(--text-faint)] transition-colors hover:text-[var(--info)]"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ))}
            </div>
            {count > 4 && (
              <p className="mt-2 text-[11px] text-[var(--text-faint)]">
                + {(count - 4).toLocaleString()} more in the full list
              </p>
            )}
          </>
        ) : (
          <div className="app-panel-inset flex items-center gap-3 px-4 py-3.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--brand)]" />
            <p className="text-xs text-[var(--text-soft)]">{emptyMessage}</p>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2.5 border-t border-[var(--border-subtle)] pt-4">
        <button type="button" onClick={onReview} className="app-btn app-btn-secondary flex-1">
          Review accounts
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
        {count > 0 && (
          <button
            type="button"
            onClick={onRun}
            className={`app-btn ${tone === "danger" ? "app-btn-danger" : "app-btn-primary"}`}
          >
            <Icon className="h-3.5 w-3.5" />
            {tone === "danger" ? "Unfollow" : "Follow back"} all ({count})
          </button>
        )}
      </div>
    </article>
  );
}
