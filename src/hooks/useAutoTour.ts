"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import type { ConditionalStep } from "./usePageTour";
import { usePageTour } from "./usePageTour";
import { useTourSeen } from "./useTourSeen";

export function useAutoTour(tourKey: string, steps: ConditionalStep[]) {
  const { startTour } = usePageTour(steps);
  const { showModal: notSeen, markSeen } = useTourSeen(tourKey);
  const searchParams = useSearchParams();
  const triggeredByParam = searchParams?.get("startTour") === tourKey;
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    if (!notSeen && !triggeredByParam) return;
    started.current = true;
    markSeen();
    startTour();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notSeen, triggeredByParam]);

  return { startTour };
}
