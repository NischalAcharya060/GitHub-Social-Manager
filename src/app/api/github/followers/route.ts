import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { fetchAllUserList, GitHubAPIError } from "@/lib/github";
import { getDemoSyncData } from "@/lib/demo-data";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session || !session.token) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "You must be signed in to view followers." },
        { status: 401 }
      );
    }

    if (session.authType === "demo") {
      const demoData = getDemoSyncData();
      return NextResponse.json({
        success: true,
        followers: demoData.followers || demoData.followBackCandidates,
      });
    }

    const { items: followers } = await fetchAllUserList(session.token, "followers");

    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q")?.toLowerCase().trim();

    const filtered = query
      ? followers.filter((u) => u.login.toLowerCase().includes(query))
      : followers;

    return NextResponse.json({
      success: true,
      followers: filtered,
    });
  } catch (error: unknown) {
    if (error instanceof GitHubAPIError) {
      return NextResponse.json(
        { error: "GITHUB_ERROR", message: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Failed to fetch followers" },
      { status: 500 }
    );
  }
}
