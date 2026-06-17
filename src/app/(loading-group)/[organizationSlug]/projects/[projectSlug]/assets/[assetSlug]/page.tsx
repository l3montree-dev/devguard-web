"use client";
import AssetTitle from "@/components/common/AssetTitle";
import Section from "@/components/common/Section";
import WebhookSetupTicketIntegrationDialog from "@/components/guides/WebhookSetupTicketIntegrationDialog";
import Page from "@/components/Page";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import "@xyflow/react/dist/style.css";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import type { FunctionComponent } from "react";
import Autosetup from "../../../../../../../components/Autosetup";
import RiskScannerDialog from "../../../../../../../components/RiskScannerDialog";
import { useAsset } from "../../../../../../../context/AssetContext";
import { useConfig } from "../../../../../../../context/ConfigContext";
import { useAutosetup } from "../../../../../../../hooks/useAutosetup";
import useDecodedParams from "../../../../../../../hooks/useDecodedParams";
import { externalProviderIdToIntegrationName } from "../../../../../../../utils/externalProvider";
import { isLoggedIn, useCurrentUserRole } from "@/hooks/useUserRole";
import usePersonalAccessToken from "@/hooks/usePersonalAccessToken";
import { SearchCode, Code, Blocks, Upload, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import useScannerImage from "../../../../../../../hooks/useScannerImage";
import { Button } from "@/components/ui/button";
import { InputWithButton } from "@/components/ui/input-with-button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDownIcon } from "lucide-react";
import { EssentialProjectConfigContent } from "@/components/common/EssentialProjectConfigDrawer";
import { useActiveOrg } from "../../../../../../../hooks/useActiveOrg";

const Index: FunctionComponent = () => {
  const assetMenu = useAssetMenu();
  const role = useCurrentUserRole();
  const [riskScanningIsOpen, setRiskScanningOpen] = useState(false);
  const [riskScanningInitialSlide, setRiskScanningInitialSlide] = useState<
    number | undefined
  >(undefined);
  const [webhookIsOpen, setWebhookIsOpen] = useState(false);
  const config = useConfig();
  const latestScannerImage = useScannerImage();
  const autosetup = useAutosetup(
    !riskScanningIsOpen,
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
  ]);

  if (!asset) {
    return null;
  }

  // Show loading state while redirecting
  if (asset.refs.length > 0) {
    return null;
  }

  return (
    <Page
      Menu={assetMenu}
      title="Welcome to DevGuard!"
      description="Overview of the asset"
      Title={<AssetTitle />}
    >
      {isLoggedIn(role) ? (
        <Section primaryHeadline forceVertical title="Welcome to DevGuard 🚀">
          {((asset?.externalEntityProviderId &&
            externalProviderIdToIntegrationName(
              asset.externalEntityProviderId,
            ) === "gitlab") ||
            asset?.repositoryProvider === "gitlab") && (
            <>
              <div className="mb-8">
                {asset?.externalEntityId || asset?.repositoryId ? (
                  // Asset is connected to an actual repository — autosetup is usable
                  activeOrg.gitLabIntegrations.length > 0 ? (
                    <Autosetup {...autosetup} />
                  ) : (
                    <div className="flex flex-col gap-4 rounded-lg border bg-card p-8">
                      <div className="flex flex-col gap-2">
                        <span className="font-semibold text-foreground">
                          GitLab Integration required for Auto Setup
                        </span>
                        <span className="text-sm text-muted-foreground">
                          To use the Auto Setup feature, you need to configure a
                          GitLab integration for your organization first.
                        </span>
                      </div>
                      <Button
                        className="self-start"
                        onClick={() => {
                          setRiskScanningInitialSlide(2);
                          setRiskScanningOpen(true);
                        }}
                      >
                        Set up GitLab Integration
                      </Button>
                    </div>
                  )
                ) : (
                  // No repository connected yet — guide the user to connect one
                  <div className="flex flex-col gap-4 rounded-lg border bg-card p-8">
                    <div className="flex flex-col gap-2">
                      <span className="font-semibold text-foreground">
                        Connect a GitLab repository for Auto Setup
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Link this asset to a GitLab repository to use the Auto
                        Setup feature.
                      </span>
                    </div>
                    <Button
                      className="self-start"
                      onClick={() => {
                        // ProviderSetupSlide (slide 3) if integration exists, else GitLabIntegrationSlide (slide 2)
                        setRiskScanningInitialSlide(
                          activeOrg.gitLabIntegrations.length > 0 ? 3 : 2,
                        );
                        setRiskScanningOpen(true);
                      }}
                    >
                      Connect Repository
                    </Button>
                  </div>
                )}
              </div>
              <hr className="mb-8" />
            </>
          )}
          <Card className="space-y-1.5 p-6">
            <div className="flex gap-x-3 items-top">
              <div className="flex items-center justify-center w-10 h-10 rounded-md bg-secondary">
                <SearchCode className="w-5 h-5 text-secondary-foreground/70" />
              </div>
              <div className="flex-1">
                <span className="font-semibold text-foreground">
                  Check your Code for Risks
                </span>
                <div className="text-sm text-muted-foreground">
                  Scan your code, dependencies, and infrastructure for
                  vulnerabilities, leaked secrets, bad practices, and license
                  issues. <br /> Connect your CI/CD pipeline to scan on every
                  push.
                </div>
                {(() => {
                  const isGitLab =
                    (asset?.externalEntityProviderId &&
                      externalProviderIdToIntegrationName(
                        asset.externalEntityProviderId,
                      ) === "gitlab") ||
                    asset?.repositoryProvider === "gitlab";

                  // Slide indices in RiskScannerDialog carousel:
                  // 7  = ScannerOptionsSelectionSlide (CI/CD tools)
                  // 16 = DevGuardCliSlide
                  // 11 = IntegrationMethodSelectionSlide (manual upload)
                  // 15 = SetupInformationSourceSlide (supplier URL)
                  const allCards = [
                    {
                      icon: <Blocks />,
                      name: "DevGuard CI/CD Integration",
                      sub: "From our curated list of scans and scanners, select the ones you want to use.",
                      recommended: true,
                      githubOnly: false,
                      slide: 7,
                    },
                    {
                      icon: <Code />,
                      name: "DevGuard CLI",
                      sub: "Use the DevGuard CLI to run scans and upload the results to DevGuard.",
                      recommended: false,
                      githubOnly: false,
                      slide: 16,
                    },
                    {
                      icon: <Upload />,
                      name: "Manually Upload",
                      sub: "You already have a SARIF/ SBOM file and want to scan for known vulnerabilities or manage your findings.",
                      recommended: false,
                      githubOnly: false,
                      slide: 11,
                    },
                    {
                      icon: <Link2 />,
                      name: "Supplier provided URL",
                      sub: "Provide SBOM URLs to setup DevGuard based on external data sources. This data will be periodically fetched and updated.",
                      recommended: false,
                      githubOnly: false,
                      slide: 15,
                    },
                  ];

                  const cards = allCards.filter((c) =>
                    isGitLab ? !c.githubOnly : true,
                  );

                  return (
                    <div
                      className={`grid gap-4 mt-4 ${cards.length === 3 ? "grid-cols-3" : "grid-cols-4"}`}
                    >
                      {cards.map(({ icon, name, sub, recommended, slide }) => (
                        <button
                          key={name}
                          type="button"
                          data-tour={
                            recommended ? "setup-risk-scan" : undefined
                          }
                          className={`flex flex-col gap-1.5 rounded-lg border cursor-pointer hover:bg-muted p-4 text-left ${
                            recommended ? "border-primary" : "border-secondary"
                          }`}
                          onClick={() => {
                            setRiskScanningInitialSlide(slide);
                            setRiskScanningOpen(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            {icon}
                            {recommended && (
                              <Badge
                                variant="default"
                                className="text-xs text-primary-foreground"
                              >
                                Recommended
                              </Badge>
                            )}
                          </div>
                          <span className="text-base font-medium">{name}</span>
                          <span className="text-sm leading-relaxed text-muted-foreground">
                            {sub}
                          </span>
                        </button>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          </Card>
          <Collapsible className="mb-6 mt-4 pb-6 cursor-pointer border rounded-lg p-6 bg-card">
            <CollapsibleTrigger className="flex w-full items-center justify-between group cursor-pointer">
              <div className="text-left">
                <h2 className="text-base font-semibold leading-7 text-foreground">
                  Project Config
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  These values are required to connect your CI/CD pipeline or
                  tooling to this asset.
                </p>
              </div>
              <ChevronDownIcon className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-4">
                <EssentialProjectConfigContent
                  organizationSlug={params.organizationSlug}
                  projectSlug={params.projectSlug}
                  assetSlug={params.assetSlug}
                  repositoryProvider={asset.repositoryProvider}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
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
      <RiskScannerDialog
        open={riskScanningIsOpen}
        onOpenChange={setRiskScanningOpen}
        apiUrl={config.devguardApiUrlPublicInternet}
        frontendUrl={config.frontendUrl}
        devguardCIComponentBase={config.devguardCIComponentBase}
        devguardWebLatestScannerImage={latestScannerImage}
        initialSlide={riskScanningInitialSlide}
      />
      <WebhookSetupTicketIntegrationDialog
        open={webhookIsOpen}
        onOpenChange={setWebhookIsOpen}
      />
    </Page>
  );
};
export default Index;
