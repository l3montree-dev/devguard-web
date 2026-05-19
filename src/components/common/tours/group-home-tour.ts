import type { ConditionalStep } from "@/hooks/usePageTour";

export const groupHomeTourSteps = (isAdmin: boolean): ConditionalStep[] => [
  {
    selector: '[data-tour="menu"]',
    content: "Navigate between the menu items.",
  },
  {
    selector: '[data-tour="create-repository-button"]',
    content: "Create a new repository to connect your software projects.",
    condition: isAdmin,
  },
  {
    selector: '[data-tour="create-subgroup-button"]',
    content: "Create a new subgroup to organize your software projects.",
    condition: isAdmin,
  },
];
