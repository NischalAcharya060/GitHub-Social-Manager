import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getSession } from "@/lib/session";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

// Local persistent storage file on the server (persists across Next.js restarts)
const DATA_FILE = path.join(process.cwd(), "data", "whitelist.json");

function getLocalStore(): Record<string, string[]> {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf8");
      return JSON.parse(content) || {};
    }
  } catch {
    // ignore read error
  }
  return {};
}

function saveLocalStore(store: Record<string, string[]>) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), "utf8");
  } catch {
    // ignore write error
  }
}

function getLocalUserWhitelist(userId: number): Set<string> {
  const store = getLocalStore();
  const list = store[String(userId)] || [];
  return new Set(list.map((s) => s.toLowerCase()));
}

function saveLocalUserWhitelist(userId: number, logins: Set<string>) {
  const store = getLocalStore();
  store[String(userId)] = Array.from(logins);
  saveLocalStore(store);
}

/**
 * GET /api/whitelist
 * Returns the list of protected usernames for the authenticated user
 */
export async function GET() {
  const session = await getSession();

  if (!session || !session.user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const isConfigured = isSupabaseConfigured();
  let dbError: string | null = null;

  if (isConfigured) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("github_whitelist")
          .select("target_login")
          .eq("user_id", userId);

        if (!error && Array.isArray(data)) {
          const whitelist = data.map((item) => item.target_login.toLowerCase());

          // Check if local backup has any accounts not yet in Supabase, and auto-backfill them
          const localSet = getLocalUserWhitelist(userId);
          const missingInCloud = Array.from(localSet).filter((l) => !whitelist.includes(l));
          if (missingInCloud.length > 0) {
            const rows = missingInCloud.map((target_login) => ({
              user_id: userId,
              target_login,
            }));
            await supabase.from("github_whitelist").upsert(rows, { onConflict: "user_id,target_login" });
            whitelist.push(...missingInCloud);
          }

          saveLocalUserWhitelist(userId, new Set(whitelist));

          return NextResponse.json({
            success: true,
            whitelist,
            isDatabaseConnected: true,
          });
        }

        if (error) {
          dbError = error.message || error.code || "Supabase query error";
          if (error.code === "PGRST205") {
            dbError = "Table 'github_whitelist' does not exist in Supabase schema. Create it in Supabase SQL Editor.";
          }
        }
      } catch (err: unknown) {
        dbError = err instanceof Error ? err.message : "Supabase connection failed";
      }
    }
  }

  // Fallback to local server persistent file
  const localSet = getLocalUserWhitelist(userId);
  return NextResponse.json({
    success: true,
    whitelist: Array.from(localSet),
    isDatabaseConnected: false,
    dbError,
  });
}

/**
 * POST /api/whitelist
 * Adds one or more usernames to the whitelist
 * Body: { username: string, targetId?: number } or { usernames: string[] }
 */
export async function POST(req: NextRequest) {
  const session = await getSession();

  if (!session || !session.user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  let body: { username?: string; usernames?: string[]; targetId?: number };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const loginsToAdd: string[] = [];
  if (body.username && typeof body.username === "string") {
    loginsToAdd.push(body.username.toLowerCase().trim());
  } else if (Array.isArray(body.usernames)) {
    body.usernames.forEach((u) => {
      if (typeof u === "string" && u.trim()) {
        loginsToAdd.push(u.toLowerCase().trim());
      }
    });
  }

  if (loginsToAdd.length === 0) {
    return NextResponse.json(
      { success: false, message: "No valid usernames provided" },
      { status: 400 }
    );
  }

  const isConfigured = isSupabaseConfigured();
  let dbError: string | null = null;

  if (isConfigured) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const rows = loginsToAdd.map((target_login) => ({
          user_id: userId,
          target_login,
          target_id: body.targetId || null,
        }));

        const { error } = await supabase
          .from("github_whitelist")
          .upsert(rows, { onConflict: "user_id,target_login" });

        if (!error) {
          // Keep local backup in sync
          const localSet = getLocalUserWhitelist(userId);
          loginsToAdd.forEach((l) => localSet.add(l));
          saveLocalUserWhitelist(userId, localSet);

          return NextResponse.json({
            success: true,
            added: loginsToAdd,
            isDatabaseConnected: true,
          });
        }

        if (error) {
          dbError = error.message || error.code;
          if (error.code === "PGRST205") {
            dbError = "Table 'github_whitelist' does not exist in Supabase schema. Create it in Supabase SQL Editor.";
          }
        }
      } catch (err: unknown) {
        dbError = err instanceof Error ? err.message : "Supabase request failed";
      }
    }
  }

  // Fallback: save to local server file
  const localSet = getLocalUserWhitelist(userId);
  loginsToAdd.forEach((login) => localSet.add(login));
  saveLocalUserWhitelist(userId, localSet);

  return NextResponse.json({
    success: true,
    added: loginsToAdd,
    isDatabaseConnected: false,
    dbError,
  });
}

/**
 * DELETE /api/whitelist
 * Removes one or more usernames from the whitelist
 * Body: { username?: string, usernames?: string[] }
 */
export async function DELETE(req: NextRequest) {
  const session = await getSession();

  if (!session || !session.user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  let body: { username?: string; usernames?: string[] };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const loginsToRemove: string[] = [];
  if (body.username && typeof body.username === "string") {
    loginsToRemove.push(body.username.toLowerCase().trim());
  } else if (Array.isArray(body.usernames)) {
    body.usernames.forEach((u) => {
      if (typeof u === "string" && u.trim()) {
        loginsToRemove.push(u.toLowerCase().trim());
      }
    });
  }

  if (loginsToRemove.length === 0) {
    return NextResponse.json(
      { success: false, message: "No valid usernames provided" },
      { status: 400 }
    );
  }

  const isConfigured = isSupabaseConfigured();

  if (isConfigured) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase
          .from("github_whitelist")
          .delete()
          .eq("user_id", userId)
          .in("target_login", loginsToRemove);

        if (!error) {
          const localSet = getLocalUserWhitelist(userId);
          loginsToRemove.forEach((l) => localSet.delete(l));
          saveLocalUserWhitelist(userId, localSet);

          return NextResponse.json({
            success: true,
            removed: loginsToRemove,
            isDatabaseConnected: true,
          });
        }
      } catch (err) {
        console.error("Supabase delete failed:", err);
      }
    }
  }

  // Fallback: remove from local server file
  const localSet = getLocalUserWhitelist(userId);
  loginsToRemove.forEach((login) => localSet.delete(login));
  saveLocalUserWhitelist(userId, localSet);

  return NextResponse.json({
    success: true,
    removed: loginsToRemove,
    isDatabaseConnected: false,
  });
}
