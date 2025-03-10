"use client";

import { useState } from "react";
import LoadingSpinner from "./LoadingSpinner";

interface PromptEnhancerProps {
  initialPrompt: string;
  initialNegativePrompt: string;
  onApplyEnhanced: (
    enhancedPrompt: string,
    enhancedNegativePrompt: string
  ) => void;
  onCancel: () => void;
}

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
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Prompt Enhancement</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mb-4">
        <h3 className="font-medium mb-2">Original Prompt</h3>
        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
          {initialPrompt}
        </div>
        {initialNegativePrompt && (
          <div className="mt-2">
            <h3 className="font-medium mb-2">Original Negative Prompt</h3>
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
              {initialNegativePrompt}
            </div>
          </div>
        )}
      </div>

      {!showEnhanced ? (
        <div className="flex justify-between">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={enhancePrompt}
            disabled={isEnhancing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors"
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
          <div className="mb-4">
            <h3 className="font-medium mb-2">Enhanced Prompt</h3>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
              {enhancedPrompt}
            </div>

            <h3 className="font-medium mb-2 mt-4">Enhanced Negative Prompt</h3>
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              {enhancedNegativePrompt}
            </div>

            <h3 className="font-medium mb-2 mt-4">Explanation</h3>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              {explanation}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
            >
              Apply Enhanced Prompt
            </button>
          </div>
        </>
      )}
    </div>
  );
}
