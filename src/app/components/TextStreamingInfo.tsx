"use client";

import React, { useState, useEffect } from "react";

export default function TextStreamingInfo() {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const enhancedPrompt =
    "A fluffy orange tabby cat sitting gracefully in a lush garden with vibrant flowers, soft sunlight filtering through leaves, creating a warm and peaceful atmosphere, detailed fur texture, shallow depth of field, 85mm lens, f/2.8";

  // Function to simulate text streaming
  const simulateTextStreaming = () => {
    setIsTyping(true);
    setDisplayText("");

    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < enhancedPrompt.length) {
        setDisplayText((prev) => prev + enhancedPrompt.charAt(i));
        i++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
      }
    }, 30); // Speed of typing

    return () => clearInterval(typingInterval);
  };

  // Start animation when component mounts
  useEffect(() => {
    simulateTextStreaming();

    // Restart animation every 15 seconds
    const animationInterval = setInterval(() => {
      simulateTextStreaming();
    }, 15000);

    return () => clearInterval(animationInterval);
  }, []);

  return (
    <div className="bg-[#0f1a36] rounded-lg overflow-hidden shadow-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-4">How It Works</h2>
      <p className="text-gray-300 mb-4">
        XGenLens uses advanced AI technology to enhance your prompts in
        real-time:
      </p>

      <div className="space-y-4 mb-6">
        <div className="flex items-start">
          <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
            1
          </div>
          <div>
            <h3 className="text-white font-medium">Input Your Prompt</h3>
            <p className="text-gray-400">
              Enter a simple description of the image you want to create
            </p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
            2
          </div>
          <div>
            <h3 className="text-white font-medium">Real-time Enhancement</h3>
            <p className="text-gray-400">
              Watch as AI enhances your prompt with details, style, and
              composition
            </p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
            3
          </div>
          <div>
            <h3 className="text-white font-medium">Generate Your Image</h3>
            <p className="text-gray-400">
              The enhanced prompt is used to create a detailed, high-quality
              image
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[#0a1328] p-4 rounded-lg mb-4">
        <h3 className="text-white font-medium mb-2">Example:</h3>
        <div className="space-y-2">
          <div>
            <p className="text-gray-400 text-sm">Original prompt:</p>
            <p className="text-white">A cat in a garden</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Enhanced prompt:</p>
            <div className="relative">
              <p className="text-white min-h-[4.5rem]">
                {displayText}
                {isTyping && (
                  <span className="inline-block w-1 h-4 bg-blue-500 ml-1 animate-pulse"></span>
                )}
              </p>
              {!isTyping && (
                <button
                  onClick={simulateTextStreaming}
                  className="absolute right-0 bottom-0 text-xs text-blue-400 hover:text-blue-300"
                >
                  Replay
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
