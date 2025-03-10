"use client";

import { useState, useEffect } from "react";
import GeneratedImage from "../components/GeneratedImage";
import Navigation from "../components/Navigation";
import LoadingSpinner from "../components/LoadingSpinner";
import PromptEnhancer from "../components/PromptEnhancer";
import AnimatedBackground from "../components/AnimatedBackground";
import Link from "next/link";
import Confetti from "../components/Confetti";

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

// Wavy text component for animated headings
const WavyText = ({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) => {
  return (
    <span className={`wavy-text ${className}`}>
      {text.split("").map((char, index) => (
        <span key={index} style={{ animationDelay: `${index * 0.05}s` }}>
          {char}
        </span>
      ))}
    </span>
  );
};

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
  const [showEnhancer, setShowEnhancer] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hoverStates, setHoverStates] = useState({
    generateButton: false,
    enhanceButton: false,
    downloadButton: false,
    saveButton: false,
  });
  const [pulseEffect, setPulseEffect] = useState(false);

  const styles = [
    { id: "realistic", name: "Realistic" },
    { id: "cartoon", name: "Cartoon" },
    { id: "abstract", name: "Abstract" },
    { id: "sketch", name: "Sketch" },
    { id: "watercolor", name: "Watercolor" },
  ];

  // Pulse effect for the generate button
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseEffect((prev) => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

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

  const handleSave = async () => {
    try {
      const response = await fetch("/api/gallery/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId,
          imageUrl: generatedImage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save to gallery");
      }

      setSaveSuccess(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      console.error("Error saving to gallery:", err);
    }
  };

  const handleEnhancePrompt = () => {
    setShowEnhancer(true);
  };

  const handleCancelEnhance = () => {
    setShowEnhancer(false);
  };

  const handleApplyEnhanced = (
    enhancedPrompt: string,
    enhancedNegativePrompt: string
  ) => {
    setPrompt(enhancedPrompt);
    setNegativePrompt(enhancedNegativePrompt);
    setShowEnhancer(false);
  };

  const setHover = (field: keyof typeof hoverStates, value: boolean) => {
    setHoverStates((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-[#050b1f] text-white">
      <AnimatedBackground />
      <Confetti active={showConfetti} />
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        {showEnhancer ? (
          <PromptEnhancer
            initialPrompt={prompt}
            initialNegativePrompt={negativePrompt}
            onApplyEnhanced={handleApplyEnhanced}
            onCancel={handleCancelEnhance}
          />
        ) : (
          <div className="bg-[#081231]/60 p-6 rounded-lg shadow-2xl mb-8 backdrop-blur-sm animated-border">
            <h2 className="text-2xl font-bold mb-6 neon-text">
              <WavyText text="Customization & Generation" />
            </h2>

            {error && (
              <div className="mb-6 p-4 bg-slate-900/60 border-4 border-slate-600 text-white rounded-lg animate-pulse shadow-lg slide-in">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-3 text-slate-400"
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

            <div className="mb-6 transform transition-all duration-300 hover:scale-102">
              <div className="flex justify-between items-center mb-3">
                <label
                  htmlFor="prompt"
                  className="text-lg font-bold text-blue-300"
                >
                  Prompt <span className="animate-pulse">✨</span>
                </label>
                {prompt.trim() && (
                  <button
                    onClick={handleEnhancePrompt}
                    className={`px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all duration-300 transform ${
                      hoverStates.enhanceButton ? "scale-110" : ""
                    }`}
                    onMouseEnter={() => setHover("enhanceButton", true)}
                    onMouseLeave={() => setHover("enhanceButton", false)}
                  >
                    <span className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      Enhance Prompt
                    </span>
                  </button>
                )}
              </div>
              <textarea
                id="prompt"
                className="w-full p-4 border-2 border-blue-700 rounded-lg bg-[#0a1845]/70 text-white font-medium shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500 transition-all duration-300 input-bouncy"
                rows={3}
                placeholder="Describe the image you want to generate..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            <div className="mb-6 transform transition-all duration-300 hover:scale-102">
              <label
                htmlFor="negative-prompt"
                className="block mb-3 text-lg font-bold text-blue-300"
              >
                Negative Prompt <span className="text-sm">(what to avoid)</span>
              </label>
              <textarea
                id="negative-prompt"
                className="w-full p-4 border-2 border-blue-700 rounded-lg bg-[#0a1845]/70 text-white font-medium shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500 transition-all duration-300 input-bouncy"
                rows={2}
                placeholder="Elements you want to exclude from the image..."
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-[#0a1845]/60 p-5 rounded-lg border-2 border-blue-700 shadow-lg transform transition-all duration-300 hover:scale-105">
                <label
                  htmlFor="diffusion-strength"
                  className="block mb-3 text-lg font-bold text-blue-300"
                >
                  Diffusion Strength:{" "}
                  <span className="text-white">
                    {diffusionStrength.toFixed(2)}
                  </span>
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
                  className="w-full h-3 bg-blue-900 rounded-lg appearance-none cursor-pointer"
                />
                <div className="w-full flex justify-between mt-2 text-sm text-blue-300">
                  <span>0.00</span>
                  <span>0.50</span>
                  <span>1.00</span>
                </div>
              </div>

              <div className="bg-[#0a1845]/60 p-5 rounded-lg border-2 border-blue-700 shadow-lg transform transition-all duration-300 hover:scale-105">
                <label
                  htmlFor="style-intensity"
                  className="block mb-3 text-lg font-bold text-blue-300"
                >
                  Style Intensity:{" "}
                  <span className="text-white">
                    {styleIntensity.toFixed(2)}
                  </span>
                </label>
                <input
                  id="style-intensity"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={styleIntensity}
                  onChange={(e) =>
                    setStyleIntensity(parseFloat(e.target.value))
                  }
                  className="w-full h-3 bg-blue-900 rounded-lg appearance-none cursor-pointer"
                />
                <div className="w-full flex justify-between mt-2 text-sm text-blue-300">
                  <span>0.00</span>
                  <span>0.50</span>
                  <span>1.00</span>
                </div>
              </div>
            </div>

            <div className="mb-8 bg-[#0a1845]/60 p-5 rounded-lg border-2 border-blue-700 shadow-lg transform transition-all duration-300 hover:scale-105">
              <label
                htmlFor="style"
                className="block mb-3 text-lg font-bold text-blue-300"
              >
                Style
              </label>
              <select
                id="style"
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full p-4 border-2 border-blue-700 rounded-lg bg-[#081231]/70 text-white font-medium shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500 transition-all duration-300"
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
              className={`w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-lg rounded-lg shadow-lg transition-all duration-300 transform ${
                hoverStates.generateButton && !isGenerating && prompt.trim()
                  ? "scale-105"
                  : ""
              } ${
                pulseEffect && !isGenerating && prompt.trim()
                  ? "pulsating-btn"
                  : ""
              }`}
              onMouseEnter={() => setHover("generateButton", true)}
              onMouseLeave={() => setHover("generateButton", false)}
            >
              {isGenerating ? (
                <div className="flex items-center justify-center">
                  <div className="spinner mr-3"></div>
                  <span>Generating Your Masterpiece...</span>
                </div>
              ) : (
                <span className="flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Generate Image
                </span>
              )}
            </button>
          </div>
        )}

        {isGenerating && (
          <div className="bg-[#081231]/60 p-8 rounded-lg shadow-2xl mb-8 backdrop-blur-sm animated-border flex flex-col items-center slide-in">
            <p className="mb-6 text-xl font-bold text-center neon-text">
              Creating your image...
            </p>
            <div className="spinner"></div>
            <div className="mt-6 text-blue-300 text-center">
              <p className="mb-2">
                This may take a moment while we craft your masterpiece
              </p>
              <p>Our AI is hard at work bringing your vision to life</p>
            </div>
          </div>
        )}

        {!isGenerating && generatedImage && (
          <>
            <div className="bg-[#081231]/60 p-6 rounded-lg shadow-2xl mb-8 backdrop-blur-sm animated-border slide-in">
              <h2 className="text-2xl font-bold mb-6 neon-text">
                <WavyText text="Your Generated Masterpiece" />
              </h2>

              <div className="flex flex-col items-center mb-6">
                <div className="relative w-full max-w-2xl mx-auto mb-6 transform transition-all duration-500 hover:scale-102">
                  <div className="absolute inset-0 border-4 border-blue-500 rounded-lg animate-pulse"></div>
                  <img
                    src={generatedImage}
                    alt="Generated image"
                    className="w-full rounded-lg border-2 border-blue-700 shadow-2xl"
                  />
                </div>

                <div className="flex space-x-4 mt-4">
                  <button
                    onClick={handleDownload}
                    className={`px-6 py-3 bg-[#0a1845] border-2 border-blue-700 text-white rounded-lg font-bold shadow-lg transition-all duration-300 transform ${
                      hoverStates.downloadButton ? "scale-110" : ""
                    }`}
                    onMouseEnter={() => setHover("downloadButton", true)}
                    onMouseLeave={() => setHover("downloadButton", false)}
                  >
                    <span className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Download Image
                    </span>
                  </button>

                  <button
                    onClick={handleSave}
                    className={`px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-lg transition-all duration-300 transform ${
                      hoverStates.saveButton ? "scale-110" : ""
                    } pulsating-btn`}
                    onMouseEnter={() => setHover("saveButton", true)}
                    onMouseLeave={() => setHover("saveButton", false)}
                  >
                    <span className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                        />
                      </svg>
                      Save to Gallery
                    </span>
                  </button>
                </div>
              </div>

              <div className="bg-[#0a1845]/60 p-5 rounded-lg border-2 border-blue-700 shadow-lg">
                <h3 className="text-lg font-bold mb-3 text-blue-300">
                  Image Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="mb-2">
                      <span className="font-bold text-blue-300">Prompt:</span>{" "}
                      {prompt}
                    </p>
                    {negativePrompt && (
                      <p className="mb-2">
                        <span className="font-bold text-blue-300">
                          Negative Prompt:
                        </span>{" "}
                        {negativePrompt}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="mb-2">
                      <span className="font-bold text-blue-300">Style:</span>{" "}
                      {styles.find((s) => s.id === selectedStyle)?.name}
                    </p>
                    <p className="mb-2">
                      <span className="font-bold text-blue-300">
                        Diffusion Strength:
                      </span>{" "}
                      {diffusionStrength.toFixed(2)}
                    </p>
                    <p>
                      <span className="font-bold text-blue-300">
                        Style Intensity:
                      </span>{" "}
                      {styleIntensity.toFixed(2)}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-xs font-mono text-blue-300">
                  Request ID: {requestId}
                </p>
              </div>
            </div>

            {saveSuccess && (
              <div className="mt-4 p-5 bg-[#0a1845]/60 border-2 border-blue-500 text-white rounded-lg shadow-lg slide-in">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-3 text-blue-400"
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
                  <div>
                    <p className="font-bold text-lg">Image saved to gallery!</p>
                    <p>
                      You can view it on the{" "}
                      <Link
                        href="/"
                        className="text-blue-400 hover:text-blue-300 underline"
                      >
                        home page
                      </Link>
                      .
                    </p>
                  </div>
                </div>
              </div>
            )}

            {generationLogs.length > 0 && (
              <div className="bg-[#081231]/60 p-6 rounded-lg shadow-2xl mt-8 backdrop-blur-sm animated-border slide-in">
                <h2 className="text-2xl font-bold mb-6 neon-text">
                  <WavyText text="Generation Logs" />
                </h2>
                <div className="border-2 border-blue-700 rounded-lg overflow-hidden shadow-lg">
                  <table className="min-w-full divide-y divide-blue-700">
                    <thead className="bg-[#0a1845]/70">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold text-blue-300 uppercase tracking-wider">
                          Step
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-blue-300 uppercase tracking-wider">
                          Timestamp
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-[#081231]/70 divide-y divide-blue-700">
                      {generationLogs.map((log, index) => (
                        <tr
                          key={index}
                          className="hover:bg-[#0a1845] transition-all duration-300"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {log.step}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-300 font-mono">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 text-sm text-blue-300 font-mono">
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
