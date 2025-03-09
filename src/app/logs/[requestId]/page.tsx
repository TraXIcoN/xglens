"use client";

import { useParams } from "next/navigation";
import Navigation from "../../components/Navigation";
import StreamingLogs from "../../components/StreamingLogs";
import Link from "next/link";

export default function LogDetailPage() {
  const params = useParams();
  const requestId = params.requestId as string;

  return (
    <div className="min-h-screen p-8">
      <Navigation />

      <main className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center">
          <Link
            href="/logs"
            className="mr-4 text-blue-500 hover:underline flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Logs
          </Link>
          <h1 className="text-2xl font-bold">Generation Details</h1>
        </div>

        <StreamingLogs requestId={requestId} />
      </main>
    </div>
  );
}
