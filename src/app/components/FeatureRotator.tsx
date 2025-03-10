"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Feature {
  title: string;
  description: string;
  icon: string;
}

export default function FeatureRotator() {
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);

  const features: Feature[] = [
    {
      title: "Powerful AI Generation",
      description:
        "XGenLens uses cutting-edge AI models to generate high-quality images from your text descriptions.",
      icon: "/next.svg",
    },
    {
      title: "Customizable Options",
      description:
        "Fine-tune your generated images with adjustable parameters like diffusion strength and style intensity.",
      icon: "/vercel.svg",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeatureIndex((current) => (current + 1) % features.length);
    }, 5000); // Switch every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg bg-gray-900 p-8">
      {features.map((feature, index) => (
        <div
          key={index}
          className={`absolute inset-0 flex flex-col justify-center p-8 transition-opacity duration-1000 ${
            index === activeFeatureIndex
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <h2 className="text-2xl font-semibold mb-4 text-white">
            {feature.title}
          </h2>
          <p className="mb-6 text-gray-300">{feature.description}</p>
          <div className="flex justify-center">
            <Image
              src={feature.icon}
              alt={feature.title}
              width={180}
              height={38}
              className="dark:invert"
            />
          </div>
        </div>
      ))}

      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
        {features.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveFeatureIndex(index)}
            className={`h-2 w-2 rounded-full ${
              index === activeFeatureIndex ? "bg-blue-500" : "bg-gray-600"
            }`}
            aria-label={`Show feature ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
