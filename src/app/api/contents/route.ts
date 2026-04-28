import { NextRequest, NextResponse } from "next/server";

export type ContentPayload = {
  thumbnailImage: string;
  title: string;
  author: string;
  dateCreated: string;
  dateScheduled: string;
  platforms: string[];
};

function getScriptUrl() {
  return process.env.CONTENTS_SCRIPT_URL;
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
    return NextResponse.json({ data: json.data ?? [] });
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
