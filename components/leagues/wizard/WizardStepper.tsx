import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  label: string;
  description?: string;
}

interface WizardStepperProps {
  steps: Step[];
  currentStep: number; // 0-indexed
}

export function WizardStepper({ steps, currentStep }: WizardStepperProps) {
  return (
    <nav aria-label="Progress" className="w-full">
      <ol className="flex items-center">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;
          const isLast = idx === steps.length - 1;

          return (
            <li
              key={step.label}
              className={cn("flex items-center", !isLast && "flex-1")}
            >
              {/* Circle + label */}
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                    isCompleted
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCurrent
                      ? "border-primary bg-white text-primary"
                      : "border-muted-foreground/30 bg-white text-muted-foreground/50"
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : idx + 1}
                </div>
                <span
                  className={cn(
                    "hidden sm:block text-xs font-medium whitespace-nowrap",
                    isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground/50"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2 mt-[-1rem]",
                    isCompleted ? "bg-primary" : "bg-muted-foreground/20"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
