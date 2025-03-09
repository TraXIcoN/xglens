"use client";

import { useState } from "react";

interface GeneratedImageProps {
  imageUrl: string;
  requestId: string;
  onDownload?: () => void;
  onSave?: () => void;
}

export default function GeneratedImage({
  imageUrl,
  requestId,
  onDownload = () => {},
  onSave = () => {},
}: GeneratedImageProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  const handleSaveToGallery = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError("");

    try {
      // Call the API to mark this image as saved to gallery
      const response = await fetch("/api/gallery/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId,
          imageUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save to gallery");
      }

      setSaveSuccess(true);

      // Call the parent component's onSave callback
      onSave();
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      console.error("Error saving to gallery:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Generated Image</h2>
      <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden">
        <img
          src={imageUrl}
          alt="Generated image"
          className="w-full h-full object-contain"
        />
      </div>

      {saveError && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {saveError}
        </div>
      )}

      {saveSuccess && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          Image saved to gallery successfully!
        </div>
      )}

      <div className="mt-4 flex justify-end space-x-4">
        <button
          onClick={onDownload}
          className="py-2 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors"
        >
          Download
        </button>
        <button
          onClick={handleSaveToGallery}
          disabled={isSaving || saveSuccess}
          className={`py-2 px-4 rounded-md transition-colors ${
            saveSuccess
              ? "bg-green-500 text-white cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {isSaving
            ? "Saving..."
            : saveSuccess
            ? "Saved to Gallery"
            : "Save to Gallery"}
        </button>
      </div>
    </div>
  );
}
