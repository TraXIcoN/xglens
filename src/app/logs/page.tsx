"use client";

import { useState, useEffect } from "react";
import Navigation from "../components/Navigation";
import LoadingSpinner from "../components/LoadingSpinner";
import Link from "next/link";
import AnimatedBackground from "../components/AnimatedBackground";
import Confetti from "../components/Confetti";

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
  const [showConfetti, setShowConfetti] = useState(false);
  const [hoverStates, setHoverStates] = useState({
    prevButton: false,
    nextButton: false,
    clearButton: false,
    refreshButton: false,
    generateButton: false,
  });

  useEffect(() => {
    fetchLogs();
  }, [limit, offset]);

  // Show confetti when a request is selected
  useEffect(() => {
    if (selectedRequestId) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [selectedRequestId]);

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
        return "bg-blue-100 text-blue-800 border-2 border-blue-400";
      case "processing":
        return "bg-indigo-100 text-indigo-800 border-2 border-indigo-400";
      case "completed":
        return "bg-cyan-100 text-cyan-800 border-2 border-cyan-400";
      case "failed":
        return "bg-slate-100 text-slate-800 border-2 border-slate-400";
      default:
        return "bg-gray-100 text-gray-800 border-2 border-gray-400";
    }
  };

  const setHover = (field: keyof typeof hoverStates, value: boolean) => {
    setHoverStates((prev) => ({ ...prev, [field]: value }));
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
    <div className="min-h-screen bg-[#050b1f] text-white">
      <AnimatedBackground />
      <Confetti active={showConfetti} />
      <Navigation />

      <main className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        <div className="bg-[#081231]/80 p-6 rounded-lg shadow-2xl mb-8 backdrop-blur-sm animated-border">
          <h1 className="text-3xl font-bold mb-6 neon-text">
            <WavyText text="Generation Logs" />
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-slate-900/80 border-4 border-slate-600 text-white rounded-lg animate-pulse shadow-lg slide-in">
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

          {!tableExists && (
            <div className="mb-6 p-6 bg-indigo-900/40 border-4 border-indigo-700 text-white rounded-lg shadow-lg slide-in">
              <h3 className="font-bold text-xl mb-4 neon-text">
                Database Table Not Found
              </h3>
              <p className="mb-3 text-lg">
                {tableMessage ||
                  "The generation_logs table does not exist in your Supabase database."}
              </p>
              <p className="mb-4 text-lg">
                You need to create the table in your Supabase database to store
                and view logs.
              </p>

              <div className="bg-[#0a1845] p-5 rounded-lg border-2 border-blue-700 mb-6 shadow-lg">
                <h4 className="font-bold mb-3 text-lg text-blue-300">
                  SQL to Create Table:
                </h4>
                <pre className="text-xs bg-black p-4 rounded-lg overflow-x-auto border-2 border-blue-800 text-blue-300">
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

              <p className="mb-3 text-lg font-bold">To create this table:</p>
              <ol className="list-decimal list-inside mb-6 ml-4 space-y-2">
                <li className="text-lg">Log in to your Supabase dashboard</li>
                <li className="text-lg">Navigate to the SQL Editor</li>
                <li className="text-lg">
                  Create a new query and paste the SQL above
                </li>
                <li className="text-lg">Run the query</li>
              </ol>

              <div className="flex justify-end">
                <button
                  onClick={fetchLogs}
                  className={`px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg shadow-lg transition-all duration-300 transform ${
                    hoverStates.refreshButton ? "scale-110" : ""
                  } pulsating-btn`}
                  onMouseEnter={() => setHover("refreshButton", true)}
                  onMouseLeave={() => setHover("refreshButton", false)}
                >
                  <span className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Refresh After Creating Table
                  </span>
                </button>
              </div>
            </div>
          )}

          {tableExists && (
            <>
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <span className="text-lg font-medium text-blue-300">
                    Showing {totalCount > 0 ? offset + 1 : 0}-
                    {Math.min(offset + limit, totalCount)} of {totalCount} logs
                  </span>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={handlePrevPage}
                    disabled={offset === 0}
                    className={`px-4 py-2 bg-[#0a1845] border-2 border-blue-700 rounded-lg disabled:opacity-50 font-bold transition-all duration-300 transform ${
                      hoverStates.prevButton && offset !== 0 ? "scale-110" : ""
                    }`}
                    onMouseEnter={() => setHover("prevButton", true)}
                    onMouseLeave={() => setHover("prevButton", false)}
                  >
                    <span className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      Previous
                    </span>
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={offset + limit >= totalCount}
                    className={`px-4 py-2 bg-[#0a1845] border-2 border-blue-700 rounded-lg disabled:opacity-50 font-bold transition-all duration-300 transform ${
                      hoverStates.nextButton && offset + limit < totalCount
                        ? "scale-110"
                        : ""
                    }`}
                    onMouseEnter={() => setHover("nextButton", true)}
                    onMouseLeave={() => setHover("nextButton", false)}
                  >
                    <span className="flex items-center">
                      Next
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 ml-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </span>
                  </button>
                  {selectedRequestId && (
                    <button
                      onClick={() => setSelectedRequestId(null)}
                      className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all duration-300 transform ${
                        hoverStates.clearButton ? "scale-110" : ""
                      }`}
                      onMouseEnter={() => setHover("clearButton", true)}
                      onMouseLeave={() => setHover("clearButton", false)}
                    >
                      <span className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        Clear Filter
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="spinner"></div>
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-12 slide-in">
                  <p className="mb-4 text-xl font-bold text-blue-300">
                    No logs found
                  </p>
                  <p className="mb-8 text-lg">
                    Generate some images to see logs here
                  </p>
                  <Link
                    href="/generate"
                    className={`px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg shadow-lg transition-all duration-300 transform ${
                      hoverStates.generateButton ? "scale-110" : ""
                    } pulsating-btn`}
                    onMouseEnter={() => setHover("generateButton", true)}
                    onMouseLeave={() => setHover("generateButton", false)}
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
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      Go to Generate Page
                    </span>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border-2 border-blue-700 shadow-lg">
                  <table className="min-w-full divide-y divide-blue-700">
                    <thead className="bg-[#0a1845]">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold text-blue-300 uppercase tracking-wider">
                          Request ID
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-blue-300 uppercase tracking-wider">
                          Prompt
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-blue-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-blue-300 uppercase tracking-wider">
                          Step
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-blue-300 uppercase tracking-wider">
                          Created At
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-[#081231] divide-y divide-blue-700">
                      {processedLogs.map((log) => (
                        <tr
                          key={log.id}
                          className={`hover:bg-[#0a1845] cursor-pointer transition-all duration-300 ${
                            selectedRequestId === log.request_id
                              ? "bg-blue-900/30 border-l-4 border-blue-500"
                              : ""
                          }`}
                          onClick={() => handleRequestClick(log.request_id)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {log.isFirstOccurrence ? (
                              <span className="font-mono bg-[#0a1845] px-2 py-1 rounded border border-blue-700">
                                {log.request_id.substring(0, 8) + "..."}
                              </span>
                            ) : (
                              <span className="text-blue-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm max-w-xs truncate">
                            {log.isFirstOccurrence ? (
                              <span className="font-medium">{log.prompt}</span>
                            ) : (
                              ""
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 text-xs rounded-full font-bold ${getStatusColor(
                                log.status
                              )}`}
                            >
                              {log.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className="font-medium">{log.step}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-300">
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
          <div className="bg-[#081231]/80 p-6 rounded-lg shadow-2xl mb-8 backdrop-blur-sm animated-border slide-in">
            <h2 className="text-2xl font-bold mb-6 neon-text">
              <WavyText text="Request Details" />
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="transform transition-all duration-500 hover:scale-105">
                <h3 className="text-xl font-bold mb-3 text-blue-300">
                  Request Information
                </h3>
                <div className="bg-[#0a1845] p-5 rounded-lg border-2 border-blue-700 shadow-lg">
                  <p className="mb-2 text-lg">
                    <strong className="text-blue-300">Request ID:</strong>{" "}
                    <span className="font-mono bg-black/30 px-2 py-1 rounded">
                      {selectedRequestId}
                    </span>
                  </p>
                  <p className="mb-2 text-lg">
                    <strong className="text-blue-300">User ID:</strong>{" "}
                    <span className="font-mono">
                      {groupedLogs[selectedRequestId][0]?.user_id}
                    </span>
                  </p>
                  <p className="mb-2 text-lg">
                    <strong className="text-blue-300">Prompt:</strong>{" "}
                    <span className="italic">
                      {groupedLogs[selectedRequestId][0]?.prompt}
                    </span>
                  </p>
                  <p className="text-lg">
                    <strong className="text-blue-300">Created:</strong>{" "}
                    <span>
                      {formatDate(
                        groupedLogs[selectedRequestId][0]?.created_at
                      )}
                    </span>
                  </p>
                </div>
              </div>

              {groupedLogs[selectedRequestId].some((log) => log.image_url) && (
                <div className="transform transition-all duration-500 hover:scale-105">
                  <h3 className="text-xl font-bold mb-3 text-blue-300">
                    Generated Image
                  </h3>
                  <div className="bg-[#0a1845] p-5 rounded-lg border-2 border-blue-700 shadow-lg flex justify-center">
                    <img
                      src={
                        groupedLogs[selectedRequestId].find(
                          (log) => log.image_url
                        )?.image_url || ""
                      }
                      alt="Generated image"
                      className="max-h-64 object-contain rounded border-2 border-blue-500 shadow-lg"
                    />
                  </div>
                </div>
              )}
            </div>

            <h3 className="text-xl font-bold mb-4 text-blue-300">
              Process Timeline
            </h3>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-1 bg-blue-700 animate-pulse"></div>
              <ul className="space-y-6">
                {groupedLogs[selectedRequestId]
                  .sort(
                    (a, b) =>
                      new Date(a.created_at).getTime() -
                      new Date(b.created_at).getTime()
                  )
                  .map((log, index) => (
                    <li
                      key={log.id}
                      className="relative pl-12 transform transition-all duration-300 hover:scale-102"
                    >
                      <div className="absolute left-0 top-2 w-9 h-9 rounded-full flex items-center justify-center bg-blue-600 text-white font-bold border-2 border-blue-400 shadow-lg z-10">
                        {index + 1}
                      </div>
                      <div className="bg-[#0a1845] p-5 rounded-lg border-2 border-blue-700 shadow-lg">
                        <div className="flex justify-between mb-3">
                          <span
                            className={`px-3 py-1 text-sm rounded-full font-bold ${getStatusColor(
                              log.status
                            )}`}
                          >
                            {log.status}
                          </span>
                          <span className="text-sm text-blue-300 font-mono">
                            {formatDate(log.created_at)}
                          </span>
                        </div>
                        <p className="font-bold text-lg mb-2">{log.step}</p>
                        {log.details && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-blue-300 mb-1">
                              Details:
                            </p>
                            <pre className="text-xs bg-black p-3 rounded-lg overflow-x-auto border border-blue-700 text-blue-200">
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
