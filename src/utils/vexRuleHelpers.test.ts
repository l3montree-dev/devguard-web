import type { DetailedDependencyVulnDTO, VexRule } from "@/types/api/api";
import {
  getVexRulesSectionLabel,
  isVexRuleAppliedToVuln,
} from "./vexRuleHelpers";

const baseVuln = {
  state: "open",
} as DetailedDependencyVulnDTO;

const falsePositiveRule = {
  id: "rule-1",
  eventType: "falsePositive",
} as VexRule;

const acceptedRule = {
  id: "rule-2",
  eventType: "accepted",
} as VexRule;

describe("isVexRuleAppliedToVuln", () => {
  it("returns true when false positive rule matches vuln state", () => {
    expect(
      isVexRuleAppliedToVuln(falsePositiveRule, {
        ...baseVuln,
        state: "falsePositive",
      }),
    ).toBe(true);
  });

  it("returns false when vuln was reopened (state is open)", () => {
    expect(
      isVexRuleAppliedToVuln(falsePositiveRule, {
        ...baseVuln,
        state: "open",
      }),
    ).toBe(false);
  });

  it("returns true when accepted rule matches vuln state", () => {
    expect(
      isVexRuleAppliedToVuln(acceptedRule, {
        ...baseVuln,
        state: "accepted",
      }),
    ).toBe(true);
  });
});

describe("getVexRulesSectionLabel", () => {
  it('shows "Matching Rules" when rule is not currently applied (reopened vuln)', () => {
    expect(
      getVexRulesSectionLabel([falsePositiveRule], {
        ...baseVuln,
        state: "open",
      }),
    ).toBe("Matching Rules");
  });

  it('shows "Applied Rules" when false positive rule is applied', () => {
    expect(
      getVexRulesSectionLabel([falsePositiveRule], {
        ...baseVuln,
        state: "falsePositive",
      }),
    ).toBe("Applied Rules");
  });

  it('shows "Matching Rules" when only some rules are applied', () => {
    expect(
      getVexRulesSectionLabel([falsePositiveRule, acceptedRule], {
        ...baseVuln,
        state: "falsePositive",
      }),
    ).toBe("Matching Rules");
  });

  it('shows "Matching Rules" when there are no rules', () => {
    expect(getVexRulesSectionLabel([], baseVuln)).toBe("Matching Rules");
  });
});
