"use client";

import React, { useEffect, useState, useRef } from "react";
import { animate } from "motion/react";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}

export function AnimatedCounter({
  value,
  duration = 0.9,
  className = "",
  suffix = "",
  prefix = "",
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState<number>(value);
  const prevValueRef = useRef<number>(value);

  useEffect(() => {
    const isReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const from = prevValueRef.current;
    const to = value;

    if (from === to) return;

    if (isReduced) {
      prevValueRef.current = to;
      const t = setTimeout(() => setDisplayValue(to), 0);
      return () => clearTimeout(t);
    }

    const durationSeconds =
      typeof duration === "number" && duration > 10 ? duration / 1000 : duration;

    const controls = animate(from, to, {
      duration: durationSeconds,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        setDisplayValue(Math.round(latest));
      },
      onComplete: () => {
        prevValueRef.current = to;
      },
    });

    return () => controls.stop();
  }, [value, duration]);

  return (
    <span className={`font-mono tabular-nums ${className}`}>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}
