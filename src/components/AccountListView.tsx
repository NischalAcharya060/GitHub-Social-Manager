"use client";

import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  UserMinus,
  UserPlus,
  ExternalLink,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Loader2,
  X,
  ListFilter,
  Shield,
  ShieldCheck,
  Building2,
  Users,
  ArrowUpDown,
  LayoutGrid,
  List,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GitHubAccountItem } from "@/lib/github";
import { UserAvatar } from "./UserAvatar";
import { ProtectFollowersModal } from "./ProtectFollowersModal";

export type FilterCategory = "all" | "protected" | "unprotected" | "orgs" | "users";
export type SortOption = "default" | "name-asc" | "name-desc" | "protected-first";
export type ViewDensity = "comfortable" | "compact";

interface AccountListViewProps {
  type: "not-following-back" | "follow-back" | "whitelist";
  accounts: GitHubAccountItem[];
  whitelist: Set<string>;
  followers?: GitHubAccountItem[];
  onSingleAction: (action: "follow" | "unfollow", username: string) => Promise<boolean>;
  onBulkAction: (action: "follow" | "unfollow", targets: GitHubAccountItem[]) => void;
  onToggleWhitelist: (username: string, accountId?: number) => Promise<void>;
  onBulkWhitelist: (usernames: string[], action: "add" | "remove") => Promise<void>;
}

export function AccountListView({
  type,
  accounts,
  whitelist,
  followers = [],
  onSingleAction,
  onBulkAction,
  onToggleWhitelist,
  onBulkWhitelist,
}: AccountListViewProps) {
  const isWhitelistMode = type === "whitelist";
  const isUnfollowMode = type === "not-following-back";
  const actionVerb = isWhitelistMode ? "Unprotect" : isUnfollowMode ? "Unfollow" : "Follow";

  const [isProtectModalOpen, setIsProtectModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("all");
  const [sortOption, setSortOption] = useState<SortOption>("default");
  const [density, setDensity] = useState<ViewDensity>("comfortable");
  const [selectedLogins, setSelectedLogins] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [loadingUsernames, setLoadingUsernames] = useState<Set<string>>(new Set());
  const [whitelistLoadingUsernames, setWhitelistLoadingUsernames] = useState<Set<string>>(new Set());
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [lastClickedIndex, setLastClickedIndex] = useState<number | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const rowRefs = useRef<Array<HTMLDivElement | null>>([]);

  // Count summaries for category badges
  const totalProtectedCount = useMemo(
    () => accounts.filter((u) => whitelist.has(u.login.toLowerCase())).length,
    [accounts, whitelist]
  );
  const totalUnprotectedCount = accounts.length - totalProtectedCount;
  const totalOrgsCount = useMemo(
    () => accounts.filter((u) => u.type === "Organization").length,
    [accounts]
  );
  const totalUsersCount = accounts.length - totalOrgsCount;

  // Filter and sort accounts
  const processedAccounts = useMemo(() => {
    let result = accounts;

    // 1. Text Search Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((user) => user.login.toLowerCase().includes(query));
    }

    // 2. Category Filter
    if (activeCategory === "protected") {
      result = result.filter((user) => whitelist.has(user.login.toLowerCase()));
    } else if (activeCategory === "unprotected") {
      result = result.filter((user) => !whitelist.has(user.login.toLowerCase()));
    } else if (activeCategory === "orgs") {
      result = result.filter((user) => user.type === "Organization");
    } else if (activeCategory === "users") {
      result = result.filter((user) => user.type !== "Organization");
    }

    // 3. Sorting
    if (sortOption === "name-asc") {
      result = [...result].sort((a, b) => a.login.localeCompare(b.login));
    } else if (sortOption === "name-desc") {
      result = [...result].sort((a, b) => b.login.localeCompare(a.login));
    } else if (sortOption === "protected-first") {
      result = [...result].sort((a, b) => {
        const aProt = whitelist.has(a.login.toLowerCase()) ? 1 : 0;
        const bProt = whitelist.has(b.login.toLowerCase()) ? 1 : 0;
        if (bProt !== aProt) return bProt - aProt;
        return a.login.localeCompare(b.login);
      });
    }

    return result;
  }, [accounts, searchQuery, activeCategory, sortOption, whitelist]);

  const totalItems = processedAccounts.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const safePage = Math.min(Math.max(1, page), totalPages);

  const paginatedAccounts = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return processedAccounts.slice(start, start + pageSize);
  }, [processedAccounts, safePage, pageSize]);

  const selectablePageLogins = useMemo(() => {
    return paginatedAccounts.map((account) => account.login);
  }, [paginatedAccounts]);

  const isAllPageSelected =
    selectablePageLogins.length > 0 &&
    selectablePageLogins.every((login) => selectedLogins.has(login));

  const toggleSelectAllPage = () => {
    const next = new Set(selectedLogins);
    if (isAllPageSelected) {
      selectablePageLogins.forEach((login) => next.delete(login));
    } else {
      selectablePageLogins.forEach((login) => next.add(login));
    }
    setSelectedLogins(next);
  };

  // Toggle user with Shift + Click range selection support
  const handleUserSelect = useCallback(
    (login: string, index: number, event?: React.MouseEvent) => {
      if (event?.shiftKey && lastClickedIndex !== null) {
        const start = Math.min(lastClickedIndex, index);
        const end = Math.max(lastClickedIndex, index);
        const next = new Set(selectedLogins);
        for (let i = start; i <= end; i++) {
          if (paginatedAccounts[i]) {
            next.add(paginatedAccounts[i].login);
          }
        }
        setSelectedLogins(next);
      } else {
        const next = new Set(selectedLogins);
        if (next.has(login)) next.delete(login);
        else next.add(login);
        setSelectedLogins(next);
      }
      setLastClickedIndex(index);
      setFocusedIndex(index);
    },
    [lastClickedIndex, selectedLogins, paginatedAccounts]
  );

  const selectAllFiltered = () => {
    setSelectedLogins(new Set(processedAccounts.map((account) => account.login)));
  };

  const clearSelection = useCallback(() => {
    setSelectedLogins(new Set());
    setFocusedIndex(null);
  }, []);

  const selectedAccounts = useMemo(
    () => accounts.filter((account) => selectedLogins.has(account.login)),
    [accounts, selectedLogins]
  );

  const safeSelectedAccounts = useMemo(() => {
    if (!isUnfollowMode) return selectedAccounts;
    return selectedAccounts.filter((acc) => !whitelist.has(acc.login.toLowerCase()));
  }, [selectedAccounts, isUnfollowMode, whitelist]);

  const selectedProtectedCount = useMemo(() => {
    return selectedAccounts.filter((acc) => whitelist.has(acc.login.toLowerCase())).length;
  }, [selectedAccounts, whitelist]);

  // Keyboard navigation & shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl?.tagName === "INPUT" ||
        activeEl?.tagName === "TEXTAREA" ||
        activeEl?.tagName === "SELECT";

      // 1. Focus search with "/"
      if (e.key === "/" && !isInput) {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      // 2. Escape: clear search or clear selection
      if (e.key === "Escape") {
        if (isInput) {
          (activeEl as HTMLElement)?.blur();
          return;
        }
        if (selectedLogins.size > 0) {
          clearSelection();
          return;
        }
      }

      // 3. Arrow Down / "j" navigation
      if ((e.key === "ArrowDown" || e.key === "j") && !isInput) {
        e.preventDefault();
        setFocusedIndex((prev) => {
          const next = prev === null ? 0 : Math.min(paginatedAccounts.length - 1, prev + 1);
          rowRefs.current[next]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
          return next;
        });
      }

      // 4. Arrow Up / "k" navigation
      if ((e.key === "ArrowUp" || e.key === "k") && !isInput) {
        e.preventDefault();
        setFocusedIndex((prev) => {
          const next = prev === null ? 0 : Math.max(0, prev - 1);
          rowRefs.current[next]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
          return next;
        });
      }

      // 5. "x" to toggle selection on focused item
      if (e.key === "x" && !isInput && focusedIndex !== null) {
        e.preventDefault();
        const account = paginatedAccounts[focusedIndex];
        if (account) {
          handleUserSelect(account.login, focusedIndex);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [paginatedAccounts, focusedIndex, selectedLogins, clearSelection, handleUserSelect]);

  const handleSingleActionClick = async (username: string) => {
    setLoadingUsernames((prev) => new Set(prev).add(username));
    try {
      const ok = await onSingleAction(isUnfollowMode ? "unfollow" : "follow", username);
      if (ok) {
        setSelectedLogins((prev) => {
          const next = new Set(prev);
          next.delete(username);
          return next;
        });
      }
    } finally {
      setLoadingUsernames((prev) => {
        const next = new Set(prev);
        next.delete(username);
        return next;
      });
    }
  };

  const handleToggleWhitelistClick = async (username: string, accountId?: number) => {
    setWhitelistLoadingUsernames((prev) => new Set(prev).add(username));
    try {
      await onToggleWhitelist(username, accountId);
    } finally {
      setWhitelistLoadingUsernames((prev) => {
        const next = new Set(prev);
        next.delete(username);
        return next;
      });
    }
  };

  const handleBulkProtect = async (action: "add" | "remove") => {
    const logins = Array.from(selectedLogins);
    if (logins.length === 0) return;
    await onBulkWhitelist(logins, action);
  };

  const handleBulkActionClick = () => {
    const eligibleAccounts = isUnfollowMode
      ? accounts.filter((acc) => !whitelist.has(acc.login.toLowerCase()))
      : accounts;
    onBulkAction(isUnfollowMode ? "unfollow" : "follow", eligibleAccounts);
  };

  const bulkButtonClass = isUnfollowMode ? "app-btn-danger" : "app-btn-primary";
  const BulkIcon = isUnfollowMode ? UserMinus : UserPlus;

  return (
    <div className="animate-rise space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className={isWhitelistMode ? "eyebrow-brand" : isUnfollowMode ? "eyebrow" : "eyebrow-blue"}>
            {isWhitelistMode ? "Protected list" : isUnfollowMode ? "Cleanup queue" : "Opportunities"}
          </span>
          <h1 className="page-title mt-1.5 flex flex-wrap items-center gap-2.5">
            {isWhitelistMode ? (
              <ShieldCheck className="h-5 w-5 text-[var(--brand)]" />
            ) : isUnfollowMode ? (
              <UserMinus className="h-5 w-5 text-[var(--danger)]" />
            ) : (
              <UserPlus className="h-5 w-5 text-[var(--brand)]" />
            )}
            {isWhitelistMode ? "Protected Accounts" : isUnfollowMode ? "Not Following Back" : "Follow Back Candidates"}
            <span className="app-chip font-mono tabular-nums">{accounts.length.toLocaleString()}</span>
            {!isWhitelistMode && isUnfollowMode && totalProtectedCount > 0 && (
              <span className="app-chip app-chip-brand font-mono tabular-nums">
                <ShieldCheck className="h-3 w-3" />
                {totalProtectedCount} protected
              </span>
            )}
          </h1>
          <p className="mt-1.5 max-w-xl text-[13px] text-[var(--text-muted)]">
            {isWhitelistMode
              ? "Accounts you have shielded from batch unfollow and cleanup operations."
              : isUnfollowMode
              ? "Accounts you follow that don't follow your profile back. Whitelisted accounts are shielded from bulk unfollows."
              : "Developers who follow you that you haven't followed yet."}
          </p>
        </div>

        {isWhitelistMode ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsProtectModalOpen(true)}
              className="app-btn app-btn-primary"
            >
              <UserPlus className="h-4 w-4" />
              Choose from Followers
            </button>
          </div>
        ) : (
          accounts.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBulkActionClick}
                className={`app-btn ${bulkButtonClass}`}
                title={
                  isUnfollowMode && totalProtectedCount > 0
                    ? `Unfollows ${totalUnprotectedCount} accounts (${totalProtectedCount} protected accounts will be skipped)`
                    : undefined
                }
              >
                <BulkIcon className="h-4 w-4" />
                {actionVerb} {isUnfollowMode ? "eligible" : "all"} (
                {isUnfollowMode ? totalUnprotectedCount.toLocaleString() : accounts.length.toLocaleString()})
              </button>
            </div>
          )
        )}
      </div>

      {/* Smart Category Tabs & Sorting Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Account category filters">
          <button
            type="button"
            onClick={() => {
              setActiveCategory("all");
              setPage(1);
            }}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeCategory === "all"
                ? "bg-[var(--surface-3)] text-[var(--text)] shadow-[var(--shadow-xs)]"
                : "text-[var(--text-muted)] hover:bg-white/[0.04] hover:text-[var(--text)]"
            }`}
          >
            All
            <span className="rounded-full bg-white/10 px-1.5 py-0.2 text-[10px] tabular-nums font-mono">
              {accounts.length}
            </span>
          </button>

          {!isWhitelistMode && isUnfollowMode && (
            <>
              <button
                type="button"
                onClick={() => {
                  setActiveCategory("protected");
                  setPage(1);
                }}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeCategory === "protected"
                    ? "bg-[var(--brand-soft)] text-[var(--brand)] shadow-[var(--shadow-xs)]"
                    : "text-[var(--text-muted)] hover:bg-white/[0.04] hover:text-[var(--brand)]"
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Protected
                <span className="rounded-full bg-[var(--brand-soft)] px-1.5 py-0.2 text-[10px] tabular-nums font-mono text-[var(--brand)]">
                  {totalProtectedCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveCategory("unprotected");
                  setPage(1);
                }}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeCategory === "unprotected"
                    ? "bg-[var(--danger-soft)] text-[var(--danger)] shadow-[var(--shadow-xs)]"
                    : "text-[var(--text-muted)] hover:bg-white/[0.04] hover:text-[var(--text)]"
                }`}
              >
                Unprotected
                <span className="rounded-full bg-white/10 px-1.5 py-0.2 text-[10px] tabular-nums font-mono">
                  {totalUnprotectedCount}
                </span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => {
              setActiveCategory("orgs");
              setPage(1);
            }}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeCategory === "orgs"
                ? "bg-[var(--info-soft)] text-[var(--info)] shadow-[var(--shadow-xs)]"
                : "text-[var(--text-muted)] hover:bg-white/[0.04] hover:text-[var(--text)]"
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            Organizations
            <span className="rounded-full bg-white/10 px-1.5 py-0.2 text-[10px] tabular-nums font-mono">
              {totalOrgsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveCategory("users");
              setPage(1);
            }}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeCategory === "users"
                ? "bg-[var(--surface-3)] text-[var(--text)] shadow-[var(--shadow-xs)]"
                : "text-[var(--text-muted)] hover:bg-white/[0.04] hover:text-[var(--text)]"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            Users
            <span className="rounded-full bg-white/10 px-1.5 py-0.2 text-[10px] tabular-nums font-mono">
              {totalUsersCount}
            </span>
          </button>
        </div>

        {/* View Density Toggle & Sort selector */}
        <div className="flex flex-wrap items-center gap-2 self-start text-xs text-[var(--text-muted)] sm:self-auto">
          {/* Density Switcher */}
          <div className="flex items-center rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-0.5">
            <button
              type="button"
              onClick={() => setDensity("comfortable")}
              title="Comfortable view"
              className={`rounded-md p-1.5 transition-colors ${
                density === "comfortable"
                  ? "bg-[var(--surface-3)] text-[var(--text)] shadow-xs"
                  : "text-[var(--text-faint)] hover:text-[var(--text)]"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setDensity("compact")}
              title="Compact view"
              className={`rounded-md p-1.5 transition-colors ${
                density === "compact"
                  ? "bg-[var(--surface-3)] text-[var(--text)] shadow-xs"
                  : "text-[var(--text-faint)] hover:text-[var(--text)]"
              }`}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="h-3.5 w-3.5 text-[var(--text-faint)]" />
            <select
              id="account-sort"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="app-input h-8 py-0.5 text-xs"
            >
              <option value="default">Sort: Default</option>
              <option value="name-asc">Sort: Name (A to Z)</option>
              <option value="name-desc">Sort: Name (Z to A)</option>
              {!isWhitelistMode && isUnfollowMode && <option value="protected-first">Sort: Protected first</option>}
            </select>
          </div>
        </div>
      </div>

      {/* Search & Bulk Toolbar */}
      <div className="app-panel flex flex-col gap-3 p-3.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-faint)]" />
          <label htmlFor="account-search" className="sr-only">
            Search accounts by username
          </label>
          <input
            ref={searchInputRef}
            id="account-search"
            type="search"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setPage(1);
            }}
            placeholder={`Search ${accounts.length.toLocaleString()} accounts… (Press “/”)`}
            className="app-input pl-9 pr-9"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setPage(1);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[var(--text-faint)] transition-colors hover:bg-white/5 hover:text-[var(--text)]"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="hidden items-center gap-1.5 text-[11px] text-[var(--text-faint)] sm:flex">
            <span className="rounded border border-[var(--border)] bg-white/5 px-1 font-mono">j</span>
            <span className="rounded border border-[var(--border)] bg-white/5 px-1 font-mono">k</span>
            <span>navigate</span>
            <span className="ml-1 rounded border border-[var(--border)] bg-white/5 px-1 font-mono">x</span>
            <span>select</span>
            <span className="ml-1 rounded border border-[var(--border)] bg-white/5 px-1 font-mono">Shift+Click</span>
            <span>range</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <ListFilter className="h-3.5 w-3.5 text-[var(--text-faint)]" />
            <select
              id="page-size"
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
              className="app-input h-9 w-auto py-1 pr-7 text-xs"
            >
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Selection info bar */}
      {processedAccounts.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-white/[0.02] px-4 py-2.5 text-xs text-[var(--text-muted)]">
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={toggleSelectAllPage}
              aria-pressed={isAllPageSelected}
              className="flex items-center gap-2 transition-colors hover:text-[var(--text)]"
            >
              {isAllPageSelected ? (
                <CheckSquare className="h-4 w-4 text-[var(--info)]" />
              ) : (
                <Square className="h-4 w-4 text-[var(--text-faint)]" />
              )}
              Select this page ({paginatedAccounts.length})
            </button>
            {processedAccounts.length > paginatedAccounts.length && (
              <button
                type="button"
                onClick={selectAllFiltered}
                className="font-medium text-[var(--info)] transition-colors hover:text-[var(--text)]"
              >
                Select all {processedAccounts.length.toLocaleString()} matching
              </button>
            )}
          </div>
          <span className="font-mono tabular-nums text-[var(--text-faint)]">
            {totalItems === 0 ? "0" : (safePage - 1) * pageSize + 1}–
            {Math.min(safePage * pageSize, totalItems)} of {totalItems.toLocaleString()}
          </span>
        </div>
      )}

      {/* List */}
      {paginatedAccounts.length > 0 ? (
        <div className="app-panel-flat divide-y divide-[var(--border-subtle)] overflow-hidden">
          <AnimatePresence initial={false}>
            {paginatedAccounts.map((account, index) => {
              const isSelected = selectedLogins.has(account.login);
              const isLoading = loadingUsernames.has(account.login);
              const isProtected = whitelist.has(account.login.toLowerCase());
              const isWhitelistLoading = whitelistLoadingUsernames.has(account.login);
              const isKeyboardFocused = focusedIndex === index;

              return (
                <motion.div
                  key={account.id}
                  layout="position"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  ref={(el) => {
                    rowRefs.current[index] = el;
                  }}
                  className={`group flex items-center transition-colors ${
                    density === "compact"
                      ? "gap-2.5 px-3 py-2 text-xs sm:px-4"
                      : "gap-3 px-3.5 py-3.5 sm:gap-4 sm:px-5"
                  } ${
                    isKeyboardFocused
                      ? "ring-1 ring-inset ring-[var(--info)]/50 bg-[var(--surface-3)]/60"
                      : isSelected
                        ? "bg-[var(--info-soft)]"
                        : isProtected && isUnfollowMode
                          ? "bg-[var(--brand-soft)]/20 hover:bg-[var(--brand-soft)]/30"
                          : "hover:bg-white/[0.025]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={(e) => handleUserSelect(account.login, index, e)}
                    aria-label={`${isSelected ? "Deselect" : "Select"} @${account.login}`}
                    aria-pressed={isSelected}
                    className="rounded-md p-1 text-[var(--text-faint)] transition-colors hover:text-[var(--text)]"
                  >
                    {isSelected ? (
                      <CheckSquare className="h-[18px] w-[18px] text-[var(--info)]" />
                    ) : (
                      <Square className="h-[18px] w-[18px]" />
                    )}
                  </button>

                  <UserAvatar
                    src={account.avatar_url}
                    name={account.login}
                    className={density === "compact" ? "h-7 w-7 text-xs" : "h-10 w-10 text-sm"}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <a
                        href={account.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-1.5 font-semibold text-[var(--text)] transition-colors hover:text-[var(--info)]"
                      >
                        <span className="truncate">@{account.login}</span>
                        <ExternalLink className="h-3 w-3 shrink-0 text-[var(--text-faint)] opacity-0 transition-opacity group-hover:opacity-100" />
                      </a>
                      {account.type === "Organization" && (
                        <span className="app-chip !px-1.5 !py-0.2 !text-[9px] font-mono uppercase tracking-wider text-[var(--text-faint)]">
                          Org
                        </span>
                      )}
                    </div>

                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                      {!isWhitelistMode ? (
                        <span
                          className={`app-chip !px-1.5 !py-0.2 ${
                            density === "compact" ? "!text-[9px]" : "!text-[10px]"
                          } ${isUnfollowMode ? "app-chip-danger" : "app-chip-brand"}`}
                        >
                          {isUnfollowMode ? "Does not follow you" : "Follows you"}
                        </span>
                      ) : (
                        <span
                          className={`app-chip app-chip-brand !px-1.5 !py-0.2 inline-flex items-center gap-1 font-semibold ${
                            density === "compact" ? "!text-[9px]" : "!text-[10px]"
                          }`}
                        >
                          <ShieldCheck className="h-3 w-3" />
                          Never unfollow
                        </span>
                      )}

                      {!isWhitelistMode && isProtected && (
                        <span
                          className={`app-chip app-chip-brand !px-1.5 !py-0.2 inline-flex items-center gap-1 font-semibold ${
                            density === "compact" ? "!text-[9px]" : "!text-[10px]"
                          }`}
                        >
                          <ShieldCheck className="h-3 w-3" />
                          Protected
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                    {/* Whitelist Toggle Shield Button (when not in whitelist tab) */}
                    {!isWhitelistMode && (
                      <button
                        type="button"
                        onClick={() => handleToggleWhitelistClick(account.login, account.id)}
                        disabled={isWhitelistLoading}
                        className={`app-btn p-0 ${
                          density === "compact" ? "h-7.5 w-7.5" : "h-9 w-9"
                        } ${
                          isProtected
                            ? "app-btn-secondary text-[var(--brand)] hover:border-[var(--danger-line)] hover:text-[var(--danger)]"
                            : "app-btn-ghost text-[var(--text-faint)] hover:text-[var(--brand)]"
                        }`}
                        title={
                          isProtected
                            ? "Protected: Shielded from bulk unfollows. Click to unprotect."
                            : "Protect account: Never unfollow in batch operations."
                        }
                        aria-label={isProtected ? `Unprotect @${account.login}` : `Protect @${account.login}`}
                      >
                        {isWhitelistLoading ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : isProtected ? (
                          <ShieldCheck className="h-4 w-4" />
                        ) : (
                          <Shield className="h-4 w-4" />
                        )}
                      </button>
                    )}

                    <a
                      href={account.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`app-btn app-btn-outline hidden px-2.5 sm:inline-flex ${
                        density === "compact" ? "h-7.5 text-xs" : "h-9"
                      }`}
                    >
                      Profile
                      <ExternalLink className="h-3 w-3" />
                    </a>

                    {/* Action Button */}
                    {isWhitelistMode ? (
                      <button
                        type="button"
                        onClick={() => handleToggleWhitelistClick(account.login, account.id)}
                        disabled={isWhitelistLoading}
                        className={`app-btn app-btn-secondary text-[var(--danger)] hover:border-[var(--danger-line)] ${
                          density === "compact" ? "h-7.5 min-w-[95px] text-xs px-2" : "h-9 min-w-[110px]"
                        }`}
                        aria-label={`Unprotect @${account.login}`}
                      >
                        {isWhitelistLoading ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Working…
                          </>
                        ) : (
                          <>
                            <Shield className="h-3.5 w-3.5" />
                            Unprotect
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSingleActionClick(account.login)}
                        disabled={isLoading}
                        className={`app-btn ${
                          isProtected && isUnfollowMode ? "app-btn-secondary opacity-75" : bulkButtonClass
                        } ${density === "compact" ? "h-7.5 min-w-[85px] text-xs px-2" : "h-9 min-w-[104px]"}`}
                        aria-label={`${actionVerb} @${account.login}`}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Working…
                          </>
                        ) : (
                          <>
                            <BulkIcon className="h-3.5 w-3.5" />
                            {actionVerb}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="app-panel px-6 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)]">
            {searchQuery || activeCategory !== "all" ? (
              <Search className="h-6 w-6" />
            ) : (
              <CheckCircle2 className="h-6 w-6 text-[var(--brand)]" />
            )}
          </div>
          <h3 className="mt-4 text-base font-semibold text-[var(--text)]">
            {searchQuery
              ? `No accounts matching “${searchQuery}”`
              : activeCategory !== "all"
                ? `No accounts in category “${activeCategory}”`
                : isWhitelistMode
                  ? "No protected accounts yet"
                  : isUnfollowMode
                    ? "Your graph is perfectly mutual"
                    : "No follow-backs pending"}
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-[var(--text-muted)]">
            {searchQuery || activeCategory !== "all"
              ? "Try adjusting your category filter or clearing the search query."
              : isWhitelistMode
                ? "Protect accounts from the cleanup queue using the shield icon. Protected accounts will never be unfollowed in batch operations."
                : isUnfollowMode
                  ? "Everyone you follow also follows you back. Nothing to clean up here."
                  : "You've already followed back everyone who follows you."}
          </p>
          {isWhitelistMode && (
            <button
              type="button"
              onClick={() => setIsProtectModalOpen(true)}
              className="app-btn app-btn-primary mx-auto mt-5"
            >
              <UserPlus className="h-4 w-4" />
              Choose from Followers to Protect
            </button>
          )}
          {(searchQuery || activeCategory !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("all");
              }}
              className="app-btn app-btn-secondary mx-auto mt-5"
            >
              Reset filters
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav
          className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border)] bg-white/[0.02] px-4 py-3"
          aria-label="Pagination"
        >
          <p className="text-xs text-[var(--text-muted)]">
            Page <span className="font-semibold text-[var(--text)]">{safePage}</span> of{" "}
            <span className="font-semibold text-[var(--text)]">{totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={safePage === 1}
              className="app-btn app-btn-outline h-9"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={safePage === totalPages}
              className="app-btn app-btn-outline h-9"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </nav>
      )}

      {/* Floating Action Command Dock (Linear/Raycast style) */}
      <AnimatePresence>
        {selectedLogins.size > 0 && (
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
            className="fixed bottom-6 left-1/2 z-50 flex max-w-[94vw] -translate-x-1/2 flex-wrap items-center justify-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--surface-glass)] px-4 py-2 shadow-2xl backdrop-blur-2xl sm:gap-3"
          >
            <span className="font-mono text-xs font-semibold tabular-nums text-[var(--text)]">
              {selectedLogins.size} selected
            </span>

            <div className="hidden h-4 w-px bg-white/10 sm:block" />

            {!isWhitelistMode ? (
              <>
                <button
                  type="button"
                  onClick={() => onBulkAction(isUnfollowMode ? "unfollow" : "follow", safeSelectedAccounts)}
                  disabled={safeSelectedAccounts.length === 0}
                  className={`app-btn ${bulkButtonClass} h-8 rounded-full px-3 text-xs`}
                  title={
                    selectedProtectedCount > 0 && isUnfollowMode
                      ? `${selectedProtectedCount} protected accounts will be skipped`
                      : undefined
                  }
                >
                  <BulkIcon className="h-3.5 w-3.5" />
                  {actionVerb} selected ({safeSelectedAccounts.length})
                </button>

                <button
                  type="button"
                  onClick={() => handleBulkProtect("add")}
                  className="app-btn app-btn-secondary h-8 rounded-full px-3 text-xs"
                  title="Add selected accounts to Whitelist"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-[var(--brand)]" />
                  Protect
                </button>

                {selectedProtectedCount > 0 && (
                  <button
                    type="button"
                    onClick={() => handleBulkProtect("remove")}
                    className="app-btn app-btn-secondary h-8 rounded-full px-3 text-xs text-[var(--danger)]"
                    title="Remove protection from selected accounts"
                  >
                    <Shield className="h-3.5 w-3.5" />
                    Unprotect
                  </button>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={() => handleBulkProtect("remove")}
                className="app-btn app-btn-secondary h-8 rounded-full px-3 text-xs text-[var(--danger)]"
                title="Remove protection from selected accounts"
              >
                <Shield className="h-3.5 w-3.5" />
                Unprotect selected ({selectedLogins.size})
              </button>
            )}

            <div className="hidden h-4 w-px bg-white/10 sm:block" />

            <button
              type="button"
              onClick={clearSelection}
              className="rounded-full px-2 py-1 text-xs text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
            >
              Clear <span className="ml-0.5 rounded bg-white/10 px-1 py-0.5 text-[10px]">Esc</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Protect Followers Selection Modal */}
      {isProtectModalOpen && (
        <ProtectFollowersModal
          isOpen={isProtectModalOpen}
          onClose={() => setIsProtectModalOpen(false)}
          followers={followers || []}
          whitelist={whitelist}
          onBulkWhitelist={onBulkWhitelist}
          onToggleWhitelist={onToggleWhitelist}
        />
      )}
    </div>
  );
}
