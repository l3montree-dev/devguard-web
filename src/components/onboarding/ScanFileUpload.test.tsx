// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useActiveAssetVersion } from "@/hooks/useActiveAssetVersion";
import { toast } from "@/lib/toast";
import ScanFileUpload from "./ScanFileUpload";
import {
  uploadSbomFile,
  uploadSarif,
  uploadVex,
} from "@/services/scanUploadService";

jest.mock("@/hooks/useActiveOrg", () => ({
  useActiveOrg: () => ({ slug: "org" }),
}));
jest.mock("@/hooks/useActiveProject", () => ({
  useActiveProject: () => ({ slug: "project" }),
}));
jest.mock("@/hooks/useActiveAsset", () => ({
  useActiveAsset: () => ({ slug: "asset" }),
}));
jest.mock("@/hooks/useActiveAssetVersion", () => ({
  useActiveAssetVersion: jest.fn(),
  useAssetBranchesAndTags: () => ({
    branches: [],
    tags: [{ name: "Release 1", slug: "release-1", type: "tag" }],
  }),
}));
jest.mock("@/components/BranchTagSelector", () => ({
  BranchTagSelector: () => <button>Release 1</button>,
}));
jest.mock("@/components/ArtifactSelector", () => ({
  SimpleArtifactSelector: ({
    selectedArtifact,
  }: {
    selectedArtifact: string;
  }) => <span>{selectedArtifact}</span>,
}));
jest.mock("@/lib/toast", () => ({
  toast: { error: jest.fn(), success: jest.fn() },
}));
jest.mock("@/services/scanUploadService", () => ({
  uploadSbomFile: jest.fn().mockResolvedValue({ ok: true }),
  uploadSarif: jest.fn().mockResolvedValue(undefined),
  uploadVex: jest.fn(),
}));

beforeEach(() => jest.clearAllMocks());

it("uploads to the current tag and selected artifact", async () => {
  const onUploaded = jest.fn();
  render(
    <ScanFileUpload
      onUploaded={onUploaded}
      initialRef={{ name: "Release 1", slug: "release-1", type: "tag" }}
      initialArtifact="existing-artifact"
    />,
  );
  const file = new File(
    [JSON.stringify({ bomFormat: "CycloneDX" })],
    "bom.json",
    { type: "application/json" },
  );
  fireEvent.change(screen.getByTestId("file-upload-input-onboarding-upload"), {
    target: { files: [file] },
  });
  fireEvent.click(
    await screen.findByRole("button", { name: "Upload CycloneDX SBOM" }),
  );
  await waitFor(() =>
    expect(uploadSbomFile).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        branchOrTagName: "Release 1",
        isTag: true,
        artifactName: "existing-artifact",
        origin: "SBOM_DEFAULT",
      }),
      file,
    ),
  );
  expect(onUploaded).toHaveBeenCalledWith(
    "/org/projects/project/assets/asset/refs/release-1/dependency-risks?artifact=existing-artifact",
  );
});

it("detects SARIF and uses the code risks destination", async () => {
  const onUploaded = jest.fn();
  render(<ScanFileUpload onUploaded={onUploaded} showOptions={false} />);
  const content = JSON.stringify({ version: "2.1.0", runs: [] });
  fireEvent.change(screen.getByTestId("file-upload-input-onboarding-upload"), {
    target: {
      files: [
        new File([content], "report.sarif", { type: "application/sarif+json" }),
      ],
    },
  });
  fireEvent.click(
    await screen.findByRole("button", { name: "Upload SARIF report" }),
  );
  await waitFor(() =>
    expect(uploadSarif).toHaveBeenCalledWith(
      expect.objectContaining({ origin: "SARIF_DEFAULT" }),
      content,
    ),
  );
  expect(onUploaded).toHaveBeenCalledWith(
    "/org/projects/project/assets/asset/refs/main/code-risks/",
  );
});

it("detects OpenVEX and uses the VEX destination", async () => {
  jest.mocked(uploadVex).mockResolvedValueOnce(undefined);
  const onUploaded = jest.fn();
  render(<ScanFileUpload onUploaded={onUploaded} />);
  const content = JSON.stringify({
    "@context": "https://openvex.dev/ns/v0.2.0",
  });
  fireEvent.change(screen.getByTestId("file-upload-input-onboarding-upload"), {
    target: {
      files: [new File([content], "vex.json", { type: "application/json" })],
    },
  });
  fireEvent.click(
    await screen.findByRole("button", { name: "Upload VEX document" }),
  );
  await waitFor(() =>
    expect(uploadVex).toHaveBeenCalledWith(
      expect.objectContaining({ origin: "VEX_DEFAULT" }),
      content,
    ),
  );
  expect(onUploaded).toHaveBeenCalledWith(
    "/org/projects/project/assets/asset/vex-rules/",
  );
});

it("rejects malformed JSON without enabling upload", async () => {
  render(<ScanFileUpload onUploaded={jest.fn()} />);
  fireEvent.change(screen.getByTestId("file-upload-input-onboarding-upload"), {
    target: {
      files: [
        new File(["invalid"], "broken.json", { type: "application/json" }),
      ],
    },
  });
  await waitFor(() => expect(toast.error).toHaveBeenCalled());
  expect(screen.getByRole("button", { name: "Upload" })).toBeDisabled();
  expect(uploadSbomFile).not.toHaveBeenCalled();
});

it("uses the active reference when a caller does not pass initialRef", async () => {
  jest.mocked(useActiveAssetVersion).mockReturnValueOnce({
    name: "Release 1",
    slug: "release-1",
    type: "tag",
  } as NonNullable<ReturnType<typeof useActiveAssetVersion>>);
  const onUploaded = jest.fn();
  render(<ScanFileUpload onUploaded={onUploaded} />);
  const content = JSON.stringify({ version: "2.1.0", runs: [] });
  fireEvent.change(screen.getByTestId("file-upload-input-onboarding-upload"), {
    target: {
      files: [
        new File([content], "report.sarif", { type: "application/sarif+json" }),
      ],
    },
  });
  fireEvent.click(
    await screen.findByRole("button", { name: "Upload SARIF report" }),
  );
  await waitFor(() =>
    expect(uploadSarif).toHaveBeenCalledWith(
      expect.objectContaining({ branchOrTagName: "Release 1", isTag: true }),
      content,
    ),
  );
  expect(onUploaded).toHaveBeenCalledWith(
    "/org/projects/project/assets/asset/refs/release-1/code-risks/",
  );
});

it("allows a CycloneDX inventory with VEX statements to use the VEX endpoint", async () => {
  const vex = await import("../../../e2e/assets/vex.json");
  const content = JSON.stringify(vex.default);
  const onUploaded = jest.fn();
  render(<ScanFileUpload onUploaded={onUploaded} />);
  fireEvent.change(screen.getByTestId("file-upload-input-onboarding-upload"), {
    target: {
      files: [new File([content], "vex.json", { type: "application/json" })],
    },
  });
  await screen.findByRole("button", { name: "Upload CycloneDX SBOM" });
  fireEvent.change(screen.getByLabelText("Upload CycloneDX document as"), {
    target: { value: "vex" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Upload VEX document" }));
  await waitFor(() =>
    expect(uploadVex).toHaveBeenCalledWith(
      expect.objectContaining({ origin: "VEX_DEFAULT" }),
      content,
    ),
  );
  expect(uploadSbomFile).not.toHaveBeenCalled();
  expect(onUploaded).toHaveBeenCalledWith(
    "/org/projects/project/assets/asset/vex-rules/",
  );
});

it("keeps upload disabled while pending and releases pending state after a failure", async () => {
  let rejectUpload!: (error: Error) => void;
  jest.mocked(uploadSarif).mockReturnValueOnce(
    new Promise((_, reject) => {
      rejectUpload = reject;
    }),
  );
  const onUploadingChange = jest.fn();
  const onUploaded = jest.fn();
  render(
    <ScanFileUpload
      onUploaded={onUploaded}
      onUploadingChange={onUploadingChange}
    />,
  );
  const content = JSON.stringify({ version: "2.1.0", runs: [] });
  fireEvent.change(screen.getByTestId("file-upload-input-onboarding-upload"), {
    target: {
      files: [
        new File([content], "report.sarif", { type: "application/sarif+json" }),
      ],
    },
  });
  const submit = await screen.findByRole("button", {
    name: "Upload SARIF report",
  });
  fireEvent.click(submit);
  expect(submit).toBeDisabled();
  expect(onUploadingChange).toHaveBeenLastCalledWith(true);
  rejectUpload(new Error("server unavailable"));
  await waitFor(() => expect(submit).toBeEnabled());
  expect(onUploadingChange).toHaveBeenLastCalledWith(false);
  expect(onUploaded).not.toHaveBeenCalled();
  expect(toast.error).toHaveBeenCalledWith(
    "SARIF report has not been sent successfully",
  );
});

it("does not navigate on an unsuccessful SBOM response", async () => {
  jest.mocked(uploadSbomFile).mockResolvedValueOnce({
    ok: false,
    status: 400,
    statusText: "Bad Request",
    headers: { get: () => "text/plain" },
    text: async () => "Invalid SBOM",
  } as unknown as Response);
  const onUploaded = jest.fn();
  render(<ScanFileUpload onUploaded={onUploaded} />);
  fireEvent.change(screen.getByTestId("file-upload-input-onboarding-upload"), {
    target: {
      files: [
        new File([JSON.stringify({ bomFormat: "CycloneDX" })], "bom.json", {
          type: "application/json",
        }),
      ],
    },
  });
  const submit = await screen.findByRole("button", {
    name: "Upload CycloneDX SBOM",
  });
  fireEvent.click(submit);
  await waitFor(() =>
    expect(toast.error).toHaveBeenCalledWith(
      "SBOM has not been sent successfully. Reason: Invalid SBOM",
    ),
  );
  expect(submit).toBeEnabled();
  expect(onUploaded).not.toHaveBeenCalled();
});
