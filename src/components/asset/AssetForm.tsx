import { FunctionComponent } from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";

import { Slider } from "@/components/ui/slider";
import { AssetDTO } from "@/types/api/api";
import { Modify } from "@/types/common";
import { UseFormReturn } from "react-hook-form";
import ListItem from "../common/ListItem";
import Section from "../common/Section";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";

import { classNames } from "@/utils/common";
import Image from "next/image";
import React from "react";
import { useConfig } from "../../context/ConfigContext";
import { Button } from "../ui/button";
import { InputWithButton } from "../ui/input-with-button";
import { Label } from "../ui/label";
import { CopyCodeFragment } from "../common/CopyCode";

interface Props {
  form: UseFormReturn<AssetFormValues, any, AssetFormValues>;
  assetId?: string;
  disable?: boolean;
}

export type AssetFormValues = Modify<
  AssetDTO,
  {
    cvssAutomaticTicketThreshold: number[];
    riskAutomaticTicketThreshold: number[];
    enableTicketRange: boolean;
  }
>;
export const AssetFormGeneral: FunctionComponent<Props> = ({
  form,
  disable,
}) => {
  const gitInstance = form.watch("repositoryProvider");
  const externalEntityProviderId = form.watch("externalEntityProviderId");
  return (
    <>
      <FormField
        name="name"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input disabled={disable} required={true} {...field} />
            </FormControl>
            <FormDescription>The name of the repository.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        name="description"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Input disabled={disable} {...field} />
            </FormControl>
            <FormDescription>
              The description of the repository.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      {!externalEntityProviderId && (
        <>
          <Label className="mt-4">
            Which Repository provider are you using?
          </Label>

          <div className="flex gap-2 w-full">
            <Button
              variant={"secondary"}
              type="button"
              className={classNames(
                "w-full",
                gitInstance === "github" && "border !border-primary",
              )}
              onClick={() => {
                form.setValue("repositoryProvider", "github");
              }}
            >
              <Image
                src="/assets/github.svg"
                alt="GitHub Logo"
                className="mr-2 dark:invert"
                width={24}
                height={24}
              />
              GitHub
            </Button>
            <Button
              variant={"secondary"}
              type="button"
              className={classNames(
                "w-full border",
                gitInstance === "gitlab" && "!border-primary",
              )}
              onClick={() => {
                form.setValue("repositoryProvider", "gitlab");
              }}
            >
              <Image
                src="/assets/gitlab.svg"
                alt="GitHub Logo"
                className="mr-2"
                width={24}
                height={24}
              />
              Gitlab
            </Button>
          </div>
        </>
      )}
    </>
  );
};

export const AssetFormRequirements: FunctionComponent<Props> = ({
  form,
  assetId,
}) => {
  const devguardApiUrl = useConfig().devguardApiUrlPublicInternet;

  return (
    <>
      <FormField
        control={form.control}
        name="confidentialityRequirement"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Confidentiality Requirement</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Choose the confidentiality requirement based on how crucial it is
              to protect sensitive information from unauthorized access in your
              specific context, considering the potential impact on your
              organization.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="integrityRequirement"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Integrity Requirement</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Select the integrity requirement based on how crucial it is to
              maintain the accuracy and reliability of your information,
              ensuring it remains unaltered by unauthorized users.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="availabilityRequirement"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Availability Requirement</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Select the availability requirement based on how important it is
              for your information and systems to remain accessible and
              operational without interruptions.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="vulnAutoReopenAfterDays"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Automatically reopen accepted vulnerabilities after
            </FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value?.toString()}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a time range" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="30">30 Days</SelectItem>
                <SelectItem value="60">2 Months</SelectItem>
                <SelectItem value="120">4 Months</SelectItem>
                <SelectItem value="180">6 Months</SelectItem>
                <SelectItem value="360">1 Year</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Select the time period after which a vulnerability will be
              automatically reopened if it was once accepted. PCI-DSS requires
              vulnerabilities to be revalidated after 6 months, so this is a
              good default.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="paranoidMode"
        render={({ field }) => (
          <FormItem>
            <ListItem
              Description={
                "Do you trust your upstream supplier? If not, enable this mode so you need to accept the vex reports from your supplier manually."
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
                    <div className="text-white mt-4">
                      <InputWithButton
                        label="VeX-URL (Always up to date vulnerability information)"
                        copyable
                        variant="onCard"
                        value={
                          devguardApiUrl +
                          "/api/v1/public/" +
                          assetId +
                          "/vex.json"
                        }
                      />
                    </div>
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
    </>
  );
};

export const AssetFormMisc: FunctionComponent<Props> = ({ form }) => (
  <FormField
    control={form.control}
    name="reachableFromTheInternet"
    render={({ field }) => (
      <FormItem>
        <ListItem
          Description={
            "Is the repository publicly available. Does it have a static IP-Address assigned to it or a domain name?"
          }
          Title="Reachable from the internet"
          Button={
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          }
        />
        <FormMessage />
      </FormItem>
    )}
  />
);

export const EnableTicketRange: FunctionComponent<Props> = ({ form }) => (
  <FormField
    control={form.control}
    name="enableTicketRange"
    render={({ field }) => (
      <FormItem>
        <ListItem
          Description={
            "Enables automatic ticket creation for vulnerabilities. Be aware that this will create tickets for all vulnerabilities that exceed the defined thresholds, which may result in a large number of tickets being created."
          }
          Title="Reporting range"
          Button={
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={(v) => {
                  form.setValue("enableTicketRange", v);
                  form.setValue("cvssAutomaticTicketThreshold", [8]);
                  form.setValue("riskAutomaticTicketThreshold", [8]);
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

const SliderForm: FunctionComponent<Props> = ({ form }) => {
  const value = form.watch("cvssAutomaticTicketThreshold");

  return (
    <FormField
      name="cvssAutomaticTicketThreshold"
      control={form.control}
      render={({ field }) => (
        <FormItem>
          <FormLabel>CVSS Score</FormLabel>
          <FormControl>
            <Slider
              min={0}
              max={10}
              step={0.5}
              value={value}
              onValueChange={field.onChange}
            />
          </FormControl>
          <FormDescription>
            CVSS-BTE [Base] from experts [T] adapted [E]nvironment = adapted
            Score given by experts
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
const RiskSliderForm: FunctionComponent<Props> = ({ form }) => {
  const value = form.watch("riskAutomaticTicketThreshold");

  return (
    <FormField
      name="riskAutomaticTicketThreshold"
      control={form.control}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Risk Value</FormLabel>
          <FormControl>
            <Slider
              min={0}
              max={10}
              step={0.5}
              value={value}
              onValueChange={field.onChange}
            />
          </FormControl>
          <FormDescription>
            Calculates Risk including multiple factors.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const AssetSettingsForm: FunctionComponent<
  Props & {
    forceVerticalSections?: boolean;
    showReportingRange: boolean;
    disable?: boolean;
    showSecurityRequirements?: boolean;
    showEnvironmentalInformation?: boolean;
    assetId?: string;
  }
> = ({
  form,
  forceVerticalSections,
  showReportingRange,
  disable,
  showSecurityRequirements = true,
  showEnvironmentalInformation = true,
  assetId,
}) => {
  return (
    <>
      <Section
        forceVertical={forceVerticalSections}
        title="General"
        description="General settings"
      >
        <AssetFormGeneral disable={disable} form={form} />
      </Section>
      {showSecurityRequirements && (
        <>
          <hr />
          <Section
            forceVertical={forceVerticalSections}
            title="Security Requirements"
            description="
Security requirements are specific criteria or conditions that an application, system, or organization must meet to ensure the protection of data, maintain integrity, confidentiality, and availability, and guard against threats and vulnerabilities. These requirements help to establish security policies, guide the development of secure systems, and ensure compliance with regulatory and industry standards."
          >
            <AssetFormRequirements assetId={assetId} form={form} />
          </Section>
        </>
      )}
      {showEnvironmentalInformation && (
        <>
          <hr />
          <Section
            forceVertical={forceVerticalSections}
            description="Provide more information how the application is used and how it interacts with other systems. This information is used to calculate the risk score of the repository."
            title="Environmental information"
          >
            <AssetFormMisc form={form} />
          </Section>
        </>
      )}
      {showReportingRange && (
        <>
          <hr />
          <Section
            forceVertical={forceVerticalSections}
            description="CVSS-BTE is the latest Scoring System standard.
        It combines multiple metrics into one, your defined range will automatically create tickets that 
        "
            title="Reporting range"
          >
            <EnableTicketRange form={form}></EnableTicketRange>

            {form.watch("enableTicketRange") && (
              <React.Fragment>
                <SliderForm form={form}></SliderForm>
                <RiskSliderForm form={form}></RiskSliderForm>
              </React.Fragment>
            )}
          </Section>
        </>
      )}
    </>
  );
};

export default AssetSettingsForm;
