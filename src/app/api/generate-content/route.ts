import { NextRequest, NextResponse } from "next/server";
import { externalMarketingInstructions } from "@/lib/marketingPrompt";

type PlatformKey = "facebook" | "instagram" | "linkedin";

type GenerateRequest = {
  contentIdea?: string;
  sourceUrl?: string;
  platforms?: PlatformKey[];
};

type GeminiPart = {
  text?: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: GeminiPart[];
    };
  }>;
  error?: {
    message?: string;
  };
};

const DEFAULT_MODEL = "gemini-2.5-flash-lite";
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
    const res = await fetch(sourceUrl, {
      signal: controller.signal,
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; MarketiSContentBot/1.0)",
      },
      cache: "no-store",
    });

    if (!res.ok) {
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
  return `
${externalMarketingInstructions}

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
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY is not configured." }, { status: 500 });
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
    const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: buildPrompt({ ...body, platforms: selectedPlatforms }, sourceText) }],
          },
        ],
        generationConfig: {
          temperature: 0.65,
          responseMimeType: "application/json",
        },
      }),
    });

    const geminiJson = (await geminiRes.json()) as GeminiResponse;
    if (!geminiRes.ok) {
      throw new Error(geminiJson.error?.message || `Gemini responded with ${geminiRes.status}`);
    }

    const text = geminiJson.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
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
