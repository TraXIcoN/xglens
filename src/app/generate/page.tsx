"use client";

import { useState } from "react";
import GeneratedImage from "../components/GeneratedImage";
import Navigation from "../components/Navigation";
import LoadingSpinner from "../components/LoadingSpinner";
import Link from "next/link";

interface GenerationResponse {
  success: boolean;
  imageUrl: string;
  requestId: string;
  metadata: {
    prompt: string;
    diffusionStrength: number;
    styleIntensity: number;
    style: string;
    generatedAt: string;
  };
  logs: Array<{
    step: string;
    timestamp: string;
  }>;
}

export default function GeneratePage() {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [diffusionStrength, setDiffusionStrength] = useState(0.7);
  const [styleIntensity, setStyleIntensity] = useState(0.5);
  const [selectedStyle, setSelectedStyle] = useState("realistic");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState("");
  const [requestId, setRequestId] = useState("");
  const [generationLogs, setGenerationLogs] = useState<
    Array<{ step: string; timestamp: string }>
  >([]);
  const [error, setError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const styles = [
    { id: "realistic", name: "Realistic" },
    { id: "cartoon", name: "Cartoon" },
    { id: "abstract", name: "Abstract" },
    { id: "sketch", name: "Sketch" },
    { id: "watercolor", name: "Watercolor" },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError("");
    setGenerationLogs([]);
    setGeneratedImage("");
    setRequestId("");
    setSaveSuccess(false);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          negative_prompt: negativePrompt,
          diffusionStrength,
          styleIntensity,
          style: selectedStyle,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate image");
      }

      const data: GenerationResponse = await response.json();
      setGeneratedImage(data.imageUrl);
      setRequestId(data.requestId);
      setGenerationLogs(data.logs || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      console.error("Error generating image:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;

    // Create a temporary anchor element
    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `generated-image-${requestId || Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = () => {
    setSaveSuccess(true);
    // Optionally, you could refresh the gallery here or show a notification
  };

  return (
    <div className="min-h-screen p-8">
      <Navigation />

      <main className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Customization & Generation
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="prompt" className="block mb-2 font-medium">
              Prompt
            </label>
            <textarea
              id="prompt"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              rows={3}
              placeholder="Describe the image you want to generate..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="negative-prompt" className="block mb-2 font-medium">
              Negative Prompt (what to avoid)
            </label>
            <textarea
              id="negative-prompt"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              rows={2}
              placeholder="Elements you want to exclude from the image..."
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label
                htmlFor="diffusion-strength"
                className="block mb-2 font-medium"
              >
                Diffusion Strength: {diffusionStrength.toFixed(2)}
              </label>
              <input
                id="diffusion-strength"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={diffusionStrength}
                onChange={(e) =>
                  setDiffusionStrength(parseFloat(e.target.value))
                }
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <label
                htmlFor="style-intensity"
                className="block mb-2 font-medium"
              >
                Style Intensity: {styleIntensity.toFixed(2)}
              </label>
              <input
                id="style-intensity"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={styleIntensity}
                onChange={(e) => setStyleIntensity(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="style" className="block mb-2 font-medium">
              Style
            </label>
            <select
              id="style"
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {styles.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors"
          >
            {isGenerating ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="small" />
                <span className="ml-2">Generating...</span>
              </div>
            ) : (
              "Generate Image"
            )}
          </button>
        </div>

        {isGenerating && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8 flex flex-col items-center">
            <p className="mb-4 text-center">Creating your image...</p>
            <LoadingSpinner size="large" />
          </div>
        )}

        {!isGenerating && generatedImage && (
          <>
            <GeneratedImage
              imageUrl={generatedImage}
              requestId={requestId}
              onDownload={handleDownload}
              onSave={handleSave}
            />

            {saveSuccess && (
              <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                <p className="font-bold">Image saved to gallery!</p>
                <p>
                  You can view it on the{" "}
                  <Link href="/" className="underline">
                    home page
                  </Link>
                  .
                </p>
              </div>
            )}

            {generationLogs.length > 0 && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mt-8">
                <h2 className="text-xl font-semibold mb-4">Generation Logs</h2>
                <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Step
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Timestamp
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {generationLogs.map((log, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {log.step}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  <p>Request ID: {requestId}</p>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
