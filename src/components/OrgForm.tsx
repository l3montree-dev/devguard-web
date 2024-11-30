import { countries, industryOptions } from "@/const/organizationConstants";
import { OrganizationDTO, OrganizationDetailsDTO } from "@/types/api/api";
import { FunctionComponent } from "react";
import { UseFormReturn } from "react-hook-form";
import Section from "./common/Section";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";
import ListItem from "./common/ListItem";
import DangerZone from "./common/DangerZone";

interface Props {
  form:
    | UseFormReturn<OrganizationDTO, any, undefined>
    | UseFormReturn<OrganizationDetailsDTO, any, undefined>;
}

export const OrgForm: FunctionComponent<Props> = ({ form }) => (
  <>
    <Section
      description="General and required information about your organization."
      title="Required Information"
    >
      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <div className="sm:col-span-6">
          <FormField
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>
    </Section>
    <hr />
    <Section
      description="Help us to improve DevGuard."
      title="Optional Information"
    >
      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <div className="sm:col-span-3">
          <FormField
            // @ts-expect-error
            control={form.control}
            name="contactPhoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact phone number</FormLabel>
                <FormControl>
                  <Input
                    placeholder="+49 123 456 789"
                    autoComplete="tel"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className="sm:col-span-3">
          <FormField
            // @ts-expect-error
            control={form.control}
            name="numberOfEmployees"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Employees</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>
      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <div className="sm:col-span-3">
          <FormField
            // @ts-expect-error
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Select
                    autoComplete="country-name"
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select the country your company is registered in" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="sm:col-span-3">
          <FormField
            // @ts-expect-error
            control={form.control}
            name="industry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Industry</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    autoComplete="industry-name"
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {industryOptions.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>
      <div className="mt-10">
        <h2 className="font-semibold">
          Do you have to comply with any of the following regulations/
          standards?
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <FormField
            name="criticalInfrastructure"
            // @ts-expect-error
            control={form.control}
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between gap-4 rounded-lg border bg-card p-4">
                <div className="space-y-0.5 ">
                  <FormLabel>Criticial Infrastructure (KRITIS)</FormLabel>
                  <FormDescription>
                    KRITIS (short for &quot;Kritische Infrastrukturen&quot;)
                    refers to critical infrastructures in Germany, encompassing
                    essential services and facilities in sectors such as energy,
                    water, food, health, and finance, whose failure would have
                    significant impacts on public safety and national security.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    onCheckedChange={field.onChange}
                    checked={field.value}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            name="iso27001"
            // @ts-expect-error
            control={form.control}
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between gap-4 rounded-lg border bg-card p-4">
                <div className="space-y-0.5 ">
                  <FormLabel>ISO 27001</FormLabel>
                  <FormDescription>
                    ISO 27001 is an international standard for managing
                    information security, providing a systematic approach to
                    securing sensitive data through the implementation of an
                    Information Security Management System (ISMS).
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    onCheckedChange={field.onChange}
                    checked={field.value}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            name="grundschutz"
            // @ts-expect-error
            control={form.control}
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between gap-4 rounded-lg border bg-card p-4">
                <div className="space-y-0.5 ">
                  <FormLabel>
                    IT-Grundschutz (German Federal Office for Information
                    Security)
                  </FormLabel>
                  <FormDescription>
                    The BSI IT-Grundschutz is a framework developed by the
                    German Federal Office for Information Security (BSI) that
                    provides a comprehensive approach to managing information
                    security through standardized procedures and protective
                    measures.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    onCheckedChange={field.onChange}
                    checked={field.value}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            name="nist"
            // @ts-expect-error
            control={form.control}
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between gap-4 rounded-lg border bg-card p-4">
                <div className="space-y-0.5 ">
                  <FormLabel>NIST Cybersecurity Framework</FormLabel>
                  <FormDescription>
                    The NIST Cybersecurity Framework is a set of guidelines and
                    best practices designed to help organizations identify,
                    protect, detect, respond to, and recover from cybersecurity
                    threats.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    onCheckedChange={field.onChange}
                    checked={field.value}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>
    </Section>
    <hr />
    <DangerZone>
      <Section
        description="Should this organization be made visible to the public? The organization can be accessed without any authentication."
        title="Visibility"
        className="pb-0"
      >
        <FormField
          // @ts-expect-error
          control={form.control}
          name="isPublic"
          render={({ field }) => (
            <FormItem>
              <ListItem
                description={
                  "Setting this to true will make the organization visible to the public. It allows creating public and private projects."
                }
                Title="Public Organization"
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
      </Section>
    </DangerZone>
  </>
);
