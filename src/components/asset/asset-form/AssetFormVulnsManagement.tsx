// Copyright 2026 L3montree GmbH.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import ListItem from "@/components/common/ListItem";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AsyncButton, Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { InputWithButton } from "@/components/ui/input-with-button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useConfig } from "@/context/ConfigContext";
import { fetcher } from "@/data-fetcher/fetcher";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import type { ArtifactDTO, AssetVersionDTO } from "@/types/api/api";
import { AlertTriangle, ChevronDown } from "lucide-react";
import React, { type FunctionComponent, useMemo, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import useSWR from "swr";
import { createUpdateHandler } from "../AssetForm";
import type { AssetFormValues } from "../AssetForm";
import { VulnAutoReopenAfterDays } from "./VulnAutoReopenAfterDays";

import { cn } from "@/lib/utils";
import { useActiveAsset } from "../../../hooks/useActiveAsset";
import { validateArtifactNameAgainstPurlSpec } from "../../../utils/common";
import { ClipboardDocumentIcon } from "@heroicons/react/20/solid";
import { toast } from "@/lib/toast";
import { BranchTagSelector } from "@/components/BranchTagSelector";
import { SimpleArtifactSelector } from "@/components/ArtifactSelector";
import { Badge } from "@/components/ui/badge";

interface Props {
  form: UseFormReturn<AssetFormValues, any, AssetFormValues>;
  assetId?: string;
  onUpdate?: (values: Partial<AssetFormValues>) => Promise<void>;
}

const EnableTicketRange: FunctionComponent<Props> = ({ form }) => {
  const enableTicketRange = form.watch("enableTicketRange");
  const cvssValue = form.watch("cvssAutomaticTicketThreshold");
  const riskValue = form.watch("riskAutomaticTicketThreshold");

  return (
    <FormField
      control={form.control}
      name="enableTicketRange"
      render={({ field }) => (
        <FormItem>
          <ListItem
            Description={
              <>
                Enables automatic ticket creation for vulnerabilities. Be aware
                that this will create tickets for all vulnerabilities that
                exceed the defined thresholds, which may result in a large
                number of tickets being created.
                {enableTicketRange && (
                  <div className="mt-6 space-y-6">
                    <FormField
                      name="cvssAutomaticTicketThreshold"
                      control={form.control}
                      render={({ field: sliderField }) => (
                        <FormItem>
                          <FormLabel>CVSS Score</FormLabel>
                          <FormControl>
                            <Slider
                              min={0}
                              max={10}
                              step={0.5}
                              value={cvssValue}
                              onValueChange={sliderField.onChange}
                            />
                          </FormControl>
                          <FormDescription>
                            CVSS-BTE Score: Extends standard CVSS Base metrics
                            with Temporal signals such as exploit availability
                            and Environmental factors tailored to your
                            organization’s risk profile.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Badge variant="secondary">OR</Badge>
                    <FormField
                      name="riskAutomaticTicketThreshold"
                      control={form.control}
                      render={({ field: sliderField }) => (
                        <FormItem>
                          <FormLabel>Risk Value</FormLabel>
                          <FormControl>
                            <Slider
                              min={0}
                              max={10}
                              step={0.5}
                              value={riskValue}
                              onValueChange={sliderField.onChange}
                            />
                          </FormControl>
                          <FormDescription>
                            Calculates Risk including multiple factors.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </>
            }
            Title="Reporting range"
            Button={
              <FormControl>
                <Switch
                  data-testid="reporting-range"
                  checked={field.value}
                  onCheckedChange={(v) => {
                    form.setValue("enableTicketRange", v, {
                      shouldDirty: true,
                    });
                    if (v) {
                      form.setValue("cvssAutomaticTicketThreshold", [8], {
                        shouldDirty: true,
                      });
                      form.setValue("riskAutomaticTicketThreshold", [8], {
                        shouldDirty: true,
                      });
                    } else {
                      form.resetField("cvssAutomaticTicketThreshold");
                      form.resetField("riskAutomaticTicketThreshold");
                    }
                  }}
                />
              </FormControl>
            }
          />
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

const CVSSBadgePreview: FunctionComponent<{
  badgePreviewUrl: string;
  publicBadgeUrl?: string;
  copyable: boolean;
}> = ({ badgePreviewUrl, publicBadgeUrl, copyable }) => {
  const handleCopy = async () => {
    if (!publicBadgeUrl) return;
    try {
      await navigator.clipboard.writeText(publicBadgeUrl);
      toast("Copied to clipboard", {
        description:
          "The CVSS Badge URL has been copied. Use the badge in your README or other documentation.",
      });
    } catch {
      toast("Failed to copy to clipboard", {
        description:
          "We couldn't access your clipboard. Please copy the CVSS Badge URL manually.",
      });
    }
  };

  return (
    <div className="flex flex-row items-center gap-3 rounded-md border bg-background p-2 justify-between">
      <img
        src={badgePreviewUrl}
        alt="CVSS Badge"
        className="rounded-md shadow-sm"
      />
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!copyable || !publicBadgeUrl}
          onClick={handleCopy}
          aria-label="Copy CVSS badge URL"
          className="disabled:opacity-50"
        >
          <ClipboardDocumentIcon className="mr-2 h-4 w-4" />
          Copy badge URL
        </Button>
      </div>
    </div>
  );
};

const RefArtifactSelector: FunctionComponent<{
  refs: AssetVersionDTO[];
  initialVersionSlug?: string;
  artifacts?: ArtifactDTO[];
  selectedVersionSlug: string;
  selectedArtifact: string;
  onSelectVersion: (slug: string) => void;
  onSelectArtifact: (artifact: string) => void;
}> = ({
  refs,
  initialVersionSlug,
  artifacts,
  selectedVersionSlug,
  selectedArtifact,
  onSelectVersion,
  onSelectArtifact,
}) => {
  const { branches, tags } = useMemo(
    () => ({
      branches: refs.filter((r) => r.type === "branch"),
      tags: refs.filter((r) => r.type === "tag"),
    }),
    [refs],
  );

  const artifactNames = useMemo(
    () => artifacts?.map((a) => a.artifactName) ?? [],
    [artifacts],
  );

  return (
    <div className="flex flex-row flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Branch / Tag</label>
        <BranchTagSelector
          branches={branches}
          tags={tags}
          initialSlug={initialVersionSlug}
          disableNavigateToRefInsteadCall={(v) => onSelectVersion(v.slug)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Artifact</label>
        <SimpleArtifactSelector
          artifacts={artifactNames}
          selectedArtifact={selectedArtifact || undefined}
          onSelect={(a) => onSelectArtifact(a ?? "")}
          assetVersionSlug={selectedVersionSlug || undefined}
        />
      </div>
    </div>
  );
};

const PublicUrlsSection: FunctionComponent<{
  devguardApiUrl: string;
  orgSlug: string;
  copyable: boolean;
  basePath?: string;
}> = ({ copyable, basePath }) => {
  const urls = [
    {
      label:
        "VeX-URL (Always up to date vulnerability information in CycloneDX Format)",
      nameKey: "vex-url",
      value: basePath ? `${basePath}/vex.json/` : "",
      copyToastDescription: "The VeX-URL has been copied to your clipboard.",
    },
    {
      label:
        "OpenVex-URL (Always up to date vulnerability information in OpenVex format)",
      nameKey: "openvex-url",
      value: basePath ? `${basePath}/openvex.json/` : "",
      copyToastDescription: "The CSAF-URL has been copied to your clipboard.",
    },
    {
      label:
        "CSAF-URL (Always up to date vulnerability information in CSAF format)",
      nameKey: "csaf-url",
      value: basePath ? `${basePath}/csaf.json/` : "",
      copyToastDescription: "The CSAF-URL has been copied to your clipboard.",
    },
    {
      label: "SBOM-URL (Always up to date SBOM information)",
      nameKey: "sbom-url",
      value: basePath ? `${basePath}/sbom.json/` : "",
      copyToastDescription: "The SBOM-URL has been copied to your clipboard.",
    },
  ];

  return (
    <>
      {urls.map((url) => (
        <InputWithButton
          key={url.nameKey}
          className="truncate text-foreground"
          label={url.label}
          copyable={copyable && !!url.value}
          copyToastDescription={url.copyToastDescription}
          nameKey={url.nameKey}
          variant="onCard"
          value={url.value}
        />
      ))}
    </>
  );
};

export const AssetFormVulnsManagement: FunctionComponent<Props> = ({
  form,
  assetId,
  onUpdate: handleUpdate,
}) => {
  const devguardApiUrl = useConfig().devguardApiUrlPublicInternet;
  const org = useActiveOrg();
  const project = useActiveProject();
  const asset = project?.assets.find((a) => a.id === assetId);
  const refs = useActiveAsset().refs;
  const defaultBranch = refs.find((ref) => ref.defaultBranch);
  const [selectedVersionSlug, setSelectedVersionSlug] = useState(
    defaultBranch?.slug ?? "",
  );
  const [selectedArtifact, setSelectedArtifact] = useState("");
  const orgSlug = org.slug;
  const projectSlug = project?.slug;
  const assetSlug = asset?.slug;
  const { data: artifacts } = useSWR<ArtifactDTO[]>(
    selectedVersionSlug && assetSlug && projectSlug
      ? `/organizations/${orgSlug}/projects/${projectSlug}/assets/${assetSlug}/refs/${selectedVersionSlug}/artifacts`
      : null,
    fetcher,
  );

  // Clear selected artifact whenever the selected version changes
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedArtifact("");
  }, [selectedVersionSlug]);

  // Auto-select first artifact when artifacts load, but only if there is no valid selection
  React.useEffect(() => {
    if (!artifacts || artifacts.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedArtifact("");
      return;
    }

    const hasCurrentSelection =
      !!selectedArtifact &&
      artifacts.some((artifact) => artifact.artifactName === selectedArtifact);

    if (!hasCurrentSelection) {
      setSelectedArtifact(artifacts[0].artifactName);
    }
  }, [artifacts, selectedArtifact]);

  const selectedVersion = refs.find((ref) => ref.slug === selectedVersionSlug);

  const purlValidation = React.useMemo(
    () => validateArtifactNameAgainstPurlSpec(selectedArtifact),
    [selectedArtifact],
  );

  const basePath =
    selectedVersionSlug && selectedArtifact
      ? `${devguardApiUrl}/api/v1/public/${assetId}/refs/${selectedVersionSlug}/artifacts/${encodeURIComponent(selectedArtifact)}`
      : undefined;

  const publicBadgeUrl = basePath ? `${basePath}/badges/cvss/` : undefined;

  const assetApiPath = `/api/devguard-tunnel/api/v1/organizations/${orgSlug}/projects/${projectSlug}/assets/${assetSlug}`;
  const badgePreviewUrl =
    selectedVersionSlug && selectedArtifact
      ? `${assetApiPath}/refs/${selectedVersionSlug}/artifacts/${encodeURIComponent(selectedArtifact)}/badges/cvss/`
      : `${assetApiPath}/badges/cvss/`;

  return (
    <>
      <FormField
        control={form.control}
        name="paranoidMode"
        render={({ field }) => (
          <FormItem>
            <ListItem
              Description={
                "Do you trust your upstream supplier? If not, enable this mode so you need to accept the statement vulnerability assessment in the VEX reports from your supplier manually."
              }
              Title="Paranoid Mode"
              Button={
                <FormControl>
                  <Switch
                    data-testid="paranoid-mode"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              }
            />
            <FormMessage />
          </FormItem>
        )}
      />
      {assetId && (
        <FormField
          control={form.control}
          name="sharesInformation"
          render={({ field }) => (
            <FormItem>
              <ListItem
                className="!items-start"
                Description={
                  <div
                    data-tour="repo-settings-vuln-management"
                    className="space-y-4"
                  >
                    <p>
                      By enabling this option, your vulnerability endpoints are
                      made publicly accessible. Select an asset version and
                      artifact below to construct the public URLs.
                    </p>
                    <RefArtifactSelector
                      refs={refs}
                      initialVersionSlug={defaultBranch?.slug}
                      artifacts={artifacts}
                      selectedVersionSlug={selectedVersionSlug}
                      selectedArtifact={selectedArtifact}
                      onSelectVersion={setSelectedVersionSlug}
                      onSelectArtifact={setSelectedArtifact}
                    />
                    <CVSSBadgePreview
                      badgePreviewUrl={badgePreviewUrl}
                      publicBadgeUrl={publicBadgeUrl}
                      copyable={field.value}
                    />
                    {selectedArtifact &&
                      selectedVersion &&
                      !purlValidation.isValid && (
                        <Alert variant="default">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            {purlValidation.warning}
                          </AlertDescription>
                        </Alert>
                      )}
                    <Collapsible defaultOpen={false}>
                      <div
                        className={cn(
                          "rounded-lg border bg-background overflow-hidden",
                          !field.value && "opacity-60",
                        )}
                      >
                        <CollapsibleTrigger
                          data-testid="urls-collapsible"
                          className="text-foreground flex w-full cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            Public SBOM/ VEX/ CSAF URLs
                            {!field.value && (
                              <span className="text-xs font-normal text-muted-foreground">
                                (enable public access to copy)
                              </span>
                            )}
                          </span>
                          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="border-t px-4 py-4 space-y-2">
                            <PublicUrlsSection
                              devguardApiUrl={devguardApiUrl}
                              orgSlug={orgSlug}
                              copyable={field.value}
                              basePath={basePath}
                            />
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  </div>
                }
                Title="Enable public access to vulnerability data"
                Button={
                  <FormControl>
                    <Switch
                      data-testid="enable-public-access-switch"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="mt-6"
                    />
                  </FormControl>
                }
              />

              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <EnableTicketRange form={form} />

      <VulnAutoReopenAfterDays form={form} />

      {handleUpdate && (
        <div className="mt-4 flex flex-row justify-end">
          <AsyncButton
            data-testid="save-vulnerability-management-settings-button"
            type="button"
            disabled={
              !(
                form.formState.dirtyFields?.paranoidMode ||
                form.formState.dirtyFields?.sharesInformation ||
                form.formState.dirtyFields?.vulnAutoReopenAfterDays ||
                form.formState.dirtyFields?.enableTicketRange ||
                form.formState.dirtyFields?.cvssAutomaticTicketThreshold ||
                form.formState.dirtyFields?.riskAutomaticTicketThreshold ||
                form.formState.dirtyFields?.keepOriginalSbomRootComponent
              )
            }
            onClick={createUpdateHandler(
              form,
              [
                "paranoidMode",
                "sharesInformation",
                "vulnAutoReopenAfterDays",
                "enableTicketRange",
                "cvssAutomaticTicketThreshold",
                "riskAutomaticTicketThreshold",
                "keepOriginalSbomRootComponent",
              ],
              handleUpdate,
            )}
          >
            Save
          </AsyncButton>
        </div>
      )}
    </>
  );
};
