import React, { FunctionComponent } from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";

import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";
import ListItem from "../common/ListItem";

interface Props {
  form: any;
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
          title="Reachable from the internet"
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

const AssetForm: FunctionComponent<Props> = ({ form }) => {
  return (
    <>
      <AssetFormGeneral form={form} />
      <AssetFormRequirements form={form} />
      <AssetFormMisc form={form} />
    </>
  );
};

export default AssetForm;
