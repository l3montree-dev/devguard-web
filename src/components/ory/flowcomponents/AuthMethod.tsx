// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import type { OryCardAuthMethodListItemProps } from "@ory/elements-react";
import {
  EnvelopeIcon,
  FingerPrintIcon,
  KeyIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";

const AUTH_METHOD_META: Record<
  string,
  {
    label: string;
    description: string;
    Icon: typeof KeyIcon;
    recommended?: boolean;
  }
> = {
  passkey: {
    label: "Passkey (recommended)",
    description: "Use your device's fingerprint or face recognition",
    Icon: FingerPrintIcon,
    recommended: true,
  },
  password: {
    label: "Password",
    description: "Enter the password associated with your account",
    Icon: KeyIcon,
  },
  code: {
    label: "Email code",
    description: "Get a one-time login code sent to your email",
    Icon: EnvelopeIcon,
  },
  webauthn: {
    label: "Security key",
    description: "Use a hardware security key",
    Icon: ShieldCheckIcon,
  },
};

export function OryAuthMethodListItem({
  onClick,
  group,
}: OryCardAuthMethodListItemProps) {
  const meta = AUTH_METHOD_META[group];
  // Fallback for any unmapped group: use the group name so methods stay
  // distinct rather than all collapsing to one generic label.
  const label = meta?.label ?? group.charAt(0).toUpperCase() + group.slice(1);
  const description = meta?.description ?? "Sign in using this method";
  const Icon = meta?.Icon ?? KeyIcon;

  return (
    <Button
      variant={meta?.recommended ? "default" : "secondary"}
      className="h-auto w-full justify-start gap-3 p-3 text-left"
      onClick={onClick}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <span className="flex flex-col">
        <span className="font-medium">{label}</span>
        <span className="text-xs opacity-70 font-normal">{description}</span>
      </span>
    </Button>
  );
}
