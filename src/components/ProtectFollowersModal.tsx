"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  X,
  Search,
  ShieldCheck,
  Users,
  ExternalLink,
  CheckSquare,
  Square,
  Loader2,
  AtSign,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GitHubAccountItem } from "@/lib/github";
import { UserAvatar } from "./UserAvatar";

interface ProtectFollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  followers: GitHubAccountItem[];
  whitelist: Set<string>;
  onBulkWhitelist: (usernames: string[], action: "add" | "remove") => Promise<void>;
  onToggleWhitelist: (username: string, accountId?: number) => Promise<void>;
}

export function ProtectFollowersModal({
  isOpen,
  onClose,
  followers: initialFollowers,
  whitelist,
  onBulkWhitelist,
  onToggleWhitelist,
}: ProtectFollowersModalProps) {
  const [activeTab, setActiveTab] = useState<"followers" | "custom">("followers");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "unprotected" | "protected">("unprotected");
  const [selectedLogins, setSelectedLogins] = useState<Set<string>>(new Set());
  const [customUsername, setCustomUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingUsernames, setLoadingUsernames] = useState<Set<string>>(new Set());

  // In case initialFollowers is empty, fetch on mount
  const [fetchedFollowers, setFetchedFollowers] = useState<GitHubAccountItem[]>([]);
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // If no followers provided via props, fetch from API on mount
    if (!initialFollowers || initialFollowers.length === 0) {
      let isSubscribed = true;
      fetch("/api/github/followers")
        .then((res) => res.json())
        .then((data) => {
          if (isSubscribed && data.success && Array.isArray(data.followers)) {
            setFetchedFollowers(data.followers);
          }
        })
        .catch(() => {
          // ignore error
        })
        .finally(() => {
          if (isSubscribed) setIsLoadingFollowers(false);
        });

      return () => {
        isSubscribed = false;
      };
    }
  }, [initialFollowers]);

  // Combine props followers or fetched followers
  const followers = useMemo(() => {
    if (initialFollowers && initialFollowers.length > 0) return initialFollowers;
    return fetchedFollowers;
  }, [initialFollowers, fetchedFollowers]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Filtered followers list
  const filteredFollowers = useMemo(() => {
    let result = followers;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((item) => item.login.toLowerCase().includes(q));
    }

    // Protection status filter
    if (filterMode === "unprotected") {
      result = result.filter((item) => !whitelist.has(item.login.toLowerCase()));
    } else if (filterMode === "protected") {
      result = result.filter((item) => whitelist.has(item.login.toLowerCase()));
    }

    return result;
  }, [followers, searchQuery, filterMode, whitelist]);

  // Selectable items in current view (unprotected only)
  const selectableLogins = useMemo(() => {
    return filteredFollowers
      .filter((u) => !whitelist.has(u.login.toLowerCase()))
      .map((u) => u.login);
  }, [filteredFollowers, whitelist]);

  const isAllSelectableSelected =
    selectableLogins.length > 0 && selectableLogins.every((l) => selectedLogins.has(l));

  const toggleSelectAll = () => {
    const next = new Set(selectedLogins);
    if (isAllSelectableSelected) {
      selectableLogins.forEach((l) => next.delete(l));
    } else {
      selectableLogins.forEach((l) => next.add(l));
    }
    setSelectedLogins(next);
  };

  const handleToggleSelectUser = (login: string) => {
    const next = new Set(selectedLogins);
    if (next.has(login)) {
      next.delete(login);
    } else {
      next.add(login);
    }
    setSelectedLogins(next);
  };

  // 1-Click single protect
  const handleSingleProtect = async (username: string, accountId?: number) => {
    setLoadingUsernames((prev) => new Set(prev).add(username));
    try {
      await onToggleWhitelist(username, accountId);
      setSelectedLogins((prev) => {
        const next = new Set(prev);
        next.delete(username);
        return next;
      });
    } finally {
      setLoadingUsernames((prev) => {
        const next = new Set(prev);
        next.delete(username);
        return next;
      });
    }
  };

  // Bulk protect selected
  const handleBulkProtectSubmit = async () => {
    const logins = Array.from(selectedLogins);
    if (logins.length === 0) return;

    setIsSubmitting(true);
    try {
      await onBulkWhitelist(logins, "add");
      setSelectedLogins(new Set());
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Custom username submit
  const handleCustomUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customUsername.replace(/^@/, "").trim().toLowerCase();
    if (!clean) return;

    setIsSubmitting(true);
    try {
      await onToggleWhitelist(clean);
      setCustomUsername("");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          aria-hidden="true"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="protect-modal-title"
          className="relative flex max-h-[88vh] w-full max-w-2xl flex-col rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-glass)] shadow-2xl backdrop-blur-2xl"
        >
          {/* Header */}
          <div className="flex shrink-0 items-start justify-between border-b border-[var(--border)] p-5 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--brand-line)] bg-[var(--brand-soft)] text-[var(--brand)]">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <h2 id="protect-modal-title" className="text-base font-bold text-[var(--text)] sm:text-lg">
                  Add to Protected Accounts
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Shield accounts from bulk unfollows and cleanup operations
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-[var(--text-faint)] transition-colors hover:bg-white/5 hover:text-[var(--text)]"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex shrink-0 border-b border-[var(--border)] px-5 sm:px-6">
            <button
              type="button"
              onClick={() => setActiveTab("followers")}
              className={`flex items-center gap-2 border-b-2 py-3 text-xs font-semibold transition-colors ${
                activeTab === "followers"
                  ? "border-[var(--brand)] text-[var(--brand)]"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              <Users className="h-4 w-4" />
              Choose from Followers
              <span className="rounded-full bg-white/10 px-1.5 py-0.2 font-mono text-[10px] tabular-nums">
                {followers.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("custom")}
              className={`flex items-center gap-2 border-b-2 py-3 text-xs font-semibold transition-colors ${
                activeTab === "custom"
                  ? "border-[var(--brand)] text-[var(--brand)]"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              <AtSign className="h-4 w-4" />
              Add by Username
            </button>
          </div>

          {/* Tab 1: Followers Picker */}
          {activeTab === "followers" && (
            <>
              {/* Search & Filter Toolbar */}
              <div className="flex shrink-0 flex-col gap-2.5 border-b border-[var(--border)] bg-white/[0.015] p-4 sm:px-6">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-faint)]" />
                  <input
                    ref={searchInputRef}
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search followers by @username…"
                    className="app-input h-9 pl-9 text-xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-[var(--text-faint)] hover:text-[var(--text)]"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  {/* Category Pills */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setFilterMode("unprotected")}
                      className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                        filterMode === "unprotected"
                          ? "bg-[var(--brand-soft)] text-[var(--brand)] font-semibold"
                          : "text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--text)]"
                      }`}
                    >
                      Unprotected
                    </button>

                    <button
                      type="button"
                      onClick={() => setFilterMode("all")}
                      className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                        filterMode === "all"
                          ? "bg-[var(--surface-3)] text-[var(--text)] font-semibold"
                          : "text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--text)]"
                      }`}
                    >
                      All ({followers.length})
                    </button>

                    <button
                      type="button"
                      onClick={() => setFilterMode("protected")}
                      className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                        filterMode === "protected"
                          ? "bg-[var(--brand-soft)] text-[var(--brand)] font-semibold"
                          : "text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--text)]"
                      }`}
                    >
                      Protected ({followers.filter((u) => whitelist.has(u.login.toLowerCase())).length})
                    </button>
                  </div>

                  {/* Select All Toggle */}
                  {selectableLogins.length > 0 && (
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
                    >
                      {isAllSelectableSelected ? (
                        <CheckSquare className="h-3.5 w-3.5 text-[var(--brand)]" />
                      ) : (
                        <Square className="h-3.5 w-3.5" />
                      )}
                      <span>
                        {isAllSelectableSelected ? "Deselect page" : `Select all (${selectableLogins.length})`}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Followers List Scroll Container */}
              <div className="flex-1 divide-y divide-[var(--border-subtle)] overflow-y-auto p-2 sm:px-4">
                {isLoadingFollowers ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-xs text-[var(--text-muted)]">
                    <Loader2 className="h-6 w-6 animate-spin text-[var(--brand)]" />
                    <p className="mt-3 font-medium text-[var(--text)]">Loading your followers…</p>
                  </div>
                ) : filteredFollowers.length > 0 ? (
                  filteredFollowers.map((account) => {
                    const isProtected = whitelist.has(account.login.toLowerCase());
                    const isSelected = selectedLogins.has(account.login);
                    const isLoading = loadingUsernames.has(account.login);

                    return (
                      <div
                        key={account.id}
                        className={`group flex items-center justify-between gap-3 rounded-lg p-2.5 transition-colors ${
                          isSelected
                            ? "bg-[var(--brand-soft)]/20"
                            : isProtected
                              ? "bg-white/[0.015] opacity-75"
                              : "hover:bg-white/[0.025]"
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          {/* Checkbox */}
                          {!isProtected ? (
                            <button
                              type="button"
                              onClick={() => handleToggleSelectUser(account.login)}
                              className="rounded p-1 text-[var(--text-faint)] transition-colors hover:text-[var(--brand)]"
                              aria-label={`Select @${account.login}`}
                            >
                              {isSelected ? (
                                <CheckSquare className="h-4 w-4 text-[var(--brand)]" />
                              ) : (
                                <Square className="h-4 w-4" />
                              )}
                            </button>
                          ) : (
                            <div className="p-1 text-[var(--brand)]">
                              <ShieldCheck className="h-4 w-4" />
                            </div>
                          )}

                          <UserAvatar src={account.avatar_url} name={account.login} className="h-8 w-8 text-xs" />

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="truncate text-xs font-semibold text-[var(--text)]">
                                @{account.login}
                              </span>
                              <a
                                href={account.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[var(--text-faint)] opacity-0 transition-opacity hover:text-[var(--brand)] group-hover:opacity-100"
                                title="Open GitHub profile"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>

                            <div className="mt-0.5 flex items-center gap-1.5 text-[10px]">
                              {isProtected ? (
                                <span className="inline-flex items-center gap-1 font-medium text-[var(--brand)]">
                                  <ShieldCheck className="h-3 w-3" />
                                  Protected
                                </span>
                              ) : (
                                <span className="text-[var(--text-faint)]">Follows your profile</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div>
                          {isProtected ? (
                            <button
                              type="button"
                              onClick={() => handleSingleProtect(account.login, account.id)}
                              disabled={isLoading}
                              className="app-btn app-btn-ghost h-7.5 px-2.5 text-[11px] text-[var(--danger)] hover:bg-[var(--danger-soft)]"
                            >
                              {isLoading ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                "Unprotect"
                              )}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSingleProtect(account.login, account.id)}
                              disabled={isLoading}
                              className="app-btn app-btn-secondary h-7.5 px-3 text-[11px] text-[var(--brand)] hover:border-[var(--brand-line)]"
                            >
                              {isLoading ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <>
                                  <ShieldCheck className="h-3 w-3" />
                                  Protect
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-14 text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-[var(--text-muted)]">
                      <Search className="h-5 w-5" />
                    </div>
                    <p className="mt-3 text-xs font-semibold text-[var(--text)]">
                      {searchQuery
                        ? `No followers matching “${searchQuery}”`
                        : filterMode === "unprotected"
                          ? "All your followers are already protected!"
                          : "No followers found"}
                    </p>
                    <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                      {searchQuery
                        ? "Try clearing the search query or adjusting your filters."
                        : "Use the 'Add by Username' tab to shield any other GitHub account."}
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Sticky Action Footer */}
              <div className="flex shrink-0 items-center justify-between border-t border-[var(--border)] bg-white/[0.02] p-4 sm:px-6">
                <div className="text-xs text-[var(--text-muted)]">
                  {selectedLogins.size > 0 ? (
                    <span className="font-semibold text-[var(--text)]">
                      {selectedLogins.size} follower{selectedLogins.size === 1 ? "" : "s"} selected
                    </span>
                  ) : (
                    <span>Select followers to shield in bulk</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="app-btn app-btn-ghost h-9 px-3 text-xs"
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={handleBulkProtectSubmit}
                    disabled={selectedLogins.size === 0 || isSubmitting}
                    className="app-btn app-btn-primary h-9 px-4 text-xs font-semibold"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Protecting…
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Protect Selected ({selectedLogins.size})
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Tab 2: Custom Username Form */}
          {activeTab === "custom" && (
            <form onSubmit={handleCustomUsernameSubmit} className="flex flex-col p-6 sm:p-8">
              <div className="rounded-xl border border-[var(--border)] bg-white/[0.02] p-4 text-xs text-[var(--text-muted)]">
                <p className="font-semibold text-[var(--text)]">Protect any GitHub account</p>
                <p className="mt-1 leading-relaxed">
                  Enter any GitHub username to shield them from cleanup routines. Protected accounts
                  are permanently shielded and will never be unfollowed.
                </p>
              </div>

              <div className="mt-5">
                <label htmlFor="custom-username-input" className="block text-xs font-semibold text-[var(--text)]">
                  GitHub Username
                </label>
                <div className="relative mt-2">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-[var(--text-faint)]">
                    @
                  </span>
                  <input
                    id="custom-username-input"
                    type="text"
                    value={customUsername}
                    onChange={(e) => setCustomUsername(e.target.value)}
                    placeholder="e.g. torvalds, shadcn, or a coworker"
                    className="app-input h-10 pl-8 text-sm"
                    autoFocus
                    required
                  />
                </div>
              </div>

              {/* Live Preview if username typed */}
              {customUsername.trim() && (
                <div className="mt-4 flex items-center gap-3 rounded-lg border border-[var(--brand-line)] bg-[var(--brand-soft)]/20 p-3">
                  <UserAvatar
                    src={`https://github.com/${customUsername.replace(/^@/, "").trim()}.png?size=96`}
                    name={customUsername}
                    className="h-10 w-10 text-xs"
                  />
                  <div>
                    <div className="text-xs font-semibold text-[var(--text)]">
                      @{customUsername.replace(/^@/, "").trim()}
                    </div>
                    <div className="text-[11px] text-[var(--brand)]">Ready to be protected</div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="app-btn app-btn-ghost h-9 px-3.5 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!customUsername.trim() || isSubmitting}
                  className="app-btn app-btn-primary h-9 px-4 text-xs font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Protect @{customUsername.replace(/^@/, "").trim() || "account"}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
