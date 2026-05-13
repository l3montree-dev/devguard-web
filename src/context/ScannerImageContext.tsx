"use client";

import { createContext, useContext } from "react";
import type { WithUpdater } from "./ClientContextWrapper";

const ScannerImageContext = createContext<WithUpdater<string>>({
  v: "",
  update: () => {},
});

export const ScannerImageProvider = ScannerImageContext.Provider;
export const useScannerImage = () => useContext(ScannerImageContext).v;
export const useUpdateScannerImage = () =>
  useContext(ScannerImageContext).update;
