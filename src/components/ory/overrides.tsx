"use client";

import { FingerPrintIcon } from "@heroicons/react/24/outline";
import {
  type OryCardContentProps,
  type OryCardSettingsSectionProps,
  type OryFlowComponentOverrides,
  type OryFormSectionContentProps,
  type OryFormSectionFooterProps,
  type OryNodeButtonProps,
  type OryNodeImageProps,
  type OryNodeInputProps,
  type OryNodeLabelProps,
  type OryNodeSsoButtonProps,
} from "@ory/elements-react";
import { DefaultCardFooter } from "@ory/elements-react/theme";
import Image from "next/image";
import { PropsWithChildren, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import Section from "../common/Section";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";

function OryButton({ node, attributes, onClick, ...rest }: OryNodeButtonProps) {
  const label = node.meta.label?.text ?? "";
  const [clicked, setClicked] = useState(false);
  const {
    formState: { isSubmitting },
    setValue,
  } = useFormContext();

  useEffect(() => {
    if (!isSubmitting) setClicked(false);
  }, [isSubmitting]);

  return (
    <Button
      name={attributes.name}
      type={attributes.type === "button" ? "button" : "submit"}
      value={attributes.value?.toString()}
      disabled={attributes.disabled ?? isSubmitting}
      variant="secondary"
      onClick={(e) => {
        onClick?.(e);
        setClicked(true);
        if (attributes.type !== "button") {
          setValue(attributes.name, attributes.value);
        }
      }}
      {...rest}
    >
      {clicked && isSubmitting ? (
        <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
      ) : node.group === "passkey" ? (
        <FingerPrintIcon className="w-5 h-5 mr-2" />
      ) : null}
      {label}
    </Button>
  );
}

function OrySsoButton(props: OryNodeSsoButtonProps) {
  return (
    <Button variant="secondary" className="w-full" {...props}>
      {props.attributes.value === "opencode" ? (
        <>
          <Image
            src="/assets/provider-icons/opencode.svg"
            alt="OpenCode Icon"
            width={20}
            height={20}
            className="mr-2"
          />
          Sign in with openCode
        </>
      ) : props.attributes.value === "gitlab" ? (
        <>
          <Image
            src="/assets/provider-icons/gitlab.svg"
            alt="GitLab Icon"
            width={20}
            height={20}
            className="mr-2"
          />
          Sign in with GitLab
        </>
      ) : props.attributes.value === "github" ? (
        <>
          <Image
            src="/assets/provider-icons/github.svg"
            alt="GitHub Icon"
            width={20}
            height={20}
            className="mr-2"
          />
          Sign in with GitHub
        </>
      ) : (
        props.node.meta.label?.text
      )}
    </Button>
  );
}

function OryInput({ node, attributes, onClick }: OryNodeInputProps) {
  const { register } = useFormContext();
  const { value, name, autocomplete, maxlength, ...rest } = attributes;

  if (rest.type === "hidden") {
    return <input type="hidden" {...register(name, { value })} />;
  }

  const { ref, ...restRegister } = register(name, { value });

  return (
    <Input
      variant="onCard"
      ref={ref}
      type={rest.type}
      maxLength={maxlength}
      autoComplete={autocomplete}
      required={rest.required}
      disabled={rest.disabled}
      pattern={rest.pattern}
      placeholder={node.meta.label?.text}
      onClick={onClick}
      {...restRegister}
    />
  );
}

function OryCodeInput({ node, attributes, onClick }: OryNodeInputProps) {
  const { register } = useFormContext();
  const { value, name, autocomplete, maxlength, ...rest } = attributes;
  const { ref, ...restRegister } = register(name, { value });

  return (
    <Input
      variant="onCard"
      className="tracking-widest text-center font-mono"
      ref={ref}
      type={rest.type}
      maxLength={maxlength}
      autoComplete={autocomplete}
      required={rest.required}
      disabled={rest.disabled}
      pattern={rest.pattern}
      placeholder={node.meta.label?.text}
      onClick={onClick}
      {...restRegister}
    />
  );
}

function OryCheckbox({ node, attributes }: OryNodeInputProps) {
  const { register } = useFormContext();
  const { value, name, ...rest } = attributes;

  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        defaultChecked={Boolean(value)}
        className="peer size-4 shrink-0 rounded-[4px] border border-primary shadow-xs transition-shadow checked:bg-primary checked:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        id={name}
        required={rest.required}
        disabled={rest.disabled}
        {...register(name)}
      />
      {node.meta.label?.text && (
        <Label htmlFor={name} className="leading-none">
          {node.meta.label.text}
        </Label>
      )}
    </div>
  );
}

function OryImage({ node, attributes }: OryNodeImageProps) {
  return (
    <img
      src={attributes.src}
      alt={node.meta.label?.text ?? ""}
      width={attributes.width}
      height={attributes.height}
      className="rounded-md"
    />
  );
}

function OryLabel({ node, attributes, children, ...rest }: OryNodeLabelProps) {
  return (
    <Label htmlFor={attributes.name} {...rest}>
      {children ?? node.meta.label?.text}
    </Label>
  );
}

function OryCardRoot({ children }: PropsWithChildren) {
  return <Card className="p-6 ory-card">{children}</Card>;
}

function OryCardHeader(props: PropsWithChildren) {
  return <CardHeader className="p-0 pb-4">{props.children}</CardHeader>;
}

function OryCardFooter() {
  return <DefaultCardFooter />;
}

function OryCardContent({ children }: OryCardContentProps) {
  return <CardContent className="p-0">{children}</CardContent>;
}

function OryCardDivider() {
  return (
    <div className="relative my-4">
      <Separator />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="bg-card px-2 text-xs uppercase text-muted-foreground">
          or
        </span>
      </div>
    </div>
  );
}

function OrySettingsSection({
  children,
  action,
  method,
  onSubmit,
}: OryCardSettingsSectionProps) {
  return (
    <form action={action} method={method} onSubmit={onSubmit}>
      {children}
    </form>
  );
}

function OrySettingsSectionContent({
  children,
  title,
  description,
}: OryFormSectionContentProps) {
  return (
    <Section Title={title} description={description} className="space-y-4">
      <Card className="p-6 flex flex-col gap-4">{children}</Card>
    </Section>
  );
}

function OrySettingsSectionFooter(props: OryFormSectionFooterProps) {
  return (
    <CardFooter className="justify-end px-0 pb-0 pb-4 border-b border-border mt-4">
      {props.children}
    </CardFooter>
  );
}

// Track which toast IDs have been shown to prevent duplicates
const shownToastIds = new Set<string | number>();

function OryToast({ message, id }: { message: any; id: string | number }) {
  useEffect(() => {
    // Only show the toast if we haven't shown this ID before
    if (!shownToastIds.has(id)) {
      shownToastIds.add(id);

      const text = typeof message === "string" ? message : message?.text || "";
      const type = typeof message === "object" ? message?.type : "info";

      if (type === "error") {
        toast.error(text);
      } else if (type === "success") {
        toast.success(text);
      } else {
        toast.message(text);
      }
    }
  }, [id, message]);

  return null;
}

export const oryComponentOverrides: OryFlowComponentOverrides = {
  Node: {
    Button: OryButton,
    SsoButton: OrySsoButton,
    Input: OryInput,
    CodeInput: OryCodeInput,
    Checkbox: OryCheckbox,
    // Image: OryImage,
    // Label: OryLabel,
  },
  Card: {
    Root: OryCardRoot,
    // Header: OryCardHeader,
    //Footer: OryCardFooter,
    // Content: OryCardContent,
    //Divider: OryCardDivider,
    SettingsSection: OrySettingsSection,
    SettingsSectionContent: OrySettingsSectionContent,
    SettingsSectionFooter: OrySettingsSectionFooter,
  },
  Message: {
    Toast: OryToast,
  },
};
