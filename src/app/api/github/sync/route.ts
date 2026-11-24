import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  fetchAuthenticatedUser,
  fetchAllUserList,
  fetchRateLimit,
  GitHubAPIError,
} from "@/lib/github";
import { getDemoSyncData } from "@/lib/demo-data";

export const maxDuration = 60; // Allow sufficient time for fetching followers/following

export async function GET() {
  try {
    const session = await getSession();

    if (!session || !session.token) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "You must be signed in to sync GitHub data." },
        { status: 401 }
      );
    }

    // Demo Mode Handler
    if (session.authType === "demo") {
      const demoData = getDemoSyncData();
      return NextResponse.json({
        success: true,
        user: session.user,
        totalFollowers: demoData.totalFollowers,
        totalFollowing: demoData.totalFollowing,
        notFollowingBack: demoData.notFollowingBack,
        followBackCandidates: demoData.followBackCandidates,
        rateLimit: {
          limit: 5000,
          remaining: 4892,
          reset: Math.floor(Date.now() / 1000) + 3600,
          used: 108,
        },
        syncedAt: new Date().toISOString(),
      });
    }

    const token = session.token;

    // 1. Fetch fresh user profile
    const { user } = await fetchAuthenticatedUser(token);

    // 2. Fetch followers & following in parallel
    const [followersRes, followingRes] = await Promise.all([
      fetchAllUserList(token, "followers"),
      fetchAllUserList(token, "following"),
    ]);

    const followers = followersRes.items;
    const following = followingRes.items;

    // Fast lookup sets (case-insensitive login comparison)
    const followersMap = new Map(followers.map((u) => [u.login.toLowerCase(), u]));
    const followingMap = new Map(following.map((u) => [u.login.toLowerCase(), u]));

    // Not Following Back: Accounts the user follows, but that don't follow them back
    const notFollowingBack = following.filter(
      (user) => !followersMap.has(user.login.toLowerCase())
    );

    // Follow Back: Accounts that follow the user, but whom the user isn't following
    const followBackCandidates = followers.filter(
      (user) => !followingMap.has(user.login.toLowerCase())
    );

    // Fresh rate limit
    const rateLimit = await fetchRateLimit(token);

    return NextResponse.json({
      success: true,
      user,
      totalFollowers: followers.length,
      totalFollowing: following.length,
      notFollowingBack,
      followBackCandidates,
      rateLimit: rateLimit || followersRes.rateLimit || followingRes.rateLimit,
      syncedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    if (error instanceof GitHubAPIError) {
      return NextResponse.json(
        {
          error: "GITHUB_SYNC_FAILED",
          message: error.message,
          status: error.status,
          rateLimit: error.rateLimit,
        },
        { status: error.status }
      );
    }

    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Failed to sync GitHub accounts",
      },
      { status: 500 }
    );
  }
}
