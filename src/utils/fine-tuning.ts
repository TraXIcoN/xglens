import { OpenAI } from "openai";
import fs from "fs";
import path from "path";
import { Readable } from "stream";
import os from "os";
import axios from "axios";
import FormData from "form-data";

// Get OpenAI client
const getClient = () => {
  const apiKey = process.env.NEBIUS_API_KEY;
  if (!apiKey) {
    throw new Error("NEBIUS_API_KEY environment variable is not set");
  }

  const baseURL =
    process.env.NEBIUS_API_ENDPOINT || "https://api.studio.nebius.com/v1/";
  console.log("Using API endpoint:", baseURL);

  return new OpenAI({
    baseURL,
    apiKey,
  });
};

// Convert File to temporary file on disk
async function fileToPath(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Create a temporary file
  const tempDir = os.tmpdir();
  const tempFilePath = path.join(tempDir, file.name);

  // Write the buffer to the temporary file
  fs.writeFileSync(tempFilePath, buffer);

  return tempFilePath;
}

// Function to wait for file processing
async function waitForFileProcessing(
  apiKey: string,
  baseURL: string,
  fileId: string,
  maxRetries = 10,
  delayMs = 2000
): Promise<boolean> {
  console.log(`Waiting for file ${fileId} to be processed...`);

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios.get(`${baseURL}files/${fileId}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      console.log(`File ${fileId} status: ${response.data.status}`);

      if (response.data.status === "processed") {
        return true;
      }

      // If still processing, wait and try again
      console.log(
        `File not ready yet (attempt ${
          i + 1
        }/${maxRetries}). Waiting ${delayMs}ms...`
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    } catch (error) {
      console.error(`Error checking file status:`, error);
      // Continue retrying despite errors
    }
  }

  return false;
}

// Upload a file using axios instead of the OpenAI client
export async function uploadFile(
  file: File,
  purpose: "fine-tune" | "assistants" | "vision" | "batch" = "fine-tune"
): Promise<string> {
  try {
    const apiKey = process.env.NEBIUS_API_KEY;
    if (!apiKey) {
      throw new Error("NEBIUS_API_KEY environment variable is not set");
    }

    const baseURL =
      process.env.NEBIUS_API_ENDPOINT || "https://api.studio.nebius.com/v1/";

    // Convert File to a temporary file path
    const filePath = await fileToPath(file);
    console.log(`File path: ${filePath}`);

    // Create form data
    const formData = new FormData();
    formData.append("purpose", purpose);
    formData.append("file", fs.createReadStream(filePath), {
      filename: path.basename(filePath),
      contentType: "application/json",
    });

    console.log(`Uploading file to ${baseURL}files`);

    // Upload the file using axios
    const response = await axios.post(`${baseURL}files`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${apiKey}`,
      },
    });

    // Clean up the temporary file
    fs.unlinkSync(filePath);

    console.log(`File uploaded with ID: ${response.data.id}`);

    // Wait for the file to be processed
    const isProcessed = await waitForFileProcessing(
      apiKey,
      baseURL,
      response.data.id
    );
    if (!isProcessed) {
      console.warn(
        `File ${response.data.id} is not fully processed yet. Fine-tuning may fail if started too soon.`
      );
    }

    return response.data.id;
  } catch (error: any) {
    console.error("Error uploading file:", error);

    // Provide more detailed error information
    if (axios.isAxiosError(error) && error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Status Text: ${error.response.statusText}`);
      console.error(`Response Data:`, error.response.data);
    }

    throw error;
  }
}

export interface FineTuningParams {
  model: string;
  trainingFile: File | null;
  validationFile?: File | null;
  hyperparameters?: {
    batchSize?: number;
    learningRate?: number;
    nEpochs?: number;
    warmupRatio?: number;
    weightDecay?: number;
    lora?: boolean;
    loraR?: number;
    loraAlpha?: number;
    loraDropout?: number;
    packing?: boolean;
  };
  wandbApiKey?: string;
  wandbProject?: string;
}

export interface FineTuningStatus {
  jobId: string;
  status: string;
  model: string;
  createdAt: string;
  finishedAt?: string;
  events?: any[];
  checkpoints?: any[];
}

// Create a fine-tuning job
export async function createFineTuningJob(
  params: FineTuningParams
): Promise<FineTuningStatus> {
  try {
    const apiKey = process.env.NEBIUS_API_KEY;
    if (!apiKey) {
      throw new Error("NEBIUS_API_KEY environment variable is not set");
    }

    const baseURL =
      process.env.NEBIUS_API_ENDPOINT || "https://api.studio.nebius.com/v1/";

    if (!params.trainingFile) {
      throw new Error("Training file is required");
    }

    // Upload the training file
    const trainingFileId = await uploadFile(params.trainingFile);
    console.log("Training file uploaded with ID:", trainingFileId);

    // Upload the validation file if provided
    let validationFileId: string | undefined;
    if (params.validationFile) {
      validationFileId = await uploadFile(params.validationFile);
      console.log("Validation file uploaded with ID:", validationFileId);
    }

    // Double-check file processing status before creating job
    try {
      const fileStatusResponse = await axios.get(
        `${baseURL}files/${trainingFileId}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      if (fileStatusResponse.data.status !== "processed") {
        // If still not processed, wait a bit longer
        console.log("File still not processed. Waiting additional time...");
        const isProcessed = await waitForFileProcessing(
          apiKey,
          baseURL,
          trainingFileId,
          5,
          3000
        );
        if (!isProcessed) {
          throw new Error(
            `Training file is not ready yet. Please try again in a few moments.`
          );
        }
      }
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        console.error(
          `Error checking file status: ${error.response.status} ${error.response.statusText}`
        );
        console.error(`Response data:`, error.response.data);
      } else {
        console.error(`Error checking file status:`, error);
      }
      throw new Error(`Error checking file status: ${error.message}`);
    }

    // Prepare hyperparameters object according to OpenAI API requirements
    const hyperparameters: Record<string, any> = {};

    if (params.hyperparameters) {
      if (params.hyperparameters.batchSize) {
        hyperparameters.batch_size = params.hyperparameters.batchSize;
      }
      if (params.hyperparameters.learningRate) {
        hyperparameters.learning_rate_multiplier =
          params.hyperparameters.learningRate;
      }
      if (params.hyperparameters.nEpochs) {
        hyperparameters.n_epochs = params.hyperparameters.nEpochs;
      }
    }

    // Create the fine-tuning job with minimal required parameters
    const createParams: any = {
      training_file: trainingFileId,
      model: params.model,
    };

    // Only add hyperparameters if they exist
    if (Object.keys(hyperparameters).length > 0) {
      createParams.hyperparameters = hyperparameters;
    }

    // Only add validation file if it exists
    if (validationFileId) {
      createParams.validation_file = validationFileId;
    }

    console.log(
      "Creating fine-tuning job with params:",
      JSON.stringify(createParams, null, 2)
    );

    try {
      // Create the fine-tuning job using axios
      const response = await axios.post(
        `${baseURL}fine_tuning/jobs`,
        createParams,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      console.log("Fine-tuning job created successfully:", response.data);

      return {
        jobId: response.data.id,
        status: response.data.status,
        model: response.data.model,
        createdAt: new Date(response.data.created_at * 1000).toISOString(),
        finishedAt: response.data.finished_at
          ? new Date(response.data.finished_at * 1000).toISOString()
          : undefined,
      };
    } catch (error: any) {
      console.error("API Error details:", error);

      // Extract more detailed error information if available
      let errorMessage = "Error creating fine-tuning job";

      if (axios.isAxiosError(error) && error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error(`Status Text: ${error.response.statusText}`);
        console.error(`Response Data:`, error.response.data);

        if (error.response.data && error.response.data.error) {
          errorMessage = `${errorMessage}: ${
            error.response.data.error.message ||
            JSON.stringify(error.response.data.error)
          }`;
        } else {
          errorMessage = `${errorMessage}: ${error.response.status} ${error.response.statusText}`;

          // Add more context about the request
          errorMessage += `\nRequest params: ${JSON.stringify(createParams)}`;

          // Check if the model is supported
          errorMessage += `\nPlease verify that the model "${params.model}" supports fine-tuning.`;

          // Check if the file format is correct
          errorMessage += `\nEnsure your training file is in the correct JSONL format with 'messages' array containing 'role' and 'content' fields.`;
        }
      } else if (error.message) {
        errorMessage = `${errorMessage}: ${error.message}`;
      }

      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error("Error creating fine-tuning job:", error);
    throw error;
  }
}

// Get the status of a fine-tuning job
export async function getFineTuningJobStatus(
  jobId: string
): Promise<FineTuningStatus> {
  try {
    const apiKey = process.env.NEBIUS_API_KEY;
    if (!apiKey) {
      throw new Error("NEBIUS_API_KEY environment variable is not set");
    }

    const baseURL =
      process.env.NEBIUS_API_ENDPOINT || "https://api.studio.nebius.com/v1/";

    const response = await axios.get(`${baseURL}fine_tuning/jobs/${jobId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    return {
      jobId: response.data.id,
      status: response.data.status,
      model: response.data.model,
      createdAt: new Date(response.data.created_at * 1000).toISOString(),
      finishedAt: response.data.finished_at
        ? new Date(response.data.finished_at * 1000).toISOString()
        : undefined,
    };
  } catch (error: any) {
    console.error("Error getting fine-tuning job status:", error);

    if (axios.isAxiosError(error) && error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Status Text: ${error.response.statusText}`);
      console.error(`Response Data:`, error.response.data);
    }

    throw error;
  }
}

// List events for a fine-tuning job
export async function listFineTuningJobEvents(jobId: string): Promise<any[]> {
  try {
    const apiKey = process.env.NEBIUS_API_KEY;
    if (!apiKey) {
      throw new Error("NEBIUS_API_KEY environment variable is not set");
    }

    const baseURL =
      process.env.NEBIUS_API_ENDPOINT || "https://api.studio.nebius.com/v1/";

    const response = await axios.get(
      `${baseURL}fine_tuning/jobs/${jobId}/events`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    return response.data.data || [];
  } catch (error: any) {
    console.error("Error listing fine-tuning job events:", error);

    if (axios.isAxiosError(error) && error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Status Text: ${error.response.statusText}`);
      console.error(`Response Data:`, error.response.data);
    }

    throw error;
  }
}

// List checkpoints for a fine-tuning job
export async function listFineTuningJobCheckpoints(
  jobId: string
): Promise<any[]> {
  try {
    const apiKey = process.env.NEBIUS_API_KEY;
    if (!apiKey) {
      throw new Error("NEBIUS_API_KEY environment variable is not set");
    }

    const baseURL =
      process.env.NEBIUS_API_ENDPOINT || "https://api.studio.nebius.com/v1/";

    const response = await axios.get(
      `${baseURL}fine_tuning/jobs/${jobId}/checkpoints`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    return response.data.data || [];
  } catch (error: any) {
    console.error("Error listing fine-tuning job checkpoints:", error);

    if (axios.isAxiosError(error) && error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Status Text: ${error.response.statusText}`);
      console.error(`Response Data:`, error.response.data);
    }

    throw error;
  }
}

// Download a checkpoint file
export async function downloadCheckpointFile(
  fileId: string,
  filename: string
): Promise<string> {
  try {
    const apiKey = process.env.NEBIUS_API_KEY;
    if (!apiKey) {
      throw new Error("NEBIUS_API_KEY environment variable is not set");
    }

    const baseURL =
      process.env.NEBIUS_API_ENDPOINT || "https://api.studio.nebius.com/v1/";

    const response = await axios.get(`${baseURL}files/${fileId}/content`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      responseType: "arraybuffer",
    });

    // Save the file to a temporary location
    const tempDir = os.tmpdir();
    const filePath = path.join(tempDir, filename);
    fs.writeFileSync(filePath, Buffer.from(response.data));

    return filePath;
  } catch (error: any) {
    console.error("Error downloading checkpoint file:", error);

    if (axios.isAxiosError(error) && error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Status Text: ${error.response.statusText}`);
      console.error(`Response Data:`, error.response.data);
    }

    throw error;
  }
}
