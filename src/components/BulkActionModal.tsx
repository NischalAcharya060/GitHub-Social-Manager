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
  Loader2,
  Clock,
  Shield,
  Zap,
  Check,
} from "lucide-react";
import { GitHubAccountItem } from "@/lib/github";
import { BulkActionSpeed } from "@/types";
import { UserAvatar } from "./UserAvatar";
import { cn } from "@/lib/ui";

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

const SPEED_DELAYS: Record<BulkActionSpeed, number> = {
  safe: 1500,
  balanced: 800,
  fast: 300,
};

const SPEED_OPTIONS: Array<{
  id: BulkActionSpeed;
  label: string;
  delay: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
}> = [
  {
    id: "safe",
    label: "Safe",
    delay: "1.5s delay",
    hint: "Recommended",
    icon: Shield,
    tone: "text-[var(--brand)]",
  },
  {
    id: "balanced",
    label: "Balanced",
    delay: "0.8s delay",
    hint: "Standard",
    icon: Clock,
    tone: "text-[var(--info)]",
  },
  {
    id: "fast",
    label: "Fast",
    delay: "0.3s delay",
    hint: "Small lists",
    icon: Zap,
    tone: "text-[var(--warning)]",
  },
];

export function BulkActionModal({
  isOpen,
  action,
  targets,
  onClose,
  onSuccessFinished,
}: BulkActionModalProps) {
  const [speed, setSpeed] = useState<BulkActionSpeed>("safe");
  const [isExecuting, setIsExecuting] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [failureCount, setFailureCount] = useState(0);
  const [currentUsername, setCurrentUsername] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const succeededRef = useRef<string[]>([]);
  const failedRef = useRef<string[]>([]);
  const cancelFlagRef = useRef(false);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    if (!isOpen) return;
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
    dialogRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isExecuting) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, isExecuting, onClose]);

  if (!isOpen) return null;

  const isUnfollow = action === "unfollow";
  const actionTitle = isUnfollow ? "Unfollow accounts" : "Follow back accounts";
  const totalCount = targets.length;
  const progressPercent = totalCount > 0 ? Math.round((currentIndex / totalCount) * 100) : 0;

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
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={() => {
          if (!isExecuting) onClose();
        }}
        className="absolute inset-0 h-full w-full cursor-default bg-[rgba(2,5,9,0.78)] backdrop-blur-sm"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bulk-dialog-title"
        tabIndex={-1}
        className="animate-scale-in relative flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[var(--surface)] shadow-[var(--shadow-lg)] outline-none"
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[var(--border-subtle)] p-5 sm:p-6">
          <div className="flex min-w-0 items-start gap-3">
            <span
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                isUnfollow
                  ? "border border-[var(--danger-line)] bg-[var(--danger-soft)] text-[var(--danger)]"
                  : "border border-[var(--brand-line)] bg-[var(--brand-soft)] text-[var(--brand)]"
              )}
            >
              {isUnfollow ? <UserMinus className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
            </span>
            <div className="min-w-0">
              <h2 id="bulk-dialog-title" className="section-title">
                {actionTitle}
              </h2>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                {totalCount.toLocaleString()} accounts selected for batch execution
              </p>
            </div>
          </div>
          {!isExecuting && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="rounded-lg p-2 text-[var(--text-faint)] transition-colors hover:bg-white/5 hover:text-[var(--text)]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
          {!isExecuting && !isFinished ? (
            <>
              <div className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--warning-line)] bg-[var(--warning-soft)] px-4 py-3.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--warning)]" />
                <p className="text-[13px] leading-relaxed text-[var(--text-soft)]">
                  You&apos;re about to <strong className="text-[var(--text)]">{isUnfollow ? "unfollow" : "follow back"}</strong>{" "}
                  <span className="font-mono font-semibold text-[var(--text)]">{totalCount}</span> GitHub
                  accounts. Actions run sequentially to protect your account.
                </p>
              </div>

              <fieldset>
                <legend className="app-label">Execution speed</legend>
                <div className="grid grid-cols-3 gap-2.5">
                  {SPEED_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const active = speed === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setSpeed(option.id)}
                        aria-pressed={active}
                        className={cn(
                          "rounded-[var(--radius-md)] border p-3 text-left transition-all duration-200",
                          active
                            ? "border-[var(--info-line)] bg-[var(--info-soft)] shadow-[var(--shadow-xs)]"
                            : "border-[var(--border)] bg-[var(--bg-deep)]/40 hover:border-[var(--border-strong)]"
                        )}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text)]">
                            <Icon className={cn("h-3.5 w-3.5", option.tone)} />
                            {option.label}
                          </span>
                          {active && <Check className="h-3.5 w-3.5 text-[var(--info)]" />}
                        </div>
                        <p className="mt-1.5 font-mono text-[10px] text-[var(--text-muted)]">
                          {option.delay}
                        </p>
                        <p className="mt-0.5 text-[10px] text-[var(--text-faint)]">{option.hint}</p>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div>
                <p className="app-label">Target accounts ({targets.length})</p>
                <div className="app-panel-inset max-h-36 space-y-1 overflow-y-auto p-2">
                  {targets.map((account) => (
                    <div
                      key={account.id}
                      className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-[var(--text-soft)]"
                    >
                      <UserAvatar src={account.avatar_url} name={account.login} className="h-5 w-5" />
                      <span className="truncate">@{account.login}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-5">
              <div className="app-panel-inset space-y-3 p-4">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-medium text-[var(--text)]">
                    {isExecuting
                      ? `Processing @${currentUsername}`
                      : isCancelled
                        ? "Execution stopped"
                        : "Execution complete"}
                  </span>
                  <span className="font-mono tabular-nums text-[var(--text-muted)]">
                    {currentIndex} / {totalCount} ({progressPercent}%)
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      isUnfollow ? "bg-[var(--danger)]" : "bg-[var(--brand)]"
                    )}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 border-t border-[var(--border-subtle)] pt-3 text-center">
                  {[
                    { label: "Succeeded", value: successCount, tone: "text-[var(--brand)]" },
                    { label: "Failed", value: failureCount, tone: "text-[var(--danger)]" },
                    {
                      label: "Remaining",
                      value: Math.max(0, totalCount - currentIndex),
                      tone: "text-[var(--text-muted)]",
                    },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-[10px] uppercase tracking-wider text-[var(--text-faint)]">
                        {item.label}
                      </p>
                      <p className={cn("mt-0.5 font-mono text-base font-semibold tabular-nums", item.tone)}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="app-label">Activity feed</p>
                <div
                  ref={logContainerRef}
                  className="app-panel-inset h-44 overflow-y-auto p-3 font-mono text-[11px]"
                  aria-live="polite"
                >
                  {logs.length === 0 ? (
                    <div className="py-8 text-center text-[var(--text-faint)]">
                      Starting actions sequentially…
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {logs.map((log) => (
                        <div
                          key={log.id}
                          className={cn(
                            "flex gap-2 leading-relaxed",
                            log.status === "success" ? "text-[var(--brand)]" : "text-[var(--danger)]"
                          )}
                        >
                          <span className="shrink-0 text-[var(--text-faint)]">[{log.timestamp}]</span>
                          <span className="break-all">{log.message}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-[var(--border-subtle)] bg-[var(--bg-deep)]/30 p-5 sm:p-6">
          {!isExecuting && !isFinished ? (
            <>
              <button type="button" onClick={onClose} className="app-btn app-btn-ghost">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartExecution}
                className={`app-btn ${isUnfollow ? "app-btn-danger" : "app-btn-primary"}`}
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                Start {actionTitle}
              </button>
            </>
          ) : isExecuting ? (
            <>
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <Loader2 className="h-4 w-4 animate-spin text-[var(--info)]" />
                Running sequentially…
              </div>
              <button type="button" onClick={handleCancel} className="app-btn app-btn-outline text-[var(--danger)]">
                <Square className="h-3 w-3 fill-current" />
                Stop execution
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-xs text-[var(--text-soft)]">
                <CheckCircle2 className="h-4 w-4 text-[var(--brand)]" />
                {isCancelled
                  ? `Stopped early · ${successCount} processed`
                  : `Done · ${successCount} succeeded, ${failureCount} failed`}
              </div>
              <button type="button" onClick={handleFinishAndClose} className="app-btn app-btn-primary">
                Done &amp; update list
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
