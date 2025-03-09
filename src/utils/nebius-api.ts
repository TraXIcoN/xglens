// Nebius Studio API client for text-to-image generation

import OpenAI from "openai";
import { ImageGenerateParams } from "openai/resources/images";

// Extend the OpenAI types to include Nebius-specific properties
interface NebiusImageGenerateParams extends Omit<ImageGenerateParams, "model"> {
  model: string;
  extra_body?: {
    response_extension?: string;
    width?: number;
    height?: number;
    num_inference_steps?: number;
    seed?: number;
    negative_prompt?: string;
  };
}

// Define the parameters for image generation
export interface GenerationParams {
  prompt: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  num_inference_steps?: number;
  seed?: number;
  style?: string;
}

// Define the response structure
export interface GenerationResponse {
  image_url: string;
  request_id: string;
  status: string;
  b64_json?: string;
}

// Initialize the OpenAI client with Nebius Studio base URL
const getClient = () => {
  const apiKey = process.env.NEBIUS_API_KEY;

  if (!apiKey) {
    throw new Error("NEBIUS_API_KEY is not defined in environment variables");
  }

  return new OpenAI({
    baseURL:
      process.env.NEBIUS_API_ENDPOINT || "https://api.studio.nebius.com/v1/",
    apiKey,
  });
};

/**
 * Generate an image using the Nebius Studio API via OpenAI client
 */
export async function generateImage(
  params: GenerationParams
): Promise<GenerationResponse> {
  try {
    const client = getClient();

    // Prepare the prompt with style if provided
    const finalPrompt = params.style
      ? `${params.prompt} in ${params.style} style`
      : params.prompt;

    // Call the API with Nebius-specific parameters
    const generateParams: NebiusImageGenerateParams = {
      model: "stability-ai/sdxl",
      prompt: finalPrompt,
      response_format: "b64_json",
      extra_body: {
        response_extension: "webp",
        width: params.width || 512,
        height: params.height || 512,
        num_inference_steps: params.num_inference_steps || 30,
        seed: params.seed || -1, // -1 means random seed
        negative_prompt: params.negative_prompt || "",
      },
    };

    // @ts-ignore - Using our extended type but TypeScript still needs to be ignored
    const response = await client.images.generate(generateParams);

    // Extract the first image from the response
    const image = response.data[0];

    // Generate a unique request ID
    const requestId = crypto.randomUUID();

    // If we have a base64 image, we could save it to a file or return it directly
    // For now, we'll just return it in the response
    return {
      image_url: image.url || "", // The API might return a URL directly
      b64_json: image.b64_json, // Or a base64 encoded image
      request_id: requestId,
      status: "success",
    };
  } catch (error) {
    console.error("Error calling Nebius API:", error);
    throw error;
  }
}
