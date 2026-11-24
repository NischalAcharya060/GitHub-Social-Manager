"use client";

import React, { useState } from "react";
import { cn, initials } from "@/lib/ui";

interface UserAvatarProps {
  src?: string | null;
  name: string;
  className?: string;
  loading?: "lazy" | "eager";
}

export function UserAvatar({
  src,
  name,
  className = "h-9 w-9",
  loading = "lazy",
}: UserAvatarProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span
        aria-label={name}
        role="img"
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full border border-[var(--border-strong)] bg-gradient-to-br from-[var(--surface-3)] to-[var(--surface)] text-[0.65em] font-semibold text-[var(--brand)]",
          className
        )}
      >
        {initials(name)}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      loading={loading}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={cn(
        "shrink-0 rounded-full border border-[var(--border)] bg-[var(--surface-2)] object-cover",
        className
      )}
    />
  );
}
