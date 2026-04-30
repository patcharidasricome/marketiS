/** OpenRouter chat completions (OpenAI-compatible). Docs: https://openrouter.ai/docs */

export const OPENROUTER_CHAT_URL = "https://openrouter.ai/api/v1/chat/completions";

export function getOpenRouterApiKey(): string | undefined {
  return process.env.OPENROUTER_API_KEY?.trim() || undefined;
}

export function buildOpenRouterHeaders(): HeadersInit {
  const key = getOpenRouterApiKey();
  if (!key) {
    throw new Error("OPENROUTER_API_KEY is not configured.");
  }
  const headers: Record<string, string> = {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
  const referer = process.env.OPENROUTER_HTTP_REFERER?.trim();
  if (referer) headers["HTTP-Referer"] = referer;
  const title = process.env.OPENROUTER_APP_TITLE?.trim();
  if (title) headers["X-Title"] = title;
  return headers;
}

export type OpenRouterContentPart =
  | { type: "text"; text?: string }
  | { type: "image_url"; image_url?: { url?: string }; imageUrl?: { url?: string } };

/** OpenRouter puts generated images here for models like Gemini Flash Image. */
export type OpenRouterAssistantImageItem = {
  type?: string;
  image_url?: { url?: string };
  imageUrl?: { url?: string };
};

export type OpenRouterAssistantMessage = {
  role?: string;
  content?: string | OpenRouterContentPart[];
  images?: OpenRouterAssistantImageItem[];
};

export type OpenRouterChatResponse = {
  choices?: Array<{
    message?: OpenRouterAssistantMessage;
  }>;
  error?: { message?: string };
};

export async function openRouterChat(body: Record<string, unknown>): Promise<OpenRouterChatResponse> {
  const res = await fetch(OPENROUTER_CHAT_URL, {
    method: "POST",
    headers: buildOpenRouterHeaders(),
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as OpenRouterChatResponse;
  if (!res.ok) {
    throw new Error(json.error?.message || `OpenRouter responded with ${res.status}`);
  }
  return json;
}

/** Maps short IDs (e.g. gemini-2.5-flash-lite) to OpenRouter provider/id. */
export function normalizeOpenRouterModelId(raw: string, defaultGoogleSlug: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return defaultGoogleSlug;
  if (trimmed.includes("/")) return trimmed;
  return `google/${trimmed}`;
}

export function resolveOpenRouterTextModel(): string {
  const explicit = process.env.OPENROUTER_MODEL?.trim();
  if (explicit) return normalizeOpenRouterModelId(explicit, "google/gemini-2.5-flash-lite");
  const legacy = process.env.GEMINI_MODEL?.trim();
  if (legacy) return normalizeOpenRouterModelId(legacy, "google/gemini-2.5-flash-lite");
  return "google/gemini-2.5-flash-lite";
}

export function resolveOpenRouterImageModel(): string {
  const explicit = process.env.OPENROUTER_IMAGE_MODEL?.trim();
  if (explicit) return normalizeOpenRouterModelId(explicit, "google/gemini-2.5-flash-image");
  const legacy = process.env.GEMINI_IMAGE_MODEL?.trim();
  if (legacy) return normalizeOpenRouterModelId(legacy, "google/gemini-2.5-flash-image");
  return "google/gemini-2.5-flash-image";
}

export function assistantMessageText(content: string | OpenRouterContentPart[] | undefined): string {
  if (content == null) return "";
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .filter((p): p is { type: "text"; text: string } => p?.type === "text" && typeof p.text === "string")
    .map((p) => p.text)
    .join("");
}

function parseDataImageUrl(url: string): { mimeType: string; data: string } | null {
  const trimmed = url.trim();
  const dataUri = trimmed.match(/^data:(image\/[a-z0-9+.-]+);base64,([\s\S]+)$/i);
  if (dataUri) return { mimeType: dataUri[1], data: dataUri[2].replace(/\s+/g, "") };
  return null;
}

async function fetchRemoteImageAsBase64(url: string): Promise<{ mimeType: string; data: string } | null> {
  if (!/^https?:\/\//i.test(url)) return null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: { Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8" },
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > 20 * 1024 * 1024) return null;
    let mime = res.headers.get("content-type")?.split(";")[0]?.trim() || "image/png";
    if (!mime.startsWith("image/")) mime = "image/png";
    return { mimeType: mime, data: buf.toString("base64") };
  } catch {
    return null;
  }
}

function imageUrlFromAssistantItem(item: OpenRouterAssistantImageItem): string | undefined {
  const u = item.image_url?.url ?? item.imageUrl?.url;
  return typeof u === "string" ? u.trim() : undefined;
}

/** Parses image from `content` parts (some providers embed here). */
export function extractInlineImageFromOpenRouterContent(
  content: string | OpenRouterContentPart[] | undefined,
): { mimeType: string; data: string } | null {
  if (content == null) return null;

  if (typeof content === "string") {
    const embedded = content.match(/data:(image\/[a-z0-9+.-]+);base64,([A-Za-z0-9+/=\s]+)/i);
    if (embedded) return { mimeType: embedded[1], data: embedded[2].replace(/\s+/g, "") };
    return parseDataImageUrl(content);
  }

  if (!Array.isArray(content)) return null;

  for (const part of content) {
    if (part?.type !== "image_url") continue;
    const url = (part.image_url?.url ?? part.imageUrl?.url)?.trim();
    if (!url) continue;
    const parsed = parseDataImageUrl(url);
    if (parsed) return parsed;
  }

  return null;
}

/**
 * OpenRouter image-generation models usually return base64 in `message.images[]`.
 * Falls back to multipart `content`, then HTTPS URLs in `images`.
 */
export async function extractGeneratedImageFromOpenRouterMessage(
  message: OpenRouterAssistantMessage | undefined,
): Promise<{ mimeType: string; data: string } | null> {
  if (!message) return null;

  const imagesField = message.images;
  if (Array.isArray(imagesField)) {
    for (const item of imagesField) {
      const url = imageUrlFromAssistantItem(item);
      if (!url) continue;
      const data = parseDataImageUrl(url);
      if (data) return data;
    }
    for (const item of imagesField) {
      const url = imageUrlFromAssistantItem(item);
      if (!url) continue;
      const fetched = await fetchRemoteImageAsBase64(url);
      if (fetched) return fetched;
    }
  }

  const fromContent = extractInlineImageFromOpenRouterContent(message.content);
  if (fromContent) return fromContent;

  return null;
}
