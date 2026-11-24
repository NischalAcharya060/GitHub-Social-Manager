import { NextResponse } from "next/server";
import { setSession } from "@/lib/session";

export async function POST() {
  const demoUser = {
    id: 99887766,
    login: "alexrivers-dev",
    name: "Alex Rivers",
    avatar_url: "https://avatars.githubusercontent.com/u/583231?v=4",
    html_url: "https://github.com/octocat",
    followers: 128,
    following: 94,
    public_repos: 24,
    created_at: "2021-03-15T08:30:00Z",
    bio: "Full-stack developer & open-source contributor. Building tools for the developer community.",
  };

  await setSession({
    token: "demo_mock_token_social_manager",
    user: demoUser,
    authType: "demo",
    createdAt: Date.now(),
  });

  return NextResponse.json({
    success: true,
    user: demoUser,
    authType: "demo",
  });
}
