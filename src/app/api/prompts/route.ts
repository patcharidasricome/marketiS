import { NextRequest, NextResponse } from "next/server";
import { externalMarketingInstructions } from "@/lib/marketingPrompt";

export type PromptItem = {
  id: string;
  name: string;
  content: string;
  isDefault?: boolean;
  createdAt?: string;
  description?: string;
  tags?: string;
  attachedLinks?: string[];
};

const DEFAULT_PROMPT: PromptItem = {
  id: "default-issi-content-generation",
  name: "iSSi Default Content Generation Prompt",
  content: externalMarketingInstructions,
  isDefault: true,
  createdAt: "",
};

function getScriptUrl() {
  return process.env.PROMPTS_SCRIPT_URL;
}

function parseAttachedLinks(value: unknown): string[] | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (Array.isArray(value)) {
    const out = value.map((v) => String(v).trim()).filter(Boolean);
    return out.length ? out : undefined;
  }
  if (typeof value === "string") {
    const s = value.trim();
    if (!s) return undefined;
    try {
      const parsed = JSON.parse(s) as unknown;
      if (Array.isArray(parsed)) {
        const out = parsed.map((v) => String(v).trim()).filter(Boolean);
        return out.length ? out : undefined;
      }
    } catch {
      /* not JSON */
    }
    const out = s.split(/[\n,]/).map((x) => x.trim()).filter(Boolean);
    return out.length ? out : undefined;
  }
  return undefined;
}

function normalizePrompt(raw: unknown, index: number): PromptItem | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const name = String(row.name ?? row.Name ?? "").trim();
  const content = String(row.content ?? row.Content ?? row.prompt ?? row.Prompt ?? "").trim();
  if (!name || !content) return null;

  const description = String(row.description ?? row.Description ?? "").trim() || undefined;
  const tags = String(row.tags ?? row.Tags ?? "").trim() || undefined;
  const attachedLinks = parseAttachedLinks(row.attachedLinks ?? row.links ?? row.Links ?? row.attached_links);

  return {
    id: String(row.id ?? row.ID ?? `sheet-prompt-${index + 1}`),
    name,
    content,
    isDefault: false,
    createdAt: String(row.createdAt ?? row.CreatedAt ?? row.created_at ?? ""),
    ...(description ? { description } : {}),
    ...(tags ? { tags } : {}),
    ...(attachedLinks?.length ? { attachedLinks } : {}),
  };
}

function badGateway(message: string) {
  return NextResponse.json({ error: message }, { status: 502 });
}

async function forwardToAppsScript(scriptUrl: string, payload: Record<string, unknown>) {
  const res = await fetch(scriptUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
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

  const scriptResult = await res.json().catch(() => ({}));
  if (scriptResult && typeof scriptResult === "object" && "error" in scriptResult && scriptResult.error) {
    throw new Error(String((scriptResult as { error: string }).error));
  }

  return scriptResult;
}

function buildPayloadFromBody(body: Partial<PromptItem>, idOverride?: string): PromptItem | NextResponse {
  const name = body.name?.trim();
  const content = body.content?.trim();
  const description = body.description?.trim();
  const tags = body.tags?.trim();
  let attachedLinks: string[] | undefined;
  if (Array.isArray(body.attachedLinks)) {
    attachedLinks = body.attachedLinks.map((u) => String(u).trim()).filter(Boolean).slice(0, 5);
    if (attachedLinks.length === 0) attachedLinks = undefined;
  }

  if (!name || !content) {
    return NextResponse.json({ error: "Prompt name and content are required" }, { status: 400 });
  }

  if (content.length > 45000) {
    return NextResponse.json({ error: "Prompt content must be 45,000 characters or fewer" }, { status: 400 });
  }

  const id = idOverride ?? (body.id?.trim() || `prompt-${Date.now()}`);
  const payload: PromptItem = {
    id,
    name,
    content,
    isDefault: false,
    createdAt: body.createdAt || new Date().toISOString(),
    ...(description ? { description } : {}),
    ...(tags ? { tags } : {}),
    ...(attachedLinks?.length ? { attachedLinks } : {}),
  };

  return payload;
}

export async function GET() {
  const scriptUrl = getScriptUrl();
  if (!scriptUrl) return NextResponse.json({ data: [DEFAULT_PROMPT] });

  try {
    const res = await fetch(scriptUrl, { redirect: "follow", cache: "no-store" });
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) return NextResponse.json({ data: [DEFAULT_PROMPT] });

    const json = await res.json();
    const rows = Array.isArray(json.data) ? json.data : [];
    const prompts = rows
      .map((row: unknown, index: number) => normalizePrompt(row, index))
      .filter((row: PromptItem | null): row is PromptItem => row !== null);

    return NextResponse.json({ data: [DEFAULT_PROMPT, ...prompts] });
  } catch {
    return NextResponse.json({ data: [DEFAULT_PROMPT] });
  }
}

export async function POST(req: NextRequest) {
  const scriptUrl = getScriptUrl();
  if (!scriptUrl) {
    return NextResponse.json({ error: "PROMPTS_SCRIPT_URL is not configured" }, { status: 500 });
  }

  const body = (await req.json()) as Partial<PromptItem>;
  const built = buildPayloadFromBody(body);
  if (built instanceof NextResponse) return built;
  const payload = built;

  try {
    const scriptResult = await forwardToAppsScript(scriptUrl, payload);
    return NextResponse.json({ ok: true, prompt: payload, scriptResult });
  } catch (err) {
    return badGateway(err instanceof Error ? err.message : "Failed to save prompt");
  }
}

/** Updates an existing sheet-backed prompt. Apps Script should handle `{ action: "update", ...fields }`. */
export async function PATCH(req: NextRequest) {
  const scriptUrl = getScriptUrl();
  if (!scriptUrl) {
    return NextResponse.json({ error: "PROMPTS_SCRIPT_URL is not configured" }, { status: 500 });
  }

  const body = (await req.json()) as Partial<PromptItem>;
  const rowId = body.id?.trim();
  if (!rowId || rowId === DEFAULT_PROMPT.id) {
    return NextResponse.json({ error: "A valid custom prompt id is required to update" }, { status: 400 });
  }

  const built = buildPayloadFromBody(body, rowId);
  if (built instanceof NextResponse) return built;
  const payload = built;

  try {
    const scriptResult = await forwardToAppsScript(scriptUrl, { action: "update", ...payload });
    return NextResponse.json({ ok: true, prompt: payload, scriptResult });
  } catch (err) {
    return badGateway(err instanceof Error ? err.message : "Failed to update prompt");
  }
}
