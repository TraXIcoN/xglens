"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="mb-8">
      <div className="flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          XGenLens
        </Link>
        <div className="flex space-x-4">
          <Link
            href="/"
            className={`px-3 py-2 rounded-md ${
              isActive("/")
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Home
          </Link>
          <Link
            href="/generate"
            className={`px-3 py-2 rounded-md ${
              isActive("/generate")
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Generate
          </Link>
        </div>
      </div>
    </nav>
  );
}
