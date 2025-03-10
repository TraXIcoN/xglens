import Link from "next/link";

export default function ComprehensiveLogging() {
  return (
    <div className="bg-[#0f1a36] rounded-lg overflow-hidden shadow-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-4">
        Comprehensive Logging
      </h2>
      <p className="text-gray-300 mb-6">
        Every step of the image generation process is logged for transparency
        and debugging. View detailed logs to understand how your images are
        created.
      </p>
      <div className="flex justify-center">
        <Link
          href="/logs"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
        >
          View Logs
        </Link>
      </div>
    </div>
  );
}
