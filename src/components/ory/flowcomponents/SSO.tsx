// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import { Children, cloneElement, isValidElement } from "react";
import type {
  OryFormSsoRootProps,
  OryNodeSsoButtonProps,
  OrySettingsSsoProps,
} from "@ory/elements-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const providerDisplayNames: Record<string, string> = {
  github: "GitHub",
  gitlab: "GitLab",
  opencode: "openCode",
};

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

export function OrySsoButton({
  node,
  attributes,
  buttonProps,
  className,
}: OryNodeSsoButtonProps & { className?: string }) {
  const provider = String(attributes.value).split("-")[0];
  const displayName = providerDisplayNames[provider];
  return (
    <Button
      variant="outline"
      className={`px-6 ${className ?? ""}`.trim()}
      name={buttonProps.name}
      type={buttonProps.type}
      value={buttonProps.value?.toString()}
      disabled={buttonProps.disabled}
      onClick={buttonProps.onClick}
    >
      <SsoProviderIcon provider={provider} />
      {displayName ? `${displayName}` : node.meta.label?.text}
    </Button>
  );
}

export function OrySsoRoot({ children }: OryFormSsoRootProps) {
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

export function OrySsoSettings({
  linkButtons,
  unlinkButtons,
}: OrySettingsSsoProps) {
  return (
    <div className="flex flex-row flex-wrap gap-2">
      {linkButtons.map((button) => {
        const { name, type, value, disabled, onClick } = button.buttonProps;
        const provider = String(value ?? "").split("-")[0];
        const displayName = providerDisplayNames[provider] ?? provider;
        return (
          <Button
            key={`link:${name}:${String(value ?? "")}`}
            variant="secondary"
            className="w-44"
            name={name}
            type={type}
            value={value?.toString()}
            disabled={disabled}
            onClick={onClick}
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
        const { name, type, value, disabled, onClick } = button.buttonProps;
        const provider = String(value ?? "").split("-")[0];
        const displayName = providerDisplayNames[provider] ?? provider;
        return (
          <Button
            key={`unlink:${name}:${String(value ?? "")}`}
            variant="secondary"
            className="w-44"
            name={name}
            type={type}
            value={value?.toString()}
            disabled={disabled}
            onClick={onClick}
          >
            <SsoProviderIcon provider={provider} />
            Unlink {displayName}
          </Button>
        );
      })}
    </div>
  );
}
