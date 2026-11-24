"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
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

  // 2. Sync GitHub followers & following data
  const syncGitHubData = useCallback(async (quiet: boolean = false) => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/github/sync");
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to sync GitHub data.");
      }

      setSyncData({
        user: data.user,
        totalFollowers: data.totalFollowers,
        totalFollowing: data.totalFollowing,
        notFollowingBack: data.notFollowingBack,
        followBackCandidates: data.followBackCandidates,
        rateLimit: data.rateLimit,
        syncedAt: data.syncedAt,
      });

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
  }, [showToast]);

  // Initial load: the session + graph fetch are external I/O, so their async
  // results need to be published back into React state from this subscription.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkAuth().then((authed) => {
      if (authed) {
        syncGitHubData(true);
      }
    });
  }, [checkAuth, syncGitHubData]);

  // Logout handler
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setIsAuthenticated(false);
      setCurrentUser(null);
      setSyncData(null);
      showToast("info", "Signed Out", "You have been logged out.");
    } catch {
      setIsAuthenticated(false);
    }
  };

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

        if (action === "unfollow") {
          return {
            ...prev,
            totalFollowing: Math.max(0, prev.totalFollowing - 1),
            notFollowingBack: prev.notFollowingBack.filter((u) => u.login !== username),
          };
        } else {
          return {
            ...prev,
            totalFollowing: prev.totalFollowing + 1,
            followBackCandidates: prev.followBackCandidates.filter((u) => u.login !== username),
          };
        }
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
    if (targets.length === 0) {
      showToast("info", "No Accounts", "No accounts to process.");
      return;
    }

    setBulkModalState({
      isOpen: true,
      action,
      targets,
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

      if (action === "unfollow") {
        return {
          ...prev,
          totalFollowing: Math.max(0, prev.totalFollowing - succeededSet.size),
          notFollowingBack: prev.notFollowingBack.filter(
            (u) => !succeededSet.has(u.login)
          ),
        };
      } else {
        return {
          ...prev,
          totalFollowing: prev.totalFollowing + succeededSet.size,
          followBackCandidates: prev.followBackCandidates.filter(
            (u) => !succeededSet.has(u.login)
          ),
        };
      }
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
            if (ok) syncGitHubData(true);
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
                  onSingleAction={handleSingleAction}
                  onBulkAction={handleTriggerBulkAction}
                />
              )}

              {currentTab === "follow-back" && (
                <AccountListView
                  type="follow-back"
                  accounts={syncData.followBackCandidates}
                  onSingleAction={handleSingleAction}
                  onBulkAction={handleTriggerBulkAction}
                />
              )}

              {currentTab === "settings" && currentUser && (
                <SettingsView
                  user={currentUser}
                  rateLimit={rateLimit}
                  syncedAt={syncData.syncedAt}
                  authType={authType}
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
