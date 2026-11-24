import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { fetchRateLimit } from "@/lib/github";

export async function GET() {
  try {
    const session = await getSession();

    const isOAuthConfigured = Boolean(
      process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
    );

    if (!session) {
      return NextResponse.json({
        authenticated: false,
        user: null,
        isOAuthConfigured,
      });
    }

    // Optionally fetch fresh rate limit
    let rateLimit = null;
    try {
      rateLimit = await fetchRateLimit(session.token);
    } catch {
      // ignore non-critical rate limit fetch error
    }

    return NextResponse.json({
      authenticated: true,
      user: session.user,
      authType: session.authType,
      isOAuthConfigured,
      rateLimit,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        authenticated: false,
        error: error instanceof Error ? error.message : "Session error",
      },
      { status: 500 }
    );
  }
}
