"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  AlertTriangle,
  UserMinus,
  UserPlus,
  X,
  Play,
  Square,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  Shield,
  Zap,
  Check,
} from "lucide-react";
import { GitHubAccountItem, RateLimitInfo } from "@/lib/github";
import { BulkActionSpeed } from "@/types";

interface BulkActionModalProps {
  isOpen: boolean;
  action: "follow" | "unfollow";
  targets: GitHubAccountItem[];
  onClose: () => void;
  onSuccessFinished: (
    action: "follow" | "unfollow",
    succeededLogins: string[],
    failedLogins: string[]
  ) => void;
}

interface LogEntry {
  id: string;
  timestamp: string;
  username: string;
  status: "success" | "failure";
  message: string;
}

export function BulkActionModal({
  isOpen,
  action,
  targets,
  onClose,
  onSuccessFinished,
}: BulkActionModalProps) {
  // Speed delays in milliseconds
  const SPEED_DELAYS: Record<BulkActionSpeed, number> = {
    safe: 1500,
    balanced: 800,
    fast: 300,
  };

  const [speed, setSpeed] = useState<BulkActionSpeed>("safe");
  const [isExecuting, setIsExecuting] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [failureCount, setFailureCount] = useState(0);
  const [currentUsername, setCurrentUsername] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Succeeded and failed sets
  const succeededRef = useRef<string[]>([]);
  const failedRef = useRef<string[]>([]);
  const cancelFlagRef = useRef(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsExecuting(false);
      setIsCancelled(false);
      setIsFinished(false);
      setCurrentIndex(0);
      setSuccessCount(0);
      setFailureCount(0);
      setCurrentUsername("");
      setLogs([]);
      succeededRef.current = [];
      failedRef.current = [];
      cancelFlagRef.current = false;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isUnfollow = action === "unfollow";
  const actionTitle = isUnfollow ? "Unfollow Accounts" : "Follow Back Accounts";
  const totalCount = targets.length;
  const progressPercent = totalCount > 0 ? Math.round((currentIndex / totalCount) * 100) : 0;

  // Execution runner
  const handleStartExecution = async () => {
    setIsExecuting(true);
    setIsCancelled(false);
    setIsFinished(false);
    cancelFlagRef.current = false;

    const delayMs = SPEED_DELAYS[speed];

    for (let i = 0; i < targets.length; i++) {
      if (cancelFlagRef.current) {
        setIsCancelled(true);
        break;
      }

      const account = targets[i];
      setCurrentIndex(i + 1);
      setCurrentUsername(account.login);

      const timestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      try {
        const res = await fetch("/api/github/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, username: account.login }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          succeededRef.current.push(account.login);
          setSuccessCount((prev) => prev + 1);
          setLogs((prev) => [
            ...prev,
            {
              id: `${account.login}-${Date.now()}`,
              timestamp,
              username: account.login,
              status: "success",
              message: `Successfully ${isUnfollow ? "unfollowed" : "followed"} @${account.login}`,
            },
          ]);
        } else {
          failedRef.current.push(account.login);
          setFailureCount((prev) => prev + 1);
          setLogs((prev) => [
            ...prev,
            {
              id: `${account.login}-${Date.now()}`,
              timestamp,
              username: account.login,
              status: "failure",
              message: `Failed: ${data.message || "Unknown error"}`,
            },
          ]);
        }
      } catch (err: unknown) {
        failedRef.current.push(account.login);
        setFailureCount((prev) => prev + 1);
        setLogs((prev) => [
          ...prev,
          {
            id: `${account.login}-${Date.now()}`,
            timestamp,
            username: account.login,
            status: "failure",
            message: `Network error: ${err instanceof Error ? err.message : "Request failed"}`,
          },
        ]);
      }

      // Safe delay between requests
      if (i < targets.length - 1 && !cancelFlagRef.current) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    setIsExecuting(false);
    setIsFinished(true);
  };

  const handleCancel = () => {
    cancelFlagRef.current = true;
    setIsCancelled(true);
  };

  const handleFinishAndClose = () => {
    onSuccessFinished(action, succeededRef.current, failedRef.current);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => {
          if (!isExecuting) onClose();
        }}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-lg bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#30363d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isUnfollow
                  ? "bg-[#da3633]/15 text-[#f85149] border border-[#da3633]/30"
                  : "bg-[#238636]/15 text-[#3fb950] border border-[#238636]/30"
              }`}
            >
              {isUnfollow ? <UserMinus className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#f0f6fc]">{actionTitle}</h3>
              <p className="text-xs text-[#8b949e]">
                {totalCount} accounts selected for batch execution
              </p>
            </div>
          </div>

          {!isExecuting && (
            <button
              onClick={onClose}
              className="p-1.5 text-[#8b949e] hover:text-[#f0f6fc] rounded-lg hover:bg-[#21262d] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body content based on state */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {!isExecuting && !isFinished ? (
            /* Confirmation & Settings Step */
            <>
              <div className="p-3.5 bg-[#21262d]/60 rounded-xl border border-[#30363d] flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#d29922] shrink-0 mt-0.5" />
                <div className="text-xs text-[#c9d1d9] leading-relaxed">
                  You are about to <strong>{isUnfollow ? "unfollow" : "follow back"}</strong>{" "}
                  <span className="font-mono font-bold text-[#f0f6fc]">{totalCount}</span> GitHub
                  accounts. This operation is executed sequentially to protect your account against
                  GitHub rate limit penalties.
                </div>
              </div>

              {/* Speed Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#c9d1d9] mb-2">
                  Execution Rate Limit &amp; Speed
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSpeed("safe")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      speed === "safe"
                        ? "bg-[#21262d] border-[#388bfd] ring-1 ring-[#388bfd]"
                        : "bg-[#0d1117] border-[#30363d] hover:border-[#484f58]"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-[#f0f6fc]">
                      <span className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-[#3fb950]" /> Safe
                      </span>
                      {speed === "safe" && <Check className="w-3.5 h-3.5 text-[#388bfd]" />}
                    </div>
                    <p className="text-[10px] text-[#8b949e] mt-1">1.5s delay</p>
                    <span className="inline-block mt-1 text-[9px] text-[#3fb950] font-medium">
                      Recommended
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSpeed("balanced")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      speed === "balanced"
                        ? "bg-[#21262d] border-[#388bfd] ring-1 ring-[#388bfd]"
                        : "bg-[#0d1117] border-[#30363d] hover:border-[#484f58]"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-[#f0f6fc]">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#58a6ff]" /> Balanced
                      </span>
                      {speed === "balanced" && <Check className="w-3.5 h-3.5 text-[#388bfd]" />}
                    </div>
                    <p className="text-[10px] text-[#8b949e] mt-1">0.8s delay</p>
                    <span className="inline-block mt-1 text-[9px] text-[#8b949e]">
                      Standard
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSpeed("fast")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      speed === "fast"
                        ? "bg-[#21262d] border-[#388bfd] ring-1 ring-[#388bfd]"
                        : "bg-[#0d1117] border-[#30363d] hover:border-[#484f58]"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-[#f0f6fc]">
                      <span className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-[#d29922]" /> Fast
                      </span>
                      {speed === "fast" && <Check className="w-3.5 h-3.5 text-[#388bfd]" />}
                    </div>
                    <p className="text-[10px] text-[#8b949e] mt-1">0.3s delay</p>
                    <span className="inline-block mt-1 text-[9px] text-[#d29922]">
                      Small lists
                    </span>
                  </button>
                </div>
              </div>

              {/* Target Accounts Preview list */}
              <div>
                <span className="text-xs font-semibold text-[#c9d1d9] block mb-2">
                  Target Accounts ({targets.length})
                </span>
                <div className="max-h-36 overflow-y-auto p-2 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-1.5">
                  {targets.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center gap-2 p-1.5 text-xs text-[#c9d1d9] hover:bg-[#161b22] rounded"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={u.avatar_url}
                        alt={u.login}
                        className="w-5 h-5 rounded-full border border-[#30363d]"
                      />
                      <span className="truncate">@{u.login}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Active Execution / Results Screen */
            <div className="space-y-4">
              {/* Progress Bar & Counters */}
              <div className="p-4 bg-[#0d1117] rounded-xl border border-[#30363d] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#f0f6fc]">
                    {isExecuting
                      ? `Processing: @${currentUsername}`
                      : isCancelled
                      ? "Execution Cancelled"
                      : "Execution Complete"}
                  </span>
                  <span className="font-mono text-[#8b949e] tabular-nums">
                    {currentIndex} / {totalCount} ({progressPercent}%)
                  </span>
                </div>

                {/* Progress bar line */}
                <div className="w-full h-2.5 bg-[#21262d] rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      isUnfollow ? "bg-[#da3633]" : "bg-[#238636]"
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Counters row */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#30363d]/60 text-center text-xs">
                  <div>
                    <span className="text-[#8b949e] block text-[10px]">Succeeded</span>
                    <span className="font-bold text-[#3fb950] font-mono tabular-nums">
                      {successCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8b949e] block text-[10px]">Failed</span>
                    <span className="font-bold text-[#f85149] font-mono tabular-nums">
                      {failureCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8b949e] block text-[10px]">Remaining</span>
                    <span className="font-bold text-[#8b949e] font-mono tabular-nums">
                      {Math.max(0, totalCount - currentIndex)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Live Activity Logs */}
              <div>
                <span className="text-xs font-semibold text-[#c9d1d9] block mb-1.5">
                  Activity Feed
                </span>
                <div
                  ref={logContainerRef}
                  className="h-44 overflow-y-auto p-3 rounded-xl bg-[#0d1117] border border-[#30363d] font-mono text-[11px] space-y-1.5"
                >
                  {logs.length === 0 ? (
                    <div className="text-center text-[#8b949e] py-8">
                      Starting actions sequentially...
                    </div>
                  ) : (
                    logs.map((log) => (
                      <div
                        key={log.id}
                        className={`flex items-start gap-2 leading-relaxed ${
                          log.status === "success" ? "text-[#3fb950]" : "text-[#f85149]"
                        }`}
                      >
                        <span className="text-[#6e7681] shrink-0">[{log.timestamp}]</span>
                        <span className="break-all">{log.message}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="p-4 sm:p-5 border-t border-[#30363d] bg-[#161b22] flex items-center justify-between gap-3">
          {!isExecuting && !isFinished ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs sm:text-sm font-medium text-[#c9d1d9] hover:text-[#f0f6fc] hover:bg-[#21262d] rounded-lg transition-colors border border-transparent hover:border-[#30363d]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleStartExecution}
                className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white rounded-lg transition-all shadow-sm ${
                  isUnfollow
                    ? "bg-[#da3633] hover:bg-[#b62324]"
                    : "bg-[#238636] hover:bg-[#2ea043]"
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start {actionTitle}</span>
              </button>
            </>
          ) : isExecuting ? (
            <>
              <div className="flex items-center gap-2 text-xs text-[#8b949e]">
                <Loader2 className="w-4 h-4 animate-spin text-[#58a6ff]" />
                <span>Running sequentially...</span>
              </div>

              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold bg-[#21262d] hover:bg-[#30363d] text-[#f85149] border border-[#da3633]/30 rounded-lg transition-colors"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop / Cancel</span>
              </button>
            </>
          ) : (
            /* Finished or Cancelled */
            <>
              <div className="flex items-center gap-2 text-xs text-[#3fb950]">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isCancelled
                    ? `Stopped early. ${successCount} accounts processed.`
                    : `Completed! ${successCount} succeeded, ${failureCount} failed.`}
                </span>
              </div>

              <button
                type="button"
                onClick={handleFinishAndClose}
                className="px-4 py-2 text-xs sm:text-sm font-semibold bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg transition-colors"
              >
                Done &amp; Update List
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
