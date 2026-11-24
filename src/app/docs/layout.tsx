import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation & Setup Guide | GitHub Social Manager",
  description:
    "Learn how to sign in via 1-click GitHub OAuth or generate a GitHub Personal Access Token (PAT) with user:follow scope to audit and manage your followers safely.",
  alternates: {
    canonical: "/docs",
  },
  openGraph: {
    title: "Documentation & Setup Guide | GitHub Social Manager",
    description:
      "Step-by-step instructions on generating GitHub tokens, authenticating safely with AES-256 encryption, and managing followers.",
    url: "/docs",
  },
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
