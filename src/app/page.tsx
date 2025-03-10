"use client";

import Link from "next/link";
import Navigation from "./components/Navigation";
import ImageGallery from "./components/ImageGallery";
import CustomizableOptions from "./components/CustomizableOptions";
import TextStreamingInfo from "./components/TextStreamingInfo";
import AnimatedBackground from "./components/AnimatedBackground";

export default function Home() {
  return (
    <div className="min-h-screen">
      <AnimatedBackground />
      <Navigation />

      <div className="max-w-6xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div className="flex flex-col justify-center animate-fadeIn">
            <h1 className="text-5xl font-bold mb-4 text-white">
              Welcome to XGenLens
            </h1>
            <p className="text-xl mb-10 text-gray-300">
              Your AI-powered image generation platform
            </p>

            <div className="flex space-x-4">
              <Link
                href="/generate"
                className="rounded-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 text-lg font-medium transition-colors inline-block"
              >
                Create an Image
              </Link>
              <Link
                href="/logs"
                className="rounded-full bg-transparent hover:bg-gray-800 text-white border border-gray-500 py-3 px-8 text-lg font-medium transition-colors inline-block"
              >
                View Logs
              </Link>
            </div>
          </div>

          <div className="animate-fadeIn">
            <CustomizableOptions />
          </div>
        </div>

        <div className="mb-16 animate-fadeIn">
          <TextStreamingInfo />
        </div>

        <div className="animate-fadeIn">
          <h2 className="text-3xl font-bold mb-8 text-white">Your Gallery</h2>
          <ImageGallery />
        </div>
      </div>

      <footer className="mt-16 text-center text-sm text-gray-400 pb-8">
        <p>© 2023 XGenLens. All rights reserved.</p>
      </footer>
    </div>
  );
}
