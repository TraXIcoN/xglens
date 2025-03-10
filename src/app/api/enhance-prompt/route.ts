import { NextRequest, NextResponse } from "next/server";
import { enhancePrompt } from "@/utils/prompt-enhancer";
import { validateEnv } from "@/utils/env";

export async function POST(request: NextRequest) {
  // Validate environment variables
  validateEnv();

  try {
    // Parse request body
    const body = await request.json();
    const { prompt, negativePrompt } = body;

    // Validate input
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required and must be a string" },
        { status: 400 }
      );
    }

    // Enhance the prompt
    const enhancedPromptData = await enhancePrompt(prompt, negativePrompt);

    // Return the enhanced prompt
    return NextResponse.json({
      success: true,
      originalPrompt: enhancedPromptData.originalPrompt,
      enhancedPrompt: enhancedPromptData.enhancedPrompt,
      negativePrompt: enhancedPromptData.negativePrompt,
      explanation: enhancedPromptData.explanation,
    });
  } catch (error) {
    console.error("Error enhancing prompt:", error);
    return NextResponse.json(
      {
        error: "Failed to enhance prompt",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
