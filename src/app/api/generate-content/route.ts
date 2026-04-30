import { NextRequest, NextResponse } from "next/server";
import { externalMarketingInstructions } from "@/lib/marketingPrompt";
import {
  assistantMessageText,
  getOpenRouterApiKey,
  openRouterChat,
  resolveOpenRouterTextModel,
} from "@/lib/openrouter";

type PlatformKey = "facebook" | "instagram" | "linkedin";

type GenerateRequest = {
  contentIdea?: string;
  sourceUrl?: string;
  platforms?: PlatformKey[];
  promptInstructions?: string;
};

const MAX_SOURCE_CHARS = 8000;

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function validUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

async function readSourceUrl(sourceUrl: string) {
  if (!sourceUrl.trim()) return "";
  if (!validUrl(sourceUrl)) {
    throw new Error("Source link must be a valid http(s) URL.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);

  try {
    let refererOrigin: string;
    try {
      refererOrigin = new URL(sourceUrl).origin;
    } catch {
      refererOrigin = "";
    }

    const res = await fetch(sourceUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        ...(refererOrigin ? { Referer: `${refererOrigin}/` } : {}),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 403) {
        throw new Error(
          "Could not read source link (403). That site often blocks server fetches — clear Source Link and paste the text into Content Idea, or try a simpler public article URL.",
        );
      }
      throw new Error(`Could not read source link (${res.status}).`);
    }

    const contentType = res.headers.get("content-type") ?? "";
    const text = await res.text();
    const cleaned = contentType.includes("text/html") ? stripHtml(text) : text.replace(/\s+/g, " ").trim();
    return cleaned.slice(0, MAX_SOURCE_CHARS);
  } finally {
    clearTimeout(timeout);
  }
}

function buildPrompt(input: GenerateRequest, sourceText: string) {
  const platforms = (input.platforms ?? []).join(", ");
  const systemPrompt = input.promptInstructions?.trim() || externalMarketingInstructions;
  return `
${systemPrompt}

Task:
Write optimized social media post copy for the selected platforms only.

Selected platforms: ${platforms}

User content idea:
${input.contentIdea?.trim() || "(No written idea provided.)"}

Optional source link:
${input.sourceUrl?.trim() || "(None)"}

Extracted source context:
${sourceText || "(No source context available.)"}

Output rules:
- Return JSON only. No markdown fences.
- JSON shape must be:
{
  "linkedin": "post copy",
  "facebook": "post copy",
  "instagram": "post copy"
}
- Include only selected platform keys.
- Each post should be ready to publish.
- Include concise, relevant hashtags inside the post copy.
- Do not invent statistics, client names, certifications, or product claims not supported by the user idea, source context, or project instructions.
`.trim();
}

function extractJsonObject(text: string) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]?.trim();
  const candidate = fenced || trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("AI response was not valid JSON.");
  }
  return JSON.parse(candidate.slice(start, end + 1)) as Partial<Record<PlatformKey, string>>;
}

export async function POST(req: NextRequest) {
  if (!getOpenRouterApiKey()) {
    return NextResponse.json({ error: "OPENROUTER_API_KEY is not configured." }, { status: 500 });
  }

  const body = (await req.json()) as GenerateRequest;
  const selectedPlatforms = (body.platforms ?? []).filter((p): p is PlatformKey =>
    ["facebook", "instagram", "linkedin"].includes(p),
  );

  if (selectedPlatforms.length === 0) {
    return NextResponse.json({ error: "Select at least one platform." }, { status: 400 });
  }

  if (!body.contentIdea?.trim() && !body.sourceUrl?.trim()) {
    return NextResponse.json({ error: "Enter a content idea or source link." }, { status: 400 });
  }

  try {
    const sourceText = body.sourceUrl?.trim() ? await readSourceUrl(body.sourceUrl.trim()) : "";
    const model = resolveOpenRouterTextModel();
    const prompt = buildPrompt({ ...body, platforms: selectedPlatforms }, sourceText);

    const orJson = await openRouterChat({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.65,
      response_format: { type: "json_object" },
    });

    const rawContent = orJson.choices?.[0]?.message?.content;
    const text = assistantMessageText(rawContent);
    const parsed = extractJsonObject(text);
    const captions = Object.fromEntries(
      selectedPlatforms.map((platform) => [platform, parsed[platform]?.trim() || ""]),
    ) as Partial<Record<PlatformKey, string>>;

    return NextResponse.json({ captions, model });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate content." },
      { status: 502 },
    );
  }
}
