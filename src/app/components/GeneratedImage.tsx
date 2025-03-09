"use client";

interface GeneratedImageProps {
  imageUrl: string;
  onDownload?: () => void;
  onSave?: () => void;
}

export default function GeneratedImage({
  imageUrl,
  onDownload = () => {},
  onSave = () => {},
}: GeneratedImageProps) {
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
      <div className="mt-4 flex justify-end space-x-4">
        <button
          onClick={onDownload}
          className="py-2 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors"
        >
          Download
        </button>
        <button
          onClick={onSave}
          className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
        >
          Save to Gallery
        </button>
      </div>
    </div>
  );
}
