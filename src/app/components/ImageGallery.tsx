"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import LoadingSpinner from "./LoadingSpinner";

interface GalleryImage {
  id: string;
  request_id: string;
  image_url: string;
  prompt: string;
  created_at: string;
}

export default function ImageGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchGalleryImages();

    // Set up an interval to refresh the gallery every 10 seconds
    const refreshInterval = setInterval(fetchGalleryImages, 10000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(refreshInterval);
  }, []);

  const fetchGalleryImages = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Fetch completed logs with images that are saved to gallery
      const response = await fetch(
        "/api/logs?status=completed&galleryOnly=true&limit=50"
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch gallery images");
      }

      const data = await response.json();

      // Extract unique images from logs
      const uniqueImages: GalleryImage[] = [];
      const requestIds = new Set();

      // Process logs to extract images
      if (data.logs && Array.isArray(data.logs)) {
        data.logs.forEach((log: any) => {
          if (log.image_url && !requestIds.has(log.request_id)) {
            requestIds.add(log.request_id);
            uniqueImages.push({
              id: log.id,
              request_id: log.request_id,
              image_url: log.image_url,
              prompt: log.prompt,
              created_at: log.created_at,
            });
          }
        });
      }

      setImages(uniqueImages);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      console.error("Error fetching gallery images:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p className="font-bold">Error loading gallery</p>
        <p>{error}</p>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Your Gallery is Empty</h3>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Generate some images and save them to your gallery to see them here.
        </p>
        <Link
          href="/generate"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
        >
          Create Images
        </Link>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Generated Images</h2>
        <Link
          href="/generate"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
        >
          Create More
        </Link>
      </div>

      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="break-inside-avoid bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
          >
            <Link href={`/logs/${image.request_id}`}>
              <div className="relative group">
                <img
                  src={image.image_url}
                  alt={image.prompt}
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-center p-4">
                    <span className="bg-black bg-opacity-70 px-2 py-1 rounded">
                      View Generation Process
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {formatDate(image.created_at)}
                </p>
                <p className="line-clamp-2 text-sm">{image.prompt}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
