"use client";

import { useState, useEffect } from "react";
import TriangleGraphic from "./TriangleGraphic";

export default function CustomizableOptions() {
  const [sliderPosition1, setSliderPosition1] = useState(0);
  const [sliderPosition2, setSliderPosition2] = useState(0);

  const sliderPositions1 = [20, 40, 60, 80, 60, 40]; // Different positions for slider 1
  const sliderPositions2 = [70, 50, 30, 10, 30, 50]; // Different positions for slider 2 (inverse pattern)

  useEffect(() => {
    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % sliderPositions1.length;
      setSliderPosition1(sliderPositions1[currentIndex]);
      setSliderPosition2(sliderPositions2[currentIndex]);
    }, 1500); // Change position every 1.5 seconds for a snappier feel

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#0f1a36] rounded-lg overflow-hidden shadow-xl">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-white mb-4">
          Customizable Options
        </h2>
        <p className="text-gray-300 mb-4">
          Fine-tune your generated images with adjustable parameters like
          diffusion strength and style intensity.
        </p>

        <TriangleGraphic />

        {/* Slider indicators */}
        <div className="mt-4 space-y-4">
          {/* First slider */}
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Diffusion Strength</span>
            </div>
            <div className="w-full bg-gray-700 h-1.5 rounded-full mb-1 relative">
              <div
                className="bg-blue-500 h-1.5 rounded-full absolute top-0 left-0 transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                style={{ width: `${sliderPosition1}%` }}
              ></div>
              <div
                className="w-3 h-3 bg-white rounded-full absolute top-1/2 transform -translate-y-1/2 transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-md"
                style={{ left: `calc(${sliderPosition1}% - 6px)` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>Min</span>
              <span>Max</span>
            </div>
          </div>

          {/* Second slider */}
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Style Intensity</span>
            </div>
            <div className="w-full bg-gray-700 h-1.5 rounded-full mb-1 relative">
              <div
                className="bg-purple-500 h-1.5 rounded-full absolute top-0 left-0 transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                style={{ width: `${sliderPosition2}%` }}
              ></div>
              <div
                className="w-3 h-3 bg-white rounded-full absolute top-1/2 transform -translate-y-1/2 transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-md"
                style={{ left: `calc(${sliderPosition2}% - 6px)` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>Min</span>
              <span>Max</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
