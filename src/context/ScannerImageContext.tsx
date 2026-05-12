"use client";
import React from "react";

const ScannerImageContext = React.createContext<string>("main-latest");

export function ScannerImageProvider({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  return (
    <ScannerImageContext.Provider value={value}>
      {children}
    </ScannerImageContext.Provider>
  );
}

export const useScannerImage = () => React.useContext(ScannerImageContext);
