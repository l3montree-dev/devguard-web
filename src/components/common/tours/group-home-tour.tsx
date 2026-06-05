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
  {
    selector: '[data-tour="subgroups-repositories-actions"]',
    content:
      "Admins can create new subgroups and repositories from here. If you need a new subgroup or repository, please contact your administrator.",
    condition: !isAdmin,
  },
  {
    selector: '[data-tour="group-filter"]',
    content:
      "Use sorting and search to filter the list of subgroups and repositories.",
  },
  {
    selector: '[data-tour="help-center"]',
    content: "Need help? Find guides and restart tours here anytime.",
  },
];
