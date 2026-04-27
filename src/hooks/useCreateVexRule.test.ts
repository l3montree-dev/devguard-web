import { buildVexPathPattern } from "./useCreateVexRule";
import type { VexSelection } from "@/components/DependencyGraph";

describe("buildVexPathPattern", () => {
  it("returns null for empty path", () => {
    const selection: VexSelection = {
      type: "node",
      justification: "not_present",
      path: [],
    };
    expect(buildVexPathPattern(selection)).toBeNull();
  });

  describe("node selection", () => {
    it("wraps the node with leading and trailing wildcard", () => {
      const selection: VexSelection = {
        type: "node",
        justification: "not_present",
        path: ["pkg:golang/vuln-lib"],
      };
      expect(buildVexPathPattern(selection)).toEqual([
        "*",
        "pkg:golang/vuln-lib",
        "*",
      ]);
    });

    it("uses only the first path element (the clicked node)", () => {
      const selection: VexSelection = {
        type: "node",
        justification: "not_present",
        path: ["pkg:golang/middle", "pkg:golang/vuln-lib"],
      };
      expect(buildVexPathPattern(selection)).toEqual([
        "*",
        "pkg:golang/middle",
        "*",
      ]);
    });
  });

  describe("edge selection", () => {
    it("prepends a leading wildcard to the full suffix path", () => {
      const selection: VexSelection = {
        type: "edge",
        justification: "does_not_call_vulnerable_function",
        path: ["pkg:golang/middle", "pkg:golang/vuln-lib"],
        childIndex: 1,
      };
      expect(buildVexPathPattern(selection)).toEqual([
        "*",
        "pkg:golang/middle",
        "pkg:golang/vuln-lib",
      ]);
    });

    it("includes the full suffix chain from the clicked edge to the leaf", () => {
      const selection: VexSelection = {
        type: "edge",
        justification: "inline_mitigations",
        path: ["pkg:golang/a", "pkg:golang/b", "pkg:golang/vuln-lib"],
        childIndex: 1,
      };
      expect(buildVexPathPattern(selection)).toEqual([
        "*",
        "pkg:golang/a",
        "pkg:golang/b",
        "pkg:golang/vuln-lib",
      ]);
    });
  });
});
