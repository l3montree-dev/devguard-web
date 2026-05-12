import type { StepType } from "@reactour/tour";

export const groupHomeTourSteps: StepType[] = [
  {
    selector: '[data-tour="menu"]',
    content: "Navigate between the menu items.",
  },
  {
    selector: '[data-tour="create-repository-button"]',
    content: "Create a new repository to connect your software projects.",
  },
  {
    selector: '[data-tour="create-subgroup-button"]',
    content: "Create a new subgroup to organize your software projects.",
  },
];
