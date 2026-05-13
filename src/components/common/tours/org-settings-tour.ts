import type { StepType } from "@reactour/tour";

export const orgSettingsTourSteps: StepType[] = [
  {
    selector: '[data-tour="third-party-integrations"]',
    content:
      "Here you can manage your third-party integrations to directly use DevGuard in your code projects.",
  },
  {
    selector: '[data-tour="webhook"]',
    content:
      "You can create webhooks to receive notifications about events in DevGuard.",
  },
  {
    selector: '[data-tour="config-file"]',
    content:
      "You can set global configurations like scanner tool settings, but these can be overridden at lower levels.",
  },
  {
    selector: '[data-tour="dependency-proxy"]',
    content:
      "Here you can manage your dependency proxy. This allows you to control which dependencies are allowed and speed up your builds through caching.",
  },
  {
    selector: '[data-tour="visibility"]',
    content:
      "Set your Organization public if your projects are publicly accessible and you want to share your Vulnerability Management with others.",
  },
];
