import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GitHub Social Manager | Follow & Unfollow Manager",
  description:
    "A modern, lightweight web application for managing GitHub followers, finding non-followers, and following back accounts with safe rate-limiting.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body className="min-h-full flex flex-col bg-[#0d1117] text-[#f0f6fc] antialiased selection:bg-[#388bfd]/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
