import React from "react";

export function BrandLogo({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="GitHub Social Manager Logo"
    >
      <rect width="32" height="32" rx="8" fill="#161b22" stroke="#30363d" strokeWidth="1.5" />
      {/* GitHub Silhouette */}
      <path
        fill="#f0f6fc"
        d="M16 5C9.92 5 5 9.92 5 16c0 4.87 3.15 8.98 7.52 10.44.55.1.76-.23.76-.52 0-.26-.01-1.13-.01-2.05-2.76.51-3.48-.67-3.7-1.29-.12-.32-.66-1.29-1.13-1.55-.38-.21-.93-.72-.01-.73.87-.01 1.48.8 1.69 1.13.99 1.66 2.57 1.2 3.2.91.1-.71.38-1.2.7-1.47-2.45-.28-5.01-1.22-5.01-5.43 0-1.2.43-2.19 1.13-2.96-.11-.28-.49-1.4.11-2.92 0 0 .92-.29 3.03 1.13.88-.25 1.82-.37 2.75-.37s1.87.12 2.75.37c2.11-1.42 3.03-1.13 3.03-1.13.6 1.52.22 2.64.11 2.92.7.77 1.13 1.75 1.13 2.96 0 4.23-2.57 5.15-5.02 5.43.4.34.74 1 .74 2.03 0 1.47-.01 2.65-.01 3.03 0 .29.21.63.76.52C23.85 24.98 27 20.87 27 16c0-6.08-4.92-11-11-11z"
      />
      {/* Social Manager Badge: Follow / Check Indicator */}
      <circle cx="24" cy="24" r="4.5" fill="#238636" stroke="#161b22" strokeWidth="1.5" />
      <path
        d="M22.5 24l1 1 2-2"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
