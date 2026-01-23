"use client";
import AssetTitle from "@/components/common/AssetTitle";
import Section from "@/components/common/Section";
import WebhookSetupTicketIntegrationDialog from "@/components/guides/WebhookSetupTicketIntegrationDialog";
import Page from "@/components/Page";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import "@xyflow/react/dist/style.css";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FunctionComponent, useState, useEffect } from "react";
import Autosetup from "../../../../../../../components/Autosetup";
import ListItem from "../../../../../../../components/common/ListItem";
import RiskScannerDialog from "../../../../../../../components/RiskScannerDialog";
import { Button } from "../../../../../../../components/ui/button";
import { useAsset } from "../../../../../../../context/AssetContext";
import { useConfig } from "../../../../../../../context/ConfigContext";
import { useAutosetup } from "../../../../../../../hooks/useAutosetup";
import useDecodedParams from "../../../../../../../hooks/useDecodedParams";
import { externalProviderIdToIntegrationName } from "../../../../../../../utils/externalProvider";

const Index: FunctionComponent = () => {
  const assetMenu = useAssetMenu();

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
  }, [asset, params.organizationSlug, params.projectSlug, params.assetSlug, router]);

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
          (asset?.repositoryProvider === "gitlab" && asset?.repositoryId)) && (
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
      </Section>
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
