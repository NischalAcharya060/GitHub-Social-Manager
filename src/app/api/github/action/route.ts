import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { followUser, unfollowUser, GitHubAPIError } from "@/lib/github";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || !session.token) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "You must be signed in to perform this action." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const action = body?.action;
    const username = typeof body?.username === "string" ? body.username.trim() : "";

    if (!username) {
      return NextResponse.json(
        { error: "BAD_REQUEST", message: "Username is required." },
        { status: 400 }
      );
    }

    if (action !== "follow" && action !== "unfollow") {
      return NextResponse.json(
        { error: "BAD_REQUEST", message: "Action must be 'follow' or 'unfollow'." },
        { status: 400 }
      );
    }

    const token = session.token;

    // Demo Mode Handler
    if (session.authType === "demo") {
      const { performDemoAction } = await import("@/lib/demo-data");
      performDemoAction(action, username);
      return NextResponse.json({
        success: true,
        action,
        username,
        rateLimit: {
          limit: 5000,
          remaining: 4890,
          reset: Math.floor(Date.now() / 1000) + 3600,
          used: 110,
        },
      });
    }

    if (action === "follow") {
      const result = await followUser(token, username);
      return NextResponse.json({
        success: true,
        action: "follow",
        username,
        rateLimit: result.rateLimit,
      });
    } else {
      const result = await unfollowUser(token, username);
      return NextResponse.json({
        success: true,
        action: "unfollow",
        username,
        rateLimit: result.rateLimit,
      });
    }
  } catch (error: unknown) {
    if (error instanceof GitHubAPIError) {
      return NextResponse.json(
        {
          error: "GITHUB_ACTION_FAILED",
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
        message: error instanceof Error ? error.message : "Failed to execute action.",
      },
      { status: 500 }
    );
  }
}
