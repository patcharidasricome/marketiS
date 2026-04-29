import { NextRequest, NextResponse } from "next/server";

export type ContentPayload = {
  thumbnailImage: string;
  title: string;
  author: string;
  dateCreated: string;
  dateScheduled: string;
  status: string;
  platforms: string[];
  linkedinCaption: string;
  facebookCaption: string;
  instagramCaption: string;
};

function getScriptUrl() {
  return process.env.CONTENTS_SCRIPT_URL;
}

function pickFirstString(r: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = r[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

/** Matches thumbnail/base64 or image URLs Sheets might store when columns shift after Script updates. */
function looksLikeImageSrc(s: string): boolean {
  const t = s.trim();
  return t.startsWith("data:image") || /^https?:\/\//i.test(t);
}

function extractThumbnailImage(r: Record<string, unknown>): string {
  const aliases = pickFirstString(r, [
    "thumbnailImage",
    "thumbnail",
    "Thumbnail Image",
    "Thumbnail",
    "thumbnail_image",
    "thumb",
    "image",
    "Image",
  ]);
  if (aliases) return aliases;
  for (const v of Object.values(r)) {
    if (typeof v === "string" && looksLikeImageSrc(v)) return v.trim();
  }
  return "";
}

/** Normalize one Apps Script row so the app always receives camelCase + thumbnailImage populated when possible. */
function normalizeContentsRow(raw: unknown, index: number): Record<string, unknown> {
  if (Array.isArray(raw)) {
    const pseudo = Object.fromEntries(raw.map((cell, i) => [`col${i}`, cell])) as Record<string, unknown>;
    return normalizeContentsRow(pseudo, index);
  }

  if (!raw || typeof raw !== "object") {
    return { id: index + 1 };
  }

  const r = raw as Record<string, unknown>;
  const id =
    r.id ?? r.ID ?? r.Id ?? r.uuid ?? r.UUID ?? index + 1;

  const title =
    pickFirstString(r, ["title", "Title", "TITLE"]) || String(r.title ?? "");

  const author =
    pickFirstString(r, ["author", "Author", "AUTHOR"]) || String(r.author ?? "");

  const dateCreated =
    pickFirstString(r, ["dateCreated", "date_created", "Date Created", "created"]);

  const dateScheduled =
    pickFirstString(r, ["dateScheduled", "date_scheduled", "Date Scheduled", "scheduled"]);

  const status =
    pickFirstString(r, ["status", "Status", "STATUS"]) || "Drafted";

  let platforms: string[] | string = [];
  const pl = r.platforms ?? r.Platforms ?? r.platform;
  if (Array.isArray(pl)) platforms = pl.map(String);
  else if (typeof pl === "string") platforms = pl;

  const thumbnailImage = extractThumbnailImage(r);

  return {
    ...r,
    id,
    thumbnailImage,
    title,
    author,
    dateCreated,
    dateScheduled,
    status,
    platforms,
    linkedinCaption: pickFirstString(r, ["linkedinCaption", "linkedin_caption", "LinkedIn Caption"]) || r.linkedinCaption,
    facebookCaption: pickFirstString(r, ["facebookCaption", "facebook_caption", "Facebook Caption"]) || r.facebookCaption,
    instagramCaption: pickFirstString(r, ["instagramCaption", "instagram_caption", "Instagram Caption"]) || r.instagramCaption,
  };
}

export async function GET() {
  const scriptUrl = getScriptUrl();
  if (!scriptUrl) {
    return NextResponse.json({ data: [] });
  }

  try {
    const res = await fetch(scriptUrl, { redirect: "follow", cache: "no-store" });
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) return NextResponse.json({ data: [] });

    const json = await res.json();
    const rawList =
      json?.data ?? json?.rows ?? json?.contents ?? json?.records ?? [];
    const rows = Array.isArray(rawList)
      ? rawList.map((row: unknown, i: number) => normalizeContentsRow(row, i))
      : [];

    return NextResponse.json({ data: rows });
  } catch {
    return NextResponse.json({ data: [] });
  }
}

export async function POST(req: NextRequest) {
  const scriptUrl = getScriptUrl();
  if (!scriptUrl) {
    return NextResponse.json({ error: "CONTENTS_SCRIPT_URL is not configured" }, { status: 500 });
  }

  const body: ContentPayload = await req.json();

  if (!body.title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  try {
    const res = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      redirect: "follow",
    });

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      const text = await res.text();
      const isAccessDenied =
        res.status === 403 ||
        text.includes("Access Denied") ||
        text.includes("Sign in") ||
        text.includes("accounts.google.com");

      if (isAccessDenied) {
        throw new Error(
          "Google Apps Script access denied. Re-deploy the web app with access set to Anyone, and make sure the script owner can edit the Google Sheet.",
        );
      }

      throw new Error(`Unexpected content-type: ${contentType}`);
    }
    if (!res.ok) throw new Error(`Apps Script responded with ${res.status}`);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save content" },
      { status: 502 },
    );
  }
}

/** Proxies delete to Google Apps Script — script must handle POST body `{ action: "delete", id }`. */
export async function DELETE(req: NextRequest) {
  const scriptUrl = getScriptUrl();
  if (!scriptUrl) {
    return NextResponse.json({ error: "CONTENTS_SCRIPT_URL is not configured" }, { status: 500 });
  }

  let body: { id?: string | number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.id === undefined || body.id === null || String(body.id).trim() === "") {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  try {
    const res = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id: body.id }),
      redirect: "follow",
    });

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      const text = await res.text();
      const isAccessDenied =
        res.status === 403 ||
        text.includes("Access Denied") ||
        text.includes("Sign in") ||
        text.includes("accounts.google.com");

      if (isAccessDenied) {
        throw new Error(
          "Google Apps Script access denied. Re-deploy the web app with access set to Anyone.",
        );
      }

      throw new Error(`Unexpected content-type: ${contentType}`);
    }
    if (!res.ok) throw new Error(`Apps Script responded with ${res.status}`);

    const json = await res.json().catch(() => ({}));
    if (json && typeof json === "object" && "error" in json && json.error) {
      throw new Error(String((json as { error: string }).error));
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete content" },
      { status: 502 },
    );
  }
}
