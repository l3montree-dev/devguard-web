import type { ConditionalStep } from "@/hooks/usePageTour";
import { TourLink } from "./TourLink";

const DOCS = "https://docs.devguard.org";

export const repoSettingsTourSteps: ConditionalStep[] = [
  {
    selector: '[data-tour="repo-settings-header"]',
    content:
      "Welcome to Repository Settings. Here you can configure all aspects of this repository inside DevGuard — from general metadata to integrations and access control.",
  },
  {
    selector: '[data-tour="repo-settings-vuln-management"]',
    content:
      "Enable public access here to share this repository's vulnerability data via a public link — no login required. This lets you share reports or dashboards with external stakeholders directly.",
  },
  {
    selector: '[data-tour="repo-settings-webhook"]',
    content: (
      <>
        Copy the{" "}
        <TourLink href={`${DOCS}/explanations/integrations/webhook-system`}>
          Webhook URL and Secret
        </TourLink>{" "}
        to connect your issue tracker or CI system. DevGuard uses this to
        receive updates — for example, when a ticket is closed — and keep
        vulnerability states in sync.
      </>
    ),
  },
  {
    selector: '[data-tour="repo-settings-config-files"]',
    content: (
      <>
        <TourLink href={`${DOCS}/how-to-guides/administration`}>
          Configuration files
        </TourLink>{" "}
        let you control scanner behaviour at the repository level and override
        project-wide defaults. Open this section to view or edit them.
      </>
    ),
  },
  {
    selector: '[data-tour="repo-settings-dependency-proxy"]',
    content: (
      <>
        The{" "}
        <TourLink
          href={`${DOCS}/explanations/security/dependency-proxy-security`}
        >
          Dependency Proxy
        </TourLink>{" "}
        caches packages from external registries, speeding up builds and
        reducing external network traffic. Configure proxy settings for this
        repository here.
      </>
    ),
  },
  {
    selector: '[data-tour="repo-settings-danger"]',
    content:
      "The Danger Zone lets you delete this repository permanently. All associated vulnerability data, settings, and history will be removed — this action cannot be undone.",
  },
  {
    selector: '[data-tour="help-center"]',
    content: "Need help? Find guides and restart tours here anytime.",
  },
];
