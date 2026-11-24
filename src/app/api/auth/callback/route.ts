import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { setSession } from "@/lib/session";
import { fetchAuthenticatedUser } from "@/lib/github";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://github-social-manager.acharyanischal.com.np";

  if (error) {
    return NextResponse.redirect(
      `${baseUrl}/?error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(`${baseUrl}/?error=Missing_authorization_code`);
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get("gh_oauth_state")?.value;
  cookieStore.delete("gh_oauth_state");

  if (!savedState || savedState !== state) {
    return NextResponse.redirect(`${baseUrl}/?error=Invalid_OAuth_state_CSRF_mismatch`);
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${baseUrl}/?error=OAuth_credentials_not_configured`);
  }

  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error || !tokenData.access_token) {
      return NextResponse.redirect(
        `${baseUrl}/?error=${encodeURIComponent(
          tokenData.error_description || tokenData.error || "Failed to retrieve access token"
        )}`
      );
    }

    const accessToken = tokenData.access_token;
    const { user } = await fetchAuthenticatedUser(accessToken);

    await setSession({
      token: accessToken,
      user,
      authType: "oauth",
      createdAt: Date.now(),
    });

    return NextResponse.redirect(`${baseUrl}/`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Authentication failed";
    return NextResponse.redirect(`${baseUrl}/?error=${encodeURIComponent(message)}`);
  }
}
