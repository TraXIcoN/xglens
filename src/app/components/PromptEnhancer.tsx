"use client";

import { useState, useEffect } from "react";
import LoadingSpinner from "./LoadingSpinner";
import Confetti from "./Confetti";
import AnimatedBackground from "./AnimatedBackground";

interface PromptEnhancerProps {
  initialPrompt: string;
  initialNegativePrompt: string;
  onApplyEnhanced: (
    enhancedPrompt: string,
    enhancedNegativePrompt: string
  ) => void;
  onCancel: () => void;
}

// Wavy text animation component
const WavyText = ({ text }: { text: string }) => {
  return (
    <span className="inline-block">
      {text.split("").map((char, i) => (
        <span
          key={i}
          className="inline-block animate-wave"
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          {char}
        </span>
      ))}
    </span>
  );
};

export default function PromptEnhancer({
  initialPrompt,
  initialNegativePrompt,
  onApplyEnhanced,
  onCancel,
}: PromptEnhancerProps) {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [error, setError] = useState("");
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [enhancedNegativePrompt, setEnhancedNegativePrompt] = useState("");
  const [explanation, setExplanation] = useState("");
  const [showEnhanced, setShowEnhanced] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hoverStates, setHoverStates] = useState({
    cancel: false,
    enhance: false,
    apply: false,
  });

  const enhancePrompt = async () => {
    setIsEnhancing(true);
    setError("");

    try {
      const response = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: initialPrompt,
          negativePrompt: initialNegativePrompt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to enhance prompt");
      }

      const data = await response.json();
      setEnhancedPrompt(data.enhancedPrompt);
      setEnhancedNegativePrompt(data.negativePrompt);
      setExplanation(data.explanation);
      setShowEnhanced(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      console.error("Error enhancing prompt:", err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleApply = () => {
    onApplyEnhanced(enhancedPrompt, enhancedNegativePrompt);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
  };

  return (
    <div className="relative min-h-[500px] w-full overflow-hidden rounded-xl bg-[#0f1a36] p-8 shadow-[0_0_15px_rgba(0,0,0,0.3)] transition-all duration-300">
      <AnimatedBackground />
      <Confetti active={showConfetti} />

      <h2 className="mb-6 text-center text-3xl font-bold text-white">
        <WavyText text="Prompt Enhancement" />
      </h2>

      {error && (
        <div className="mb-4 animate-slide-in rounded border border-red-400 bg-red-100/10 p-3 text-red-400">
          {error}
        </div>
      )}

      <div className="mb-6 space-y-4">
        <div className="transform transition-all duration-300 hover:scale-[1.02]">
          <h3 className="mb-2 font-medium text-white">Original Prompt</h3>
          <div className="rounded-md border border-white/20 bg-black/30 p-4 text-white backdrop-blur-sm">
            {initialPrompt}
          </div>
        </div>

        {initialNegativePrompt && (
          <div className="mt-4 transform transition-all duration-300 hover:scale-[1.02]">
            <h3 className="mb-2 font-medium text-white">
              Original Negative Prompt
            </h3>
            <div className="rounded-md border border-white/20 bg-black/30 p-4 text-white backdrop-blur-sm">
              {initialNegativePrompt}
            </div>
          </div>
        )}
      </div>

      {!showEnhanced ? (
        <div className="flex justify-between">
          <button
            onClick={onCancel}
            onMouseEnter={() =>
              setHoverStates((prev) => ({ ...prev, cancel: true }))
            }
            onMouseLeave={() =>
              setHoverStates((prev) => ({ ...prev, cancel: false }))
            }
            className={`transform rounded-md bg-white/10 px-6 py-3 text-white transition-all duration-300 hover:scale-105 hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] ${
              hoverStates.cancel ? "animate-pulse" : ""
            }`}
          >
            Cancel
          </button>
          <button
            onClick={enhancePrompt}
            disabled={isEnhancing}
            onMouseEnter={() =>
              setHoverStates((prev) => ({ ...prev, enhance: true }))
            }
            onMouseLeave={() =>
              setHoverStates((prev) => ({ ...prev, enhance: false }))
            }
            className={`transform rounded-md bg-blue-600 px-6 py-3 text-white transition-all duration-300 hover:scale-105 hover:bg-blue-700 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] disabled:bg-blue-400 ${
              hoverStates.enhance ? "animate-pulse" : ""
            }`}
          >
            {isEnhancing ? (
              <div className="flex items-center">
                <LoadingSpinner size="small" />
                <span className="ml-2">Enhancing...</span>
              </div>
            ) : (
              "Enhance Prompt"
            )}
          </button>
        </div>
      ) : (
        <>
          <div className="mb-6 space-y-6">
            <div className="transform transition-all duration-300 hover:scale-[1.02]">
              <h3 className="mb-2 font-medium text-white">Enhanced Prompt</h3>
              <div className="rounded-md border border-blue-400/30 bg-blue-500/10 p-4 text-white backdrop-blur-sm">
                {enhancedPrompt}
              </div>
            </div>

            <div className="transform transition-all duration-300 hover:scale-[1.02]">
              <h3 className="mb-2 font-medium text-white">
                Enhanced Negative Prompt
              </h3>
              <div className="rounded-md border border-red-400/30 bg-red-500/10 p-4 text-white backdrop-blur-sm">
                {enhancedNegativePrompt}
              </div>
            </div>

            <div className="transform transition-all duration-300 hover:scale-[1.02]">
              <h3 className="mb-2 font-medium text-white">Explanation</h3>
              <div className="rounded-md border border-white/30 bg-white/5 p-4 text-white backdrop-blur-sm">
                {explanation}
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={onCancel}
              onMouseEnter={() =>
                setHoverStates((prev) => ({ ...prev, cancel: true }))
              }
              onMouseLeave={() =>
                setHoverStates((prev) => ({ ...prev, cancel: false }))
              }
              className={`transform rounded-md bg-white/10 px-6 py-3 text-white transition-all duration-300 hover:scale-105 hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] ${
                hoverStates.cancel ? "animate-pulse" : ""
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              onMouseEnter={() =>
                setHoverStates((prev) => ({ ...prev, apply: true }))
              }
              onMouseLeave={() =>
                setHoverStates((prev) => ({ ...prev, apply: false }))
              }
              className={`transform rounded-md bg-blue-600 px-6 py-3 text-white transition-all duration-300 hover:scale-105 hover:bg-blue-700 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] ${
                hoverStates.apply ? "animate-pulse" : ""
              }`}
            >
              Apply Enhanced Prompt
            </button>
          </div>
        </>
      )}
    </div>
  );
}
