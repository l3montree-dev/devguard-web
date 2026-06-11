import type { DetailedDependencyVulnDTO, VexRule } from "@/types/api/api";

export function isVexRuleAppliedToVuln(
  rule: VexRule,
  vuln: DetailedDependencyVulnDTO,
): boolean {
  if (rule.eventType === "falsePositive") {
    return vuln.state === "falsePositive";
  }
  if (rule.eventType === "accepted") {
    return vuln.state === "accepted";
  }
  return false;
}

export function getVexRulesSectionLabel(
  rules: VexRule[],
  vuln: DetailedDependencyVulnDTO,
): string {
  if (rules.length === 0) {
    return "Matching Rules";
  }
  const allApplied = rules.every((rule) =>
    isVexRuleAppliedToVuln(rule, vuln),
  );
  return allApplied ? "Applied Rules" : "Matching Rules";
}
