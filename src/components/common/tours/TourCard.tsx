"use client";

import type { PopoverContentProps } from "@reactour/tour";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export function TourCard({
  currentStep,
  steps,
  setCurrentStep,
  setIsOpen,
}: PopoverContentProps) {
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;
  const step = steps[currentStep];

  return (
    <div className="bg-card text-card-foreground rounded-lg border border-border p-5 shadow-lg w-72">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground">
          {currentStep + 1} / {steps.length}
        </span>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label="Close tour"
          className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <p className="text-sm text-card-foreground mb-5">
        {typeof step.content === "function"
          ? (step.content({} as any) ?? null)
          : step.content}
      </p>

      {/* Dots */}
      <div className="flex flex-row items-center justify-between">
        <button
          type="button"
          disabled={isFirst}
          onClick={() => setCurrentStep(currentStep - 1)}
          aria-label="Previous step"
          className="text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors outline-primary"
        >
          <ArrowLeftIcon className="cursor-pointer h-4 w-4" />
        </button>

        <div className="flex flex-row gap-1.5">
          {steps.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentStep(i)}
              aria-label={`Go to step ${i + 1}`}
              aria-current={i === currentStep ? "step" : undefined}
              className={`h-1.5 rounded-full transition-all ${
                i === currentStep
                  ? "w-4 bg-primary"
                  : "w-1.5 bg-muted-foreground/40"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            if (isLast) {
              setIsOpen(false);
            } else {
              setCurrentStep(currentStep + 1);
            }
          }}
          aria-label={isLast ? "Finish tour" : "Next step"}
          className="text-muted-foreground hover:text-foreground transition-colors outline-primary"
        >
          <ArrowRightIcon className="cursor-pointer h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
