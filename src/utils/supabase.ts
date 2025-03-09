import { createClient } from "@supabase/supabase-js";

// Initialize the Supabase client
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "Supabase credentials are missing. Some functionality may not work properly."
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to log generation events to Supabase
export async function logGenerationEvent({
  requestId,
  userId = "anonymous",
  prompt,
  status,
  step,
  details,
  imageUrl = null,
}: {
  requestId: string;
  userId?: string;
  prompt: string;
  status: "started" | "processing" | "completed" | "failed";
  step: string;
  details?: any;
  imageUrl?: string | null;
}) {
  try {
    const { error } = await supabase.from("generation_logs").insert({
      request_id: requestId,
      user_id: userId,
      prompt,
      status,
      step,
      details,
      image_url: imageUrl,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error logging to Supabase:", error);
    }
  } catch (err) {
    console.error("Failed to log to Supabase:", err);
  }
}
