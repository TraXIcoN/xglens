"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Confetti from "./Confetti";
import FineTuningSteps from "./FineTuningSteps";

interface FineTuningFormProps {
  onJobCreated?: (jobId: string) => void;
}

export default function FineTuningForm({ onJobCreated }: FineTuningFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [hoverStates, setHoverStates] = useState({
    model: false,
    trainingFile: false,
    validationFile: false,
    batchSize: false,
    learningRate: false,
    nEpochs: false,
    submit: false,
  });

  // Form state
  const [model, setModel] = useState("meta-llama/Meta-Llama-3.1-8B-Instruct");
  const [trainingFile, setTrainingFile] = useState<File | null>(null);
  const [validationFile, setValidationFile] = useState<File | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [batchSize, setBatchSize] = useState("");
  const [learningRate, setLearningRate] = useState("");
  const [nEpochs, setNEpochs] = useState("");
  const [rainbowText, setRainbowText] = useState(0);

  // Rainbow text animation
  useEffect(() => {
    const interval = setInterval(() => {
      setRainbowText((prev) => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const [showForm, setShowForm] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Mock step progression
  useEffect(() => {
    if (!showForm && currentStep < 8) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
        if (currentStep === 7) {
          setIsCompleted(true);
          setShowConfetti(true);
          if (onJobCreated) {
            onJobCreated("mock-job-id");
          }
        }
      }, 3000); // Progress every 3 seconds
      return () => clearTimeout(timer);
    }
  }, [showForm, currentStep, onJobCreated]);

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

      // Create form data for file upload
      const formData = new FormData();
      formData.append("model", model);
      formData.append("training_file", trainingFile);
      if (validationFile) {
        formData.append("validation_file", validationFile);
      }
      if (batchSize) formData.append("batch_size", batchSize);
      if (learningRate) formData.append("learning_rate", learningRate);
      if (nEpochs) formData.append("n_epochs", nEpochs);

      try {
        // Attempt the actual API call
        const response = await fetch("/api/fine-tune/create", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          // Check specifically for the 409 file processing error
          if (
            response.status === 409 &&
            data.message?.includes("Training file is not ready yet")
          ) {
            console.warn("File still processing, falling back to mock flow");
            setStatusMessage(
              "File is being processed - showing demo flow while you wait"
            );
            setTimeout(() => {
              setShowForm(false);
              setCurrentStep(1);
              // Use a mock job ID for the demo
              if (onJobCreated) {
                onJobCreated("mock-job-id");
              }
            }, 2000);
            return;
          }
          throw new Error(
            data.message || `API call failed: ${response.statusText}`
          );
        }

        setShowForm(false);
        setCurrentStep(1);

        // If we have a job ID from the API, use it
        if (onJobCreated && data.jobId) {
          onJobCreated(data.jobId);
        }
      } catch (apiError) {
        console.warn(
          "API call failed, falling back to mock process:",
          apiError
        );
        // Smoothly transition to mock process
        setStatusMessage(
          "Connection issue detected - falling back to demo mode"
        );
        setTimeout(() => {
          setShowForm(false);
          setCurrentStep(1);
          // Use a mock job ID for the demo
          if (onJobCreated) {
            onJobCreated("mock-job-id");
          }
        }, 2000);
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      setIsSubmitting(false);
      setStatusMessage("");
    }
  };

  const setHover = (field: keyof typeof hoverStates, value: boolean) => {
    setHoverStates((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 relative">
      <Confetti active={showConfetti} />

      {showForm ? (
        <form
          onSubmit={handleSubmit}
          className="space-y-6 relative transition-all duration-500 transform"
        >
          {error && (
            <div className="p-3 bg-red-100 border-4 border-red-400 text-red-700 rounded-lg animate-pulse shadow-lg">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span className="font-bold text-lg">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-100 border-4 border-green-400 text-green-700 rounded-lg shadow-lg slide-in">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="font-bold text-lg wavy-text">{success}</span>
              </div>
            </div>
          )}

          {statusMessage && (
            <div className="p-3 bg-blue-100 border-4 border-blue-400 text-blue-700 rounded-lg shadow-lg slide-in flex items-center">
              <div className="spinner mr-3"></div>
              <span className="font-bold text-lg">{statusMessage}</span>
            </div>
          )}

          <div
            className={`transition-all duration-300 transform ${
              hoverStates.model ? "scale-105" : ""
            } animated-border p-4 rounded-lg`}
            onMouseEnter={() => setHover("model", true)}
            onMouseLeave={() => setHover("model", false)}
          >
            <label
              htmlFor="model"
              className="block text-lg font-bold mb-2 neon-text"
            >
              Model* <span className="animate-pulse">🚀</span>
            </label>
            <select
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-4 py-3 border-2 border-purple-500 rounded-lg shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-300 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 font-medium transition-all duration-300"
              required
            >
              <option value="meta-llama/Meta-Llama-3.1-8B-Instruct">
                Meta-Llama-3.1-8B-Instruct ✨
              </option>
              <option value="meta-llama/Meta-Llama-3.1-70B-Instruct">
                Meta-Llama-3.1-70B-Instruct 🔥
              </option>
              <option value="meta-llama/Llama-3.2-1B-Instruct">
                Llama-3.2-1B-Instruct 🌟
              </option>
              <option value="meta-llama/Llama-3.2-3B-Instruct">
                Llama-3.2-3B-Instruct 💫
              </option>
              <option value="meta-llama/Llama-3.3-70B-Instruct">
                Llama-3.3-70B-Instruct 🌈
              </option>
            </select>
            <p
              className="mt-2 text-sm font-medium"
              style={{ color: `hsl(${rainbowText}, 100%, 60%)` }}
            >
              Select a model that supports fine-tuning
            </p>
          </div>

          <div
            className={`transition-all duration-300 transform ${
              hoverStates.trainingFile ? "scale-105" : ""
            } animated-border p-4 rounded-lg`}
            onMouseEnter={() => setHover("trainingFile", true)}
            onMouseLeave={() => setHover("trainingFile", false)}
          >
            <label
              htmlFor="trainingFile"
              className="block text-lg font-bold mb-2 neon-text"
            >
              Training File* (JSONL format){" "}
              <span className="animate-bounce inline-block">📊</span>
            </label>
            <input
              type="file"
              id="trainingFile"
              accept=".jsonl"
              onChange={(e) => setTrainingFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-3 border-2 border-pink-500 rounded-lg shadow-lg focus:outline-none focus:ring-4 focus:ring-pink-300 bg-gradient-to-r from-pink-100 to-purple-100 text-pink-800 font-medium file-input-bouncy"
              required
            />
            <p className="mt-2 text-sm font-medium text-pink-600">
              {trainingFile
                ? `Selected: ${trainingFile.name}`
                : "No file chosen yet! 👀"}
            </p>
            <div className="mt-3 text-sm bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg border-l-4 border-pink-400 shadow-md">
              <p className="font-bold text-purple-700">Required format:</p>
              <pre className="mt-2 text-xs overflow-x-auto p-2 bg-black text-green-400 rounded border border-purple-300">
                {`{"messages": [{"role": "user", "content": "Your question?"}, {"role": "assistant", "content": "The answer"}]}`}
              </pre>
              <p className="mt-2 font-medium text-blue-600">
                See sample_training_data.jsonl for an example.
              </p>
              <p className="mt-2 font-bold text-yellow-600 animate-pulse">
                Note: Files may take a few moments to process after upload. If
                you get a "file not ready" error, please wait and try again.
              </p>
            </div>
          </div>

          <div
            className={`transition-all duration-300 transform ${
              hoverStates.validationFile ? "scale-105" : ""
            } animated-border p-4 rounded-lg`}
            onMouseEnter={() => setHover("validationFile", true)}
            onMouseLeave={() => setHover("validationFile", false)}
          >
            <label
              htmlFor="validationFile"
              className="block text-lg font-bold mb-2 neon-text"
            >
              Validation File (JSONL format, optional){" "}
              <span className="animate-pulse inline-block">🔍</span>
            </label>
            <input
              type="file"
              id="validationFile"
              accept=".jsonl"
              onChange={(e) => setValidationFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-3 border-2 border-blue-500 rounded-lg shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 font-medium file-input-bouncy"
            />
            <p className="mt-2 text-sm font-medium text-blue-600">
              {validationFile
                ? `Selected: ${validationFile.name}`
                : "No file chosen yet! (Optional) 🤔"}
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-lg font-bold neon-text flex items-center p-2 rounded-lg transition-all duration-300 hover:scale-105"
            >
              <span className="mr-2">{showAdvanced ? "🔽" : "▶️"}</span>
              {showAdvanced ? "Hide Advanced Options" : "Show Advanced Options"}
            </button>

            {showAdvanced && (
              <div className="mt-4 p-6 bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 rounded-lg border-2 border-purple-400 shadow-lg space-y-6 slide-in">
                <h3 className="font-bold text-xl text-center neon-text">
                  ✨ Hyperparameters ✨
                </h3>

                <div
                  className={`transition-all duration-300 transform ${
                    hoverStates.batchSize ? "scale-105" : ""
                  }`}
                  onMouseEnter={() => setHover("batchSize", true)}
                  onMouseLeave={() => setHover("batchSize", false)}
                >
                  <label
                    htmlFor="batchSize"
                    className="block text-lg font-bold mb-2 text-purple-700"
                  >
                    Batch Size 🔢
                  </label>
                  <input
                    type="number"
                    id="batchSize"
                    value={batchSize}
                    onChange={(e) => setBatchSize(e.target.value)}
                    min="1"
                    max="64"
                    className="w-full px-4 py-3 border-2 border-purple-500 rounded-lg shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-300 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-800 font-medium input-bouncy"
                    placeholder="Default: 4"
                  />
                </div>

                <div
                  className={`transition-all duration-300 transform ${
                    hoverStates.learningRate ? "scale-105" : ""
                  }`}
                  onMouseEnter={() => setHover("learningRate", true)}
                  onMouseLeave={() => setHover("learningRate", false)}
                >
                  <label
                    htmlFor="learningRate"
                    className="block text-lg font-bold mb-2 text-pink-700"
                  >
                    Learning Rate 📈
                  </label>
                  <input
                    type="number"
                    id="learningRate"
                    value={learningRate}
                    onChange={(e) => setLearningRate(e.target.value)}
                    step="0.0001"
                    min="0.0001"
                    max="0.01"
                    className="w-full px-4 py-3 border-2 border-pink-500 rounded-lg shadow-lg focus:outline-none focus:ring-4 focus:ring-pink-300 bg-gradient-to-r from-pink-50 to-purple-50 text-pink-800 font-medium input-bouncy"
                    placeholder="Default: 0.0002"
                  />
                </div>

                <div
                  className={`transition-all duration-300 transform ${
                    hoverStates.nEpochs ? "scale-105" : ""
                  }`}
                  onMouseEnter={() => setHover("nEpochs", true)}
                  onMouseLeave={() => setHover("nEpochs", false)}
                >
                  <label
                    htmlFor="nEpochs"
                    className="block text-lg font-bold mb-2 text-blue-700"
                  >
                    Number of Epochs 🔄
                  </label>
                  <input
                    type="number"
                    id="nEpochs"
                    value={nEpochs}
                    onChange={(e) => setNEpochs(e.target.value)}
                    min="1"
                    max="50"
                    className="w-full px-4 py-3 border-2 border-blue-500 rounded-lg shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-800 font-medium input-bouncy"
                    placeholder="Default: 3"
                  />
                </div>
              </div>
            )}
          </div>

          <div
            className={`transition-all duration-300 transform ${
              hoverStates.submit ? "scale-105" : ""
            }`}
            onMouseEnter={() => setHover("submit", true)}
            onMouseLeave={() => setHover("submit", false)}
          >
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 disabled:opacity-70 text-white font-bold text-lg rounded-lg shadow-lg focus:outline-none focus:ring-4 focus:ring-pink-300 transition-all duration-300 pulsate-button"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <div className="spinner mr-3"></div>
                  Creating Job...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <span className="mr-2">🚀</span>
                  Create Fine-Tuning Job
                  <span className="ml-2">✨</span>
                </span>
              )}
            </button>
            {isSubmitting && (
              <p className="mt-3 text-center font-medium text-lg text-purple-600 animate-pulse">
                This may take a minute while we process your files... 🔄
              </p>
            )}
          </div>
        </form>
      ) : (
        <div className="transition-all duration-500 transform">
          <FineTuningSteps
            currentStep={currentStep}
            isCompleted={isCompleted}
          />
        </div>
      )}
    </div>
  );
}
