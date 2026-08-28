// Copyright 2026 L3montree GmbH.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import ListItem from "@/components/common/ListItem";
import { AsyncButton, Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CVSS31_MODIFIED_METRICS, CVSS40_MODIFIED_METRICS } from "@/utils/cvss";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { FunctionComponent } from "react";
import type { UseFormReturn } from "react-hook-form";
import { createUpdateHandler } from "../AssetForm";
import type { AssetFormValues } from "@/types/view/asset";
import { CircleHelp, Settings2 } from "lucide-react";

interface Props {
  form: UseFormReturn<AssetFormValues, any, AssetFormValues>;
  assetId?: string;
  onUpdate?: (values: Partial<AssetFormValues>) => Promise<void>;
}

const requirementLevels = ["low", "medium", "high"] as const;

const valueToIndex = (value: string): number[] => {
  const index = requirementLevels.indexOf(
    value as (typeof requirementLevels)[number],
  );
  return [index >= 0 ? index : 1];
};

const indexToValue = (index: number[]): string => {
  return requirementLevels[index[0]] ?? "medium";
};

const RequirementSlider: FunctionComponent<{
  label: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  testId: string;
}> = ({ label, description, value, onChange, testId }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FormLabel>{label}</FormLabel>
        <span className="text-sm font-medium capitalize text-primary">
          {value}
        </span>
      </div>
      <Slider
        min={0}
        max={2}
        step={1}
        value={valueToIndex(value)}
        onValueChange={(v) => onChange(indexToValue(v))}
        showBadge={false}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        {requirementLevels.map((level) => (
          <button
            key={level}
            type="button"
            data-testid={`${testId}-${level}`}
            className="capitalize hover:text-foreground transition-colors"
            onClick={() => onChange(level)}
          >
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};

const EnableExposureMetrics: FunctionComponent<Props> = ({ form }) => {
  const enableExposureMetrics = form.watch("enableExposureMetrics");
  const [cvssVersion, setCvssVersion] = useState<"3.1" | "4.0">("3.1");

  const cvssMetrics =
    cvssVersion === "3.1" ? CVSS31_MODIFIED_METRICS : CVSS40_MODIFIED_METRICS;

  return (
    <FormField
      control={form.control}
      name="enableExposureMetrics"
      render={({ field }) => (
        <FormItem>
          <ListItem
            Description={
              <>
                Enables more detailed exposure metrics to risk formula for
                vulnerabilities. Be aware that this will change your current
                risk score and affect this asset, which may result in different
                results in different assets.
                {enableExposureMetrics && (
                  <div className="mt-6 space-y-6">
                    <div className="flex flex-col gap-3 p-4">
                      <Tabs
                        value={cvssVersion}
                        onValueChange={(v) =>
                          setCvssVersion(v as "3.1" | "4.0")
                        }
                      >
                        <TabsList>
                          <TabsTrigger value="3.1">CVSS 3.1</TabsTrigger>
                          <TabsTrigger value="4.0">CVSS 4.0</TabsTrigger>
                        </TabsList>
                      </Tabs>

                      <div className="flex flex-col gap-3">
                        {cvssMetrics.map((metric) => (
                          <div
                            key={metric.key}
                            className="flex flex-col gap-1.5"
                          >
                            <Label className="text-xs text-muted-foreground">
                              {metric.label}{" "}
                              <Tooltip>
                                <TooltipTrigger>
                                  <CircleHelp className="h-3 w-3 cursor-help text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipPortal>
                                  <TooltipContent>
                                    <div className="relative font-normal">
                                      {metric.description}{" "}
                                      <a
                                        target="_blank"
                                        rel="noreferrer noopener"
                                        href={`https://www.first.org/cvss/calculator/${cvssVersion}`}
                                      >
                                        More information.
                                      </a>
                                    </div>
                                  </TooltipContent>
                                </TooltipPortal>
                              </Tooltip>
                            </Label>

                            <div className="flex flex-wrap gap-1.5">
                              {metric.options.map((opt) => (
                                <Button
                                  key={opt.v}
                                  variant="outline"
                                  type="button"
                                  size="sm"
                                  onClick={() =>
                                    form.setValue(
                                      metric.field as keyof AssetFormValues,
                                      opt.v as any,
                                      {
                                        shouldDirty: true,
                                      },
                                    )
                                  }
                                  className={cn(
                                    form.watch(
                                      metric.field as keyof AssetFormValues,
                                    ) === opt.v &&
                                      "bg-secondary text-secondary-foreground",
                                  )}
                                >
                                  {opt.l}
                                </Button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            }
            Title="Exposure metrics"
            Button={
              <FormControl>
                <Switch
                  data-testid="exposure-metrics"
                  checked={field.value}
                  onCheckedChange={(v) => {
                    form.setValue("enableExposureMetrics", v, {
                      shouldDirty: true,
                    });
                  }}
                />
              </FormControl>
            }
          />
        </FormItem>
      )}
    />
  );
};

const EXPOSURE_METRICS_FIELDS = [
  "enableExposureMetrics",
  "modifiedAttackVector",
  "modifiedAttackComplexity",
  "modifiedPrivilegesRequired",
  "modifiedScope",
  "modifiedUserInteraction",
  "modifiedConfidentiality",
  "modifiedIntegrity",
  "modifiedAvailability",
] as const;

export const AssetFormRequirements: FunctionComponent<Props> = ({
  form,
  onUpdate: handleUpdate,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const confidentialityValue = form.watch("confidentialityRequirement");
  const integrityValue = form.watch("integrityRequirement");
  const availabilityValue = form.watch("availabilityRequirement");

  const handleSaveRequirements = async () => {
    if (handleUpdate) {
      await createUpdateHandler(
        form,
        [
          "confidentialityRequirement",
          "integrityRequirement",
          "availabilityRequirement",
        ],
        handleUpdate,
      )();
      setDialogOpen(false);
    }
  };

  return (
    <>
      <ListItem
        Title="Security Requirements"
        Description={
          <>
            Configure your security requirements for this repository. Current:
            Confidentiality:{" "}
            <span className="capitalize font-mono">{confidentialityValue}</span>
            , Integrity:{" "}
            <span className="font-mono capitalize">{integrityValue}</span>,{" "}
            Availability:{" "}
            <span className="font-mono capitalize">{availabilityValue}</span>
          </>
        }
        Button={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                data-testid="configure-security-requirements-button"
              >
                <Settings2 className="mr-2 h-4 w-4" />
                Configure
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Security Requirements</DialogTitle>
                <DialogDescription>
                  Set the security requirements for this repository. These
                  settings affect how vulnerabilities are scored and
                  prioritized.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <FormField
                  control={form.control}
                  name="confidentialityRequirement"
                  render={({ field }) => (
                    <FormItem>
                      <RequirementSlider
                        label="Confidentiality"
                        description="How crucial is it to protect sensitive information from unauthorized access?"
                        value={field.value}
                        onChange={field.onChange}
                        testId="confidentiality-requirement"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <hr />
                <FormField
                  control={form.control}
                  name="integrityRequirement"
                  render={({ field }) => (
                    <FormItem>
                      <RequirementSlider
                        label="Integrity"
                        description="How crucial is it to maintain the accuracy and reliability of your information?"
                        value={field.value}
                        onChange={field.onChange}
                        testId="integrity-requirement"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <hr />
                <FormField
                  control={form.control}
                  name="availabilityRequirement"
                  render={({ field }) => (
                    <FormItem>
                      <RequirementSlider
                        label="Availability"
                        description="How important is it for your systems to remain accessible and operational?"
                        value={field.value}
                        onChange={field.onChange}
                        testId="availability-requirement"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <AsyncButton
                  onClick={handleSaveRequirements}
                  data-testid="save-security-requirements-button"
                >
                  Save Changes
                </AsyncButton>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <EnableExposureMetrics form={form} />
      {handleUpdate && (
        <div className="mt-4 flex flex-row justify-end">
          <AsyncButton
            data-testid="save-exposure-metrics-button"
            type="button"
            disabled={
              !EXPOSURE_METRICS_FIELDS.some(
                (f) => form.formState.dirtyFields?.[f],
              )
            }
            onClick={createUpdateHandler(
              form,
              [...EXPOSURE_METRICS_FIELDS],
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
