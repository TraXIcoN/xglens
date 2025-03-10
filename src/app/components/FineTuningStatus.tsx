"use client";

import { useState, useEffect } from "react";
import LoadingSpinner from "./LoadingSpinner";

interface FineTuningStatusProps {
  jobId: string;
}

interface JobStatus {
  jobId: string;
  status: string;
  model: string;
  createdAt: string;
  finishedAt?: string;
}

interface JobEvent {
  object: string;
  id: string;
  created_at: number;
  level: string;
  message: string;
  data?: any;
}

interface Checkpoint {
  id: string;
  object: string;
  created_at: number;
  result_files: string[];
}

export default function FineTuningStatus({ jobId }: FineTuningStatusProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [events, setEvents] = useState<JobEvent[]>([]);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [isPolling, setIsPolling] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    fetchStatus();

    // Start polling if the job is active
    if (
      status &&
      ["validating_files", "queued", "running"].includes(status.status)
    ) {
      setIsPolling(true);
      const interval = setInterval(fetchStatus, 15000); // Poll every 15 seconds

      return () => {
        clearInterval(interval);
        setIsPolling(false);
      };
    }
  }, [jobId, status?.status]);

  const fetchStatus = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Fetch job status
      const statusResponse = await fetch(
        `/api/fine-tune?jobId=${jobId}&action=status`
      );

      if (!statusResponse.ok) {
        const errorData = await statusResponse.json();
        throw new Error(errorData.error || "Failed to fetch job status");
      }

      const statusData = await statusResponse.json();
      setStatus(statusData.status);

      // Fetch job events
      const eventsResponse = await fetch(
        `/api/fine-tune?jobId=${jobId}&action=events`
      );

      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setEvents(eventsData.events || []);
      }

      // Fetch job checkpoints if the job is completed
      if (statusData.status.status === "succeeded") {
        const checkpointsResponse = await fetch(
          `/api/fine-tune?jobId=${jobId}&action=checkpoints`
        );

        if (checkpointsResponse.ok) {
          const checkpointsData = await checkpointsResponse.json();
          setCheckpoints(checkpointsData.checkpoints || []);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      console.error("Error fetching job status:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadCheckpointFile = async (fileId: string, filename: string) => {
    setDownloadStatus((prev) => ({ ...prev, [fileId]: "downloading" }));

    try {
      const response = await fetch(
        `/api/fine-tune?jobId=${jobId}&action=download&fileId=${fileId}&filename=${filename}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to download checkpoint file"
        );
      }

      const data = await response.json();

      // Create a download link
      const link = document.createElement("a");
      link.href = data.filePath;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadStatus((prev) => ({ ...prev, [fileId]: "downloaded" }));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      console.error("Error downloading checkpoint file:", err);
      setDownloadStatus((prev) => ({ ...prev, [fileId]: "error" }));
    }
  };

  const formatDate = (timestamp: number | string) => {
    const date =
      typeof timestamp === "number"
        ? new Date(timestamp * 1000)
        : new Date(timestamp);
    return date.toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "validating_files":
        return "bg-blue-100 text-blue-800";
      case "queued":
        return "bg-yellow-100 text-yellow-800";
      case "running":
        return "bg-purple-100 text-purple-800";
      case "succeeded":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading && !status) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Fine-tuning Job Status</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {status && (
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Job Information</h3>
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded">
                <p>
                  <strong>Job ID:</strong> {status.jobId}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                      status.status
                    )}`}
                  >
                    {status.status}
                  </span>
                  {isPolling && (
                    <span className="ml-2 inline-flex items-center">
                      <LoadingSpinner size="small" />
                      <span className="ml-1 text-xs">Updating...</span>
                    </span>
                  )}
                </p>
                <p>
                  <strong>Model:</strong> {status.model}
                </p>
                <p>
                  <strong>Created:</strong> {formatDate(status.createdAt)}
                </p>
                {status.finishedAt && (
                  <p>
                    <strong>Finished:</strong> {formatDate(status.finishedAt)}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Actions</h3>
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded">
                <button
                  onClick={fetchStatus}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  Refresh Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {events.length > 0 && (
        <div className="mb-6">
          <h3 className="font-medium mb-2">Job Events</h3>
          <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Message
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {events.map((event) => (
                  <tr key={event.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(event.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          event.level === "info"
                            ? "bg-blue-100 text-blue-800"
                            : event.level === "warning"
                            ? "bg-yellow-100 text-yellow-800"
                            : event.level === "error"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {event.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {event.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {checkpoints.length > 0 && (
        <div>
          <h3 className="font-medium mb-2">Checkpoints</h3>
          <div className="space-y-4">
            {checkpoints.map((checkpoint) => (
              <div
                key={checkpoint.id}
                className="bg-gray-100 dark:bg-gray-700 p-4 rounded"
              >
                <p>
                  <strong>Checkpoint ID:</strong> {checkpoint.id}
                </p>
                <p>
                  <strong>Created:</strong> {formatDate(checkpoint.created_at)}
                </p>
                <div className="mt-2">
                  <h4 className="font-medium mb-1">Files:</h4>
                  <ul className="space-y-2">
                    {checkpoint.result_files.map((fileId) => (
                      <li key={fileId} className="flex items-center">
                        <span className="mr-2">{fileId}</span>
                        <button
                          onClick={() =>
                            downloadCheckpointFile(
                              fileId,
                              `${checkpoint.id}_${fileId}.bin`
                            )
                          }
                          disabled={downloadStatus[fileId] === "downloading"}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm rounded-md transition-colors"
                        >
                          {downloadStatus[fileId] === "downloading" ? (
                            <div className="flex items-center">
                              <LoadingSpinner size="small" />
                              <span className="ml-1">Downloading...</span>
                            </div>
                          ) : downloadStatus[fileId] === "downloaded" ? (
                            "Downloaded"
                          ) : downloadStatus[fileId] === "error" ? (
                            "Retry Download"
                          ) : (
                            "Download"
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
