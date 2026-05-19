import type { StepType } from "@reactour/tour";

export const orgHomeTourSteps: StepType[] = [
  {
    selector: '[data-tour="org-switcher"]',
    content: "Here you can switch between your organizations.",
  },
  {
    selector: '[data-tour="menu"]',
    content: "Navigate between Overview, Groups, Compliance and Settings.",
  },
  {
    selector: '[data-tour="create-group-button"]',
    content: "Create a new group to organize your software projects.",
  },
  {
    selector: '[data-tour="help-center"]',
    content: "Need help? Find guides and restart tours here anytime.",
  },
];
