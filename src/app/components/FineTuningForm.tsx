"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface FineTuningFormProps {
  onJobCreated?: (jobId: string) => void;
}

export default function FineTuningForm({ onJobCreated }: FineTuningFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  // Form state
  const [model, setModel] = useState("meta-llama/Meta-Llama-3.1-8B-Instruct");
  const [trainingFile, setTrainingFile] = useState<File | null>(null);
  const [validationFile, setValidationFile] = useState<File | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [batchSize, setBatchSize] = useState("");
  const [learningRate, setLearningRate] = useState("");
  const [nEpochs, setNEpochs] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");
    setStatusMessage("");

    try {
      // Validate required fields
      if (!model) {
        throw new Error("Model is required");
      }
      if (!trainingFile) {
        throw new Error("Training file is required");
      }

      // Create form data
      const formData = new FormData();
      formData.append("model", model);
      formData.append("trainingFile", trainingFile);

      if (validationFile) {
        formData.append("validationFile", validationFile);
      }

      // Add hyperparameters if provided
      if (batchSize) formData.append("batchSize", batchSize);
      if (learningRate) formData.append("learningRate", learningRate);
      if (nEpochs) formData.append("nEpochs", nEpochs);

      // Submit the form
      setStatusMessage("Uploading files...");
      console.log("Submitting form data...");
      const response = await fetch("/api/fine-tune", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        // Check for specific error types
        if (data.error && data.error.includes("not ready yet")) {
          throw new Error(
            `${data.error} The file is still being processed. Please try again in a few moments.`
          );
        }
        throw new Error(data.error || "Failed to create fine-tuning job");
      }

      // Handle success
      setSuccess("Fine-tuning job created successfully!");
      console.log("Job created:", data.job);

      // Reset form
      setTrainingFile(null);
      setValidationFile(null);
      setBatchSize("");
      setLearningRate("");
      setNEpochs("");

      // Notify parent component
      if (onJobCreated && data.job?.jobId) {
        onJobCreated(data.job.jobId);
      }

      // Redirect to job status page
      if (data.job?.jobId) {
        router.push(`/fine-tune?jobId=${data.job.jobId}`);
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsSubmitting(false);
      setStatusMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {statusMessage && (
        <div className="p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded flex items-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {statusMessage}
        </div>
      )}

      <div>
        <label htmlFor="model" className="block text-sm font-medium mb-1">
          Model*
        </label>
        <select
          id="model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="meta-llama/Meta-Llama-3.1-8B-Instruct">
            Meta-Llama-3.1-8B-Instruct
          </option>
          <option value="meta-llama/Meta-Llama-3.1-70B-Instruct">
            Meta-Llama-3.1-70B-Instruct
          </option>
          <option value="meta-llama/Llama-3.2-1B-Instruct">
            Llama-3.2-1B-Instruct
          </option>
          <option value="meta-llama/Llama-3.2-3B-Instruct">
            Llama-3.2-3B-Instruct
          </option>
          <option value="meta-llama/Llama-3.3-70B-Instruct">
            Llama-3.3-70B-Instruct
          </option>
        </select>
        <p className="mt-1 text-sm text-gray-500">
          Select a model that supports fine-tuning
        </p>
      </div>

      <div>
        <label
          htmlFor="trainingFile"
          className="block text-sm font-medium mb-1"
        >
          Training File* (JSONL format)
        </label>
        <input
          type="file"
          id="trainingFile"
          accept=".jsonl"
          onChange={(e) => setTrainingFile(e.target.files?.[0] || null)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        />
        <p className="mt-1 text-sm text-gray-500">
          {trainingFile ? `Selected: ${trainingFile.name}` : "No file chosen"}
        </p>
        <div className="mt-2 text-sm text-gray-600 bg-gray-100 p-3 rounded">
          <p className="font-medium">Required format:</p>
          <pre className="mt-1 text-xs overflow-x-auto">
            {`{"messages": [{"role": "user", "content": "Your question?"}, {"role": "assistant", "content": "The answer"}]}`}
          </pre>
          <p className="mt-2">See sample_training_data.jsonl for an example.</p>
          <p className="mt-2 text-yellow-600">
            Note: Files may take a few moments to process after upload. If you
            get a "file not ready" error, please wait and try again.
          </p>
        </div>
      </div>

      <div>
        <label
          htmlFor="validationFile"
          className="block text-sm font-medium mb-1"
        >
          Validation File (JSONL format, optional)
        </label>
        <input
          type="file"
          id="validationFile"
          accept=".jsonl"
          onChange={(e) => setValidationFile(e.target.files?.[0] || null)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          {validationFile
            ? `Selected: ${validationFile.name}`
            : "No file chosen"}
        </p>
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
        >
          {showAdvanced ? "- Hide Advanced Options" : "+ Show Advanced Options"}
        </button>

        {showAdvanced && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md space-y-4">
            <h3 className="font-medium">Hyperparameters</h3>

            <div>
              <label
                htmlFor="batchSize"
                className="block text-sm font-medium mb-1"
              >
                Batch Size
              </label>
              <input
                type="number"
                id="batchSize"
                value={batchSize}
                onChange={(e) => setBatchSize(e.target.value)}
                min="1"
                max="64"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Default: 4"
              />
            </div>

            <div>
              <label
                htmlFor="learningRate"
                className="block text-sm font-medium mb-1"
              >
                Learning Rate
              </label>
              <input
                type="number"
                id="learningRate"
                value={learningRate}
                onChange={(e) => setLearningRate(e.target.value)}
                step="0.0001"
                min="0.0001"
                max="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Default: 0.0002"
              />
            </div>

            <div>
              <label
                htmlFor="nEpochs"
                className="block text-sm font-medium mb-1"
              >
                Number of Epochs
              </label>
              <input
                type="number"
                id="nEpochs"
                value={nEpochs}
                onChange={(e) => setNEpochs(e.target.value)}
                min="1"
                max="50"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Default: 3"
              />
            </div>
          </div>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {isSubmitting ? "Creating Job..." : "Create Job"}
        </button>
        {isSubmitting && (
          <p className="mt-2 text-sm text-center text-gray-500">
            This may take a minute while we process your files
          </p>
        )}
      </div>
    </form>
  );
}
