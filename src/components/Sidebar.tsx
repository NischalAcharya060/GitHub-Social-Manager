"use client";

import React from "react";
import {
  LayoutDashboard,
  UserMinus,
  UserCheck,
  Settings,
  ExternalLink,
  LogOut,
  X,
} from "lucide-react";
import { TabType } from "@/types";
import { GitHubUser } from "@/lib/session";
import { GithubIcon } from "./GithubIcon";
import { BrandLogo } from "./BrandLogo";

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  notFollowingBackCount: number;
  followBackCount: number;
  user: GitHubUser | null;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
}

export function Sidebar({
  currentTab,
  onSelectTab,
  notFollowingBackCount,
  followBackCount,
  user,
  isOpenMobile,
  onCloseMobile,
  onLogout,
}: SidebarProps) {
  const navItems = [
    {
      id: "dashboard" as TabType,
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "not-following-back" as TabType,
      label: "Not Following Back",
      icon: UserMinus,
      badge: notFollowingBackCount > 0 ? notFollowingBackCount : 0,
      badgeColor: "bg-[#da3633]/20 text-[#f85149] border-[#da3633]/30",
    },
    {
      id: "follow-back" as TabType,
      label: "Follow Back",
      icon: UserCheck,
      badge: followBackCount > 0 ? followBackCount : 0,
      badgeColor: "bg-[#238636]/20 text-[#3fb950] border-[#238636]/30",
    },
    {
      id: "settings" as TabType,
      label: "Settings",
      icon: Settings,
      badge: null,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#161b22] border-r border-[#30363d] w-64 select-none">
      {/* Brand Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-[#30363d] shrink-0">
        <div className="flex items-center gap-2.5">
          <BrandLogo className="w-7 h-7 shrink-0 shadow-md" />
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-semibold text-xs text-[#f0f6fc] tracking-tight truncate">
              GitHub Social Manager
            </span>
            <span className="text-[10px] uppercase font-mono px-1 py-0.5 bg-[#21262d] text-[#3fb950] border border-[#30363d] rounded shrink-0">
              v1.0
            </span>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="p-1.5 text-[#8b949e] hover:text-[#f0f6fc] rounded-md hover:bg-[#21262d] md:hidden"
          aria-label="Close menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-semibold text-[#8b949e] uppercase tracking-wider">
          Social Management
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? "bg-[#21262d] text-[#f0f6fc] border border-[#30363d]"
                  : "text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d]/50 border border-transparent"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 ${
                    isActive
                      ? item.id === "not-following-back"
                        ? "text-[#f85149]"
                        : item.id === "follow-back"
                        ? "text-[#3fb950]"
                        : "text-[#58a6ff]"
                      : "text-[#8b949e]"
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge !== null && (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-mono border tabular-nums ${item.badgeColor}`}
                >
                  {item.badge.toLocaleString()}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Info footer */}
      {user && (
        <div className="p-3 border-t border-[#30363d] bg-[#0d1117]/60 shrink-0">
          <div className="p-2.5 rounded-lg bg-[#161b22] border border-[#30363d]">
            <div className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user.avatar_url}
                alt={user.login}
                className="w-8 h-8 rounded-full border border-[#30363d] shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#f0f6fc] truncate leading-tight">
                  {user.name || `@${user.login}`}
                </p>
                <p className="text-[11px] text-[#8b949e] truncate leading-tight">@{user.login}</p>
              </div>
              <a
                href={user.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#8b949e] hover:text-[#58a6ff] p-1 rounded hover:bg-[#21262d] transition-colors"
                title="View on GitHub"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="mt-2.5 pt-2 border-t border-[#30363d]/60 grid grid-cols-2 gap-2 text-center text-[11px]">
              <div>
                <span className="text-[#8b949e] block text-[10px]">Followers</span>
                <span className="font-semibold text-[#f0f6fc] font-mono tabular-nums">
                  {user.followers.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[#8b949e] block text-[10px]">Following</span>
                <span className="font-semibold text-[#f0f6fc] font-mono tabular-nums">
                  {user.following.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1 px-2 text-[11px] font-medium text-[#8b949e] hover:text-[#f85149] hover:bg-[#da3633]/10 border border-transparent hover:border-[#da3633]/20 rounded transition-colors"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar anchored to the full left of screen */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
