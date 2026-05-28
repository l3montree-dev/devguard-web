"use client";

import { FingerPrintIcon, KeyIcon } from "@heroicons/react/24/outline";
import {
  type OryCardContentProps,
  type OryCardSettingsSectionProps,
  type OryFlowComponentOverrides,
  type OryFormSectionContentProps,
  type OryFormSectionFooterProps,
  type OryFormSsoRootProps,
  type OryNodeButtonProps,
  type OryNodeImageProps,
  type OryNodeInputProps,
  type OryNodeLabelProps,
  type OryCardAuthMethodListItemProps,
  type OryMessageContentProps,
  type OryNodeSsoButtonProps,
  type OrySettingsSsoProps,
} from "@ory/elements-react";
import {
  DefaultCardFooter,
  DefaultCardHeader,
} from "@ory/elements-react/theme";
import Image from "next/image";
import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useState,
} from "react";
import type { PropsWithChildren } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import Section from "../common/Section";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Checkbox } from "../ui/checkbox";
import { Eye, EyeOff } from "lucide-react";

function OryButton({ node, attributes, onClick, ...rest }: OryNodeButtonProps) {
  const label = node.meta.label?.text ?? "";
  const [clicked, setClicked] = useState(false);
  const {
    formState: { isSubmitting },
    setValue,
    watch,
  } = useFormContext();

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");
  const passwordsMismatch =
    typeof confirmPassword === "string" &&
    confirmPassword.length > 0 &&
    password !== confirmPassword;

  useEffect(() => {
    if (!isSubmitting) setClicked(false);
  }, [isSubmitting]);

  return (
    <Button
      name={attributes.name}
      type={attributes.type === "button" ? "button" : "submit"}
      value={attributes.value?.toString()}
      disabled={attributes.disabled || isSubmitting || passwordsMismatch}
      variant={node.group === "passkey" ? "default" : "secondary"}
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

function OrySsoButton({
  node,
  attributes,
  onClick,
  className,
  ...rest
}: OryNodeSsoButtonProps & { className?: string }) {
  const provider = String(attributes.value).split("-")[0];
  const displayName = providerDisplayNames[provider];
  return (
    <Button
      variant="outline"
      className={`px-6 ${className ?? ""}`.trim()}
      name={attributes.name}
      type={attributes.type === "button" ? "button" : "submit"}
      value={attributes.value?.toString()}
      disabled={attributes.disabled}
      onClick={onClick}
      {...rest}
    >
      <SsoProviderIcon provider={provider} />
      {displayName ? `${displayName}` : node.meta.label?.text}
    </Button>
  );
}

function OrySsoRoot({ children }: OryFormSsoRootProps) {
  const ssoButtons = Children.toArray(children);
  const providerCount = ssoButtons.length;

  const rootClassName =
    providerCount >= 3
      ? "flex justify-between gap-3 mt-3 items-center"
      : "flex gap-3 mt-3 items-center";

  const withLayout = ssoButtons.map((child) => {
    if (!isValidElement<{ className?: string }>(child)) return child;

    const baseClass = child.props.className ?? "";

    if (providerCount === 1) {
      return cloneElement(child, {
        className: `${baseClass} w-full`.trim(),
      });
    }

    if (providerCount === 2) {
      return cloneElement(child, {
        className: `${baseClass} flex-1`.trim(),
      });
    }

    return child;
  });

  return <div className={rootClassName}>{withLayout}</div>;
}

function SsoProviderIcon({ provider }: { provider: string }) {
  const icons: Record<string, { light: string; dark: string }> = {
    opencode: {
      light: "/assets/provider-icons/opencode.svg",
      dark: "/assets/provider-icons/opencode_w.svg",
    },
    gitlab: {
      light: "/assets/provider-icons/gitlab.svg",
      dark: "/assets/provider-icons/gitlab_w.svg",
    },
    github: {
      light: "/assets/provider-icons/github.svg",
      dark: "/assets/provider-icons/github_w.svg",
    },
  };

  const entry = icons[provider];
  if (!entry) return null;

  return (
    <>
      <Image
        src={entry.light}
        alt=""
        aria-hidden
        width={20}
        height={20}
        className="mr-2 dark:hidden"
      />
      <Image
        src={entry.dark}
        alt=""
        aria-hidden
        width={20}
        height={20}
        className="mr-2 hidden dark:block"
      />
    </>
  );
}

const providerDisplayNames: Record<string, string> = {
  github: "GitHub",
  gitlab: "GitLab",
  opencode: "openCode",
};

function OrySsoSettings({ linkButtons, unlinkButtons }: OrySettingsSsoProps) {
  return (
    <div className="flex flex-row flex-wrap gap-2">
      {linkButtons.map((button) => {
        const attrs = button.attributes as {
          name?: string;
          type?: string;
          value?: string;
          disabled?: boolean;
        };
        const provider = String(attrs.value ?? "").split("-")[0];
        const displayName = providerDisplayNames[provider] ?? provider;
        return (
          <Button
            key={`link:${attrs.name ?? ""}:${attrs.value ?? ""}`}
            variant="secondary"
            className="w-44"
            name={attrs.name}
            type={attrs.type === "button" ? "button" : "submit"}
            value={attrs.value}
            disabled={attrs.disabled}
            onClick={button.onClick}
          >
            <SsoProviderIcon provider={provider} />
            Link {displayName}
          </Button>
        );
      })}
      {unlinkButtons.length > 0 && linkButtons.length > 0 && (
        <Separator className="my-2" />
      )}
      {unlinkButtons.map((button) => {
        const attrs = button.attributes as {
          name?: string;
          type?: string;
          value?: string;
          disabled?: boolean;
        };
        const provider = String(attrs.value ?? "").split("-")[0];
        const displayName = providerDisplayNames[provider] ?? provider;
        return (
          <Button
            key={`unlink:${attrs.name ?? ""}:${attrs.value ?? ""}`}
            variant="secondary"
            className="w-44"
            name={attrs.name}
            type={attrs.type === "button" ? "button" : "submit"}
            value={attrs.value}
            disabled={attrs.disabled}
            onClick={button.onClick}
          >
            <SsoProviderIcon provider={provider} />
            Unlink {displayName}
          </Button>
        );
      })}
    </div>
  );
}

function OryInput({ node, attributes, onClick }: OryNodeInputProps) {
  const { register } = useFormContext();
  const { value, name, autocomplete, maxlength, ...rest } = attributes;
  const [revealPassword, setRevealPassword] = useState(false);

  if (rest.type === "hidden") {
    return <input type="hidden" {...register(name, { value })} />;
  }

  const { ref, ...restRegister } = register(name, { value });

  if (rest.type === "password") {
    return (
      <div className="bg-background/70 flex h-10 w-full rounded-md border border-input text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 items-center">
        <input
          ref={ref}
          type={revealPassword ? "text" : "password"}
          maxLength={maxlength}
          autoComplete={autocomplete}
          required={rest.required}
          disabled={rest.disabled}
          pattern={rest.pattern}
          placeholder={node.meta.label?.text}
          onClick={onClick}
          {...restRegister}
          className="w-full py-2 pl-3"
        />
        <Button
          className="bg-transparent hover:bg-transparent"
          type="button"
          onClick={() => {
            setRevealPassword((prevState) => !prevState);
          }}
          aria-label={revealPassword ? "Hide password" : "Show password"}
          aria-pressed={revealPassword}
        >
          {!revealPassword && <Eye aria-hidden="true" />}
          {revealPassword && <EyeOff aria-hidden="true" />}
        </Button>
      </div>
    );
  }

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

function OryRegistrationInput({
  node,
  attributes,
  onClick,
}: OryNodeInputProps) {
  const {
    register,
    watch,
    formState: { isSubmitSuccessful },
  } = useFormContext();
  const { value, name, autocomplete, maxlength, ...rest } = attributes;
  const [revealPassword, setRevealPassword] = useState(false);
  const [revealConfirmPassword, setRevealConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const passwordValue = watch("password");
  const confirmPasswordValue = watch("confirmPassword");

  useEffect(() => {
    setPasswordError("");
  }, [isSubmitSuccessful]);

  if (rest.type === "hidden") {
    return <input type="hidden" {...register(name, { value })} />;
  }

  const { ref, ...restRegister } = register(name, { value });

  const { onBlur, ...restRegisterConfirmPassword } = register(
    "confirmPassword",
    { required: true },
  );

  if (rest.type === "password") {
    return (
      <div className="flex flex-col gap-1">
        <div className="mb-3 bg-background/70 flex h-10 w-full rounded-md border border-input text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 items-center">
          <input
            ref={ref}
            type={revealPassword ? "text" : "password"}
            maxLength={maxlength}
            autoComplete={autocomplete}
            required={rest.required}
            disabled={rest.disabled}
            pattern={rest.pattern}
            placeholder={node.meta.label?.text}
            onClick={onClick}
            {...restRegister}
            className="w-full py-2 pl-3"
            onFocus={() => {
              setPasswordError("");
            }}
          />
          <Button
            className="bg-transparent hover:bg-transparent"
            type="button"
            onClick={() => {
              setRevealPassword((prevState) => !prevState);
            }}
            aria-label={
              revealConfirmPassword
                ? "Hide confirm password"
                : "Show confirm password"
            }
            aria-pressed={revealConfirmPassword}
          >
            {!revealPassword && <Eye aria-hidden="true" />}
            {revealPassword && <EyeOff aria-hidden="true" />}
          </Button>
        </div>
        <div className="text-sm font-medium">Confirm Password</div>
        <div className="bg-background/70 flex h-10 w-full rounded-md border border-input text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 items-center">
          <input
            type={revealConfirmPassword ? "text" : "password"}
            maxLength={maxlength}
            autoComplete={autocomplete}
            disabled={rest.disabled}
            pattern={rest.pattern}
            placeholder={"Confirm Password"}
            className="w-full py-2 pl-3"
            onBlur={(e) => {
              if (confirmPasswordValue !== passwordValue) {
                setPasswordError("Confirm password is not equal to password");
              } else {
                setPasswordError("");
              }
              onBlur(e);
            }}
            onFocus={() => {
              setPasswordError("");
            }}
            {...restRegisterConfirmPassword}
          />
          <Button
            className="bg-transparent hover:bg-transparent"
            type="button"
            onClick={() => {
              setRevealConfirmPassword((prevState) => !prevState);
            }}
            aria-label={
              revealConfirmPassword
                ? "Hide confirm password"
                : "Show confirm password"
            }
            aria-pressed={revealConfirmPassword}
          >
            {!revealConfirmPassword && <Eye aria-hidden="true" />}
            {revealConfirmPassword && <EyeOff aria-hidden="true" />}
          </Button>
        </div>
        {passwordError && (
          <p className="text-sm text-destructive">{passwordError}</p>
        )}
      </div>
    );
  }

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
  const { onChange, ...formProps } = register(name);
  return (
    <div className="flex items-center gap-2">
      <Checkbox
        defaultChecked={Boolean(value)}
        id={name}
        required={rest.required}
        disabled={rest.disabled}
        onCheckedChange={(value) => {
          onChange({ target: { name, value } });
        }}
        {...formProps}
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
  return <Card className="ory-card border-0 shadow-none">{children}</Card>;
}

// Transparent root for layouts that provide their own card wrapper (e.g. login page)
function OryCardRootTransparent({ children }: PropsWithChildren) {
  return <div className="ory-card">{children}</div>;
}

function OryCardHeader() {
  return (
    <div className="text-center">
      <DefaultCardHeader />
    </div>
  );
}

function OryCardFooter() {
  return (
    <div className="text-center">
      <DefaultCardFooter />
    </div>
  );
}

function OryCardContent({ children }: OryCardContentProps) {
  return <CardContent className="p-0">{children}</CardContent>;
}

function OryCardDivider() {
  return (
    <div className="relative my-4">
      <Separator />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="bg-card px-2 text-xs text-muted-foreground">
          or continue with
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

const MESSAGE_OVERRIDES: Record<number, string> = {
  4000029: "You must accept the terms of use to use DevGuard",
};

function OryMessageContent({ message }: OryMessageContentProps) {
  const text = MESSAGE_OVERRIDES[message.id] ?? message.text;
  const colorClass =
    message.type === "error"
      ? "text-destructive"
      : message.type === "success"
        ? "text-success"
        : "text-muted-foreground";

  return <span className={`leading-normal text-sm ${colorClass}`}>{text}</span>;
}

function OryAuthMethodListItem({
  onClick,
  group,
}: OryCardAuthMethodListItemProps) {
  const isPasskey = group === "passkey";

  return (
    <Button
      variant={isPasskey ? "default" : "secondary"}
      className="h-auto w-full justify-start gap-3 p-3 text-left"
      onClick={onClick}
    >
      {isPasskey ? (
        <FingerPrintIcon className="w-5 h-5 shrink-0" />
      ) : (
        <KeyIcon className="w-5 h-5 shrink-0" />
      )}
      <span className="flex flex-col">
        <span className="font-medium">
          {isPasskey ? "Passkey (recommended)" : "Password"}
        </span>
        <span className="text-xs opacity-70 font-normal">
          {isPasskey
            ? "Use your device's fingerprint or face recognition"
            : "Enter the password associated with your account"}
        </span>
      </span>
    </Button>
  );
}

export const loginComponentOverrides: OryFlowComponentOverrides = {
  Node: {
    Button: OryButton,
    SsoButton: OrySsoButton,
    Input: OryInput,
    CodeInput: OryCodeInput,
    Checkbox: OryCheckbox,
    // Label: OryLabel,
  },
  Form: {
    SsoRoot: OrySsoRoot,
    SsoSettings: OrySsoSettings,
  },
  Card: {
    Root: OryCardRootTransparent,
    Header: OryCardHeader,
    Footer: OryCardFooter,
    Divider: OryCardDivider,
    AuthMethodListItem: OryAuthMethodListItem,
    SettingsSection: OrySettingsSection,
    SettingsSectionContent: OrySettingsSectionContent,
    SettingsSectionFooter: OrySettingsSectionFooter,
  },
  Message: {
    Content: OryMessageContent,
    Toast: OryToast,
  },
};

export const oryComponentOverrides: OryFlowComponentOverrides = {
  Node: {
    Button: OryButton,
    SsoButton: OrySsoButton,
    Input: OryRegistrationInput,
    CodeInput: OryCodeInput,
    Checkbox: OryCheckbox,
    // Image: OryImage,
    // Label: OryLabel,
  },
  Form: {
    SsoRoot: OrySsoRoot,
    SsoSettings: OrySsoSettings,
  },
  Card: {
    Root: OryCardRoot,
    Header: OryCardHeader,
    Footer: OryCardFooter,
    // Content: OryCardContent,
    Divider: OryCardDivider,
    AuthMethodListItem: OryAuthMethodListItem,
    SettingsSection: OrySettingsSection,
    SettingsSectionContent: OrySettingsSectionContent,
    SettingsSectionFooter: OrySettingsSectionFooter,
  },
  Message: {
    Content: OryMessageContent,
    Toast: OryToast,
  },
};
