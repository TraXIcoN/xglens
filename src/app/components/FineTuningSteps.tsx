import { useState, useEffect } from "react";
import LoadingSpinner from "./LoadingSpinner";

interface Step {
  id: number;
  title: string;
  description: string;
  status: "pending" | "active" | "completed";
}

interface FineTuningStepsProps {
  currentStep: number;
  isCompleted: boolean;
}

const FINE_TUNING_STEPS: Step[] = [
  {
    id: 1,
    title: "Preparing Dataset",
    description: "Validating and processing your training data for fine-tuning",
    status: "pending",
  },
  {
    id: 2,
    title: "Model Selection",
    description: "Configuring the base model for fine-tuning",
    status: "pending",
  },
  {
    id: 3,
    title: "Hyperparameter Setup",
    description:
      "Setting up batch size, learning rate, and epochs for optimal training",
    status: "pending",
  },
  {
    id: 4,
    title: "Training Initialization",
    description:
      "Initializing the fine-tuning process with your custom dataset",
    status: "pending",
  },
  {
    id: 5,
    title: "Model Training",
    description: "Training the model on your data with specified parameters",
    status: "pending",
  },
  {
    id: 6,
    title: "Validation",
    description: "Evaluating model performance on validation dataset",
    status: "pending",
  },
  {
    id: 7,
    title: "Checkpoint Creation",
    description: "Saving model checkpoints for future use",
    status: "pending",
  },
  {
    id: 8,
    title: "Completion",
    description: "Fine-tuning process completed successfully",
    status: "pending",
  },
];

export default function FineTuningSteps({
  currentStep,
  isCompleted,
}: FineTuningStepsProps) {
  const [visibleSteps, setVisibleSteps] = useState<number[]>([]);
  const [expandedSteps, setExpandedSteps] = useState(false);

  useEffect(() => {
    // Show up to 4 steps at a time, centered around the current step
    const calculateVisibleSteps = () => {
      if (expandedSteps) {
        return FINE_TUNING_STEPS.map((step) => step.id);
      }

      let steps = [];
      const totalSteps = FINE_TUNING_STEPS.length;

      if (currentStep <= 2) {
        steps = [1, 2, 3, 4];
      } else if (currentStep >= totalSteps - 1) {
        steps = [totalSteps - 3, totalSteps - 2, totalSteps - 1, totalSteps];
      } else {
        steps = [
          currentStep - 1,
          currentStep,
          currentStep + 1,
          currentStep + 2,
        ];
      }

      return steps.filter((step) => step > 0 && step <= totalSteps);
    };

    setVisibleSteps(calculateVisibleSteps());
  }, [currentStep, expandedSteps]);

  const getStepStatus = (stepId: number) => {
    if (stepId < currentStep) return "completed";
    if (stepId === currentStep) return "active";
    return "pending";
  };

  return (
    <div className="bg-[#081231]/60 p-6 rounded-lg shadow-2xl backdrop-blur-sm animated-border slide-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold neon-text">Fine-tuning Progress</h2>
        <button
          onClick={() => setExpandedSteps(!expandedSteps)}
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          {expandedSteps ? "Show Less" : "Show All Steps"}
        </button>
      </div>

      <div className="space-y-4">
        {FINE_TUNING_STEPS.map((step) => {
          if (!visibleSteps.includes(step.id)) return null;

          const status = getStepStatus(step.id);
          return (
            <div
              key={step.id}
              className={`transform transition-all duration-500 ${
                status === "active" ? "scale-105" : ""
              }`}
            >
              <div
                className={`
                p-4 rounded-lg border-2
                ${
                  status === "completed"
                    ? "bg-[#0a1845]/40 border-green-500"
                    : status === "active"
                    ? "bg-[#0a1845]/60 border-blue-500 animate-pulse"
                    : "bg-[#0a1845]/20 border-gray-500"
                }
              `}
              >
                <div className="flex items-center">
                  <div
                    className={`
                    w-8 h-8 rounded-full flex items-center justify-center mr-4
                    ${
                      status === "completed"
                        ? "bg-green-500"
                        : status === "active"
                        ? "bg-blue-500"
                        : "bg-gray-500"
                    }
                  `}
                  >
                    {status === "completed" ? (
                      <span className="text-white">✓</span>
                    ) : status === "active" ? (
                      <LoadingSpinner size="small" />
                    ) : (
                      <span className="text-white">{step.id}</span>
                    )}
                  </div>
                  <div>
                    <h3
                      className={`font-bold ${
                        status === "active"
                          ? "text-blue-300"
                          : status === "completed"
                          ? "text-green-300"
                          : "text-gray-300"
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-400">{step.description}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!expandedSteps && visibleSteps.length < FINE_TUNING_STEPS.length && (
        <div className="mt-4 text-center">
          <span className="text-gray-400 text-sm">
            {FINE_TUNING_STEPS.length - visibleSteps.length} more steps...
          </span>
        </div>
      )}
    </div>
  );
}
