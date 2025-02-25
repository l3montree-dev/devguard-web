import { getDefaultAssetVersionSlug } from "./useAssetMenu";
import { AssetDTO } from "@/types/api/api";

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
});
