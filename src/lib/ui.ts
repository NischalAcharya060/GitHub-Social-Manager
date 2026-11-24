export const GITHUB_REPO_URL =
  "https://github.com/NischalAcharya060/GitHub-Social-Manager";

export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

export function initials(name: string): string {
  const clean = name.replace(/^@/, "").trim();
  if (!clean) return "?";
  const parts = clean.split(/[\s_-]+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}
