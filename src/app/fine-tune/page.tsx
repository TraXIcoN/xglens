"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FineTuningForm from "../components/FineTuningForm";
import FineTuningStatus from "../components/FineTuningStatus";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import AnimatedBackground from "../components/AnimatedBackground";
import Confetti from "../components/Confetti";

// Function to create wavy text with individual letter animations
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

export default function FineTunePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  const [activeTab, setActiveTab] = useState<"create" | "status">(
    jobId ? "status" : "create"
  );
  const [showConfetti, setShowConfetti] = useState(false);
  const [tabHover, setTabHover] = useState<"create" | "status" | null>(null);

  // Trigger confetti on initial load for fun
  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen">
      <AnimatedBackground />
      <Confetti active={showConfetti} />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6 slide-in">
          <button
            onClick={() => router.push("/")}
            className="mr-4 p-3 rounded-full bg-purple-600/90 hover:bg-purple-700 text-white transition-all transform hover:scale-110 hover:rotate-12 pulsating-btn"
            aria-label="Go back"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <h1 className="text-3xl font-bold neon-text-pink">
            <WavyText text="✨ Model Fine-tuning Extravaganza! ✨" />
          </h1>
        </div>

        <div className="bg-[#0f1a36]/60 rounded-lg shadow-[0_0_20px_rgba(255,0,255,0.3)] overflow-hidden animated-border">
          <div className="border-b border-gray-700 bg-gradient-to-r from-purple-900/50 via-blue-900/50 to-pink-900/50">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("create")}
                onMouseEnter={() => setTabHover("create")}
                onMouseLeave={() => setTabHover(null)}
                className={`py-4 px-8 text-center border-b-4 font-bold text-md transition-all duration-300 transform ${
                  tabHover === "create" ? "scale-110" : ""
                } ${
                  activeTab === "create"
                    ? "border-pink-500 text-white neon-text"
                    : "border-transparent text-gray-400 hover:text-white"
                }`}
              >
                🚀 Create Fine-tuning Job 🚀
              </button>
              {jobId && (
                <button
                  onClick={() => setActiveTab("status")}
                  onMouseEnter={() => setTabHover("status")}
                  onMouseLeave={() => setTabHover(null)}
                  className={`py-4 px-8 text-center border-b-4 font-bold text-md transition-all duration-300 transform ${
                    tabHover === "status" ? "scale-110" : ""
                  } ${
                    activeTab === "status"
                      ? "border-blue-500 text-white neon-text"
                      : "border-transparent text-gray-400 hover:text-white"
                  }`}
                >
                  📊 Job Status 📊
                </button>
              )}
            </nav>
          </div>

          <div className="p-6 bg-gradient-to-br from-[#0f1a36]/60 to-[#1a1a4a]/60">
            {activeTab === "create" ? (
              <div className="slide-in">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 animate-pulse">
                    Create a Spectacular Fine-tuning Job! 🎉
                  </h2>
                  <p className="text-cyan-300">
                    Fine-tune a model on your custom dataset to achieve AMAZING
                    performance! Upload your training data and watch the MAGIC
                    happen! ✨
                  </p>
                </div>
                <FineTuningForm onJobCreated={() => setShowConfetti(true)} />
              </div>
            ) : (
              jobId && <FineTuningStatus jobId={jobId} />
            )}
          </div>
        </div>

        <div className="mt-8 bg-[#0f1a36]/60 rounded-lg shadow-[0_0_15px_rgba(0,255,255,0.3)] p-6 animated-border slide-in">
          <h2 className="text-2xl font-bold mb-4 neon-text-green">
            ⭐ Fine-tuning Guide Extraordinaire! ⭐
          </h2>
          <div className="prose prose-invert max-w-none">
            <h3 className="text-yellow-300">🔥 Preparing Your Dataset 🔥</h3>
            <p className="text-blue-300">
              Your training data should be in JSONL format, with each line
              containing a prompt and completion pair:
            </p>
            <pre className="bg-[#0a1328]/80 p-4 rounded-lg overflow-x-auto border-2 border-purple-500 shadow-[0_0_10px_rgba(147,51,234,0.3)]">
              {`{"prompt": "What is the capital of France?", "completion": "The capital of France is Paris."}\n{"prompt": "Who wrote Romeo and Juliet?", "completion": "William Shakespeare wrote Romeo and Juliet."}`}
            </pre>

            <h3 className="text-yellow-300">💯 Best Practices 💯</h3>
            <ul className="list-disc pl-5 text-pink-300">
              <li className="mb-2">
                Include a DIVERSE set of examples that cover the range of tasks
                you want the model to perform.
              </li>
              <li className="mb-2">
                Aim for at least 50-100 examples for basic fine-tuning, but MORE
                examples generally lead to BETTER results!
              </li>
              <li className="mb-2">
                Balance your dataset to avoid biasing the model toward certain
                responses.
              </li>
              <li className="mb-2">
                Consider including a validation file to monitor the model's
                performance during training.
              </li>
            </ul>

            <h3 className="text-yellow-300">⚙️ Hyperparameters ⚙️</h3>
            <p className="text-blue-300">
              The default hyperparameters work well for most use cases, but you
              can SUPERCHARGE them based on your specific needs:
            </p>
            <ul className="list-disc pl-5 text-green-300">
              <li className="mb-2">
                <strong className="text-white">Batch Size:</strong> Larger batch
                sizes can SPEED UP training but require more memory.
              </li>
              <li className="mb-2">
                <strong className="text-white">Learning Rate:</strong> Controls
                how QUICKLY the model adapts to the training data. Lower values
                are more stable but train slower.
              </li>
              <li className="mb-2">
                <strong className="text-white">Epochs:</strong> The number of
                times the model will see each example during training. More
                epochs can BOOST performance but risk overfitting.
              </li>
            </ul>

            <h3 className="text-yellow-300">🏆 After Fine-tuning 🏆</h3>
            <p className="text-blue-300">
              Once your fine-tuning job completes successfully, you can:
            </p>
            <ul className="list-disc pl-5 text-purple-300">
              <li className="mb-2">
                Download the model checkpoint files for DEPLOYMENT! 🚀
              </li>
              <li className="mb-2">
                Evaluate the model's AMAZING performance on your specific tasks!
                📈
              </li>
              <li className="mb-2">
                Use the fine-tuned model in your applications by referencing its
                ID! 🔥
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
