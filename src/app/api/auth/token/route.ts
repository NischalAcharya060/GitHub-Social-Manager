import { NextRequest, NextResponse } from "next/server";
import { setSession } from "@/lib/session";
import { fetchAuthenticatedUser, GitHubAPIError } from "@/lib/github";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = typeof body?.token === "string" ? body.token.trim() : "";

    if (!token) {
      return NextResponse.json(
        { error: "Token is required", message: "Please provide a valid GitHub Personal Access Token." },
        { status: 400 }
      );
    }

    // Verify token with GitHub
    const { user, rateLimit } = await fetchAuthenticatedUser(token);

    // Save in encrypted HTTP-only session cookie
    await setSession({
      token,
      user,
      authType: "token",
      createdAt: Date.now(),
    });

    return NextResponse.json({
      success: true,
      user,
      rateLimit,
    });
  } catch (error: unknown) {
    if (error instanceof GitHubAPIError) {
      return NextResponse.json(
        {
          error: "GITHUB_AUTH_FAILED",
          message:
            error.status === 401
              ? "Invalid Personal Access Token. Please check token permissions (requires 'user:follow' scope)."
              : error.message,
          status: error.status,
          rateLimit: error.rateLimit,
        },
        { status: error.status || 401 }
      );
    }

    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Authentication failed.",
      },
      { status: 500 }
    );
  }
}
