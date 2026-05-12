import type { StepType } from "@reactour/tour";

export const repoHomeTourSteps: StepType[] = [
  {
    selector: '[data-tour="menu"]',
    content:
      "Overview gives you a quick glance at your repository's status, Dependency Risk lists all identified risks, Code Risks shows potential issues in your code and License Compliance ensures your projects adhere to licensing requirements. Also you can see your Dependency Insights and create VEX Rules to manage vulnerabilities effectively and also manage your artifacts and settings.",
  },
  {
    selector: '[data-tour="branch-switcher"]',
    content: "You can switch between your branches like you do in Git.",
  },
  {
    selector: '[data-tour="artifact-switcher"]',
    content:
      "You can switch between your artifacts to analyze different architectures or versions.",
  },
  {
    selector: '[data-tour="risk-cvss-values"]',
    content:
      "Choose between our Risk Score, which shows you the true dependent severity of the vulnerability for your project, or the official CVSS score, which shows the severity of a weak point in general.",
  },
];
