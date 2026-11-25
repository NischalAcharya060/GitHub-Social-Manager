"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ToastProvider, useToast } from "@/components/Toast";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { DashboardView } from "@/components/DashboardView";
import { AccountListView } from "@/components/AccountListView";
import { SettingsView } from "@/components/SettingsView";
import { LandingView } from "@/components/LandingView";
import { BulkActionModal } from "@/components/BulkActionModal";
import { SyncData, TabType } from "@/types";
import { GitHubAccountItem, RateLimitInfo } from "@/lib/github";
import { GitHubUser } from "@/lib/session";
import { Loader2, RefreshCw } from "lucide-react";

const STORAGE_KEY_SYNC_DATA = "gh_sm_sync_data";
const STORAGE_KEY_LAST_SYNC = "gh_sm_last_sync_time";
const STORAGE_KEY_WHITELIST = "gh_sm_whitelist";
const COOLDOWN_SECONDS = 120; // 2 minutes cooldown between manual syncs

function MainApp() {
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const oauthError = searchParams.get("error");

  // Authentication & session state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isOAuthConfigured, setIsOAuthConfigured] = useState(false);
  const [authType, setAuthType] = useState<"oauth" | "token">("oauth");
  const [currentUser, setCurrentUser] = useState<GitHubUser | null>(null);

  // App navigation state
  const [currentTab, setCurrentTab] = useState<TabType>("dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Sync data state
  const [syncData, setSyncData] = useState<SyncData | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [rateLimit, setRateLimit] = useState<RateLimitInfo | null>(null);

  // Whitelist / Protected accounts state
  const [whitelist, setWhitelist] = useState<Set<string>>(new Set());

  // Sync cooldown tracking (2 minutes cooldown)
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);

  // Interval timer updating remaining cooldown
  useEffect(() => {
    const updateCooldown = () => {
      if (typeof window === "undefined") return;
      const last = localStorage.getItem(STORAGE_KEY_LAST_SYNC);
      if (!last) {
        setCooldownSeconds(0);
        return;
      }
      const elapsed = Math.floor((Date.now() - Number(last)) / 1000);
      const remaining = Math.max(0, COOLDOWN_SECONDS - elapsed);
      setCooldownSeconds(remaining);
    };

    updateCooldown();
    const interval = setInterval(updateCooldown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Bulk action modal state
  const [bulkModalState, setBulkModalState] = useState<{
    isOpen: boolean;
    action: "follow" | "unfollow";
    targets: GitHubAccountItem[];
  }>({
    isOpen: false,
    action: "unfollow",
    targets: [],
  });

  // Load Whitelist from localStorage first (for zero-latency hydration) and merge with API
  const loadWhitelist = useCallback(async () => {
    let localItems: string[] = [];
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem(STORAGE_KEY_WHITELIST);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            localItems = parsed.map((s: string) => s.toLowerCase());
            setWhitelist(new Set(localItems));
          }
        } catch {
          // ignore cache parse error
        }
      }
    }

    try {
      const res = await fetch("/api/whitelist");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.whitelist)) {
          const cloudList = data.whitelist.map((s: string) => s.toLowerCase());
          const merged = Array.from(new Set([...localItems, ...cloudList]));
          setWhitelist(new Set(merged));
          if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY_WHITELIST, JSON.stringify(merged));
          }
        }
      }
    } catch {
      // offline or silent fail
    }
  }, []);

  // 1. Check authentication status
  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();

      setIsOAuthConfigured(Boolean(data.isOAuthConfigured));

      if (data.authenticated && data.user) {
        setIsAuthenticated(true);
        setCurrentUser(data.user);
        setAuthType(data.authType || "oauth");
        if (data.rateLimit) setRateLimit(data.rateLimit);
        return true;
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
        return false;
      }
    } catch {
      setIsAuthenticated(false);
      return false;
    }
  }, []);

  // 2. Sync GitHub followers & following data (with cooldown check to protect rate limits)
  const syncGitHubData = useCallback(
    async (quiet: boolean = false, bypassCooldown: boolean = false) => {
      // Enforce cooldown unless bypassed on initial first login
      if (!bypassCooldown && cooldownSeconds > 0) {
        const minutes = Math.floor(cooldownSeconds / 60);
        const seconds = cooldownSeconds % 60;
        const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
        showToast(
          "info",
          "Sync Cooldown Active",
          `Please wait ${timeStr} before syncing again to avoid hitting GitHub API rate limits.`
        );
        return;
      }

      setIsSyncing(true);
      try {
        const res = await fetch("/api/github/sync");
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to sync GitHub data.");
        }

        const freshSyncData: SyncData = {
          user: data.user,
          totalFollowers: data.totalFollowers,
          totalFollowing: data.totalFollowing,
          followers: data.followers,
          following: data.following,
          notFollowingBack: data.notFollowingBack,
          followBackCandidates: data.followBackCandidates,
          rateLimit: data.rateLimit,
          syncedAt: data.syncedAt,
        };

        setSyncData(freshSyncData);

        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(STORAGE_KEY_SYNC_DATA, JSON.stringify(freshSyncData));
            localStorage.setItem(STORAGE_KEY_LAST_SYNC, String(Date.now()));
          } catch {
            // private browsing or storage full
          }
        }
        setCooldownSeconds(COOLDOWN_SECONDS);

        if (data.user) setCurrentUser(data.user);
        if (data.rateLimit) setRateLimit(data.rateLimit);

        if (!quiet) {
          showToast(
            "success",
            "Sync Complete",
            `Indexed ${data.totalFollowers} followers and ${data.totalFollowing} following.`
          );
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Sync error";
        showToast("error", "Sync Failed", msg);
      } finally {
        setIsSyncing(false);
      }
    },
    [cooldownSeconds, showToast]
  );

  // Initial load: the session + graph fetch are external I/O, so their async
  // results need to be published back into React state from this subscription.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkAuth().then((authed) => {
      if (authed) {
        loadWhitelist();

        // Check local cache first so page refresh loads instantly with 0ms delay and no redundant API calls
        let hasCache = false;
        if (typeof window !== "undefined") {
          const cached = localStorage.getItem(STORAGE_KEY_SYNC_DATA);
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              if (parsed && parsed.user && Array.isArray(parsed.notFollowingBack)) {
                setSyncData(parsed);
                if (parsed.user) setCurrentUser(parsed.user);
                if (parsed.rateLimit) setRateLimit(parsed.rateLimit);
                hasCache = true;
              }
            } catch {
              // ignore corrupt cache
            }
          }
        }

        // Only auto-sync if user has no cached graph data (first login)
        if (!hasCache) {
          syncGitHubData(true, true);
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dedicated whitelist accounts list for the Whitelist tab
  const whitelistedAccounts: GitHubAccountItem[] = useMemo(() => {
    if (!whitelist || whitelist.size === 0) return [];

    const knownAccounts = new Map<string, GitHubAccountItem>();
    if (syncData) {
      syncData.notFollowingBack.forEach((a) => knownAccounts.set(a.login.toLowerCase(), a));
      syncData.followBackCandidates.forEach((a) => knownAccounts.set(a.login.toLowerCase(), a));
    }

    return Array.from(whitelist).map((login) => {
      const existing = knownAccounts.get(login.toLowerCase());
      if (existing) return existing;
      return {
        id: Math.abs(login.split("").reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)),
        login,
        avatar_url: `https://github.com/${login}.png?size=96`,
        html_url: `https://github.com/${login}`,
        type: "User",
        site_admin: false,
      };
    });
  }, [whitelist, syncData]);

  // Logout handler
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEY_SYNC_DATA);
        localStorage.removeItem(STORAGE_KEY_LAST_SYNC);
        // Retain STORAGE_KEY_WHITELIST so user's protected list persists on device
      }
      setIsAuthenticated(false);
      setCurrentUser(null);
      setSyncData(null);
      setCooldownSeconds(0);
      showToast("info", "Signed Out", "You have been logged out.");
    } catch {
      setIsAuthenticated(false);
    }
  };

  // Toggle single account in Whitelist
  const handleToggleWhitelist = useCallback(
    async (username: string, accountId?: number) => {
      const lower = username.toLowerCase();
      const isCurrentlyWhitelisted = whitelist.has(lower);

      // Optimistic state update
      setWhitelist((prev) => {
        const next = new Set(prev);
        if (isCurrentlyWhitelisted) {
          next.delete(lower);
        } else {
          next.add(lower);
        }
        if (typeof window !== "undefined") {
          localStorage.setItem("gh_sm_whitelist", JSON.stringify(Array.from(next)));
        }
        return next;
      });

      try {
        const res = await fetch("/api/whitelist", {
          method: isCurrentlyWhitelisted ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: lower, targetId: accountId }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to update whitelist");
        }
        showToast(
          "success",
          isCurrentlyWhitelisted ? "Protection Removed" : "Account Protected",
          `@${username} is ${
            isCurrentlyWhitelisted
              ? "no longer shielded from batch unfollow actions."
              : "now shielded and will never be unfollowed in batch operations."
          }`
        );
      } catch (err: unknown) {
        // Revert optimistic update
        setWhitelist((prev) => {
          const next = new Set(prev);
          if (isCurrentlyWhitelisted) {
            next.add(lower);
          } else {
            next.delete(lower);
          }
          if (typeof window !== "undefined") {
            localStorage.setItem("gh_sm_whitelist", JSON.stringify(Array.from(next)));
          }
          return next;
        });
        const msg = err instanceof Error ? err.message : "Error saving";
        showToast("error", "Protection Failed", msg);
      }
    },
    [whitelist, showToast]
  );

  // Bulk add/remove from Whitelist
  const handleBulkWhitelist = useCallback(
    async (usernames: string[], action: "add" | "remove") => {
      const lowers = usernames.map((u) => u.toLowerCase());

      // Optimistic update
      setWhitelist((prev) => {
        const next = new Set(prev);
        lowers.forEach((l) => (action === "add" ? next.add(l) : next.delete(l)));
        if (typeof window !== "undefined") {
          localStorage.setItem("gh_sm_whitelist", JSON.stringify(Array.from(next)));
        }
        return next;
      });

      try {
        const res = await fetch("/api/whitelist", {
          method: action === "add" ? "POST" : "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ usernames: lowers }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Bulk whitelist update failed");
        }
        showToast(
          "success",
          action === "add" ? "Accounts Protected" : "Protection Removed",
          `${lowers.length} account${lowers.length > 1 ? "s" : ""} ${
            action === "add" ? "added to" : "removed from"
          } your protected list.`
        );
      } catch (err: unknown) {
        loadWhitelist();
        const msg = err instanceof Error ? err.message : "Error updating";
        showToast("error", "Update Failed", msg);
      }
    },
    [loadWhitelist, showToast]
  );

  // Single Follow / Unfollow handler
  const handleSingleAction = async (
    action: "follow" | "unfollow",
    username: string
  ): Promise<boolean> => {
    try {
      const res = await fetch("/api/github/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, username }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || `Failed to ${action} @${username}`);
      }

      // Update rate limit if returned
      if (data.rateLimit) setRateLimit(data.rateLimit);

      // Optimistically update local syncData
      setSyncData((prev) => {
        if (!prev) return prev;

        const next =
          action === "unfollow"
            ? {
                ...prev,
                totalFollowing: Math.max(0, prev.totalFollowing - 1),
                notFollowingBack: prev.notFollowingBack.filter((u) => u.login !== username),
              }
            : {
                ...prev,
                totalFollowing: prev.totalFollowing + 1,
                followBackCandidates: prev.followBackCandidates.filter((u) => u.login !== username),
              };

        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(STORAGE_KEY_SYNC_DATA, JSON.stringify(next));
          } catch {
            // ignore
          }
        }

        return next;
      });

      showToast(
        "success",
        action === "unfollow" ? "Unfollowed User" : "Followed User",
        `Successfully ${action === "unfollow" ? "unfollowed" : "followed"} @${username}`
      );

      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Action failed";
      showToast("error", `Failed to ${action}`, msg);
      return false;
    }
  };

  // Open bulk action modal
  const handleTriggerBulkAction = (
    action: "follow" | "unfollow",
    targets: GitHubAccountItem[]
  ) => {
    // When unfollowing, automatically shield protected accounts
    const safeTargets =
      action === "unfollow"
        ? targets.filter((acc) => !whitelist.has(acc.login.toLowerCase()))
        : targets;

    if (safeTargets.length === 0) {
      showToast(
        "info",
        "No Eligible Accounts",
        action === "unfollow"
          ? "All selected accounts are currently shielded by your whitelist."
          : "No accounts to process."
      );
      return;
    }

    setBulkModalState({
      isOpen: true,
      action,
      targets: safeTargets,
    });
  };

  // Callback when bulk action finishes
  const handleBulkFinished = (
    action: "follow" | "unfollow",
    succeededLogins: string[],
    failedLogins: string[]
  ) => {
    const succeededSet = new Set(succeededLogins);

    setSyncData((prev) => {
      if (!prev) return prev;

      let nextData: SyncData;
      if (action === "unfollow") {
        nextData = {
          ...prev,
          totalFollowing: Math.max(0, prev.totalFollowing - succeededSet.size),
          notFollowingBack: prev.notFollowingBack.filter(
            (u) => !succeededSet.has(u.login)
          ),
        };
      } else {
        nextData = {
          ...prev,
          totalFollowing: prev.totalFollowing + succeededSet.size,
          followBackCandidates: prev.followBackCandidates.filter(
            (u) => !succeededSet.has(u.login)
          ),
        };
      }

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY_SYNC_DATA, JSON.stringify(nextData));
        } catch {
          // ignore
        }
      }

      return nextData;
    });

    if (succeededLogins.length > 0) {
      showToast(
        "success",
        "Batch Action Completed",
        `${succeededLogins.length} succeeded${failedLogins.length ? `, ${failedLogins.length} failed` : ""}.`
      );
    }
  };

  // Loading initial authentication state
  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="relative">
          <div className="absolute inset-0 animate-glow rounded-2xl bg-[var(--brand-soft)] blur-xl" />
          <div className="app-panel relative flex h-14 w-14 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--brand)]" />
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--text)]">Connecting to GitHub</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Preparing your workspace…</p>
        </div>
      </div>
    );
  }

  // Not signed in: Show Landing + Login Screen
  if (!isAuthenticated) {
    return (
      <LandingView
        isOAuthConfigured={isOAuthConfigured}
        oauthError={oauthError}
        onLoginSuccess={() => {
          checkAuth().then((ok) => {
            if (ok) {
              loadWhitelist();
              syncGitHubData(true, true);
            }
          });
        }}
      />
    );
  }

  // Signed in: Main Application Shell with Sidebar fixed to full left
  return (
    <div className="flex min-h-dvh">
      {/* Sidebar fixed to full left of screen */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        notFollowingBackCount={syncData?.notFollowingBack.length || 0}
        followBackCount={syncData?.followBackCandidates.length || 0}
        whitelistCount={whitelist.size}
        user={currentUser}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Content Column offset by sidebar width on desktop */}
      <div className="flex min-h-dvh min-w-0 flex-1 flex-col md:pl-[272px]">
        {/* Top Navbar Header */}
        <Navbar
          currentTab={currentTab}
          user={currentUser}
          rateLimit={rateLimit}
          isSyncing={isSyncing}
          cooldownSeconds={cooldownSeconds}
          onSync={() => syncGitHubData(false)}
          onLogout={handleLogout}
          onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        {/* Main View Area */}
        <main
          id="main-content"
          tabIndex={-1}
          className="w-full min-w-0 max-w-[1600px] flex-1 p-4 outline-none sm:p-8 lg:p-12"
        >
          {!syncData && isSyncing ? (
            /* Initial Skeleton Loader */
            <div className="space-y-6" aria-busy="true" aria-label="Loading your GitHub data">
              <div className="skeleton h-28 rounded-[var(--radius-lg)]" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="skeleton h-28 rounded-[var(--radius-lg)]" />
                ))}
              </div>
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div className="skeleton h-72 rounded-[var(--radius-lg)]" />
                <div className="skeleton h-72 rounded-[var(--radius-lg)]" />
              </div>
            </div>
          ) : syncData ? (
            <>
              {currentTab === "dashboard" && (
                <DashboardView
                  data={syncData}
                  whitelist={whitelist}
                  cooldownSeconds={cooldownSeconds}
                  onNavigateTab={setCurrentTab}
                  onTriggerBulkAction={handleTriggerBulkAction}
                  onRefresh={() => syncGitHubData(false)}
                  isSyncing={isSyncing}
                />
              )}

              {currentTab === "not-following-back" && (
                <AccountListView
                  type="not-following-back"
                  accounts={syncData.notFollowingBack}
                  whitelist={whitelist}
                  onSingleAction={handleSingleAction}
                  onBulkAction={handleTriggerBulkAction}
                  onToggleWhitelist={handleToggleWhitelist}
                  onBulkWhitelist={handleBulkWhitelist}
                />
              )}

              {currentTab === "follow-back" && (
                <AccountListView
                  type="follow-back"
                  accounts={syncData.followBackCandidates}
                  whitelist={whitelist}
                  onSingleAction={handleSingleAction}
                  onBulkAction={handleTriggerBulkAction}
                  onToggleWhitelist={handleToggleWhitelist}
                  onBulkWhitelist={handleBulkWhitelist}
                />
              )}

              {currentTab === "whitelist" && (
                <AccountListView
                  type="whitelist"
                  accounts={whitelistedAccounts}
                  whitelist={whitelist}
                  followers={syncData.followers || syncData.followBackCandidates || []}
                  onSingleAction={handleSingleAction}
                  onBulkAction={handleTriggerBulkAction}
                  onToggleWhitelist={handleToggleWhitelist}
                  onBulkWhitelist={handleBulkWhitelist}
                />
              )}

              {currentTab === "settings" && currentUser && (
                <SettingsView
                  user={currentUser}
                  rateLimit={rateLimit}
                  syncedAt={syncData.syncedAt}
                  authType={authType}
                  whitelistCount={whitelist.size}
                  cooldownSeconds={cooldownSeconds}
                  onRefresh={() => syncGitHubData(false)}
                  isSyncing={isSyncing}
                  onLogout={handleLogout}
                />
              )}
            </>
          ) : (
            <div className="app-panel mx-auto max-w-md px-6 py-14 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--warning-soft)] text-[var(--warning)]">
                <RefreshCw className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm font-semibold text-[var(--text)]">
                We couldn&apos;t load your GitHub data
              </p>
              <p className="mx-auto mt-1.5 max-w-xs text-xs leading-relaxed text-[var(--text-muted)]">
                This is usually temporary. Retry the sync to index your followers and following lists.
              </p>
              <button
                type="button"
                onClick={() => syncGitHubData(false)}
                className="app-btn app-btn-primary mx-auto mt-5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry sync
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Bulk Action Confirmation & Execution Modal */}
      <BulkActionModal
        isOpen={bulkModalState.isOpen}
        action={bulkModalState.action}
        targets={bulkModalState.targets}
        whitelist={whitelist}
        onClose={() => setBulkModalState((prev) => ({ ...prev, isOpen: false }))}
        onSuccessFinished={handleBulkFinished}
      />
    </div>
  );
}

export default function Page() {
  return (
    <ToastProvider>
      <Suspense
        fallback={
          <div className="flex min-h-dvh items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-[var(--brand)]" />
          </div>
        }
      >
        <MainApp />
      </Suspense>
    </ToastProvider>
  );
}
