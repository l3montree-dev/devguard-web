import { act, renderHook, waitFor } from "@testing-library/react";
import { EventEmitter } from "events";

import { createPat } from "@/services/patService";
import type {
  AsymmetricPersonalAccessTokenDTO,
  SeeOncePatWithPrivKey,
} from "@/types/api/api";
import usePersonalAccessToken from "./usePersonalAccessToken";

jest.mock("@/services/patService", () => ({
  createPat: jest.fn(),
}));

jest.mock("@/services/devGuardApi", () => ({
  browserApiClient: jest.fn(),
}));

const tokenBase = (id: string) => ({
  createdAt: "2026-08-09T00:00:00Z",
  description: `Token ${id}`,
  expiryDateUnix: 1_800_000_000,
  id,
  lastUsedAt: null,
  scopes: "scan",
  userId: "user-1",
});

const storedToken = (id: string): SeeOncePatWithPrivKey => ({
  ...tokenBase(id),
  privKey: `private-${id}`,
});

describe("usePersonalAccessToken", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("does not duplicate a stored token when the hook remounts", async () => {
    const existingToken: AsymmetricPersonalAccessTokenDTO = {
      ...tokenBase("pat-1"),
      fingerprint: "fingerprint-1",
      pubKey: "public-key-1",
    };
    sessionStorage.setItem("pat", JSON.stringify(storedToken("pat-1")));

    const firstRender = renderHook(() =>
      usePersonalAccessToken([existingToken]),
    );
    await waitFor(() => {
      expect(firstRender.result.current.personalAccessTokens).toHaveLength(1);
    });
    firstRender.unmount();

    const secondRender = renderHook(() =>
      usePersonalAccessToken([existingToken]),
    );
    await waitFor(() => {
      expect(
        secondRender.result.current.personalAccessTokens.map(({ id }) => id),
      ).toEqual(["pat-1"]);
    });
  });

  it("keeps separately created tokens that do not have fingerprints", async () => {
    const firstToken = storedToken("pat-1");
    const secondToken = storedToken("pat-2");
    const mockedCreatePat = createPat as jest.MockedFunction<typeof createPat>;
    mockedCreatePat
      .mockResolvedValueOnce(firstToken)
      .mockResolvedValueOnce(secondToken);

    const { result } = renderHook(() => usePersonalAccessToken());
    const input = {
      description: "CI token",
      expiryDateUnix: 1_800_000_000,
      scopes: "scan",
      symmetric: false as const,
    };

    await act(async () => {
      await result.current.onCreatePat(input);
      await result.current.onCreatePat(input);
    });

    expect(result.current.personalAccessTokens.map(({ id }) => id)).toEqual([
      "pat-1",
      "pat-2",
    ]);
  });

  it("unsubscribes from token events when the hook unmounts", () => {
    const on = jest.spyOn(EventEmitter.prototype, "on");
    const off = jest.spyOn(EventEmitter.prototype, "off");

    const { unmount } = renderHook(() => usePersonalAccessToken());
    const subscriptions = on.mock.calls.filter(([event]) => event === "pat");
    const listener = subscriptions[subscriptions.length - 1]?.[1];
    expect(listener).toEqual(expect.any(Function));

    unmount();

    expect(off).toHaveBeenCalledWith("pat", listener);
  });
});
