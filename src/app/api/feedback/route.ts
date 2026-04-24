import { NextRequest, NextResponse } from "next/server";

/* ─── GET: fetch all rows from the Sheet ─────────────────────── */

export async function GET() {
  const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
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

/* ─── POST: append a new row ─────────────────────────────────── */

export interface FeedbackPayload {
  name: string;
  role: string;
  rating: number;
  comment: string;
  tags: string[];
}

export async function POST(req: NextRequest) {
  const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
  if (!scriptUrl) {
    return NextResponse.json(
      { error: "GOOGLE_SCRIPT_URL is not configured" },
      { status: 500 }
    );
  }

  const body: FeedbackPayload = await req.json();

  if (!body.comment?.trim()) {
    return NextResponse.json({ error: "Comment is required" }, { status: 400 });
  }
  if (!body.rating || body.rating < 1 || body.rating > 5) {
    return NextResponse.json({ error: "Rating must be 1–5" }, { status: 400 });
  }

  try {
    const res = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...body,
        submittedAt: new Date().toISOString(),
      }),
      redirect: "follow",
    });

    const contentType = res.headers.get("content-type") ?? "";

    if (!contentType.includes("application/json")) {
      const text = await res.text();
      const isLoginWall =
        text.includes("Sign in") ||
        text.includes("accounts.google.com") ||
        text.includes("unable to open");

      if (isLoginWall) {
        return NextResponse.json(
          { error: "Google Apps Script requires login. Re-deploy with 'Who has access: Anyone'." },
          { status: 403 }
        );
      }
      throw new Error(`Unexpected content-type: ${contentType}`);
    }

    if (!res.ok) {
      throw new Error(`Apps Script responded with ${res.status}`);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Feedback submission error:", err);
    return NextResponse.json(
      { error: String(err instanceof Error ? err.message : "Failed to submit feedback") },
      { status: 502 }
    );
  }
}
