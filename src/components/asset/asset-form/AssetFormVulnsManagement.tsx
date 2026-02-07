// Copyright 2026 L3montree GmbH.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { AsyncButton } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { useConfig } from "@/context/ConfigContext";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { Switch } from "@/components/ui/switch";
import { FunctionComponent } from "react";
import { UseFormReturn } from "react-hook-form";
import { AssetFormValues, createUpdateHandler } from "../AssetForm";
import ListItem from "@/components/common/ListItem";
import { CopyCodeFragment } from "@/components/common/CopyCode";
import { InputWithButton } from "@/components/ui/input-with-button";
import { Slider } from "@/components/ui/slider";
import { VulnAutoReopenAfterDays } from "./VulnAutoReopenAfterDays";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import React from "react";

import { cn } from "@/lib/utils";

interface Props {
  form: UseFormReturn<AssetFormValues, any, AssetFormValues>;
  assetId?: string;
  onUpdate?: (values: Partial<AssetFormValues>) => Promise<void>;
}

const DeveloperTreeGraphic: FunctionComponent<{ selected: boolean }> = ({
  selected,
}) => (
  <svg
    viewBox="0 0 80 60"
    className="w-20 h-15 mx-auto mb-3"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Connection lines - drawn first so circles appear on top */}
    <line
      x1="36"
      y1="22"
      x2="26"
      y2="35"
      className={selected ? "stroke-primary/40" : "stroke-muted-foreground/30"}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="44"
      y1="22"
      x2="54"
      y2="35"
      className={selected ? "stroke-primary/40" : "stroke-muted-foreground/30"}
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Top node - excluded/grayed out for developer */}
    <circle
      cx="40"
      cy="14"
      r="11"
      className={
        selected
          ? "fill-muted stroke-muted-foreground/50"
          : "fill-muted stroke-muted-foreground/30"
      }
      strokeWidth="2"
      strokeDasharray="3 2"
    />
    <text
      x="40"
      y="17"
      textAnchor="middle"
      className={
        selected
          ? "fill-muted-foreground/50 text-[8px]"
          : "fill-muted-foreground/30 text-[8px]"
      }
    >
      App
    </text>
    {/* Bottom left node - scanned */}
    <circle
      cx="24"
      cy="46"
      r="11"
      className={
        selected
          ? "fill-primary/20 stroke-primary"
          : "fill-muted stroke-muted-foreground/30"
      }
      strokeWidth="2"
    />
    <text
      x="24"
      y="48"
      textAnchor="middle"
      className={
        selected
          ? "fill-primary text-[7px] font-medium"
          : "fill-muted-foreground/30 text-[7px]"
      }
    >
      Dep
    </text>
    {/* Bottom right node - scanned */}
    <circle
      cx="56"
      cy="46"
      r="11"
      className={
        selected
          ? "fill-primary/20 stroke-primary"
          : "fill-muted stroke-muted-foreground/30"
      }
      strokeWidth="2"
    />
    <text
      x="56"
      y="48"
      textAnchor="middle"
      className={
        selected
          ? "fill-primary text-[7px] font-medium"
          : "fill-muted-foreground/30 text-[7px]"
      }
    >
      Dep
    </text>
  </svg>
);

const SuppliedTreeGraphic: FunctionComponent<{ selected: boolean }> = ({
  selected,
}) => (
  <svg
    viewBox="0 0 80 60"
    className="w-20 h-15 mx-auto mb-3"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Connection lines - drawn first so circles appear on top */}
    <line
      x1="36"
      y1="24"
      x2="26"
      y2="35"
      className={selected ? "stroke-primary" : "stroke-muted-foreground/30"}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="44"
      y1="24"
      x2="54"
      y2="35"
      className={selected ? "stroke-primary" : "stroke-muted-foreground/30"}
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Top node - included for supplied */}
    <circle
      cx="40"
      cy="14"
      r="11"
      className={
        selected
          ? "fill-primary/20 stroke-primary"
          : "fill-muted stroke-muted-foreground/30"
      }
      strokeWidth="2"
    />
    <text
      x="40"
      y="17"
      textAnchor="middle"
      className={
        selected
          ? "fill-primary text-[8px] font-medium"
          : "fill-muted-foreground/30 text-[8px]"
      }
    >
      App
    </text>
    {/* Bottom left node - scanned */}
    <circle
      cx="24"
      cy="46"
      r="11"
      className={
        selected
          ? "fill-primary/20 stroke-primary"
          : "fill-muted stroke-muted-foreground/30"
      }
      strokeWidth="2"
    />
    <text
      x="24"
      y="48"
      textAnchor="middle"
      className={
        selected
          ? "fill-primary text-[7px] font-medium"
          : "fill-muted-foreground/30 text-[7px]"
      }
    >
      Dep
    </text>
    {/* Bottom right node - scanned */}
    <circle
      cx="56"
      cy="46"
      r="11"
      className={
        selected
          ? "fill-primary/20 stroke-primary"
          : "fill-muted stroke-muted-foreground/30"
      }
      strokeWidth="2"
    />
    <text
      x="56"
      y="48"
      textAnchor="middle"
      className={
        selected
          ? "fill-primary text-[7px] font-medium"
          : "fill-muted-foreground/30 text-[7px]"
      }
    >
      Dep
    </text>
  </svg>
);

type SbomSourceType = "developer" | "supplied";

const SbomSourceTypeSelector: FunctionComponent<Pick<Props, "form">> = ({
  form,
}) => {
  // keepOriginalSbomRootComponent: true = Supplied Application (scan everything including root)
  // keepOriginalSbomRootComponent: false = Developer (exclude root, scan only dependencies)
  const keepOriginalSbomRootComponent = form.watch(
    "keepOriginalSbomRootComponent",
  );
  const selected: SbomSourceType = keepOriginalSbomRootComponent
    ? "supplied"
    : "developer";

  const handleSelect = (type: SbomSourceType) => {
    form.setValue("keepOriginalSbomRootComponent", type === "supplied", {
      shouldDirty: true,
    });
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        type="button"
        onClick={() => handleSelect("developer")}
        className={cn(
          "relative flex flex-col items-center rounded-lg border-2 p-4 text-center transition-all hover:border-primary/50",
          selected === "developer"
            ? "border-primary bg-primary/5"
            : "border-border bg-card",
        )}
      >
        <DeveloperTreeGraphic selected={selected === "developer"} />
        <span
          className={cn(
            "font-medium text-sm",
            selected === "developer" ? "text-primary" : "text-foreground",
          )}
        >
          Developer
        </span>
        <p className="mt-1 text-xs text-muted-foreground">
          You create SBOMs for your own code to analyse dependencies you use.
        </p>
      </button>

      <button
        type="button"
        onClick={() => handleSelect("supplied")}
        className={cn(
          "relative flex flex-col items-center rounded-lg border-2 p-4 text-center transition-all hover:border-primary/50",
          selected === "supplied"
            ? "border-primary bg-primary/5"
            : "border-border bg-card",
        )}
      >
        <SuppliedTreeGraphic selected={selected === "supplied"} />
        <span
          className={cn(
            "font-medium text-sm",
            selected === "supplied" ? "text-primary" : "text-foreground",
          )}
        >
          Supplied Application
        </span>
        <p className="mt-1 text-xs text-muted-foreground">
          You receive SBOMs from suppliers for applications you deploy.
        </p>
      </button>
    </div>
  );
};

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
                          CVSS-BTE Score: Combines standard Base metrics with expert Temporal assessment and Environmental factors customized to your organization's risk profile.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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

export const AssetFormVulnsManagement: FunctionComponent<Props> = ({
  form,
  assetId,
  onUpdate: handleUpdate,
}) => {
  const devguardApiUrl = useConfig().devguardApiUrlPublicInternet;
  const org = useActiveOrg();
  const project = useActiveProject();
  const asset = project?.assets.find((a) => a.id === assetId);
  return (
    <>
      <div className="rounded-lg border bg-card p-4">
        <h3 className="font-medium text-sm mb-3">SBOM Source Type</h3>
        <SbomSourceTypeSelector form={form} />
      </div>

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
                Description={
                  <>
                    By enabling this option, your vulnerability endpoints are
                    made publicly accessible. You can add the two query
                    parameters{" "}
                    <CopyCodeFragment codeString="?ref=<Branch slug | Tag slug>" />{" "}
                    and{" "}
                    <CopyCodeFragment codeString="?artifactName=<Name of the artifact url encoded>" />{" "}
                    to the URL to further scope the data. If none is provided,
                    the default branch and all artifacts are used.
                    {field.value && (
                      <Collapsible defaultOpen={false} className="mt-4">
                        <CollapsibleTrigger className="text-foreground flex w-full cursor-pointer items-center justify-between rounded-md border bg-background px-4 py-2 text-sm font-medium hover:opacity-80">
                          <span>Public URLs</span>
                          <ChevronDown className="h-4 w-4 transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="p-4 border rounded-md bg-background space-y-2">
                          {[
                            {
                              label:
                                "VeX-URL (Always up to date vulnerability information)",
                              nameKey: "vex-url",
                              value: `${devguardApiUrl}/api/v1/public/${assetId}/vex.json`,
                              copyToastDescription:
                                "The VeX-URL has been copied to your clipboard.",
                            },
                            {
                              label:
                                "CSAF-URL (Always up to date vulnerability information in CSAF format)",
                              nameKey: "csaf-url",
                              value: `${devguardApiUrl}/api/v1/organizations/${org.slug}/csaf/provider-metadata.json`,
                              copyToastDescription:
                                "The CSAF-URL has been copied to your clipboard.",
                            },
                            {
                              label:
                                "SBOM-URL (Always up to date SBOM information)",
                              nameKey: "sbom-url",
                              value: `${devguardApiUrl}/api/v1/public/${assetId}/sbom.json`,
                              copyToastDescription:
                                "The SBOM-URL has been copied to your clipboard.",
                            },
                            {
                              label: "CVSS Badge URL",
                              nameKey: "cvss-badge-url",
                              value: `${devguardApiUrl}/api/v1/public/${assetId}/badges/cvss`,
                              copyToastDescription:
                                "The CVSS Badge URL has been copied to your clipboard.",
                              message:
                                "You can use the URL to display this badge in your README or other documentation.",
                            },
                          ].map((url) => (
                            <div
                              key={url.nameKey}
                              className={
                                field.value
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                              }
                            >
                              <InputWithButton
                                label={url.label}
                                copyable={field.value}
                                copyToastDescription={url.copyToastDescription}
                                nameKey={url.nameKey}
                                variant="onCard"
                                value={url.value}
                                message={url.message}
                              />
                            </div>
                          ))}
                          <img
                            src={`/api/devguard-tunnel/api/v1/organizations/${org.slug}/projects/${project?.slug}/assets/${asset?.slug}/badges/cvss`}
                            alt="CVSS Badge"
                            className="mt-4 rounded-md shadow-sm hover:shadow-md transition-shadow"
                          />
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                  </>
                }
                Title={"Enable public access to vulnerability data."}
                Button={
                  <FormControl>
                    <Switch
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
      )}

      <EnableTicketRange form={form} />

      <VulnAutoReopenAfterDays form={form} />

      {handleUpdate && (
        <div className="mt-4 flex flex-row justify-end">
          <AsyncButton
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
