import {
  useActiveAssetVersion,
  useAssetBranchesAndTags,
} from "./useActiveAssetVersion";
import { useStore } from "@/zustand/globalStoreProvider";
import { useActiveAsset } from "./useActiveAsset";
import { renderHook } from "@testing-library/react";

jest.mock("@/zustand/globalStoreProvider");

describe("useActiveAssetVersion", () => {
  it("should return the active asset version if it matches the active asset", () => {
    const mockStore = {
      assetVersion: { assetId: "1", version: "v1" },
      asset: { id: "1" },
    };
    (useStore as jest.Mock).mockImplementation((selector) =>
      selector(mockStore),
    );

    const { result } = renderHook(() => useActiveAssetVersion());

    expect(result.current).toEqual(mockStore.assetVersion);
  });

  it("should return undefined if there is no active asset version", () => {
    const mockStore = {
      assetVersion: null,
      asset: { id: "1" },
    };
    (useStore as jest.Mock).mockImplementation((selector) =>
      selector(mockStore),
    );

    const { result } = renderHook(() => useActiveAssetVersion());

    expect(result.current).toBeUndefined();
  });

  it("should return undefined if the asset version does not match the active asset", () => {
    const mockStore = {
      assetVersion: { assetId: "2", version: "v1" },
      asset: { id: "1" },
    };
    (useStore as jest.Mock).mockImplementation((selector) =>
      selector(mockStore),
    );

    const { result } = renderHook(() => useActiveAssetVersion());

    expect(result.current).toBeUndefined();
  });
});

jest.mock("./useActiveAsset");
describe("useAssetBranchesAndTags", () => {
  it("should return branches and tags of the active asset", () => {
    const mockActiveAsset = {
      refs: [
        { type: "branch", name: "main" },
        { type: "branch", name: "develop" },
        { type: "tag", name: "v1.0" },
      ],
    };
    (useActiveAsset as jest.Mock).mockReturnValue(mockActiveAsset);

    const { result } = renderHook(() => useAssetBranchesAndTags());

    expect(result.current.branches).toEqual([
      { type: "branch", name: "main" },
      { type: "branch", name: "develop" },
    ]);
    expect(result.current.tags).toEqual([{ type: "tag", name: "v1.0" }]);
  });

  it("should return empty arrays if there is no active asset", () => {
    (useActiveAsset as jest.Mock).mockReturnValue(null);

    const { result } = renderHook(() => useAssetBranchesAndTags());

    expect(result.current.branches).toEqual([]);
    expect(result.current.tags).toEqual([]);
  });
});
