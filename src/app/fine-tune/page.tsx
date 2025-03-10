"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FineTuningForm from "../components/FineTuningForm";
import FineTuningStatus from "../components/FineTuningStatus";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";

export default function FineTunePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  const [activeTab, setActiveTab] = useState<"create" | "status">(
    jobId ? "status" : "create"
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.push("/")}
          className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold">Model Fine-tuning</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("create")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "create"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Create Fine-tuning Job
            </button>
            {jobId && (
              <button
                onClick={() => setActiveTab("status")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "status"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Job Status
              </button>
            )}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "create" ? (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">
                  Create a Fine-tuning Job
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Fine-tune a model on your custom dataset to improve
                  performance on specific tasks. Upload your training data in
                  JSONL format and configure the fine-tuning parameters.
                </p>
              </div>
              <FineTuningForm />
            </div>
          ) : (
            jobId && <FineTuningStatus jobId={jobId} />
          )}
        </div>
      </div>

      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Fine-tuning Guide</h2>
        <div className="prose dark:prose-invert max-w-none">
          <h3>Preparing Your Dataset</h3>
          <p>
            Your training data should be in JSONL format, with each line
            containing a prompt and completion pair:
          </p>
          <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-x-auto">
            {`{"prompt": "What is the capital of France?", "completion": "The capital of France is Paris."}\n{"prompt": "Who wrote Romeo and Juliet?", "completion": "William Shakespeare wrote Romeo and Juliet."}`}
          </pre>

          <h3>Best Practices</h3>
          <ul>
            <li>
              Include a diverse set of examples that cover the range of tasks
              you want the model to perform.
            </li>
            <li>
              Aim for at least 50-100 examples for basic fine-tuning, but more
              examples generally lead to better results.
            </li>
            <li>
              Balance your dataset to avoid biasing the model toward certain
              responses.
            </li>
            <li>
              Consider including a validation file to monitor the model's
              performance during training.
            </li>
          </ul>

          <h3>Hyperparameters</h3>
          <p>
            The default hyperparameters work well for most use cases, but you
            can adjust them based on your specific needs:
          </p>
          <ul>
            <li>
              <strong>Batch Size:</strong> Larger batch sizes can speed up
              training but require more memory.
            </li>
            <li>
              <strong>Learning Rate:</strong> Controls how quickly the model
              adapts to the training data. Lower values are more stable but
              train slower.
            </li>
            <li>
              <strong>Epochs:</strong> The number of times the model will see
              each example during training. More epochs can improve performance
              but risk overfitting.
            </li>
          </ul>

          <h3>After Fine-tuning</h3>
          <p>Once your fine-tuning job completes successfully, you can:</p>
          <ul>
            <li>Download the model checkpoint files for deployment.</li>
            <li>Evaluate the model's performance on your specific tasks.</li>
            <li>
              Use the fine-tuned model in your applications by referencing its
              ID.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
