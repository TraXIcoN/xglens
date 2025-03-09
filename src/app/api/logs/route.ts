import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";
import { validateEnv } from "@/utils/env";

export async function GET(request: NextRequest) {
  // Validate environment variables
  validateEnv();

  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const requestId = searchParams.get("requestId");
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");
    const galleryOnly = searchParams.get("galleryOnly") === "true";

    // Check if the generation_logs table exists
    const { error: tableCheckError } = await supabase
      .from("generation_logs")
      .select("id")
      .limit(1);

    // If the table doesn't exist, return an empty result
    if (tableCheckError && tableCheckError.code === "42P01") {
      console.warn(
        "The generation_logs table does not exist in Supabase. Please create it using the SQL provided in the documentation."
      );

      return NextResponse.json({
        logs: [],
        groupedLogs: {},
        count: 0,
        limit,
        offset,
        tableExists: false,
        message:
          "The generation_logs table does not exist in Supabase. Please create it using the SQL provided in the documentation.",
      });
    }

    // Build the query
    let query = supabase
      .from("generation_logs")
      .select("*", { count: "exact" });

    // Apply filters if provided
    if (requestId) {
      query = query.eq("request_id", requestId);
    }
    if (status) {
      query = query.eq("status", status);
    }
    if (userId) {
      query = query.eq("user_id", userId);
    }

    // Filter for gallery images (those with image_url and saved_to_gallery flag)
    if (galleryOnly) {
      query = query
        .not("image_url", "is", null)
        .contains("details", { saved_to_gallery: true });
    }

    // Apply pagination
    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Execute the query
    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching logs from Supabase:", error);
      return NextResponse.json(
        { error: "Failed to fetch logs", details: error },
        { status: 500 }
      );
    }

    // Group logs by request_id for easier consumption
    const groupedLogs: Record<string, any[]> = {};

    data?.forEach((log) => {
      if (!groupedLogs[log.request_id]) {
        groupedLogs[log.request_id] = [];
      }
      groupedLogs[log.request_id].push(log);
    });

    // Return the logs
    return NextResponse.json({
      logs: data,
      groupedLogs,
      count,
      limit,
      offset,
      tableExists: true,
    });
  } catch (error) {
    console.error("Error in logs API:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch logs",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
