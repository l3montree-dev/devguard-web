import {
  getAssetVersionSlug,
  getDefaultAssetVersionSlug,
} from "./useAssetMenu";

describe("getDefaultAssetVersionSlug", () => {
  it("should return the slug of the default branch if it exists", () => {
    const asset: any = {
      refs: [
        { slug: "version-1", defaultBranch: false },
        { slug: "version-2", defaultBranch: true },
      ],
    };
    expect(getDefaultAssetVersionSlug(asset)).toBe("version-2");
  });

  it("should return the slug of the first branch if no default branch exists", () => {
    const asset: any = {
      refs: [
        { slug: "version-1", defaultBranch: false },
        { slug: "version-2", defaultBranch: false },
      ],
    };
    expect(getDefaultAssetVersionSlug(asset)).toBe("version-1");
  });

  it("should return an empty string if there are no branches", () => {
    const asset: any = {
      refs: [],
    };
    expect(getDefaultAssetVersionSlug(asset)).toBe("");
  });

  describe("getAssetVersionSlug", () => {
    it("should return the default asset version slug if assetVersion is not provided", () => {
      const asset: any = {
        id: "asset-1",
        refs: [
          { slug: "version-1", defaultBranch: false },
          { slug: "version-2", defaultBranch: true },
        ],
      };
      expect(getAssetVersionSlug(asset)).toBe("version-2");
    });

    it("should return the assetVersion slug if assetVersion is provided and matches the asset", () => {
      const asset: any = {
        id: "asset-1",
        refs: [
          { slug: "version-1", defaultBranch: true },
          { slug: "version-2", defaultBranch: false },
        ],
      };
      const assetVersion: any = {
        assetId: "asset-1",
        slug: "version-2",
      };
      expect(getAssetVersionSlug(asset, assetVersion)).toBe("version-2");
    });

    it("should return the default asset version slug if assetVersion is provided but does not match the asset", () => {
      const asset: any = {
        id: "asset-1",
        refs: [
          { slug: "version-1", defaultBranch: false },
          { slug: "version-2", defaultBranch: true },
        ],
      };
      const assetVersion: any = {
        assetId: "asset-2",
        slug: "version-3",
      };
      expect(getAssetVersionSlug(asset, assetVersion)).toBe("version-2");
    });
  });
});
