import { NextRequest, NextResponse } from "next/server";

export type ActivityPayload = {
  item: string;
  action: string;
  author: string;
  date: string;
  remarks: string;
};

function getScriptUrl() {
  return process.env.HISTORY_SCRIPT_URL;
}

export async function GET() {
  const scriptUrl = getScriptUrl();
  if (!scriptUrl) return NextResponse.json({ data: [] });

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
    return NextResponse.json({ error: "HISTORY_SCRIPT_URL is not configured" }, { status: 500 });
  }

  const body: ActivityPayload = await req.json();

  if (!body.item?.trim() || !body.action?.trim()) {
    return NextResponse.json({ error: "Item and action are required" }, { status: 400 });
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
        throw new Error("Google Apps Script access denied. Re-deploy with access set to Anyone.");
      }

      throw new Error(`Unexpected content-type: ${contentType}`);
    }
    if (!res.ok) throw new Error(`Apps Script responded with ${res.status}`);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to log activity" },
      { status: 502 },
    );
  }
}
