import { FunctionComponent } from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";

import { AssetDTO } from "@/types/api/api";
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
import { Slider } from "@/components/ui/slider";

interface Props {
  form: UseFormReturn<AssetDTO, any, undefined>;
}

export const AssetFormGeneral: FunctionComponent<Props> = ({ form }) => (
  <>
    <FormField
      name="name"
      control={form.control}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Name</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormDescription>The name of the asset.</FormDescription>
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
            <Input {...field} />
          </FormControl>
          <FormDescription>The description of the asset.</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />

    <FormField
      control={form.control}
      name="centralFlawManagement"
      render={({ field }) => (
        <FormItem>
          <ListItem
            description={
              "If enabled, the asset will be included in the central flaw management system. That means if you handle a flaw in a branch or a version of the asset, it will be marked as handled in all other branches and versions of the set."
            }
            Title="Central Flaw Management"
            Button={
              <FormControl>
                <Switch
                  defaultChecked={field.value}
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
  </>
);

export const AssetFormRequirements: FunctionComponent<Props> = ({ form }) => {
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
          description={
            "Is the asset publicly availabe. Does it have a static IP-Address assigned to it or a domain name?"
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

const SliderForm: FunctionComponent<Props> = ({ form }) => (
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
            defaultValue={[8]}
            value={form.getValues("cvssAutomaticTicketThreshold")}
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
const RiskSliderForm: FunctionComponent<Props> = ({ form }) => (
  <FormField
    name="riskAutomaticTicketThreshold"
    control={form.control}
    render={({ field }) => (
      <FormItem>
        <FormLabel>(form.getValues(riskAutomaticTicketThreshold))</FormLabel>
        <FormControl>
          <Slider
            min={0}
            max={10}
            step={0.5}
            defaultValue={[8]}
            value={form.getValues("riskAutomaticTicketThreshold")}
            onValueChange={field.onChange}
          />
        </FormControl>
        <FormDescription>
          CVSS-BTE [Base] from experts [T] adapted [E]nvironment = adapted Score
          given by experts
        </FormDescription>
        <FormMessage />
      </FormItem>
    )}
  />
);

const AssetForm: FunctionComponent<
  Props & { forceVerticalSections?: boolean }
> = ({ form, forceVerticalSections }) => {
  return (
    <>
      <Section
        forceVertical={forceVerticalSections}
        title="General"
        description="General settings"
      >
        <AssetFormGeneral form={form} />
      </Section>
      <hr />
      <Section
        forceVertical={forceVerticalSections}
        title="Security Requirements"
        description="
Security requirements are specific criteria or conditions that an application, system, or organization must meet to ensure the protection of data, maintain integrity, confidentiality, and availability, and guard against threats and vulnerabilities. These requirements help to establish security policies, guide the development of secure systems, and ensure compliance with regulatory and industry standards."
      >
        <AssetFormRequirements form={form} />
      </Section>
      <hr />
      <Section
        forceVertical={forceVerticalSections}
        description="Provide more information how the application is used and how it interacts with other systems. This information is used to calculate the risk score of the asset."
        title="Environmental information"
      >
        <AssetFormMisc form={form} />
      </Section>
      <hr />
      <SliderForm form={form}></SliderForm>
      <RiskSliderForm form={form}></RiskSliderForm>

      <></>
    </>
  );
};

export default AssetForm;
