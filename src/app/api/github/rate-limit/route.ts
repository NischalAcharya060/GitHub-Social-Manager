import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { fetchRateLimit } from "@/lib/github";

export async function GET() {
  try {
    const session = await getSession();

    if (!session || !session.token) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "You must be signed in." },
        { status: 401 }
      );
    }

    const rateLimit = await fetchRateLimit(session.token);

    return NextResponse.json({
      success: true,
      rateLimit,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Failed to fetch rate limit",
      },
      { status: 500 }
    );
  }
}
