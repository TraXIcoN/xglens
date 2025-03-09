import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";
import { validateEnv } from "@/utils/env";

export async function POST(request: NextRequest) {
  // Validate environment variables
  validateEnv();

  try {
    // Parse request body
    const body = await request.json();
    const { requestId, imageUrl } = body;

    // Validate input
    if (!requestId) {
      return NextResponse.json(
        { error: "Request ID is required" },
        { status: 400 }
      );
    }

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    // Check if the generation_logs table exists
    const { error: tableCheckError } = await supabase
      .from("generation_logs")
      .select("id")
      .limit(1);

    // If the table doesn't exist, return an error
    if (tableCheckError && tableCheckError.code === "42P01") {
      return NextResponse.json(
        {
          error: "The generation_logs table does not exist in Supabase",
          details:
            "Please create the table using the SQL provided in the documentation",
        },
        { status: 500 }
      );
    }

    // Find the log entry for this request
    const { data: logData, error: logError } = await supabase
      .from("generation_logs")
      .select("*")
      .eq("request_id", requestId)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(1);

    if (logError) {
      console.error("Error fetching log entry:", logError);
      return NextResponse.json(
        { error: "Failed to fetch log entry", details: logError },
        { status: 500 }
      );
    }

    if (!logData || logData.length === 0) {
      return NextResponse.json(
        { error: "No completed log entry found for this request ID" },
        { status: 404 }
      );
    }

    // Update the log entry to mark it as saved to gallery
    const { error: updateError } = await supabase
      .from("generation_logs")
      .update({
        details: {
          ...logData[0].details,
          saved_to_gallery: true,
          saved_at: new Date().toISOString(),
        },
      })
      .eq("id", logData[0].id);

    if (updateError) {
      console.error("Error updating log entry:", updateError);
      return NextResponse.json(
        { error: "Failed to save to gallery", details: updateError },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Image saved to gallery successfully",
      requestId,
      imageUrl,
    });
  } catch (error) {
    console.error("Error saving to gallery:", error);
    return NextResponse.json(
      {
        error: "Failed to save to gallery",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
