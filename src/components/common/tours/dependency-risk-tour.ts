import type { StepType } from "@reactour/tour";

export const dependencyRiskTourSteps: StepType[] = [
  {
    selector: '[data-tour="path"]',
    content:
      "Here you can see the path to component. You can interact with the graph to visit your dependencies.",
  },
  {
    selector: '[data-tour="risk-score with details"]',
    content:
      "Here you see the overall risk score and can check detailed risk assessment information.",
  },
  {
    selector: '[data-tour="affected-component"]',
    content:
      "Here you can see the affected component and how DevGuard matches vulnerabilities.",
  },
  {
    selector: '[data-tour="vuln-management"]',
    content:
      "Here you can manage vulnerabilities and their associated risks to identify them as false positives or confirmed issues.",
  },
];
