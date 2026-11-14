// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import ManualIntegrationSlide from "./ManualIntegrationSlide";

jest.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("artifact=selected-artifact"),
}));
jest.mock("@/components/ui/carousel", () => ({
  CarouselItem: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
}));
jest.mock("@/components/ui/dialog", () => ({
  DialogHeader: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
  DialogDescription: ({ children }: { children: ReactNode }) => (
    <p>{children}</p>
  ),
}));
jest.mock("@/components/onboarding/ScanFileUpload", () => ({
  __esModule: true,
  default: ({
    onUploadingChange,
    initialArtifact,
  }: {
    onUploadingChange: (uploading: boolean) => void;
    initialArtifact: string;
  }) => (
    <div>
      <span>{initialArtifact}</span>
      <button onClick={() => onUploadingChange(true)}>Start upload</button>
      <button onClick={() => onUploadingChange(false)}>Finish upload</button>
    </div>
  ),
}));

it("uses the URL artifact and blocks Back until an upload finishes", () => {
  const scrollTo = jest.fn();
  render(
    <ManualIntegrationSlide
      api={{ scrollTo }}
      prevIndex={11}
      onClose={jest.fn()}
    />,
  );
  expect(screen.getByText("selected-artifact")).toBeInTheDocument();
  const back = screen.getByRole("button", { name: "Back" });
  fireEvent.click(screen.getByRole("button", { name: "Start upload" }));
  expect(back).toBeDisabled();
  fireEvent.click(back);
  expect(scrollTo).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Finish upload" }));
  expect(back).toBeEnabled();
  fireEvent.click(back);
  expect(scrollTo).toHaveBeenCalledWith(11);
});
