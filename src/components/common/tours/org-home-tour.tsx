import type { ConditionalStep } from "@/hooks/usePageTour";

export const orgHomeTourSteps = (isAdmin: boolean): ConditionalStep[] => [
  {
    selector: '[data-tour="org-switcher"]',
    content: "Here you can switch between your organizations.",
  },
  {
    selector: '[data-tour="menu"]',
    content: isAdmin
      ? "Navigate between Overview, Groups, Compliance and Settings."
      : "Navigate between Overview, Groups and Compliance.",
  },
  {
    selector: '[data-tour="create-group-button"]',
    content: "Create a new group to organize your software projects.",
    condition: isAdmin,
  },
  {
    selector: '[data-tour="help-center"]',
    content: "Need help? Find guides and restart tours here anytime.",
  },
];
