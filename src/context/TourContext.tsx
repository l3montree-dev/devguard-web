"use client";

import { TourCard } from "@/components/common/tours/TourCard";
import { TourProvider, useTour } from "@reactour/tour";
import type { StepType } from "@reactour/tour";
import React, { useState, useEffect, useCallback } from "react";

interface TourContextType {
  registerSteps: (steps: StepType[]) => void;
  openTour: () => void;
}

const TourContext = React.createContext<TourContextType>({
  registerSteps: () => {},
  openTour: () => {},
});

function TourController({
  steps,
  shouldOpen,
  onOpened,
  children,
}: {
  steps: StepType[];
  shouldOpen: boolean;
  onOpened: () => void;
  children: React.ReactNode;
}) {
  const { setSteps, setIsOpen, setCurrentStep } = useTour();

  useEffect(() => {
    if (steps.length > 0) {
      setSteps?.(steps);
    }
    // setSteps is stable, safe to omit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps]);

  const stableOnOpened = useCallback(onOpened, []);

  useEffect(() => {
    if (shouldOpen && steps.length > 0) {
      setCurrentStep?.(0);
      setIsOpen?.(true);
      stableOnOpened();
    }
    // setIsOpen is stable, safe to omit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldOpen, steps, stableOnOpened]);

  return <>{children}</>;
}

export function TourContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [steps, setSteps] = useState<StepType[]>([]);
  const [shouldOpen, setShouldOpen] = useState(false);

  const registerSteps = (newSteps: StepType[]) => {
    setSteps(newSteps);
  };

  const openTour = () => {
    setShouldOpen(true);
  };

  return (
    <TourContext.Provider value={{ registerSteps, openTour }}>
      <TourProvider
        steps={steps}
        ContentComponent={TourCard}
        styles={{
          popover: (base) => ({
            ...base,
            padding: 0,
            background: "transparent",
            boxShadow: "none",
          }),
        }}
      >
        <TourController
          steps={steps}
          shouldOpen={shouldOpen}
          onOpened={() => setShouldOpen(false)}
        >
          {children}
        </TourController>
      </TourProvider>
    </TourContext.Provider>
  );
}

export const useTourContext = () => React.useContext(TourContext);
