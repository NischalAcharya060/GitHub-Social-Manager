"use client";

import React, { useMemo, useState } from "react";
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
} from "lucide-react";
import { GitHubAccountItem } from "@/lib/github";
import { UserAvatar } from "./UserAvatar";

interface AccountListViewProps {
  type: "not-following-back" | "follow-back";
  accounts: GitHubAccountItem[];
  onSingleAction: (action: "follow" | "unfollow", username: string) => Promise<boolean>;
  onBulkAction: (action: "follow" | "unfollow", targets: GitHubAccountItem[]) => void;
}

export function AccountListView({
  type,
  accounts,
  onSingleAction,
  onBulkAction,
}: AccountListViewProps) {
  const isUnfollowMode = type === "not-following-back";
  const actionVerb = isUnfollowMode ? "Unfollow" : "Follow";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLogins, setSelectedLogins] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [loadingUsernames, setLoadingUsernames] = useState<Set<string>>(new Set());

  const filteredAccounts = useMemo(() => {
    if (!searchQuery.trim()) return accounts;
    const query = searchQuery.toLowerCase().trim();
    return accounts.filter((user) => user.login.toLowerCase().includes(query));
  }, [accounts, searchQuery]);

  const totalItems = filteredAccounts.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const safePage = Math.min(Math.max(1, page), totalPages);

  const paginatedAccounts = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredAccounts.slice(start, start + pageSize);
  }, [filteredAccounts, safePage, pageSize]);

  const isAllPageSelected =
    paginatedAccounts.length > 0 &&
    paginatedAccounts.every((account) => selectedLogins.has(account.login));

  const toggleSelectAllPage = () => {
    const next = new Set(selectedLogins);
    paginatedAccounts.forEach((account) => {
      if (isAllPageSelected) next.delete(account.login);
      else next.add(account.login);
    });
    setSelectedLogins(next);
  };

  const toggleSelectUser = (login: string) => {
    const next = new Set(selectedLogins);
    if (next.has(login)) next.delete(login);
    else next.add(login);
    setSelectedLogins(next);
  };

  const selectAllFiltered = () => {
    setSelectedLogins(new Set(filteredAccounts.map((account) => account.login)));
  };

  const clearSelection = () => setSelectedLogins(new Set());

  const selectedAccounts = useMemo(
    () => accounts.filter((account) => selectedLogins.has(account.login)),
    [accounts, selectedLogins]
  );

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

  const bulkButtonClass = isUnfollowMode ? "app-btn-danger" : "app-btn-primary";
  const BulkIcon = isUnfollowMode ? UserMinus : UserPlus;

  return (
    <div className="animate-rise space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className={isUnfollowMode ? "eyebrow" : "eyebrow-blue"}>
            {isUnfollowMode ? "Cleanup queue" : "Opportunities"}
          </span>
          <h1 className="page-title mt-1.5 flex flex-wrap items-center gap-2.5">
            {isUnfollowMode ? (
              <UserMinus className="h-5 w-5 text-[var(--danger)]" />
            ) : (
              <UserPlus className="h-5 w-5 text-[var(--brand)]" />
            )}
            {isUnfollowMode ? "Not Following Back" : "Follow Back Candidates"}
            <span className="app-chip font-mono tabular-nums">{accounts.length.toLocaleString()}</span>
          </h1>
          <p className="mt-1.5 max-w-xl text-[13px] text-[var(--text-muted)]">
            {isUnfollowMode
              ? "Accounts you follow that don't follow your profile back. Review before taking action."
              : "Developers who follow you that you haven't followed yet."}
          </p>
        </div>

        {accounts.length > 0 && (
          <button
            type="button"
            onClick={() => onBulkAction(isUnfollowMode ? "unfollow" : "follow", accounts)}
            className={`app-btn ${bulkButtonClass}`}
          >
            <BulkIcon className="h-4 w-4" />
            {actionVerb} all ({accounts.length})
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="app-panel flex flex-col gap-3 p-3.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-faint)]" />
          <label htmlFor="account-search" className="sr-only">
            Search accounts by username
          </label>
          <input
            id="account-search"
            type="search"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setPage(1);
            }}
            placeholder={`Search ${accounts.length.toLocaleString()} accounts…`}
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
          {selectedLogins.size > 0 && (
            <div className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1.5">
              <span className="font-mono text-xs font-semibold tabular-nums text-[var(--text)]">
                {selectedLogins.size} selected
              </span>
              <button
                type="button"
                onClick={() => onBulkAction(isUnfollowMode ? "unfollow" : "follow", selectedAccounts)}
                className={`app-btn ${bulkButtonClass} min-h-8 px-2.5 py-1`}
              >
                <BulkIcon className="h-3.5 w-3.5" />
                {actionVerb} selected
              </button>
              <button
                type="button"
                onClick={clearSelection}
                className="rounded-md px-1.5 py-1 text-[11px] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
              >
                Clear
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <ListFilter className="h-3.5 w-3.5 text-[var(--text-faint)]" />
            <label htmlFor="page-size" className="sr-only">
              Accounts per page
            </label>
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

      {/* Selection bar */}
      {filteredAccounts.length > 0 && (
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
            {filteredAccounts.length > paginatedAccounts.length && (
              <button
                type="button"
                onClick={selectAllFiltered}
                className="font-medium text-[var(--info)] transition-colors hover:text-[var(--text)]"
              >
                Select all {filteredAccounts.length.toLocaleString()} matching
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
          {paginatedAccounts.map((account) => {
            const isSelected = selectedLogins.has(account.login);
            const isLoading = loadingUsernames.has(account.login);

            return (
              <div
                key={account.id}
                className={`flex items-center gap-3 px-3.5 py-3.5 transition-colors sm:gap-4 sm:px-5 ${
                  isSelected ? "bg-[var(--info-soft)]" : "hover:bg-white/[0.025]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleSelectUser(account.login)}
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

                <UserAvatar src={account.avatar_url} name={account.login} className="h-10 w-10 text-sm" />

                <div className="min-w-0 flex-1">
                  <a
                    href={account.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--text)] transition-colors hover:text-[var(--info)]"
                  >
                    <span className="truncate">@{account.login}</span>
                    <ExternalLink className="h-3 w-3 shrink-0 text-[var(--text-faint)] opacity-0 transition-opacity group-hover:opacity-100" />
                  </a>
                  <div className="mt-1">
                    <span
                      className={`app-chip !px-2 !py-0.5 !text-[10px] ${
                        isUnfollowMode ? "app-chip-danger" : "app-chip-brand"
                      }`}
                    >
                      {isUnfollowMode ? "Does not follow you" : "Follows you"}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <a
                    href={account.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="app-btn app-btn-outline hidden h-9 px-3 sm:inline-flex"
                  >
                    Profile
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleSingleActionClick(account.login)}
                    disabled={isLoading}
                    className={`app-btn ${bulkButtonClass} h-9 min-w-[104px]`}
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
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="app-panel px-6 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)]">
            {searchQuery ? <Search className="h-6 w-6" /> : <CheckCircle2 className="h-6 w-6 text-[var(--brand)]" />}
          </div>
          <h3 className="mt-4 text-base font-semibold text-[var(--text)]">
            {searchQuery
              ? `No accounts matching “${searchQuery}”`
              : isUnfollowMode
                ? "Your graph is perfectly mutual"
                : "No follow-backs pending"}
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-[var(--text-muted)]">
            {searchQuery
              ? "Try a different username or clear the search filter."
              : isUnfollowMode
                ? "Everyone you follow also follows you back. Nothing to clean up here."
                : "You've already followed back everyone who follows you."}
          </p>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="app-btn app-btn-secondary mx-auto mt-5"
            >
              Clear search
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
    </div>
  );
}
