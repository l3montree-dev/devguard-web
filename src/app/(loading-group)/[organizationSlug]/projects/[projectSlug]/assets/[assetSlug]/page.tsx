// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";
import AssetTitle from "@/components/common/AssetTitle";
import Section from "@/components/common/Section";
import Page from "@/components/Page";
import PageSkeleton from "@/components/PageSkeleton";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import "@xyflow/react/dist/style.css";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import type { FunctionComponent } from "react";
import Autosetup from "../../../../../../../components/Autosetup";
import { useAsset } from "../../../../../../../context/AssetContext";
import { useConfig } from "../../../../../../../context/ConfigContext";
import { useAutosetup } from "../../../../../../../hooks/useAutosetup";
import useDecodedParams from "../../../../../../../hooks/useDecodedParams";
import { isLoggedIn, useCurrentUserRole } from "@/hooks/useUserRole";
import {
  Boxes,
  Code,
  Blocks,
  KeyRound,
  ListChecks,
  Ship,
  FolderGit2,
  Ticket,
  Webhook,
  Workflow,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import IssueTrackerConnect from "@/components/onboarding/IssueTrackerConnect";
import RepositorySelector from "@/components/guides/webhook-setup-carousel-slides/RepositorySelector";
import WebhookSecretSetup, {
  webhookInstructions,
} from "@/components/guides/webhook-setup-carousel-slides/WebhookSecretSetup";
import useScannerImage from "../../../../../../../hooks/useScannerImage";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { useActiveOrg } from "../../../../../../../hooks/useActiveOrg";
import { useAutoTour } from "@/hooks/useAutoTour";
import { repoSetupTourSteps } from "@/components/common/tours/repoSetupTour";
import OnboardingSteps from "@/components/onboarding/OnboardingSteps";
import ScanFileUpload from "@/components/onboarding/ScanFileUpload";
import ScannerOptionsFields from "@/components/guides/risk-scanner-carousel-slides/ScannerOptionsFields";
import CiTokenSetup, {
  ciTokenInstructions,
  type CiProvider,
} from "@/components/guides/risk-scanner-carousel-slides/CiTokenSetup";
import PipelineSnippet, {
  pipelineFileHint,
} from "@/components/guides/risk-scanner-carousel-slides/PipelineSnippet";
import type { Config } from "@/types/common";

const DOCS = "https://docs.devguard.org";

const alternatives = [
  {
    icon: Code,
    title: "DevGuard CLI",
    description:
      "Run the same scans locally or in any other CI system and upload the results.",
    href: `${DOCS}/how-to-guides/scanning/scan-your-project/`,
  },
  {
    icon: Boxes,
    title: "DevGuard API",
    description: "Integrate DevGuard into your own tooling.",
    href: `${DOCS}/getting-started/use-devguard-api/`,
  },
  {
    icon: Ship,
    title: "Integrations and Connectors (e.g. Kubernetes)",
    description:
      "Wire it into your registry, bring it into your editor, or let AI agents work with it.",
    href: `https://devguard.org/ecosystem-projects`,
  },
];

const Index: FunctionComponent = () => {
  const assetMenu = useAssetMenu();
  const role = useCurrentUserRole();
  const config = useConfig();
  const latestScannerImage = useScannerImage();
  const autosetup = useAutosetup(
    true,
    config.devguardApiUrlPublicInternet,
    "full",
  );
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useDecodedParams() as {
    organizationSlug: string;
    projectSlug: string;
    assetSlug: string;
  };
  const activeOrg = useActiveOrg();
  // check if we can redirect to the first ref
  const asset = useAsset();

  const [scannerConfig, setScannerConfig] = useState<Config>({
    "secret-scanning": true,
    sast: true,
    iac: true,
    sca: true,
    build: true,
    "container-scanning": true,
    push: true,
    sign: true,
    attest: true,
    sbom: false,
    sarif: false,
  });
  // undefined until the user picks one - defaults to the repository provider
  const [ciProviderChoice, setCiProvider] = useState<CiProvider>();

  useEffect(() => {
    if (!asset || asset.refs.length === 0) {
      return;
    }

    // redirect to the default ref
    let redirectTo = asset.refs.find((r) => r.defaultBranch);
    // if there is no default ref, redirect to the first one
    if (!redirectTo) {
      redirectTo = asset.refs[0];
    }
    let destination = `/${params.organizationSlug}/projects/${params.projectSlug}/assets/${params.assetSlug}/refs/${redirectTo.slug}`;
    const startTour = searchParams?.get("startTour");
    if (startTour) {
      destination += `?startTour=${startTour}`;
    }
    router.replace(destination);
  }, [
    asset,
    params.organizationSlug,
    params.projectSlug,
    params.assetSlug,
    router,
    searchParams,
  ]);

  const showSetupCards = Boolean(
    asset && asset.refs.length === 0 && isLoggedIn(role),
  );

  useAutoTour("repo-setup", showSetupCards ? repoSetupTourSteps : []);

  if (!asset) {
    return <PageSkeleton />;
  }
  if (asset.refs.length > 0) {
    return <PageSkeleton />;
  }

  const onUploaded = (destination: string) => {
    // hard navigation - a fresh asset has a cached 404 for its refs
    window.location.href = destination;
  };

  // assets synced from an external entity provider - gitlab and opencode, both are GitLab instances
  const isSyncedFromGitLab = Boolean(asset.externalEntityProviderId);
  const isGitLab = isSyncedFromGitLab || asset.repositoryProvider === "gitlab";

  const ciProvider: CiProvider =
    ciProviderChoice ?? (isGitLab ? "gitlab" : "github");
  const gitInstance = ciProvider === "github" ? "GitHub" : "Gitlab";

  const customSetup = (
    <div data-tour="onboarding-steps">
      <OnboardingSteps
        hint="Integrate DevGuard into your CI/CD pipeline to scan on every push."
        storageKey={`devguard:onboarding:${asset.id}`}
        steps={[
          {
            id: "build-platform",
            icon: Blocks,
            title: "Choose your build platform",
            summary: "Where does your CI/CD pipeline run?",
            description:
              "DevGuard generates the pipeline configuration for the platform you choose.",
            content: (
              <ToggleGroup
                type="single"
                variant="outline"
                className="justify-start"
                value={ciProvider}
                onValueChange={(v) => v && setCiProvider(v as CiProvider)}
              >
                <ToggleGroupItem
                  value="github"
                  className="data-[state=on]:border-primary"
                >
                  GitHub Actions
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="gitlab"
                  className="data-[state=on]:border-primary"
                >
                  GitLab CI/CD
                </ToggleGroupItem>
              </ToggleGroup>
            ),
          },
          {
            id: "select-scans",
            icon: ListChecks,
            title: "Select your scans",
            summary: "Choose the scans DevGuard should run in your pipeline.",
            description:
              "Choose from our curated list of scan and scanner setups to integrate.",
            content: (
              <ScannerOptionsFields
                config={scannerConfig}
                setConfig={setScannerConfig}
                variant="onCard"
              />
            ),
          },
          {
            id: "add-token",
            icon: KeyRound,
            title: "Add the DevGuard token",
            summary:
              "Store a DevGuard token as a secret in your CI/CD settings.",
            description: (
              <>
                <span className="font-medium text-foreground">
                  {ciTokenInstructions[ciProvider].title}
                </span>
                <br />
                {ciTokenInstructions[ciProvider].description}
              </>
            ),
            content: <CiTokenSetup provider={ciProvider} variant="onCard" />,
          },
          {
            id: "add-pipeline",
            icon: Workflow,
            title: "Add the pipeline",
            summary:
              "Add the DevGuard jobs to your pipeline and push to run your first scan.",
            description: pipelineFileHint,
            content: (
              <PipelineSnippet
                scannerImage={latestScannerImage}
                gitInstance={gitInstance}
                config={scannerConfig}
                orgSlug={activeOrg.slug}
                projectSlug={params.projectSlug}
                assetSlug={asset.slug}
                apiUrl={config.devguardApiUrlPublicInternet}
                frontendUrl={config.frontendUrl}
                devguardCIComponentBase={config.devguardCIComponentBase}
                variant="onCard"
              />
            ),
            docs: [
              ciProvider === "github"
                ? {
                    label: "Scan with GitHub Actions",
                    href: `${DOCS}/how-to-guides/scanning/scan-with-github-actions/`,
                  }
                : {
                    label: "Scan with GitLab CI",
                    href: `${DOCS}/how-to-guides/scanning/scan-with-gitlab-ci/`,
                  },
              {
                label: "Branches, tags and artifacts",
                href: `${DOCS}/how-to-guides/scanning/branches-tags-and-artifacts/`,
              },
            ],
          },
          {
            id: "issue-tracker",
            icon: Ticket,
            title: "Connect your issue tracker",
            summary: "Let DevGuard create tickets in GitHub, GitLab or Jira.",
            description: isSyncedFromGitLab
              ? "Whenever DevGuard detects a new risk, it creates a ticket in your project. Invite the DevGuard Bot, so it is allowed to do so."
              : "Whenever DevGuard detects a new risk, it creates a ticket in your issue tracker. There you can work on the risk and even use slash commands to apply mitigation strategies.",
            content: <IssueTrackerConnect variant="onCard" />,
            docs: [
              {
                label: "Jira Integration",
                href: `${DOCS}/explanations/integrations/jira-integration/`,
              },
              {
                label: "GitLab Ticket Sync",
                href: `${DOCS}/how-to-guides/integrations/gitlab/ticket-sync/`,
              },
            ],
          },
          // synced assets are already linked to their repository
          ...(isSyncedFromGitLab
            ? []
            : [
                {
                  id: "select-repository",
                  icon: FolderGit2,
                  title: "Select the repository",
                  summary:
                    "Choose where DevGuard creates the tickets for this repository.",
                  description:
                    "Connect this repository with a repository or project of your issue tracker.",
                  content: (
                    <RepositorySelector
                      repositoryId={asset.repositoryId}
                      repositoryName={asset.repositoryName}
                      variant="onCard"
                    />
                  ),
                },
              ]),
          {
            id: "add-webhook",
            icon: Webhook,
            title: "Add the webhook",
            summary: "Keep tickets and risks in sync in both directions.",
            description: webhookInstructions,
            content: <WebhookSecretSetup variant="onCard" />,
          },
        ]}
      />
    </div>
  );

  return (
    <Page
      Menu={assetMenu}
      title="Welcome to DevGuard!"
      description="Overview of the asset"
      Title={<AssetTitle />}
    >
      {isLoggedIn(role) ? (
        <Section primaryHeadline forceVertical title="Welcome to DevGuard 🚀">
          {isSyncedFromGitLab ? (
            // assets of external entity providers support the auto-setup, which
            // takes care of all onboarding steps at once - the custom setup is the manual alternative
            <Tabs defaultValue="auto-setup">
              <TabsList>
                <TabsTrigger value="auto-setup">Auto-Setup</TabsTrigger>
                <TabsTrigger value="custom-setup">Custom setup</TabsTrigger>
              </TabsList>
              <TabsContent value="auto-setup" className="mt-4">
                <Autosetup {...autosetup} />
              </TabsContent>
              <TabsContent value="custom-setup" className="mt-4">
                {customSetup}
              </TabsContent>
            </Tabs>
          ) : (
            customSetup
          )}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card data-tour="onboarding-upload" className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">
                  Already have a report?
                </CardTitle>
                <CardDescription>
                  Upload a CycloneDX SBOM, a SARIF report or a VEX document. The
                  file type is detected automatically.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <ScanFileUpload
                  onUploaded={onUploaded}
                  showOptions={false}
                  variant="onCard"
                />
              </CardContent>
            </Card>
            <Card data-tour="onboarding-alternatives">
              <CardHeader>
                <CardTitle className="text-lg">
                  Other ways to get started
                </CardTitle>
                <CardDescription>
                  Not using GitHub Actions or GitLab CI/CD? These guides show
                  alternative setups.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ItemGroup className="gap-2">
                  {alternatives.map((a) => (
                    <Item key={a.title} variant="outline" size="sm">
                      <ItemMedia variant="icon">
                        <a.icon />
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle>{a.title}</ItemTitle>
                        <ItemDescription>{a.description}</ItemDescription>
                      </ItemContent>
                      <ItemActions>
                        <Button size="xs" variant="outline" asChild>
                          <a
                            href={a.href}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Docs
                          </a>
                        </Button>
                      </ItemActions>
                    </Item>
                  ))}
                </ItemGroup>
              </CardContent>
            </Card>
          </div>
        </Section>
      ) : (
        <Section
          primaryHeadline
          forceVertical
          description="There is not any data to show yet."
          title="This Repository is empty"
        >
          <div></div>
        </Section>
      )}
    </Page>
  );
};
export default Index;
