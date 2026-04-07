"use client";
import AssetTitle from "@/components/common/AssetTitle";
import CopyCode from "@/components/common/CopyCode";
import Section from "@/components/common/Section";
import WebhookSetupTicketIntegrationDialog from "@/components/guides/WebhookSetupTicketIntegrationDialog";
import Page from "@/components/Page";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import "@xyflow/react/dist/style.css";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { FunctionComponent } from "react";
import Autosetup from "../../../../../../../components/Autosetup";
import ListItem from "../../../../../../../components/common/ListItem";
import RiskScannerDialog from "../../../../../../../components/RiskScannerDialog";
import { Button } from "../../../../../../../components/ui/button";
import { useAsset } from "../../../../../../../context/AssetContext";
import { useConfig } from "../../../../../../../context/ConfigContext";
import { useAutosetup } from "../../../../../../../hooks/useAutosetup";
import useDecodedParams from "../../../../../../../hooks/useDecodedParams";
import { externalProviderIdToIntegrationName } from "../../../../../../../utils/externalProvider";
import { useSession } from "@/context/SessionContext";
import usePersonalAccessToken from "@/hooks/usePersonalAccessToken";
import { InputWithButton } from "@/components/ui/input-with-button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDownIcon } from "lucide-react";
import Link from "next/link";

const Index: FunctionComponent = () => {
  const { pat, onCreatePat } = usePersonalAccessToken();
  const assetMenu = useAssetMenu();

  const { session } = useSession();

  const [riskScanningIsOpen, setRiskScanningOpen] = useState(false);
  const [webhookIsOpen, setWebhookIsOpen] = useState(false);
  const config = useConfig();
  const autosetup = useAutosetup(
    !riskScanningIsOpen,
    config.devguardApiUrlPublicInternet,
    "full",
  );
  const router = useRouter();
  const params = useDecodedParams() as {
    organizationSlug: string;
    projectSlug: string;
    assetSlug: string;
  };
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
      {session ? (
        <Section
          primaryHeadline
          forceVertical
          description="Start scanning your code for vulnerabilities, bad-practices, license issues, policy violations and more."
          title="Welcome to DevGuard 🚀"
        >
          {((asset?.externalEntityProviderId &&
            externalProviderIdToIntegrationName(
              asset.externalEntityProviderId,
            ) === "gitlab") ||
            (asset?.repositoryProvider === "gitlab" &&
              asset?.repositoryId)) && (
            <>
              <div className="mb-8">
                <div className="">
                  <Autosetup {...autosetup} />
                </div>
              </div>
              <hr className="mb-8" />
            </>
          )}
          <div className="flex flex-col gap-4 z-10">
            <ListItem
              Title="Check your Code for Risks 🛡️ (Vulnerabilities, Bad Practices, Leaked Secrets, and more...)"
              Description={
                "A typical applications code is made of 70-90% by dependencies (NPM, Go, maven, Debian, etc.). Let's check, if we can find any vulnerable dependencies. Another thing is your code — let's scan for any bad practices here, check that there are no secrets leaked, infrastructure is configured good and more."
              }
              Button={
                <div className="flex flex-row gap-2">
                  <Button
                    onClick={() => setRiskScanningOpen(true)}
                    variant={
                      asset?.externalEntityProviderId &&
                      externalProviderIdToIntegrationName(
                        asset.externalEntityProviderId,
                      ) === "gitlab"
                        ? "secondary"
                        : "default"
                    }
                  >
                    Setup Risk Scanning
                  </Button>
                </div>
              }
            />
          </div>
          <div>
            <ListItem
              Title={
                <span className="">
                  Connect your Issue Tracker to DevGuard{" "}
                  <Image
                    src="/assets/provider-icons/gitlab.svg"
                    width={50}
                    height={50}
                    alt="GitLab Logo"
                    className="inline-block ml-2 h-5 w-auto"
                  />
                  <Image
                    src="/assets/provider-icons/opencode.svg"
                    width={50}
                    height={50}
                    alt="GitLab Logo"
                    className="inline-block ml-2 h-4 w-auto"
                  />
                  <Image
                    src="/assets/provider-icons/github.svg"
                    width={50}
                    height={50}
                    alt="GitLab Logo"
                    className="inline-block ml-2 h-4 w-auto dark:invert"
                  />
                </span>
              }
              Description={
                "You can connect your Issue Tracker to DevGuard to automatically create issues for identified risks. You can handle findings directly from your issue tracker via slash commands. This way, you can easily track and mitigate vulnerabilities, bad-practices, license issues and more."
              }
              Button={
                <div className="flex flex-row gap-2">
                  <Button
                    onClick={() => setWebhookIsOpen(true)}
                    variant={"secondary"}
                  >
                    Setup Ticket-Integration
                  </Button>
                </div>
              }
            />
          </div>
          <Collapsible className="mb-6 mt-4 pb-6">
            <CollapsibleTrigger className="flex w-full items-center justify-between group">
              <div className="text-left">
                <h2 className="text-base font-semibold leading-7 text-foreground">
                  Essential Project Config
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  These values are required to connect your CI/CD pipeline or
                  tooling to this asset.
                </p>
              </div>
              <ChevronDownIcon className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Card className="mt-4">
                <CardContent className="flex flex-col gap-6 pt-6">
                  <div>
                    <p className="text-sm font-semibold mb-2">Asset Name</p>
                    <p className="text-sm text-muted-foreground mb-2">
                      Use this as the{" "}
                      <code className="font-mono text-xs">
                        {asset.repositoryProvider === "github"
                          ? "asset-name"
                          : "devguard_asset_name"}
                      </code>{" "}
                      config parameter when sending scan reports or SBOMs to
                      DevGuard.
                    </p>
                    <CopyCode
                      language="shell"
                      codeString={`${params.organizationSlug}/projects/${params.projectSlug}/assets/${params.assetSlug}`}
                    />
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold">
                        Personal Access Token
                      </p>
                      <Link
                        href="/user-settings#pat"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-foreground underline"
                      >
                        Manage existing tokens
                      </Link>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Used for API authentication. Set this as{" "}
                      <code className="font-mono text-xs">DEVGUARD_TOKEN</code>{" "}
                      in your CI/CD variables.
                    </p>
                    <InputWithButton
                      label="Personal Access token"
                      nameKey="devguard-secret-token"
                      copyable={true}
                      copyToastDescription="The DevGuard token has been copied to your clipboard."
                      mutable={true}
                      variant="onCard"
                      value={pat?.privKey ?? "<PERSONAL ACCESS TOKEN>"}
                      update={{
                        update: () =>
                          onCreatePat({
                            scopes: "scan",
                            description: "DevGuard token with 'scan' scope",
                          }),
                        updateConfirmTitle: "Create new personal access token",
                        updateConfirmDescription:
                          "Are you sure you want to create a new personal access token? Make sure to copy it, as you won't be able to see it again.",
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
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
      />
      <WebhookSetupTicketIntegrationDialog
        open={webhookIsOpen}
        onOpenChange={setWebhookIsOpen}
      />
    </Page>
  );
};
export default Index;
