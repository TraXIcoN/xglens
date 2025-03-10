import OpenAI from "openai";

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

interface EnhancedPrompt {
  originalPrompt: string;
  enhancedPrompt: string;
  negativePrompt: string;
  explanation: string;
}

/**
 * Enhances a user prompt for better image generation results
 */
export async function enhancePrompt(
  userPrompt: string,
  negativePrompt?: string
): Promise<EnhancedPrompt> {
  try {
    const client = getClient();

    const response = await client.chat.completions.create({
      max_tokens: 500,
      temperature: 0.7,
      top_p: 1,
      n: 1,
      stream: false,
      model: "meta-llama/Meta-Llama-3.1-8B-Instruct",
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "system",
          content: `You are an expert at crafting optimal prompts for text-to-image AI models. 
          Your job is to take a user's image generation prompt and improve it to produce better results.
          
          Guidelines for improvement:
          1. Add more descriptive details that enhance the visual quality
          2. Include art style, lighting, composition, and other relevant visual elements
          3. Structure the prompt in a way that prioritizes the most important elements
          4. Suggest a negative prompt that helps avoid unwanted elements
          5. Keep the core intent and subject of the original prompt intact
          
          Respond with a JSON object containing:
          - enhancedPrompt: The improved prompt
          - negativePrompt: Suggested negative prompt (incorporate user's negative prompt if provided)
          - explanation: Brief explanation of your improvements`,
        },
        {
          role: "user",
          content: `Please enhance this image generation prompt: "${userPrompt}"${
            negativePrompt ? `\nNegative prompt: "${negativePrompt}"` : ""
          }`,
        },
      ],
    });

    // Parse the response
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content in response");
    }

    const result = JSON.parse(content);

    return {
      originalPrompt: userPrompt,
      enhancedPrompt: result.enhancedPrompt,
      negativePrompt: result.negativePrompt,
      explanation: result.explanation,
    };
  } catch (error) {
    console.error("Error enhancing prompt:", error);
    // Return original prompt if enhancement fails
    return {
      originalPrompt: userPrompt,
      enhancedPrompt: userPrompt,
      negativePrompt: negativePrompt || "",
      explanation: "Failed to enhance prompt. Using original prompt instead.",
    };
  }
}
