"use client";

import React from "react";
import {
  RefreshCw,
  LogOut,
  ExternalLink,
  Menu,
  Activity,
  User,
  LayoutDashboard,
  UserMinus,
  UserCheck,
  Settings as SettingsIcon,
} from "lucide-react";
import { GitHubUser } from "@/lib/session";
import { RateLimitInfo } from "@/lib/github";
import { TabType } from "@/types";

interface NavbarProps {
  currentTab: TabType;
  user: GitHubUser | null;
  rateLimit: RateLimitInfo | null;
  isSyncing: boolean;
  onSync: () => void;
  onLogout: () => void;
  onToggleSidebar: () => void;
}

export function Navbar({
  currentTab,
  user,
  rateLimit,
  isSyncing,
  onSync,
  onLogout,
  onToggleSidebar,
}: NavbarProps) {
  const getTabLabel = (tab: TabType) => {
    switch (tab) {
      case "dashboard":
        return { label: "Dashboard", icon: LayoutDashboard };
      case "not-following-back":
        return { label: "Not Following Back", icon: UserMinus };
      case "follow-back":
        return { label: "Follow Back Candidates", icon: UserCheck };
      case "settings":
        return { label: "Settings & Sync", icon: SettingsIcon };
    }
  };

  const currentInfo = getTabLabel(currentTab);
  const TabIcon = currentInfo.icon;

  return (
    <header className="h-14 border-b border-[#30363d] bg-[#161b22]/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile hamburger & Current Page Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d] rounded-md md:hidden transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#f0f6fc]">
          <TabIcon className="w-4 h-4 text-[#58a6ff]" />
          <span>{currentInfo.label}</span>
        </div>
      </div>

      {/* Right: Rate limit, Sync, Profile, Logout */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Rate limit status pill */}
        {rateLimit && (
          <div
            title={`GitHub API Rate Limit: ${rateLimit.remaining} remaining of ${rateLimit.limit}`}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0d1117] border border-[#30363d] rounded-full text-xs text-[#8b949e]"
          >
            <Activity className="w-3.5 h-3.5 text-[#58a6ff]" />
            <span className="tabular-nums font-mono text-[11px] text-[#c9d1d9]">
              {rateLimit.remaining.toLocaleString()}
            </span>
            <span className="text-[10px] text-[#6e7681]">/ {rateLimit.limit}</span>
          </div>
        )}

        {/* Sync / Refresh Button */}
        <button
          onClick={onSync}
          disabled={isSyncing}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#f0f6fc] bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-lg transition-colors disabled:opacity-50"
          title="Refresh Followers & Following lists"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-[#58a6ff]" : ""}`} />
          <span className="hidden sm:inline">{isSyncing ? "Syncing..." : "Sync"}</span>
        </button>

        {/* User avatar with link */}
        {user && (
          <a
            href={user.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 py-0.5 px-2 hover:bg-[#21262d] rounded-lg border border-transparent hover:border-[#30363d] transition-colors group"
            title={`Open @${user.login} on GitHub`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user.avatar_url}
              alt={user.login}
              className="w-6 h-6 rounded-full border border-[#30363d]"
            />
            <span className="hidden sm:inline text-xs font-medium text-[#c9d1d9] group-hover:text-[#f0f6fc]">
              @{user.login}
            </span>
            <ExternalLink className="w-3 h-3 text-[#6e7681] group-hover:text-[#8b949e] hidden sm:inline" />
          </a>
        )}

        {/* Logout button */}
        <button
          onClick={onLogout}
          className="p-1.5 text-[#8b949e] hover:text-[#f85149] hover:bg-[#21262d] rounded-lg transition-colors border border-transparent hover:border-[#da3633]/30"
          title="Sign Out"
          aria-label="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
