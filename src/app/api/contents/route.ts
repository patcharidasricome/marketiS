import { NextRequest, NextResponse } from "next/server";

export type ContentPayload = {
  /** Small preview for the Sheet cell (JPEG data URL). */
  thumbnailImage: string;
  /**
   * Optional full-size image as data URL for Apps Script → Drive (JPEG recommended — smaller than PNG).
   */
  driveImageDataUrl?: string;
  /** Suggested Drive filename, e.g. Author_ContentIdea.jpg */
  driveImageFileName?: string;
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

/**
 * Apps Script Web Apps sometimes send JSON bodies with Content-Type: text/html.
 * Parse when the body looks like JSON.
 */
function tryParseJson(text: string): unknown | null {
  const t = text.trim();
  if (!t.startsWith("{") && !t.startsWith("[")) return null;
  try {
    return JSON.parse(t);
  } catch {
    return null;
  }
}

function isLikelyHtmlErrorPage(text: string, contentType: string): boolean {
  const t = text.trim();
  return (
    contentType.includes("text/html") ||
    t.includes("<!DOCTYPE html") ||
    t.toLowerCase().includes("<html")
  );
}

function extractHtmlTitle(html: string): string | null {
  const m = /<title[^>]*>([^<]{1,200})<\/title>/i.exec(html);
  return m ? m[1].trim().replace(/\s+/g, " ") : null;
}

/** Apps Script / proxies may return HTML on oversized payloads or timeouts — keep saves smaller (JPEG). */
const MAX_APPS_SCRIPT_PAYLOAD_CHARS = 9_500_000;

/**
 * POST to the deployed Web App. Must use redirect: "follow": Google returns 302 to
 * script.googleusercontent.com; Undici follows it correctly. Manually re-POSTing to the
 * Location URL returns 405 (GET-only echo endpoint).
 */
function fetchAppsScriptPost(scriptUrl: string, bodyString: string): Promise<Response> {
  return fetch(scriptUrl.trim(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "MarketiS-Server/1.0",
    },
    body: bodyString,
    redirect: "follow",
  });
}

function htmlAppsScriptHintDiagnostics(args: {
  status: number;
  requestUrl: string;
  responseUrl: string;
  contentType: string;
  bodyPreview: string;
  htmlTitle: string | null;
}): string {
  const preview = args.bodyPreview.replace(/\s+/g, " ").slice(0, 280);
  const titleLine = args.htmlTitle ? ` HTML title: "${args.htmlTitle}".` : "";
  return (
    `Apps Script returned HTML (HTTP ${args.status}) instead of JSON.${titleLine} ` +
    `response URL: ${args.responseUrl.slice(0, 120)}… — If deployment is already "Anyone": ` +
    `the payload may be too large or Google timed out (try saving again with a smaller image). ` +
    `Otherwise check Web App URL ends with /exec, Execute as: Me, Who has access: Anyone. ` +
    `Raw preview: ${preview}`
  );
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

  const driveImageUrl =
    pickFirstString(r, [
      "driveImageUrl",
      "drive_image_url",
      "Drive Image URL",
      "Drive Link",
      "driveLink",
      "drive_url",
    ]) || "";

  return {
    ...r,
    id,
    thumbnailImage,
    driveImageUrl,
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
    const text = await res.text();
    const parsed = tryParseJson(text);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return NextResponse.json({ data: [] });
    }

    const json = parsed as Record<string, unknown>;
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

  const serialized = JSON.stringify(body);
  if (serialized.length > MAX_APPS_SCRIPT_PAYLOAD_CHARS) {
    return NextResponse.json(
      {
        error: `Save payload is too large (~${Math.round(serialized.length / 1024)} KB). Remove or shrink images and try again.`,
      },
      { status: 413 },
    );
  }

  try {
    const res = await fetchAppsScriptPost(scriptUrl, serialized);

    const contentType = res.headers.get("content-type") ?? "";
    const text = await res.text();
    const parsed = tryParseJson(text);

    if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
      const obj = parsed as Record<string, unknown>;
      if (!res.ok) throw new Error(`Apps Script responded with HTTP ${res.status}`);
      if ("ok" in obj && obj.ok === false) {
        throw new Error(String(obj.error || "Apps Script returned ok: false"));
      }
      if ("error" in obj && obj.error) throw new Error(String(obj.error));
      return NextResponse.json({ ok: true });
    }

    const isAccessDenied =
      res.status === 403 ||
      text.includes("Access Denied") ||
      text.includes("Sign in") ||
      text.includes("accounts.google.com") ||
      text.includes("ServiceLogin") ||
      text.includes("/signin/");

    if (isAccessDenied) {
      throw new Error(
        "Google Apps Script blocked unauthenticated access. In Deploy → Web app set Who has access to Anyone (anonymous), not only signed-in Google users — your server has no Google cookies.",
      );
    }

    if (isLikelyHtmlErrorPage(text, contentType)) {
      throw new Error(
        htmlAppsScriptHintDiagnostics({
          status: res.status,
          requestUrl: scriptUrl.slice(0, 200),
          responseUrl: res.url || scriptUrl,
          contentType,
          bodyPreview: text.trim().slice(0, 400),
          htmlTitle: extractHtmlTitle(text),
        }),
      );
    }

    throw new Error(
      `Unexpected response (${contentType || "unknown"}). Body starts with: ${text.trim().slice(0, 160)}`,
    );
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
    const res = await fetchAppsScriptPost(scriptUrl, JSON.stringify({ action: "delete", id: body.id }));

    const contentType = res.headers.get("content-type") ?? "";
    const text = await res.text();
    const parsed = tryParseJson(text);

    if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
      const json = parsed as Record<string, unknown>;
      if (!res.ok) throw new Error(`Apps Script responded with HTTP ${res.status}`);
      if ("ok" in json && json.ok === false) {
        throw new Error(String(json.error || "Apps Script returned ok: false"));
      }
      if ("error" in json && json.error) throw new Error(String(json.error));
      return NextResponse.json({ ok: true });
    }

    const isAccessDenied =
      res.status === 403 ||
      text.includes("Access Denied") ||
      text.includes("Sign in") ||
      text.includes("accounts.google.com") ||
      text.includes("ServiceLogin") ||
      text.includes("/signin/");

    if (isAccessDenied) {
      throw new Error(
        "Google Apps Script blocked unauthenticated access. Set Who has access to Anyone (anonymous) on the Web app deployment.",
      );
    }

    if (isLikelyHtmlErrorPage(text, contentType)) {
      throw new Error(
        htmlAppsScriptHintDiagnostics({
          status: res.status,
          requestUrl: scriptUrl.slice(0, 200),
          responseUrl: res.url || scriptUrl,
          contentType,
          bodyPreview: text.trim().slice(0, 400),
          htmlTitle: extractHtmlTitle(text),
        }),
      );
    }

    throw new Error(
      `Unexpected response (${contentType || "unknown"}). Body starts with: ${text.trim().slice(0, 160)}`,
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete content" },
      { status: 502 },
    );
  }
}
