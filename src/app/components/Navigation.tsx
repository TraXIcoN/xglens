"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="w-full py-4 sticky top-0 z-10 navigation-container">
      <div className="max-w-6xl mx-auto px-8">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-3xl font-bold text-white">
            XGenLens
          </Link>
          <div className="flex space-x-2">
            <Link
              href="/"
              className={`px-4 py-2 rounded-md transition-colors ${
                isActive("/")
                  ? "bg-blue-600 text-white"
                  : "text-white hover:bg-blue-600/20"
              }`}
            >
              Home
            </Link>
            <Link
              href="/generate"
              className={`px-4 py-2 rounded-md transition-colors ${
                isActive("/generate")
                  ? "bg-blue-600 text-white"
                  : "text-white hover:bg-blue-600/20"
              }`}
            >
              Generate
            </Link>
            <Link
              href="/logs"
              className={`px-4 py-2 rounded-md transition-colors ${
                isActive("/logs")
                  ? "bg-blue-600 text-white"
                  : "text-white hover:bg-blue-600/20"
              }`}
            >
              Logs
            </Link>
            <Link
              href="/fine-tune"
              className={`px-4 py-2 rounded-md transition-colors ${
                isActive("/fine-tune")
                  ? "bg-blue-600 text-white"
                  : "text-white hover:bg-blue-600/20"
              }`}
            >
              Fine-tune
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
