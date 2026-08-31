// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { act, renderHook, waitFor } from "@testing-library/react";
import { toast } from "sonner";

import { TOASTER_ID } from "@/lib/toast";
import { apiFetch } from "@/services/apiClient";
import { useAutosetup } from "./useAutosetup";

jest.mock("@/services/apiClient", () => ({
  ...jest.requireActual("@/services/apiClient"),
  apiFetch: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: Object.assign(jest.fn(), {
    error: jest.fn(),
  }),
}));

jest.mock("./useActiveAsset", () => ({
  useActiveAsset: () => ({
    slug: "asset-a",
    externalEntityProviderId: undefined,
  }),
}));

jest.mock("./useActiveOrg", () => ({
  useActiveOrg: () => ({
    slug: "org-a",
    externalEntityProviderId: undefined,
  }),
}));

jest.mock("./useActiveProject", () => ({
  useActiveProject: () => ({
    slug: "project-a",
  }),
}));

const onCreateAccessToken = jest.fn();

jest.mock("./useAccessToken", () => ({
  __esModule: true,
  default: () => ({
    AccessToken: [],
    accessToken: undefined,
    onCreateAccessToken: onCreateAccessToken,
  }),
}));

describe("useAutosetup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    onCreateAccessToken.mockResolvedValue({ privKey: "secret" });
    (apiFetch as jest.Mock).mockResolvedValue({ ok: false });
  });

  it("stops loading when autosetup request fails", async () => {
    const { result } = renderHook(() =>
      useAutosetup(false, "https://devguard.example", "full"),
    );

    await act(async () => {
      await result.current.handleAutosetup(false);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    // Toasts go through @/lib/toast, which routes them to devguard's toaster.
    expect(toast).toHaveBeenCalledWith(
      "Failed to setup GitLab integration",
      expect.objectContaining({ toasterId: TOASTER_ID }),
    );
  });
});
