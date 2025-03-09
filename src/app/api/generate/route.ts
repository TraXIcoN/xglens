import { NextRequest, NextResponse } from "next/server";
import { generateImage } from "@/utils/nebius-api";
import { logGenerationEvent } from "@/utils/supabase";
import { validateEnv } from "@/utils/env";
import fs from "fs";
import path from "path";

// Function to save base64 image to file
async function saveBase64Image(
  base64Data: string,
  requestId: string
): Promise<string> {
  // Create directory if it doesn't exist
  const dir = path.join(process.cwd(), "public", "generated");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Remove the data URL prefix if present
  const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, "");

  // Create a buffer from the base64 data
  const buffer = Buffer.from(base64Image, "base64");

  // Save the image to a file
  const filename = `${requestId}.webp`;
  const filepath = path.join(dir, filename);
  fs.writeFileSync(filepath, buffer);

  // Return the public URL
  return `/generated/${filename}`;
}

export async function POST(request: NextRequest) {
  // Validate environment variables
  validateEnv();

  try {
    // Parse request body
    const body = await request.json();
    const {
      prompt,
      negative_prompt,
      diffusionStrength,
      styleIntensity,
      style,
    } = body;

    // Validate input
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required and must be a string" },
        { status: 400 }
      );
    }

    // Generate a unique request ID
    const requestId = crypto.randomUUID();

    // Log the start of the generation process
    await logGenerationEvent({
      requestId,
      prompt,
      status: "started",
      step: "request_received",
      details: {
        negative_prompt,
        diffusionStrength,
        styleIntensity,
        style,
        userAgent: request.headers.get("user-agent"),
      },
    });

    // Map frontend parameters to Nebius API parameters
    // This is where you can transform the parameters from your UI to match what the API expects
    const nebiusParams = {
      prompt,
      negative_prompt: negative_prompt || "",
      // Convert diffusionStrength to num_inference_steps (example mapping)
      num_inference_steps: Math.round(30 + (diffusionStrength || 0.7) * 20),
      // Style is passed separately
      style,
      // Use a random seed by default
      seed: -1,
    };

    // Log the processing step
    await logGenerationEvent({
      requestId,
      prompt,
      status: "processing",
      step: "calling_nebius_api",
      details: nebiusParams,
    });

    // Call the Nebius API to generate the image
    let imageResult;
    let imageUrl;

    try {
      imageResult = await generateImage(nebiusParams);

      // If we received a base64 image, save it to a file
      if (imageResult.b64_json) {
        imageUrl = await saveBase64Image(imageResult.b64_json, requestId);
      } else {
        imageUrl = imageResult.image_url;
      }
    } catch (error) {
      // Log the API call failure
      await logGenerationEvent({
        requestId,
        prompt,
        status: "failed",
        step: "nebius_api_error",
        details: {
          error: error instanceof Error ? error.message : String(error),
        },
      });

      // In development or if Nebius API is not configured, return a mock response
      if (
        process.env.NODE_ENV === "development" ||
        !process.env.NEBIUS_API_KEY
      ) {
        console.warn("Using mock image response in development mode");
        imageUrl = "/placeholder-image.jpg";
      } else {
        throw error;
      }
    }

    // Log the successful completion
    await logGenerationEvent({
      requestId,
      prompt,
      status: "completed",
      step: "image_generated",
      details: { imageSize: "original" },
      imageUrl,
    });

    // Return the response to the client
    return NextResponse.json({
      success: true,
      imageUrl,
      requestId,
      metadata: {
        prompt,
        style,
        diffusionStrength,
        styleIntensity,
        generatedAt: new Date().toISOString(),
      },
      logs: [
        { step: "request_received", timestamp: new Date().toISOString() },
        { step: "calling_nebius_api", timestamp: new Date().toISOString() },
        { step: "image_generated", timestamp: new Date().toISOString() },
      ],
    });
  } catch (error) {
    console.error("Error generating image:", error);

    // Return an error response
    return NextResponse.json(
      {
        error: "Failed to generate image",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
