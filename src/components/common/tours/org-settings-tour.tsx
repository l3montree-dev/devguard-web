import type { ConditionalStep } from "@/hooks/usePageTour";
import { TourLink } from "./TourLink";

const DOCS = "https://docs.devguard.org";

export const orgSettingsTourSteps: ConditionalStep[] = [
  {
    selector: '[data-tour="third-party-integrations"]',
    content: (
      <>
        Here you can manage your third-party integrations to directly use
        DevGuard in your code projects.
      </>
    ),
  },
  {
    selector: '[data-tour="webhook"]',
    content: (
      <>
        You can create{" "}
        <TourLink href={`${DOCS}/explanations/integrations/webhook-system`}>
          webhooks
        </TourLink>{" "}
        to receive notifications about events in DevGuard.
      </>
    ),
  },
  {
    selector: '[data-tour="config-file"]',
    content: (
      <>
        You can set global{" "}
        <TourLink href={`${DOCS}/how-to-guides/administration`}>
          configurations
        </TourLink>{" "}
        like scanner tool settings, but these can be overridden at lower levels.
      </>
    ),
  },
  {
    selector: '[data-tour="dependency-proxy"]',
    content: (
      <>
        Here you can manage your{" "}
        <TourLink
          href={`${DOCS}/explanations/security/dependency-proxy-security`}
        >
          dependency proxy
        </TourLink>
        . This allows you to control which dependencies are allowed and speed up
        your builds through caching.
      </>
    ),
  },
  {
    selector: '[data-tour="visibility"]',
    content: (
      <>
        Set your Organization public if your projects are publicly accessible
        and you want to share your{" "}
        <TourLink
          href={`${DOCS}/explanations/vulnerability-management/vulnerability-management-overview`}
        >
          Vulnerability Management
        </TourLink>{" "}
        with others.
      </>
    ),
  },
  {
    selector: '[data-tour="help-center"]',
    content: "Need help? Find guides and restart tours here anytime.",
  },
];
