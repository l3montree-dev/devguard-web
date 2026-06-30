// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import type { OryNodeButtonProps } from "@ory/elements-react";
import { FingerPrintIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { usePasswordMismatch } from "../PasswordField";

export function OryButton({
  node,
  buttonProps,
  isSubmitting,
}: OryNodeButtonProps) {
  const label = node.meta.label?.text ?? "";
  const passwordsMismatch = usePasswordMismatch();
  const { onClick, disabled, type, name, value } = buttonProps;

  return (
    <Button
      name={name}
      type={type}
      value={value?.toString()}
      disabled={disabled || passwordsMismatch}
      variant={node.group === "passkey" ? "default" : "secondary"}
      data-testid={`${node.group}-submit`}
      onClick={onClick}
    >
      {isSubmitting ? (
        <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
      ) : node.group === "passkey" ? (
        <FingerPrintIcon className="w-5 h-5 mr-2" />
      ) : null}
      {label}
    </Button>
  );
}
