// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { readLocalStorage, writeLocalStorage } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Info,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import type { FunctionComponent, ReactNode } from "react";

export interface OnboardingStep {
  id: string;
  icon: LucideIcon;
  title: string;
  // short text shown in the step list on the left
  summary: string;
  // longer text shown above the step content
  description?: ReactNode;
  content?: ReactNode;
  docs?: { label: string; href: string }[];
  // label of the "continue" button - defaults to "Continue"
  continueLabel?: string;
  // additional buttons rendered next to back/ continue
  actions?: ReactNode;
}

interface Props {
  hint: string;
  steps: OnboardingStep[];
  // defaults to the first step which is not done yet
  initialStepIndex?: number;
  // local storage key to remember the steps the user already continued from
  storageKey?: string;
  // the steps happen on different pages - no step navigation, the step content moves on
  readOnly?: boolean;
}

const OnboardingSteps: FunctionComponent<Props> = ({
  hint,
  steps,
  initialStepIndex = 0,
  storageKey,
  readOnly = false,
}) => {
  const [completed, setCompleted] = useState<string[]>(() => {
    if (!storageKey) return [];
    try {
      return JSON.parse(readLocalStorage(storageKey) ?? "[]");
    } catch {
      return [];
    }
  });

  const [activeIndex, setActiveIndex] = useState(initialStepIndex);

  const current = Math.min(activeIndex, steps.length - 1);
  const step = steps[current];
  const isLast = current === steps.length - 1;

  const handleContinue = () => {
    if (storageKey && !completed.includes(step.id)) {
      const next = [...completed, step.id];
      setCompleted(next);
      writeLocalStorage(storageKey, JSON.stringify(next));
    }
    setActiveIndex(current + 1);
  };

  return (
    <Card className="grid gap-6 p-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-12 lg:p-6">
      <Card className="border-0 bg-gradient-to-b from-primary/15 via-muted/40 to-muted/20 p-6 lg:p-8">
        <p className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Info className="h-4 w-4 shrink-0" />
          {hint}
        </p>
        <ol>
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === current;
            return (
              <li key={s.id} className="relative flex gap-4 pb-8 last:pb-0">
                {i < steps.length - 1 && (
                  <span
                    aria-hidden
                    className={cn(
                      "absolute left-4 top-10 bottom-1 -translate-x-1/2 border-l-2 transition-colors",
                      // the line fills up to the active step
                      i < current
                        ? "border-primary"
                        : "border-dashed border-border",
                    )}
                  />
                )}
                <button
                  type="button"
                  disabled={readOnly}
                  onClick={() => setActiveIndex(i)}
                  className="flex gap-4 text-left disabled:cursor-default"
                  aria-current={isActive ? "step" : undefined}
                >
                  <span
                    className={cn(
                      "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-card transition-colors",
                      i < current &&
                        "border-primary bg-primary text-primary-foreground",

                      isActive &&
                        "border-primary text-primary ring-4 ring-primary/20",
                      i > current && "text-muted-foreground",
                    )}
                  >
                    {i < current ? (
                      <Check className="h-4 w-4" strokeWidth={3} />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </span>
                  <span className="flex flex-col gap-1">
                    <span
                      className={cn(
                        "font-semibold",
                        isActive ? "text-foreground" : "text-foreground/80",
                      )}
                    >
                      {s.title}
                    </span>
                    <span className="text-sm leading-relaxed text-muted-foreground">
                      {s.summary}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </Card>

      <section className="flex min-w-0 flex-col py-2 lg:py-6 lg:pr-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          {isLast && steps.length > 1
            ? "Last step"
            : `Step ${current + 1} of ${steps.length}`}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          {step.title}
        </h2>
        {step.description && (
          <div className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {step.description}
          </div>
        )}
        {step.content && <div className="mt-6">{step.content}</div>}
        {step.docs && step.docs.length > 0 && (
          <div className="mt-8 border-t pt-6">
            <p className="mb-3 text-sm font-semibold">Documentation</p>
            <div className="flex flex-wrap gap-2">
              {step.docs.map((d) => (
                <Button key={d.href} variant="outline" size="xs" asChild>
                  <a href={d.href} target="_blank" rel="noopener noreferrer">
                    <FileText className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                    {d.label}
                  </a>
                </Button>
              ))}
            </div>
          </div>
        )}
        {!readOnly && (current > 0 || !isLast || step.actions) && (
          <div className="mt-auto flex items-center gap-2 pt-10 justify-end">
            {current > 0 && (
              <Button
                variant="ghost"
                onClick={() => setActiveIndex(current - 1)}
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
            )}
            {!isLast && (
              <Button
                data-testid="onboarding-continue"
                onClick={handleContinue}
              >
                {step.continueLabel ?? "Continue"}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            )}
            {step.actions}
          </div>
        )}
      </section>
    </Card>
  );
};

export default OnboardingSteps;
