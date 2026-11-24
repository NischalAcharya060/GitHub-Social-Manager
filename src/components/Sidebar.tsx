"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  UserMinus,
  UserCheck,
  Settings,
  ExternalLink,
  LogOut,
  X,
  BookOpen,
  GitBranch,
} from "lucide-react";
import { TabType } from "@/types";
import { GitHubUser } from "@/lib/session";
import { GithubIcon } from "./GithubIcon";
import { BrandLogo } from "./BrandLogo";
import { UserAvatar } from "./UserAvatar";
import { cn } from "@/lib/ui";

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
  useEffect(() => {
    if (!isOpenMobile) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseMobile();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpenMobile, onCloseMobile]);

  const navItems = [
    {
      id: "dashboard" as TabType,
      label: "Overview",
      icon: LayoutDashboard,
      badge: null as number | null,
      tone: "brand",
    },
    {
      id: "not-following-back" as TabType,
      label: "Not Following Back",
      icon: UserMinus,
      badge: notFollowingBackCount,
      tone: "danger",
    },
    {
      id: "follow-back" as TabType,
      label: "Follow Back",
      icon: UserCheck,
      badge: followBackCount,
      tone: "brand",
    },
    {
      id: "settings" as TabType,
      label: "Settings",
      icon: Settings,
      badge: null as number | null,
      tone: "brand",
    },
  ];

  const sidebarContent = (
    <div className="flex h-full w-[272px] select-none flex-col border-r border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-xl">
      {/* Brand */}
      <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-[var(--border-subtle)] px-5">
        <Link href="/" className="group flex min-w-0 items-center gap-3">
          <BrandLogo className="h-8 w-8 shrink-0 transition-transform duration-200 group-hover:scale-105" />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold leading-tight tracking-tight text-[var(--text)]">
              Social Manager
            </p>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--text-faint)]">
              GitHub workspace
            </p>
          </div>
        </Link>
        <button
          type="button"
          onClick={onCloseMobile}
          className="rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-white/5 hover:text-[var(--text)] md:hidden"
          aria-label="Close navigation"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-7 overflow-y-auto px-3 py-6" aria-label="Main navigation">
        <div>
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-faint)]">
            Workspace
          </p>
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group relative flex w-full items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-left text-[13px] font-medium transition-all duration-200",
                    isActive
                      ? "bg-[var(--surface-2)] text-[var(--text)] shadow-[var(--shadow-xs)]"
                      : "text-[var(--text-muted)] hover:bg-white/[0.035] hover:text-[var(--text)]"
                  )}
                >
                  {isActive && (
                    <span className="absolute -left-3 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-[var(--brand)]" />
                  )}
                  <Icon
                    className={cn(
                      "h-[17px] w-[17px] shrink-0 transition-colors",
                      isActive
                        ? item.tone === "danger" && item.id === "not-following-back"
                          ? "text-[var(--danger)]"
                          : "text-[var(--brand)]"
                        : "text-[var(--text-faint)] group-hover:text-[var(--text-soft)]"
                    )}
                  />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge !== null && item.badge > 0 && (
                    <span
                      className={cn(
                        "min-w-[24px] rounded-md px-1.5 py-0.5 text-center font-mono text-[10px] font-semibold tabular-nums",
                        item.id === "not-following-back"
                          ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                          : "bg-[var(--brand-soft)] text-[var(--brand)]"
                      )}
                    >
                      {item.badge > 999 ? "999+" : item.badge.toLocaleString()}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-faint)]">
            Resources
          </p>
          <div className="space-y-1">
            <Link
              href="/docs"
              className="group flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-[13px] font-medium text-[var(--text-muted)] transition-colors hover:bg-white/[0.035] hover:text-[var(--text)]"
            >
              <BookOpen className="h-[17px] w-[17px] text-[var(--text-faint)] group-hover:text-[var(--info)]" />
              <span className="flex-1">Documentation</span>
              <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
            <a
              href="https://github.com/NischalAcharya060/GitHub-Social-Manager"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-[13px] font-medium text-[var(--text-muted)] transition-colors hover:bg-white/[0.035] hover:text-[var(--text)]"
            >
              <GitBranch className="h-[17px] w-[17px] text-[var(--text-faint)] group-hover:text-[var(--info)]" />
              <span className="flex-1">Source code</span>
              <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
            </a>
          </div>
        </div>
      </nav>

      {/* Account */}
      {user && (
        <div className="shrink-0 border-t border-[var(--border-subtle)] p-3">
          <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)]/70 p-3">
            <div className="flex items-center gap-2.5">
              <UserAvatar
                src={user.avatar_url}
                name={user.login}
                className="h-9 w-9 text-sm"
                loading="eager"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold leading-tight text-[var(--text)]">
                  {user.name || `@${user.login}`}
                </p>
                <p className="mt-0.5 truncate text-[11px] leading-tight text-[var(--text-muted)]">
                  @{user.login}
                </p>
              </div>
              <a
                href={user.html_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open @${user.login} on GitHub`}
                className="rounded-lg p-1.5 text-[var(--text-faint)] transition-colors hover:bg-white/5 hover:text-[var(--info)]"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[var(--border-subtle)] pt-3 text-center">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[var(--text-faint)]">Followers</p>
                <p className="font-mono text-xs font-semibold tabular-nums text-[var(--text)]">
                  {user.followers.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[var(--text-faint)]">Following</p>
                <p className="font-mono text-xs font-semibold tabular-nums text-[var(--text)]">
                  {user.following.toLocaleString()}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-transparent px-3 py-2 text-[11px] font-semibold text-[var(--text-muted)] transition-colors hover:border-[var(--danger-line)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-[var(--text-faint)]">
            <GithubIcon className="h-3 w-3" />
            <span>Official REST API · v3</span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[272px] md:block">{sidebarContent}</aside>

      {isOpenMobile && (
        <div className="fixed inset-0 z-[60] flex md:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={onCloseMobile}
            className="absolute inset-0 h-full w-full cursor-default bg-[rgba(2,5,9,0.78)] backdrop-blur-sm"
          />
          <div className="animate-rise relative z-10 h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
