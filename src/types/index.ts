import { GitHubAccountItem, RateLimitInfo } from "@/lib/github";
import { GitHubUser } from "@/lib/session";

export type TabType = "dashboard" | "not-following-back" | "follow-back" | "whitelist" | "settings";

export type BulkActionSpeed = "safe" | "balanced" | "fast";

export interface SyncData {
  user: GitHubUser;
  totalFollowers: number;
  totalFollowing: number;
  notFollowingBack: GitHubAccountItem[];
  followBackCandidates: GitHubAccountItem[];
  followers?: GitHubAccountItem[];
  following?: GitHubAccountItem[];
  rateLimit: RateLimitInfo | null;
  syncedAt: string;
}

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  message?: string;
}

export interface BulkOperationState {
  isOpen: boolean;
  action: "follow" | "unfollow";
  targets: GitHubAccountItem[];
  speed: BulkActionSpeed;
  isRunning: boolean;
  isPaused: boolean;
  isCancelled: boolean;
  isCompleted: boolean;
  currentIndex: number;
  totalCount: number;
  successCount: number;
  failureCount: number;
  currentUsername: string;
  logs: Array<{
    id: string;
    timestamp: string;
    username: string;
    status: "success" | "failure";
    message: string;
  }>;
}
