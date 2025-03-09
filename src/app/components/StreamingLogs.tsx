"use client";

import { useState, useEffect } from "react";
import LoadingSpinner from "./LoadingSpinner";

interface LogEntry {
  id: string;
  request_id: string;
  user_id: string;
  prompt: string;
  status: "started" | "processing" | "completed" | "failed";
  step: string;
  details: any;
  image_url: string | null;
  created_at: string;
}

interface StreamingLogsProps {
  requestId: string;
}

export default function StreamingLogs({ requestId }: StreamingLogsProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingComplete, setStreamingComplete] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [requestId]);

  const fetchLogs = async () => {
    setIsLoading(true);
    setError("");
    setCurrentIndex(0);
    setIsStreaming(false);
    setStreamingComplete(false);

    try {
      const response = await fetch(`/api/logs?requestId=${requestId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch logs");
      }

      const data = await response.json();

      if (data.logs && Array.isArray(data.logs)) {
        // Sort logs by creation time
        const sortedLogs = [...data.logs].sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        setLogs(sortedLogs);

        // Start streaming after a short delay
        setTimeout(() => {
          setIsStreaming(true);
        }, 500);
      } else {
        setLogs([]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      console.error("Error fetching logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to handle streaming of logs
  useEffect(() => {
    if (!isStreaming || currentIndex >= logs.length) {
      if (isStreaming && currentIndex >= logs.length) {
        setStreamingComplete(true);
      }
      return;
    }

    const timer = setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 800); // Show a new log entry every 800ms

    return () => clearTimeout(timer);
  }, [isStreaming, currentIndex, logs.length]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "started":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p className="font-bold">Error loading logs</p>
        <p>{error}</p>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No logs found for this request
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Generation Process</h2>
        {!streamingComplete && (
          <button
            onClick={() => {
              setCurrentIndex(logs.length);
              setStreamingComplete(true);
            }}
            className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Skip Animation
          </button>
        )}
      </div>

      <div className="mb-6">
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded">
          <p>
            <strong>Request ID:</strong> {requestId}
          </p>
          <p>
            <strong>Prompt:</strong> {logs[0]?.prompt}
          </p>
          <p>
            <strong>Started:</strong> {formatDate(logs[0]?.created_at)}
          </p>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
        <ul className="space-y-4">
          {logs.slice(0, currentIndex).map((log, index) => (
            <li key={log.id} className="relative pl-10 animate-fadeIn">
              <div className="absolute left-0 top-1.5 w-8 h-8 rounded-full flex items-center justify-center bg-blue-500 text-white">
                {index + 1}
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded">
                <div className="flex justify-between mb-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                      log.status
                    )}`}
                  >
                    {log.status}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(log.created_at)}
                  </span>
                </div>
                <p className="font-medium">{log.step}</p>
                {log.details && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Details:
                    </p>
                    <pre className="mt-1 text-xs bg-gray-200 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {currentIndex < logs.length && (
        <div className="flex justify-center mt-6">
          <LoadingSpinner size="medium" />
        </div>
      )}

      {streamingComplete && logs.some((log) => log.image_url) && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Generated Image</h3>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded flex justify-center">
            <img
              src={logs.find((log) => log.image_url)?.image_url || ""}
              alt="Generated image"
              className="max-h-64 object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
