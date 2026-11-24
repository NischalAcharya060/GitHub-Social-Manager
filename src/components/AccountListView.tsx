"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  UserMinus,
  UserPlus,
  ExternalLink,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { GitHubAccountItem } from "@/lib/github";

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

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLogins, setSelectedLogins] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [loadingUsernames, setLoadingUsernames] = useState<Set<string>>(new Set());

  // Filter accounts by search query
  const filteredAccounts = useMemo(() => {
    if (!searchQuery.trim()) return accounts;
    const query = searchQuery.toLowerCase().trim();
    return accounts.filter((u) => u.login.toLowerCase().includes(query));
  }, [accounts, searchQuery]);

  // Pagination calculation
  const totalItems = filteredAccounts.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const safePage = Math.min(Math.max(1, page), totalPages);

  const paginatedAccounts = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredAccounts.slice(start, start + pageSize);
  }, [filteredAccounts, safePage, pageSize]);

  // Selection handlers
  const isAllPageSelected =
    paginatedAccounts.length > 0 &&
    paginatedAccounts.every((acc) => selectedLogins.has(acc.login));

  const toggleSelectAllPage = () => {
    const next = new Set(selectedLogins);
    if (isAllPageSelected) {
      paginatedAccounts.forEach((acc) => next.delete(acc.login));
    } else {
      paginatedAccounts.forEach((acc) => next.add(acc.login));
    }
    setSelectedLogins(next);
  };

  const toggleSelectUser = (login: string) => {
    const next = new Set(selectedLogins);
    if (next.has(login)) {
      next.delete(login);
    } else {
      next.add(login);
    }
    setSelectedLogins(next);
  };

  const selectAllFiltered = () => {
    const next = new Set<string>();
    filteredAccounts.forEach((acc) => next.add(acc.login));
    setSelectedLogins(next);
  };

  const clearSelection = () => {
    setSelectedLogins(new Set());
  };

  // Get selected objects
  const selectedAccounts = useMemo(() => {
    return accounts.filter((acc) => selectedLogins.has(acc.login));
  }, [accounts, selectedLogins]);

  // Execute single action
  const handleSingleActionClick = async (username: string) => {
    setLoadingUsernames((prev) => new Set(prev).add(username));
    try {
      const ok = await onSingleAction(isUnfollowMode ? "unfollow" : "follow", username);
      if (ok) {
        // remove from selected set if selected
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

  return (
    <div className="space-y-4">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#30363d]">
        <div>
          <h2 className="text-xl font-bold text-[#f0f6fc] flex items-center gap-2">
            {isUnfollowMode ? (
              <>
                <UserMinus className="w-5 h-5 text-[#f85149]" />
                Not Following Back
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5 text-[#3fb950]" />
                Follow Back Candidates
              </>
            )}
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-[#21262d] text-[#8b949e] border border-[#30363d]">
              {accounts.length.toLocaleString()}
            </span>
          </h2>
          <p className="text-xs text-[#8b949e] mt-1">
            {isUnfollowMode
              ? "Accounts you follow that do not follow your profile back."
              : "Accounts following you that you have not followed yet."}
          </p>
        </div>

        {/* Global Bulk Action Button */}
        {accounts.length > 0 && (
          <button
            onClick={() => onBulkAction(isUnfollowMode ? "unfollow" : "follow", accounts)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-white transition-all shadow-sm ${
              isUnfollowMode
                ? "bg-[#da3633] hover:bg-[#b62324]"
                : "bg-[#238636] hover:bg-[#2ea043]"
            }`}
          >
            {isUnfollowMode ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            <span>
              {actionVerb} All ({accounts.length})
            </span>
          </button>
        )}
      </div>

      {/* Control Bar: Search & Bulk Action on Selection */}
      <div className="p-3 bg-[#161b22] border border-[#30363d] rounded-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Field */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8b949e]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder={`Search among ${accounts.length} accounts...`}
            className="w-full pl-9 pr-8 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-xs text-[#f0f6fc] placeholder-[#6e7681] focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setPage(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8b949e] hover:text-[#f0f6fc] p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action on selected & Page size */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Selected count info & bulk button */}
          {selectedLogins.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#8b949e] font-mono tabular-nums">
                {selectedLogins.size} selected
              </span>
              <button
                onClick={() =>
                  onBulkAction(isUnfollowMode ? "unfollow" : "follow", selectedAccounts)
                }
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow-sm transition-colors ${
                  isUnfollowMode
                    ? "bg-[#da3633] hover:bg-[#b62324]"
                    : "bg-[#238636] hover:bg-[#2ea043]"
                }`}
              >
                {isUnfollowMode ? (
                  <UserMinus className="w-3.5 h-3.5" />
                ) : (
                  <UserPlus className="w-3.5 h-3.5" />
                )}
                <span>
                  {actionVerb} Selected ({selectedLogins.size})
                </span>
              </button>
              <button
                onClick={clearSelection}
                className="text-xs text-[#8b949e] hover:text-[#f0f6fc] underline px-1"
              >
                Clear
              </button>
            </div>
          )}

          {/* Page size dropdown */}
          <div className="flex items-center gap-1.5 ml-auto text-xs text-[#8b949e]">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="bg-[#0d1117] border border-[#30363d] rounded-lg px-2 py-1 text-xs text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff]"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Select All Bar */}
      {filteredAccounts.length > 0 && (
        <div className="px-4 py-2 bg-[#21262d]/50 border border-[#30363d] rounded-lg flex items-center justify-between text-xs text-[#8b949e]">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAllPage}
              className="flex items-center gap-2 hover:text-[#f0f6fc] transition-colors"
            >
              {isAllPageSelected ? (
                <CheckSquare className="w-4 h-4 text-[#58a6ff]" />
              ) : (
                <Square className="w-4 h-4 text-[#8b949e]" />
              )}
              <span>Select this page ({paginatedAccounts.length})</span>
            </button>

            {filteredAccounts.length > paginatedAccounts.length && (
              <button
                onClick={selectAllFiltered}
                className="text-[#58a6ff] hover:text-[#79c0ff] hover:underline"
              >
                Select all {filteredAccounts.length} matching accounts
              </button>
            )}
          </div>

          <span className="font-mono tabular-nums hidden sm:inline">
            Showing {(safePage - 1) * pageSize + 1} -{" "}
            {Math.min(safePage * pageSize, totalItems)} of {totalItems}
          </span>
        </div>
      )}

      {/* Account List */}
      {paginatedAccounts.length > 0 ? (
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden divide-y divide-[#30363d]">
          {paginatedAccounts.map((account) => {
            const isSelected = selectedLogins.has(account.login);
            const isLoading = loadingUsernames.has(account.login);

            return (
              <div
                key={account.id}
                className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-colors ${
                  isSelected ? "bg-[#21262d]/80" : "hover:bg-[#21262d]/30"
                }`}
              >
                {/* Left: Checkbox & User Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => toggleSelectUser(account.login)}
                    className="p-1 rounded text-[#8b949e] hover:text-[#f0f6fc] transition-colors"
                    aria-label={`Select ${account.login}`}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-[#58a6ff]" />
                    ) : (
                      <Square className="w-4 h-4 text-[#8b949e]" />
                    )}
                  </button>

                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={account.avatar_url}
                    alt={account.login}
                    className="w-9 h-9 rounded-full border border-[#30363d] shrink-0"
                    loading="lazy"
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <a
                        href={account.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-xs sm:text-sm text-[#f0f6fc] hover:text-[#58a6ff] truncate hover:underline flex items-center gap-1 group"
                      >
                        @{account.login}
                        <ExternalLink className="w-3 h-3 text-[#6e7681] group-hover:text-[#58a6ff] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                          isUnfollowMode
                            ? "bg-[#da3633]/15 text-[#f85149]"
                            : "bg-[#238636]/15 text-[#3fb950]"
                        }`}
                      >
                        {isUnfollowMode ? "Does not follow back" : "Follows you"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Individual Action Button */}
                <div className="shrink-0 flex items-center gap-2">
                  <a
                    href={account.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#8b949e] hover:text-[#f0f6fc] bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-lg transition-colors"
                  >
                    <span>Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    onClick={() => handleSingleActionClick(account.login)}
                    disabled={isLoading}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all disabled:opacity-50 min-w-[95px] justify-center ${
                      isUnfollowMode
                        ? "bg-[#da3633] hover:bg-[#b62324]"
                        : "bg-[#238636] hover:bg-[#2ea043]"
                    }`}
                  >
                    {isLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isUnfollowMode ? (
                      <UserMinus className="w-3.5 h-3.5" />
                    ) : (
                      <UserPlus className="w-3.5 h-3.5" />
                    )}
                    <span>{isLoading ? "Working..." : actionVerb}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 bg-[#161b22] border border-[#30363d] rounded-xl text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#21262d] flex items-center justify-center text-[#8b949e] mx-auto">
            {searchQuery ? (
              <Search className="w-6 h-6" />
            ) : isUnfollowMode ? (
              <CheckCircle2 className="w-6 h-6 text-[#3fb950]" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-[#58a6ff]" />
            )}
          </div>
          <h3 className="text-base font-semibold text-[#f0f6fc]">
            {searchQuery
              ? `No accounts found matching "${searchQuery}"`
              : isUnfollowMode
              ? "No non-followers found!"
              : "No pending follow-backs!"}
          </h3>
          <p className="text-xs text-[#8b949e] max-w-md mx-auto leading-relaxed">
            {searchQuery
              ? "Try adjusting your search query to find accounts by GitHub username."
              : isUnfollowMode
              ? "Awesome! Every single account you follow on GitHub is currently following you back."
              : "Great job! You have reciprocated and followed back all users who are following your profile."}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-[#58a6ff] hover:underline"
            >
              Clear search filter
            </button>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 px-1">
          <span className="text-xs text-[#8b949e]">
            Page <strong className="text-[#f0f6fc]">{safePage}</strong> of{" "}
            <strong className="text-[#f0f6fc]">{totalPages}</strong>
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] rounded-lg text-xs font-medium text-[#c9d1d9] disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Prev</span>
            </button>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] rounded-lg text-xs font-medium text-[#c9d1d9] disabled:opacity-40 transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
