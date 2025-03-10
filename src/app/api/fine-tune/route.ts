import { NextRequest, NextResponse } from "next/server";
import { validateEnv } from "@/utils/env";
import {
  createFineTuningJob,
  getFineTuningJobStatus,
  listFineTuningJobEvents,
  listFineTuningJobCheckpoints,
  downloadCheckpointFile,
} from "@/utils/fine-tuning";

export async function POST(request: NextRequest) {
  try {
    // Check if environment variables are set
    if (!process.env.NEBIUS_API_KEY) {
      return NextResponse.json(
        { error: "NEBIUS_API_KEY is not defined in environment variables" },
        { status: 500 }
      );
    }

    // Get form data
    const formData = await request.formData();
    console.log(
      "Received form data:",
      Array.from(formData.entries()).map(
        ([key, value]) =>
          `${key}: ${typeof value === "object" ? "File" : value}`
      )
    );

    // Extract model
    const model = formData.get("model") as string;
    if (!model) {
      return NextResponse.json({ error: "Model is required" }, { status: 400 });
    }

    // Extract training file
    const trainingFile = formData.get("trainingFile") as File | null;
    if (!trainingFile) {
      return NextResponse.json(
        { error: "Training file is required" },
        { status: 400 }
      );
    }

    // Validate file format
    if (!trainingFile.name.endsWith(".jsonl")) {
      return NextResponse.json(
        {
          error: "Training file must be in JSONL format with .jsonl extension",
        },
        { status: 400 }
      );
    }

    // Extract validation file (optional)
    const validationFile = formData.get("validationFile") as File | null;
    if (validationFile && !validationFile.name.endsWith(".jsonl")) {
      return NextResponse.json(
        {
          error:
            "Validation file must be in JSONL format with .jsonl extension",
        },
        { status: 400 }
      );
    }

    // Extract hyperparameters
    const hyperparameters: Record<string, any> = {};

    // Basic hyperparameters
    const batchSize = formData.get("batchSize");
    if (batchSize) hyperparameters.batchSize = Number(batchSize);

    const learningRate = formData.get("learningRate");
    if (learningRate) hyperparameters.learningRate = Number(learningRate);

    const nEpochs = formData.get("nEpochs");
    if (nEpochs) hyperparameters.nEpochs = Number(nEpochs);

    // Create fine-tuning job
    try {
      console.log("Creating fine-tuning job...");
      const job = await createFineTuningJob({
        model,
        trainingFile,
        validationFile: validationFile || undefined,
        hyperparameters:
          Object.keys(hyperparameters).length > 0 ? hyperparameters : undefined,
      });

      console.log("Fine-tuning job created successfully:", job);
      return NextResponse.json({ job });
    } catch (error: any) {
      console.error("Error creating fine-tuning job:", error);

      // Check for specific error types
      if (error.message && error.message.includes("not ready yet")) {
        return NextResponse.json(
          { error: error.message },
          { status: 409 } // Conflict - resource not in correct state
        );
      }

      // Check for file format errors
      if (
        error.message &&
        (error.message.includes("format") ||
          error.message.includes("messages") ||
          error.message.includes("role") ||
          error.message.includes("content"))
      ) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 } // Bad Request - invalid file format
        );
      }

      return NextResponse.json(
        { error: error.message || "Failed to create fine-tuning job" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Unexpected error in POST handler:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Validate environment variables
  validateEnv();

  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get("jobId");
    const action = searchParams.get("action");

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

    if (action === "status") {
      // Get job status
      const status = await getFineTuningJobStatus(jobId);
      return NextResponse.json({ success: true, status });
    } else if (action === "events") {
      // Get job events
      const events = await listFineTuningJobEvents(jobId);
      return NextResponse.json({ success: true, events });
    } else if (action === "checkpoints") {
      // Get job checkpoints
      const checkpoints = await listFineTuningJobCheckpoints(jobId);
      return NextResponse.json({ success: true, checkpoints });
    } else if (
      action === "download" &&
      searchParams.get("fileId") &&
      searchParams.get("filename")
    ) {
      // Download checkpoint file
      const fileId = searchParams.get("fileId") as string;
      const filename = searchParams.get("filename") as string;
      const filePath = await downloadCheckpointFile(fileId, filename);
      return NextResponse.json({ success: true, filePath });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in fine-tuning API:", error);
    return NextResponse.json(
      {
        error: "Failed to process fine-tuning request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
