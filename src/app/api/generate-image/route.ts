import { NextRequest, NextResponse } from "next/server";
import { externalMarketingInstructions } from "@/lib/marketingPrompt";

type GeminiPart = {
  text?: string;
  inlineData?: {
    mimeType?: string;
    data?: string;
  };
  inline_data?: {
    mime_type?: string;
    data?: string;
  };
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

const DEFAULT_IMAGE_MODEL = "gemini-2.5-flash-image";

function buildImagePrompt(prompt: string, contentIdea: string) {
  return `
${externalMarketingInstructions}

Create one polished marketing visual for iSSi that can be resized for LinkedIn, Facebook, and Instagram while keeping the same design.

User image prompt:
${prompt}

Related content idea:
${contentIdea || "(No content idea provided.)"}

Visual direction:
- Enterprise B2B AI marketing visual.
- Professional, credible, clean, and modern.
- Suitable for life sciences, utilities, oil & gas, SAP, or enterprise AI audiences.
- Keep key subjects centered so the image can crop safely to 16:9 and 4:5.
- Avoid tiny text, fake logos, unreadable UI, exaggerated claims, or unrealistic scientific/medical claims.
- Do not use the iSSi logo unless explicitly requested.
`.trim();
}

function extractInlineImage(json: GeminiResponse) {
  const parts = json.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    const inline = part.inlineData ?? (part.inline_data
      ? { mimeType: part.inline_data.mime_type, data: part.inline_data.data }
      : undefined);

    if (inline?.data) {
      return {
        mimeType: inline.mimeType || "image/png",
        data: inline.data,
      };
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY is not configured." }, { status: 500 });
  }

  const body = (await req.json()) as { prompt?: string; contentIdea?: string };
  if (!body.prompt?.trim()) {
    return NextResponse.json({ error: "Enter an image prompt first." }, { status: 400 });
  }

  try {
    const model = process.env.GEMINI_IMAGE_MODEL || DEFAULT_IMAGE_MODEL;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: buildImagePrompt(body.prompt.trim(), body.contentIdea?.trim() || "") }],
          },
        ],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
        },
      }),
    });

    const geminiJson = (await geminiRes.json()) as GeminiResponse;
    if (!geminiRes.ok) {
      throw new Error(geminiJson.error?.message || `Gemini responded with ${geminiRes.status}`);
    }

    const image = extractInlineImage(geminiJson);
    if (!image) {
      throw new Error("Gemini did not return an image.");
    }

    return NextResponse.json({
      image: `data:${image.mimeType};base64,${image.data}`,
      model,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate image." },
      { status: 502 },
    );
  }
}
