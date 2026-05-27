"use client";

import { FingerPrintIcon, KeyIcon } from "@heroicons/react/24/outline";
import {
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";
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
import { usePathname } from "next/navigation";
import Section from "../common/Section";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Checkbox } from "../ui/checkbox";

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

type PasswordCheckStatus = "idle" | "loading" | "pass" | "fail";

const PASSWORD_CHECKS = [
  {
    id: "length",
    label: "At least 12 characters",
    test: (password: string) => password.length >= 12,
  },
  {
    id: "upper",
    label: "Contains an uppercase letter",
    test: (password: string) => /[A-Z]/.test(password),
  },
  {
    id: "number",
    label: "Contains a number",
    test: (password: string) => /\d/.test(password),
  },
  {
    id: "symbol",
    label: "Contains a symbol",
    test: (password: string) => /[^A-Za-z0-9]/.test(password),
  },
  {
    id: "base-strength",
    label: "Base strength requirements met",
    test: (password: string) =>
      password.length >= 12 &&
      /[A-Z]/.test(password) &&
      /\d/.test(password) &&
      /[^A-Za-z0-9]/.test(password),
  },
];

function evaluatePasswordChecks(password: string) {
  return PASSWORD_CHECKS.map((check) => ({
    ...check,
    passed: check.test(password),
  }));
}

function PasswordCheckIcon({ status }: { status: PasswordCheckStatus }) {
  if (status === "loading") {
    return (
      <ArrowPathIcon className="h-4 w-4 animate-spin text-muted-foreground" />
    );
  }

  if (status === "pass") {
    return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
  }

  if (status === "fail") {
    return <XCircleIcon className="h-4 w-4 text-destructive" />;
  }

  return (
    <span className="h-4 w-4 rounded-full border border-border" aria-hidden />
  );
}

async function sha1Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-1", data);
  const bytes = Array.from(new Uint8Array(digest));
  return bytes
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

async function getPwnedPasswordCount(
  password: string,
  signal?: AbortSignal,
): Promise<number> {
  const hash = await sha1Hex(password);
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);

  const response = await fetch(
    `https://api.pwnedpasswords.com/range/${prefix}`,
    {
      method: "GET",
      headers: {
        "Add-Padding": "true",
      },
      signal,
    },
  );

  if (!response.ok) {
    throw new Error("Unable to check leaked-password database");
  }

  const body = await response.text();
  const lines = body.split("\n");

  for (const line of lines) {
    const [candidateSuffix, count] = line.trim().split(":");
    if (candidateSuffix === suffix) {
      return Number.parseInt(count ?? "0", 10) || 0;
    }
  }

  return 0;
}

function PasswordQualityCard({ password }: { password: string }) {
  const [checkStatuses, setCheckStatuses] = useState<
    Record<string, PasswordCheckStatus>
  >(
    Object.fromEntries(
      PASSWORD_CHECKS.map((check) => [check.id, "idle"]),
    ) as Record<string, PasswordCheckStatus>,
  );
  const [pwnedStatus, setPwnedStatus] = useState<PasswordCheckStatus>("idle");
  const [pwnedCount, setPwnedCount] = useState<number | null>(null);

  useEffect(() => {
    if (!password) {
      setCheckStatuses(
        Object.fromEntries(
          PASSWORD_CHECKS.map((check) => [check.id, "idle"]),
        ) as Record<string, PasswordCheckStatus>,
      );
      setPwnedStatus("idle");
      setPwnedCount(null);
      return;
    }

    setCheckStatuses(
      Object.fromEntries(
        PASSWORD_CHECKS.map((check) => [check.id, "loading"]),
      ) as Record<string, PasswordCheckStatus>,
    );
    setPwnedStatus("loading");
    setPwnedCount(null);

    const timeoutId = window.setTimeout(() => {
      const evaluated = evaluatePasswordChecks(password);
      setCheckStatuses(
        Object.fromEntries(
          evaluated.map((check) => [check.id, check.passed ? "pass" : "fail"]),
        ) as Record<string, PasswordCheckStatus>,
      );
    }, 220);

    const abortController = new AbortController();

    const pwnedTimeoutId = window.setTimeout(async () => {
      try {
        const count = await getPwnedPasswordCount(
          password,
          abortController.signal,
        );
        setPwnedCount(count);
        setPwnedStatus(count > 0 ? "fail" : "pass");
      } catch {
        // Keep the check non-blocking for UX if network lookup is unavailable.
        setPwnedCount(null);
        setPwnedStatus("idle");
      }
    }, 220);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearTimeout(pwnedTimeoutId);
      abortController.abort();
    };
  }, [password]);

  if (!password) {
    return null;
  }

  return (
    <Card className="mt-3 border bg-muted/30 p-3">
      <div className="mb-2 text-xs font-medium text-muted-foreground">
        Password checks (local, before submit)
      </div>
      <ul className="space-y-2">
        {PASSWORD_CHECKS.map((check) => {
          const status = checkStatuses[check.id] ?? "idle";
          return (
            <li key={check.id} className="flex items-center gap-2 text-sm">
              <PasswordCheckIcon status={status} />
              <span>{check.label}</span>
            </li>
          );
        })}
        <li className="flex items-center gap-2 text-sm">
          <PasswordCheckIcon status={pwnedStatus} />
          <span>
            Not found in leaked password datasets (ORY/HIBP policy)
            {typeof pwnedCount === "number" && pwnedCount > 0
              ? ` (${pwnedCount.toLocaleString()} breaches)`
              : ""}
          </span>
        </li>
      </ul>
      {(Object.values(checkStatuses).includes("fail") ||
        pwnedStatus === "fail") && (
        <p className="mt-3 text-xs text-destructive">
          This password is not strong enough yet. Try a longer passphrase with
          mixed characters.
        </p>
      )}
    </Card>
  );
}

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
  const { register, watch } = useFormContext();
  const pathname = usePathname();
  const { value, name, autocomplete, maxlength, ...rest } = attributes;
  const isRegistrationPasswordInput =
    pathname === "/registration" &&
    rest.type === "password" &&
    name === "password";
  const currentPasswordValue = watch(name);

  if (rest.type === "hidden") {
    return <input type="hidden" {...register(name, { value })} />;
  }

  const { ref, ...restRegister } = register(
    name,
    isRegistrationPasswordInput
      ? {
          value,
          validate: (inputValue: string) => {
            if (!inputValue) {
              return false;
            }

            return getPwnedPasswordCount(inputValue)
              .then((breachCount) => {
                const allChecksPassed = evaluatePasswordChecks(
                  inputValue,
                ).every((check) => check.passed);

                if (!allChecksPassed) {
                  return "This password is not strong enough yet.";
                }

                if (breachCount > 0) {
                  return "This password appears in leaked password databases.";
                }

                return true;
              })
              .catch(() => true);
          },
        }
      : { value },
  );

  return (
    <>
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
      {isRegistrationPasswordInput && (
        <PasswordQualityCard password={String(currentPasswordValue ?? "")} />
      )}
    </>
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
    Input: OryInput,
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
