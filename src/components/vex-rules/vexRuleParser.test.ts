// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { checkCelSyntax } from "@/components/common/celLinter";
import {
  analyzeVexRuleEffect,
  buildPathPatternRule,
  extractPathPattern,
  resolveCut,
} from "./vexRuleParser";
import type { VexRuleVulnContext } from "@/types/view/vexRules";

const path = ["pkg:npm/a@1.0.0", "pkg:npm/b@2.0.0", "pkg:npm/c@3.0.0"];
const vuln: VexRuleVulnContext = {
  cveID: "CVE-2021-1234",
  componentPurl: "pkg:npm/c@3.0.0",
  vulnerabilityPath: path,
  rootName: "my-app",
};

describe("buildPathPatternRule", () => {
  it("anchors at ROOT and documents the token", () => {
    const rule = buildPathPatternRule(path, 0);
    expect(rule.split("\n")[0]).toMatch(/^\/\/ .*"ROOT".*artifacts/);
    expect(extractPathPattern(rule)).toEqual(["ROOT", ...path]);
  });

  it("names the disputed edge's parent, without ROOT or the ancestors above it", () => {
    // a → b → c ⇥ d : the claim is about c → d, so a and b stay unnamed.
    const deep = [...path, "pkg:npm/d@4.0.0"];
    const rule = buildPathPatternRule(deep, 3);
    expect(rule).not.toContain("ROOT");
    expect(extractPathPattern(rule)).toEqual([
      "*",
      "pkg:npm/c@3.0.0",
      "pkg:npm/d@4.0.0",
    ]);
  });

  it("names the direct dependency when the vulnerable component hangs off it", () => {
    const image =
      "pkg:oci/web@main?arch=arm64&repository_url=registry.opencode.de/oci-community/images/l3montree/devguard/web&tag=main-arm64";
    const braceExpansion = "pkg:npm/brace-expansion@5.0.6";
    const rule = buildPathPatternRule([image, braceExpansion], 1);
    expect(rule).not.toContain("ROOT");
    expect(extractPathPattern(rule)).toEqual(["*", image, braceExpansion]);
  });

  it("scopes the rule to one advisory when a CVE id is given", () => {
    const rule = buildPathPatternRule(path, 1, "GHSA-68g3-v927-f742");
    // vuln.cveId is the identifier column; vuln.cve is the CVE object.
    expect(rule).toContain('vuln.cveId == "GHSA-68g3-v927-f742" &&');
    expect(extractPathPattern(rule)).toEqual([
      "*",
      "pkg:npm/a@1.0.0",
      "pkg:npm/b@2.0.0",
      "pkg:npm/c@3.0.0",
    ]);
  });

  it("produces an expression the CEL linter accepts", () => {
    expect(checkCelSyntax(buildPathPatternRule(path, 1))).toBeNull();
    expect(
      checkCelSyntax(buildPathPatternRule(path, 1, "CVE-2021-1234")),
    ).toBeNull();
  });
});

describe("analyzeVexRuleEffect", () => {
  it("cuts the clicked edge for every generated rule", () => {
    path.forEach((_, edgeIndex) => {
      const effect = analyzeVexRuleEffect(
        buildPathPatternRule(path, edgeIndex),
        vuln,
      );
      expect(effect.type).toBe("pathCut");
      expect(effect.cutIndex).toBe(edgeIndex);
    });
  });

  it("still cuts the clicked edge once the rule is scoped to the advisory", () => {
    path.forEach((_, edgeIndex) => {
      const effect = analyzeVexRuleEffect(
        buildPathPatternRule(path, edgeIndex, vuln.cveID),
        vuln,
      );
      expect(effect).toMatchObject({
        type: "pathCut",
        applies: true,
        cutIndex: edgeIndex,
      });
    });
  });

  it("does not apply when the conjunction names another advisory", () => {
    const effect = analyzeVexRuleEffect(
      buildPathPatternRule(path, 1, "GHSA-68g3-v927-f742"),
      vuln,
    );
    expect(effect).toMatchObject({
      type: "attributeMiss",
      applies: false,
      cutIndex: -1,
      matchedOn: { field: "cveId", value: "GHSA-68g3-v927-f742" },
    });
  });

  it("splits conjunctions around the & inside purls", () => {
    const image =
      "pkg:oci/web@main?arch=arm64&repository_url=registry.opencode.de/oci-community/images/l3montree/devguard/web&tag=main-arm64";
    const next = "pkg:npm/next@16.2.10";
    const imageVuln: VexRuleVulnContext = {
      cveID: "GHSA-68g3-v927-f742",
      componentPurl: next,
      vulnerabilityPath: [image, next],
      rootName: "web",
    };
    const effect = analyzeVexRuleEffect(
      `matchesPattern(vuln, ${JSON.stringify(["ROOT", image, next])}) && vuln.cve.cve == "GHSA-68g3-v927-f742"`,
      imageVuln,
    );
    expect(effect).toMatchObject({
      type: "pathCut",
      applies: true,
      cutIndex: 0,
    });
  });

  it("names the nodes the cut sits between", () => {
    const effect = analyzeVexRuleEffect(buildPathPatternRule(path, 0), vuln);
    expect(resolveCut(vuln, effect.cutIndex)).toEqual({
      parent: "my-app",
      child: "a",
    });
  });

  it("reports a non-matching path rule as intact", () => {
    const effect = analyzeVexRuleEffect(
      'matchesPattern(vuln, ["ROOT", "*", "pkg:npm/other@1.0.0"])',
      vuln,
    );
    expect(effect.type).toBe("pathIntact");
    expect(effect.cutIndex).toBe(-1);
  });

  it("rejects a ROOT-anchored rule that skips path segments", () => {
    expect(
      analyzeVexRuleEffect(
        'matchesPattern(vuln, ["ROOT", "pkg:npm/c@3.0.0"])',
        vuln,
      ).type,
    ).toBe("pathIntact");
  });

  it("cuts below the named parent, keeping the parent reachable", () => {
    // ["*", b, c] disputes b → c, so b stays live and c is dismissed.
    const effect = analyzeVexRuleEffect(
      'matchesPattern(vuln, ["*", "pkg:npm/b@2.0.0", "pkg:npm/c@3.0.0"])',
      vuln,
    );
    expect(effect.cutIndex).toBe(2);
    expect(resolveCut(vuln, effect.cutIndex)).toEqual({
      parent: "b",
      child: "c",
    });
  });

  it("dismisses the component itself when a pattern names only one", () => {
    // Nothing to read as a parent, so the cut sits above the named component.
    const effect = analyzeVexRuleEffect(
      'matchesPattern(vuln, ["*", "pkg:npm/c@3.0.0"])',
      vuln,
    );
    expect(effect.type).toBe("pathCut");
    expect(effect.cutIndex).toBe(2);
    expect(resolveCut(vuln, effect.cutIndex)).toEqual({
      parent: "b",
      child: "c",
    });
  });

  it("classifies attribute rules without a cut", () => {
    const hit = analyzeVexRuleEffect('vuln.cveId == "CVE-2021-1234"', vuln);
    expect(hit).toMatchObject({
      type: "attributeMatch",
      applies: true,
      cutIndex: -1,
      matchedOn: { field: "cveId", value: "CVE-2021-1234" },
    });
    expect(
      analyzeVexRuleEffect('vuln.cveId == "CVE-2000-0001"', vuln).type,
    ).toBe("attributeMiss");
    expect(
      analyzeVexRuleEffect('vuln.componentPurl.startsWith("pkg:npm/c")', vuln)
        .type,
    ).toBe("attributeMatch");
  });

  it("gives up on combined expressions", () => {
    expect(
      analyzeVexRuleEffect(
        'vuln.cveId == "CVE-2021-1234" && vuln.cve.cvss < 4.0',
        vuln,
      ),
    ).toMatchObject({ type: "indeterminate", applies: null, cutIndex: -1 });
  });

  it("ignores expressions that live only inside a comment", () => {
    expect(
      analyzeVexRuleEffect('// vuln.cveId == "CVE-2021-1234"', vuln).type,
    ).toBe("indeterminate");
  });
});
