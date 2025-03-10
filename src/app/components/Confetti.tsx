"use client";

import { useEffect, useState, ReactNode } from "react";

interface ConfettiProps {
  active: boolean;
}

export default function Confetti({ active }: ConfettiProps) {
  const [confetti, setConfetti] = useState<ReactNode[]>([]);

  useEffect(() => {
    if (active) {
      const newConfetti: ReactNode[] = [];
      const colors = [
        "var(--neon-pink)",
        "var(--neon-blue)",
        "var(--neon-green)",
        "var(--neon-yellow)",
        "var(--neon-purple)",
        "var(--neon-orange)",
      ];

      // Create 100 confetti pieces
      for (let i = 0; i < 100; i++) {
        const left = Math.random() * 100;
        const width = Math.random() * 10 + 5;
        const height = Math.random() * 10 + 5;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const delay = Math.random() * 3;
        const duration = Math.random() * 3 + 3;
        const rotation = Math.random() * 360;

        newConfetti.push(
          <div
            key={i}
            className="confetti"
            style={{
              left: `${left}%`,
              width: `${width}px`,
              height: `${height}px`,
              backgroundColor: color,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
              transform: `rotate(${rotation}deg)`,
              borderRadius: Math.random() > 0.5 ? "50%" : "0%",
            }}
          />
        );
      }

      setConfetti(newConfetti);

      // Clear confetti after 5 seconds
      const timer = setTimeout(() => {
        setConfetti([]);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [active]);

  if (!active && confetti.length === 0) return null;

  return <div className="confetti-container">{confetti}</div>;
}
