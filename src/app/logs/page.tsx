"use client";

import { useState, useEffect } from "react";
import Navigation from "../components/Navigation";
import LoadingSpinner from "../components/LoadingSpinner";
import Link from "next/link";

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

interface LogsResponse {
  logs: LogEntry[];
  groupedLogs: Record<string, LogEntry[]>;
  count: number;
  limit: number;
  offset: number;
  tableExists: boolean;
  message?: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [groupedLogs, setGroupedLogs] = useState<Record<string, LogEntry[]>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [tableExists, setTableExists] = useState(true);
  const [tableMessage, setTableMessage] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null
  );

  useEffect(() => {
    fetchLogs();
  }, [limit, offset]);

  const fetchLogs = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/logs?limit=${limit}&offset=${offset}${
          selectedRequestId ? `&requestId=${selectedRequestId}` : ""
        }`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch logs");
      }

      const data: LogsResponse = await response.json();
      setLogs(data.logs);
      setGroupedLogs(data.groupedLogs);
      setTotalCount(data.count || 0);
      setTableExists(data.tableExists);
      setTableMessage(data.message || "");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      console.error("Error fetching logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextPage = () => {
    if (offset + limit < totalCount) {
      setOffset(offset + limit);
    }
  };

  const handlePrevPage = () => {
    if (offset - limit >= 0) {
      setOffset(Math.max(0, offset - limit));
    }
  };

  const handleRequestClick = (requestId: string) => {
    setSelectedRequestId(requestId === selectedRequestId ? null : requestId);
  };

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

  const processLogsForDisplay = () => {
    const seenRequestIds = new Map<string, boolean>();

    const sortedLogs = [...logs].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    return sortedLogs.map((log) => {
      const isFirstOccurrence = !seenRequestIds.has(log.request_id);

      if (isFirstOccurrence) {
        seenRequestIds.set(log.request_id, true);
      }

      return {
        ...log,
        isFirstOccurrence,
      };
    });
  };

  const processedLogs = processLogsForDisplay();

  return (
    <div className="min-h-screen p-8">
      <Navigation />

      <main className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h1 className="text-2xl font-bold mb-4">Generation Logs</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {!tableExists && (
            <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded">
              <h3 className="font-bold mb-2">Database Table Not Found</h3>
              <p className="mb-2">
                {tableMessage ||
                  "The generation_logs table does not exist in your Supabase database."}
              </p>
              <p className="mb-4">
                You need to create the table in your Supabase database to store
                and view logs.
              </p>

              <div className="bg-white p-4 rounded border border-gray-300 mb-4">
                <h4 className="font-bold mb-2">SQL to Create Table:</h4>
                <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                  {`-- Create the generation_logs table
CREATE TABLE public.generation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL,
  user_id TEXT NOT NULL,
  prompt TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('started', 'processing', 'completed', 'failed')),
  step TEXT NOT NULL,
  details JSONB,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_generation_logs_request_id ON public.generation_logs(request_id);
CREATE INDEX idx_generation_logs_user_id ON public.generation_logs(user_id);
CREATE INDEX idx_generation_logs_status ON public.generation_logs(status);
CREATE INDEX idx_generation_logs_created_at ON public.generation_logs(created_at);`}
                </pre>
              </div>

              <p className="mb-2">To create this table:</p>
              <ol className="list-decimal list-inside mb-4 ml-4">
                <li className="mb-1">Log in to your Supabase dashboard</li>
                <li className="mb-1">Navigate to the SQL Editor</li>
                <li className="mb-1">
                  Create a new query and paste the SQL above
                </li>
                <li>Run the query</li>
              </ol>

              <div className="flex justify-end">
                <button
                  onClick={fetchLogs}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                  Refresh After Creating Table
                </button>
              </div>
            </div>
          )}

          {tableExists && (
            <>
              <div className="mb-4 flex justify-between items-center">
                <div>
                  <span className="text-gray-600 dark:text-gray-300">
                    Showing {totalCount > 0 ? offset + 1 : 0}-
                    {Math.min(offset + limit, totalCount)} of {totalCount} logs
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={offset === 0}
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={offset + limit >= totalCount}
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                  {selectedRequestId && (
                    <button
                      onClick={() => setSelectedRequestId(null)}
                      className="px-3 py-1 bg-blue-500 text-white rounded"
                    >
                      Clear Filter
                    </button>
                  )}
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="large" />
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p className="mb-4">No logs found</p>
                  <p className="mb-6">Generate some images to see logs here</p>
                  <Link
                    href="/generate"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                  >
                    Go to Generate Page
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Request ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Prompt
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Step
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Created At
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {processedLogs.map((log) => (
                        <tr
                          key={log.id}
                          className={`hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${
                            selectedRequestId === log.request_id
                              ? "bg-blue-50 dark:bg-blue-900/20"
                              : ""
                          }`}
                          onClick={() => handleRequestClick(log.request_id)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {log.isFirstOccurrence ? (
                              log.request_id.substring(0, 8) + "..."
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">
                            {log.isFirstOccurrence ? log.prompt : ""}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                                log.status
                              )}`}
                            >
                              {log.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {log.step}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(log.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        {tableExists && selectedRequestId && groupedLogs[selectedRequestId] && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4">Request Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-medium mb-2">
                  Request Information
                </h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded">
                  <p>
                    <strong>Request ID:</strong> {selectedRequestId}
                  </p>
                  <p>
                    <strong>User ID:</strong>{" "}
                    {groupedLogs[selectedRequestId][0]?.user_id}
                  </p>
                  <p>
                    <strong>Prompt:</strong>{" "}
                    {groupedLogs[selectedRequestId][0]?.prompt}
                  </p>
                  <p>
                    <strong>Created:</strong>{" "}
                    {formatDate(groupedLogs[selectedRequestId][0]?.created_at)}
                  </p>
                </div>
              </div>

              {groupedLogs[selectedRequestId].some((log) => log.image_url) && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Generated Image</h3>
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded flex justify-center">
                    <img
                      src={
                        groupedLogs[selectedRequestId].find(
                          (log) => log.image_url
                        )?.image_url || ""
                      }
                      alt="Generated image"
                      className="max-h-64 object-contain"
                    />
                  </div>
                </div>
              )}
            </div>

            <h3 className="text-lg font-medium mb-2">Process Timeline</h3>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
              <ul className="space-y-4">
                {groupedLogs[selectedRequestId]
                  .sort(
                    (a, b) =>
                      new Date(a.created_at).getTime() -
                      new Date(b.created_at).getTime()
                  )
                  .map((log, index) => (
                    <li key={log.id} className="relative pl-10">
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
          </div>
        )}
      </main>
    </div>
  );
}
