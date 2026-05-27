"use client";

import { useState } from "react";

const storageKey = (tourKey: string) => `devguard:tourSeen:${tourKey}`;

export const hasTourSeen = (tourKey: string): boolean => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(storageKey(tourKey)) === "true";
};

export function useTourSeen(tourKey: string) {
  const key = storageKey(tourKey);

  const [showModal, setShowModal] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(key) !== "true";
  });

  const markSeen = () => {
    localStorage.setItem(key, "true");
    setShowModal(false);
  };

  return { showModal, markSeen };
}
