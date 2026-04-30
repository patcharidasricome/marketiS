import { NextRequest, NextResponse } from "next/server";
import { externalMarketingInstructions } from "@/lib/marketingPrompt";
import {
  extractGeneratedImageFromOpenRouterMessage,
  getOpenRouterApiKey,
  openRouterChat,
  resolveOpenRouterImageModel,
} from "@/lib/openrouter";

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
- Keep key subjects centered so the image can crop safely to 1:1 (1080×1080) and 4:5 vertical (1080×1350).
- Avoid tiny text, fake logos, unreadable UI, exaggerated claims, or unrealistic scientific/medical claims.
- Do not use the iSSi logo unless explicitly requested.
`.trim();
}

export async function POST(req: NextRequest) {
  if (!getOpenRouterApiKey()) {
    return NextResponse.json({ error: "OPENROUTER_API_KEY is not configured." }, { status: 500 });
  }

  const body = (await req.json()) as { prompt?: string; contentIdea?: string };
  if (!body.prompt?.trim()) {
    return NextResponse.json({ error: "Enter an image prompt first." }, { status: 400 });
  }

  try {
    const model = resolveOpenRouterImageModel();
    const userText = buildImagePrompt(body.prompt.trim(), body.contentIdea?.trim() || "");

    const orJson = await openRouterChat({
      model,
      modalities: ["text", "image"],
      messages: [
        {
          role: "user",
          content: [{ type: "text", text: userText }],
        },
      ],
    });

    const message = orJson.choices?.[0]?.message;
    const image = await extractGeneratedImageFromOpenRouterMessage(message);
    if (!image) {
      throw new Error(
        "The image model did not return image data (expected OpenRouter message.images). Try OPENROUTER_IMAGE_MODEL=google/gemini-2.5-flash-image or check credits / model access.",
      );
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
