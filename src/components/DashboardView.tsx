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
} from "lucide-react";
import { SyncData, TabType } from "@/types";
import { GitHubAccountItem } from "@/lib/github";

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

  const formatSyncTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "Recently";
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-5 sm:p-6 rounded-xl bg-[#161b22] border border-[#30363d] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={user.avatar_url}
            alt={user.login}
            className="w-12 h-12 rounded-full border border-[#30363d] hidden sm:block shrink-0"
          />
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#f0f6fc] tracking-tight">
              Hello, {user.name || `@${user.login}`}
            </h2>
            <p className="text-xs text-[#8b949e] mt-1">
              Track your social graph, spot non-followers, and reciprocate follows safely.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
          <div className="text-xs text-[#8b949e] flex items-center gap-1.5 bg-[#0d1117] px-2.5 py-1 rounded-md border border-[#30363d]">
            <Clock className="w-3.5 h-3.5 text-[#6e7681]" />
            <span>Synced at {formatSyncTime(syncedAt)}</span>
          </div>
          <button
            onClick={onRefresh}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-md text-xs font-medium text-[#c9d1d9] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-[#58a6ff]" : ""}`} />
            <span>{isSyncing ? "Updating..." : "Sync Now"}</span>
          </button>
        </div>
      </div>

      {/* 4 Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Followers */}
        <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] hover:border-[#484f58] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#8b949e] uppercase tracking-wider">
              Total Followers
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#21262d] flex items-center justify-center text-[#58a6ff]">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold font-mono text-[#f0f6fc] tabular-nums">
              {totalFollowers.toLocaleString()}
            </p>
            <p className="text-[11px] text-[#8b949e] mt-0.5">Accounts following you</p>
          </div>
        </div>

        {/* Card 2: Total Following */}
        <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] hover:border-[#484f58] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#8b949e] uppercase tracking-wider">
              Total Following
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#21262d] flex items-center justify-center text-[#c9d1d9]">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold font-mono text-[#f0f6fc] tabular-nums">
              {totalFollowing.toLocaleString()}
            </p>
            <p className="text-[11px] text-[#8b949e] mt-0.5">Accounts you follow</p>
          </div>
        </div>

        {/* Card 3: Not Following Back */}
        <div
          onClick={() => onNavigateTab("not-following-back")}
          className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] hover:border-[#da3633]/50 cursor-pointer transition-colors group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#8b949e] uppercase tracking-wider group-hover:text-[#f85149] transition-colors">
              Not Following Back
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#da3633]/15 text-[#f85149] flex items-center justify-center">
              <UserMinus className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold font-mono text-[#f85149] tabular-nums">
              {notFollowingBackCount.toLocaleString()}
            </p>
            <p className="text-[11px] text-[#8b949e] mt-0.5">You follow, but they don&apos;t</p>
          </div>
        </div>

        {/* Card 4: Follow Back Candidates */}
        <div
          onClick={() => onNavigateTab("follow-back")}
          className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] hover:border-[#238636]/50 cursor-pointer transition-colors group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#8b949e] uppercase tracking-wider group-hover:text-[#3fb950] transition-colors">
              Follow Back Candidates
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#238636]/15 text-[#3fb950] flex items-center justify-center">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold font-mono text-[#3fb950] tabular-nums">
              {followBackCount.toLocaleString()}
            </p>
            <p className="text-[11px] text-[#8b949e] mt-0.5">They follow, you don&apos;t yet</p>
          </div>
        </div>
      </div>

      {/* 2 Main Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Main Action 1: Unfollow Non-Followers */}
        <div className="p-5 rounded-xl bg-[#161b22] border border-[#30363d] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#da3633]/15 border border-[#da3633]/30 flex items-center justify-center text-[#f85149]">
                  <UserMinus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#f0f6fc]">
                    Unfollow Non-Followers
                  </h3>
                  <p className="text-xs text-[#8b949e]">
                    Clean up your following list by removing one-way connections.
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 text-xs font-mono font-medium rounded-full bg-[#da3633]/15 text-[#f85149] border border-[#da3633]/30 tabular-nums">
                {notFollowingBackCount} accounts
              </span>
            </div>

            <p className="text-xs text-[#8b949e] leading-relaxed mb-4">
              You are currently following{" "}
              <strong className="text-[#f0f6fc] font-semibold">{notFollowingBackCount}</strong>{" "}
              users who have not followed you back.
            </p>

            {/* Preview of accounts or Empty state */}
            {notFollowingBackCount > 0 ? (
              <div className="space-y-2 mb-5">
                <span className="text-[10px] font-semibold text-[#8b949e] uppercase tracking-wider block">
                  Preview Accounts:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {notFollowingBack.slice(0, 4).map((account) => (
                    <div
                      key={account.id}
                      className="flex items-center gap-2 p-2 rounded-lg bg-[#21262d]/50 border border-[#30363d] text-xs"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={account.avatar_url}
                        alt={account.login}
                        className="w-5 h-5 rounded-full border border-[#30363d]"
                      />
                      <span className="font-medium text-[#c9d1d9] truncate flex-1 text-xs">
                        @{account.login}
                      </span>
                      <a
                        href={account.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#8b949e] hover:text-[#58a6ff]"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
                {notFollowingBackCount > 4 && (
                  <p className="text-[11px] text-[#8b949e] italic">
                    + {notFollowingBackCount - 4} more accounts in list
                  </p>
                )}
              </div>
            ) : (
              <div className="p-3.5 rounded-lg bg-[#21262d]/40 border border-[#30363d] flex items-center gap-2.5 text-xs text-[#3fb950] mb-5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>All {totalFollowing} accounts you follow are currently following you back!</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5 pt-4 border-t border-[#30363d]">
            <button
              onClick={() => onNavigateTab("not-following-back")}
              className="flex-1 px-3.5 py-2 bg-[#21262d] hover:bg-[#30363d] text-[#f0f6fc] border border-[#30363d] font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Review Accounts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {notFollowingBackCount > 0 && (
              <button
                onClick={() => onTriggerBulkAction("unfollow", notFollowingBack)}
                className="px-3.5 py-2 bg-[#da3633] hover:bg-[#b62324] text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5"
              >
                <UserMinus className="w-3.5 h-3.5" />
                <span>Unfollow All ({notFollowingBackCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Action 2: Follow Back */}
        <div className="p-5 rounded-xl bg-[#161b22] border border-[#30363d] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#238636]/15 border border-[#238636]/30 flex items-center justify-center text-[#3fb950]">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#f0f6fc]">Follow Back Supporters</h3>
                  <p className="text-xs text-[#8b949e]">
                    Return the support to people who are following your profile.
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 text-xs font-mono font-medium rounded-full bg-[#238636]/15 text-[#3fb950] border border-[#238636]/30 tabular-nums">
                {followBackCount} accounts
              </span>
            </div>

            <p className="text-xs text-[#8b949e] leading-relaxed mb-4">
              There are{" "}
              <strong className="text-[#f0f6fc] font-semibold">{followBackCount}</strong> users
              following you that you haven&apos;t followed back yet.
            </p>

            {/* Preview of accounts or Empty state */}
            {followBackCount > 0 ? (
              <div className="space-y-2 mb-5">
                <span className="text-[10px] font-semibold text-[#8b949e] uppercase tracking-wider block">
                  Preview Accounts:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {followBackCandidates.slice(0, 4).map((account) => (
                    <div
                      key={account.id}
                      className="flex items-center gap-2 p-2 rounded-lg bg-[#21262d]/50 border border-[#30363d] text-xs"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={account.avatar_url}
                        alt={account.login}
                        className="w-5 h-5 rounded-full border border-[#30363d]"
                      />
                      <span className="font-medium text-[#c9d1d9] truncate flex-1 text-xs">
                        @{account.login}
                      </span>
                      <a
                        href={account.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#8b949e] hover:text-[#58a6ff]"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
                {followBackCount > 4 && (
                  <p className="text-[11px] text-[#8b949e] italic">
                    + {followBackCount - 4} more accounts in list
                  </p>
                )}
              </div>
            ) : (
              <div className="p-3.5 rounded-lg bg-[#21262d]/40 border border-[#30363d] flex items-center gap-2.5 text-xs text-[#3fb950] mb-5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>You have already followed back all of your followers!</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5 pt-4 border-t border-[#30363d]">
            <button
              onClick={() => onNavigateTab("follow-back")}
              className="flex-1 px-3.5 py-2 bg-[#21262d] hover:bg-[#30363d] text-[#f0f6fc] border border-[#30363d] font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Review Accounts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {followBackCount > 0 && (
              <button
                onClick={() => onTriggerBulkAction("follow", followBackCandidates)}
                className="px-3.5 py-2 bg-[#238636] hover:bg-[#2ea043] text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Follow Back All ({followBackCount})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Safety Banner */}
      <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-[#58a6ff] shrink-0 mt-0.5" />
        <div className="text-xs text-[#8b949e] leading-relaxed">
          <strong className="text-[#f0f6fc] block font-semibold mb-0.5">
            Safe Social Management
          </strong>
          Actions are performed strictly through the official GitHub REST API with sequential throttling to prevent triggering secondary rate limits.
        </div>
      </div>
    </div>
  );
}
