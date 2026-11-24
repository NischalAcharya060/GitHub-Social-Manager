"use client";

import React, { useState } from "react";
import {
  User,
  RefreshCw,
  LogOut,
  ExternalLink,
  Shield,
  Activity,
  Clock,
  Gauge,
  KeyRound,
  CheckCircle2,
  Calendar,
  FolderGit2,
} from "lucide-react";
import { GitHubUser } from "@/lib/session";
import { RateLimitInfo } from "@/lib/github";
import { BulkActionSpeed } from "@/types";

interface SettingsViewProps {
  user: GitHubUser;
  rateLimit: RateLimitInfo | null;
  syncedAt: string;
  authType: "oauth" | "token";
  onRefresh: () => void;
  isSyncing: boolean;
  onLogout: () => void;
}

export function SettingsView({
  user,
  rateLimit,
  syncedAt,
  authType,
  onRefresh,
  isSyncing,
  onLogout,
}: SettingsViewProps) {
  const [defaultSpeed, setDefaultSpeed] = useState<BulkActionSpeed>("safe");

  // Format joined date
  const joinedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown";

  const lastSyncFormatted = syncedAt
    ? new Date(syncedAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Not yet synced";

  // Format rate limit reset time
  const formatResetTime = (timestamp?: number) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#30363d]">
        <h2 className="text-xl font-bold text-[#f0f6fc]">Settings &amp; Synchronization</h2>
        <p className="text-xs text-[#8b949e] mt-1">
          Manage your GitHub profile connection, API rate limits, and synchronization preferences.
        </p>
      </div>

      {/* GitHub Account Card */}
      <div className="p-5 sm:p-6 bg-[#161b22] border border-[#30363d] rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
            Connected GitHub Account
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-[#21262d] text-[#58a6ff] border border-[#30363d] flex items-center gap-1.5">
            <KeyRound className="w-3 h-3" />
            {authType === "oauth" ? "GitHub OAuth" : "Personal Access Token"}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user.avatar_url}
              alt={user.login}
              className="w-14 h-14 rounded-full border-2 border-[#30363d]"
            />
            <div>
              <h3 className="text-base font-bold text-[#f0f6fc] flex items-center gap-2">
                {user.name || `@${user.login}`}
                <a
                  href={user.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#8b949e] hover:text-[#58a6ff] transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </h3>
              <p className="text-xs text-[#8b949e]">@{user.login}</p>
              {user.bio && (
                <p className="text-xs text-[#c9d1d9] mt-1 max-w-md line-clamp-2">{user.bio}</p>
              )}
            </div>
          </div>

          <button
            onClick={onLogout}
            className="self-start sm:self-center flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#f85149] hover:bg-[#da3633]/15 border border-[#da3633]/30 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Account metadata grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#30363d]/60 text-xs">
          <div className="p-2.5 rounded-lg bg-[#0d1117] border border-[#30363d]">
            <span className="text-[11px] text-[#8b949e] block">Followers</span>
            <span className="font-bold text-[#f0f6fc] font-mono text-sm tabular-nums">
              {user.followers.toLocaleString()}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#0d1117] border border-[#30363d]">
            <span className="text-[11px] text-[#8b949e] block">Following</span>
            <span className="font-bold text-[#f0f6fc] font-mono text-sm tabular-nums">
              {user.following.toLocaleString()}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#0d1117] border border-[#30363d]">
            <span className="text-[11px] text-[#8b949e] block flex items-center gap-1">
              <FolderGit2 className="w-3 h-3" /> Repos
            </span>
            <span className="font-bold text-[#f0f6fc] font-mono text-sm tabular-nums">
              {user.public_repos.toLocaleString()}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#0d1117] border border-[#30363d]">
            <span className="text-[11px] text-[#8b949e] block flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Joined
            </span>
            <span className="font-medium text-[#f0f6fc] text-xs truncate block">{joinedDate}</span>
          </div>
        </div>
      </div>

      {/* Sync Status & Rate Limit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sync Status Box */}
        <div className="p-5 bg-[#161b22] border border-[#30363d] rounded-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#58a6ff]" />
                Account Synchronization
              </span>
              <span className="flex items-center gap-1 text-[11px] text-[#3fb950] font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active
              </span>
            </div>
            <p className="text-xs text-[#8b949e] leading-relaxed">
              Your follower graph is indexed locally for fast instant search and filtering.
            </p>
            <div className="mt-3 p-3 bg-[#0d1117] rounded-lg border border-[#30363d] space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-[#8b949e]">Last full sync:</span>
                <span className="text-[#f0f6fc] font-mono">{lastSyncFormatted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8b949e]">Data status:</span>
                <span className="text-[#3fb950] font-medium">Up to date</span>
              </div>
            </div>
          </div>

          <button
            onClick={onRefresh}
            disabled={isSyncing}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-[#f0f6fc] border border-[#30363d] rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-[#58a6ff]" : ""}`} />
            <span>{isSyncing ? "Fetching complete data..." : "Force Full Re-sync"}</span>
          </button>
        </div>

        {/* API Rate Limit Box */}
        <div className="p-5 bg-[#161b22] border border-[#30363d] rounded-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#58a6ff]" />
                GitHub REST API Rate Limit
              </span>
            </div>
            <p className="text-xs text-[#8b949e] leading-relaxed">
              GitHub limits authenticated REST calls per hour. We monitor this constantly to protect
              your quota.
            </p>

            {rateLimit ? (
              <div className="mt-3 p-3 bg-[#0d1117] rounded-lg border border-[#30363d] space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#8b949e]">Remaining requests:</span>
                  <span className="font-mono font-bold text-[#f0f6fc] tabular-nums">
                    {rateLimit.remaining.toLocaleString()} / {rateLimit.limit.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#58a6ff] rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round((rateLimit.remaining / rateLimit.limit) * 100)
                      )}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-[#8b949e] pt-1">
                  <span>Quota resets at:</span>
                  <span className="font-mono text-[#c9d1d9]">
                    {formatResetTime(rateLimit.reset)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-3 p-3 bg-[#0d1117] rounded-lg border border-[#30363d] text-xs text-[#8b949e]">
                Rate limit information will refresh upon your next API call.
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#8b949e]">
            <Shield className="w-3.5 h-3.5 text-[#3fb950] shrink-0" />
            <span>Automatic throttling protects against HTTP 429 errors.</span>
          </div>
        </div>
      </div>

      {/* Security & Privacy Card */}
      <div className="p-5 bg-[#161b22] border border-[#30363d] rounded-xl space-y-2 text-xs text-[#8b949e]">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#f0f6fc]">
          <Shield className="w-4 h-4 text-[#3fb950]" />
          <span>Security &amp; Token Storage</span>
        </div>
        <p className="leading-relaxed">
          Your GitHub credentials are never persisted in plain text, database, or client-side storage.
          All requests are authenticated via secure, encrypted HTTP-only session cookies using AES-256-GCM.
          No automated web scrapers or unauthorized background bots are used.
        </p>
      </div>
    </div>
  );
}
