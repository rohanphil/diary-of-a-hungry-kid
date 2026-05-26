import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { images } = await req.json();

    if (!images || images.length === 0) {
      return NextResponse.json({ error: "No images provided" }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is not configured" },
        { status: 500 }
      );
    }

    // Build image content blocks
    const imageBlocks: Anthropic.ImageBlockParam[] = images.map(
      (dataUrl: string) => {
        const [header, base64Data] = dataUrl.split(",");
        const mediaType = header.match(/:(.*?);/)?.[1] as
          | "image/jpeg"
          | "image/png"
          | "image/gif"
          | "image/webp";

        return {
          type: "image",
          source: {
            type: "base64",
            media_type: mediaType || "image/jpeg",
            data: base64Data,
          },
        };
      }
    );

    const systemPrompt = `You are a nutrition expert and food analysis AI. When given photos of food, you:
1. Identify each distinct food item visible in the image(s)
2. Estimate realistic serving sizes based on visual cues (plate size, utensils, context)
3. Calculate macronutrients for each item using standard nutritional databases
4. Be specific and practical — give your best estimates, not vague ranges
5. Always respond with valid JSON only, no markdown, no extra text`;

    const userPrompt = `Analyze the food in these images. For each distinct food item you can identify, estimate the macros.

Return ONLY a valid JSON object in this exact format:
{
  "foods": [
    {
      "name": "Food name (be specific, e.g. 'Grilled Chicken Breast' not just 'Chicken')",
      "servingSize": "Estimated serving (e.g. '150g', '1 cup', '2 slices')",
      "macros": {
        "calories": 250,
        "protein": 30,
        "carbs": 0,
        "fat": 8,
        "fiber": 0,
        "sugar": 0
      }
    }
  ],
  "notes": "Any relevant notes about the meal, preparation method, or confidence level"
}

Rules:
- All macro values must be numbers (grams for protein/carbs/fat/fiber/sugar, kcal for calories)
- If you genuinely cannot identify something, include it as "Unknown food item" with conservative estimates
- Be realistic with portion sizes based on what you see`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            ...imageBlocks,
            {
              type: "text",
              text: userPrompt,
            },
          ],
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    // Parse the JSON response
    let parsed;
    try {
      // Strip any potential markdown code fences
      const cleaned = content.text.replace(/```json\n?|\n?```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      throw new Error(`Failed to parse Claude response: ${content.text}`);
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Analysis error:", error);
    const message = error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
