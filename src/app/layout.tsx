import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL || "http://github-social-manager.acharyanischal.com.np";

export const viewport: Viewport = {
  themeColor: "#080c12",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "GitHub Social Manager | Follow & Unfollow Manager",
    template: "%s | GitHub Social Manager",
  },
  description:
    "A lightweight, modern web application for managing GitHub followers, finding non-followers, and reciprocating follows safely with official GitHub REST API rate-limiting.",
  keywords: [
    "GitHub",
    "GitHub social manager",
    "GitHub followers",
    "unfollow non-followers",
    "follow back",
    "GitHub API",
    "developer tools",
    "rate limit safe",
    "GitHub audit",
  ],
  authors: [
    {
      name: "Nischal Acharya",
      url: "https://github.com/NischalAcharya060",
    },
  ],
  creator: "Nischal Acharya",
  publisher: "Nischal Acharya",
  applicationName: "GitHub Social Manager",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "GitHub Social Manager | Clean Up Non-Followers & Manage Follow Backs",
    description:
      "Inspect your GitHub social graph, detect accounts that don't follow back, and reciprocate follows safely with rate-limiting.",
    url: siteUrl,
    siteName: "GitHub Social Manager",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GitHub Social Manager",
    description:
      "Manage your GitHub followers and following lists safely with rate limiting and secure server-side session handling.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "GitHub Social Manager",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "A modern web application for managing GitHub followers, discovering non-followers, and following back supporters safely with official GitHub REST API rate-limiting.",
    url: siteUrl,
    author: {
      "@type": "Person",
      name: "Nischal Acharya",
      url: "https://github.com/NischalAcharya060",
    },
  };

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark h-full`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="flex min-h-dvh flex-col antialiased">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
