import { act, renderHook, waitFor } from "@testing-library/react";
import { toast } from "sonner";

import { browserApiClient } from "@/services/devGuardApi";
import { useAutosetup } from "./useAutosetup";

jest.mock("@/services/devGuardApi", () => ({
  browserApiClient: jest.fn(),
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

const onCreatePat = jest.fn();

jest.mock("./usePersonalAccessToken", () => ({
  __esModule: true,
  default: () => ({
    personalAccessTokens: [],
    onCreatePat,
  }),
}));

describe("useAutosetup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    onCreatePat.mockResolvedValue({ privKey: "secret" });
    (browserApiClient as jest.Mock).mockResolvedValue({ ok: false });
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
    expect(toast).toHaveBeenCalledWith("Failed to setup GitLab integration");
  });
});
