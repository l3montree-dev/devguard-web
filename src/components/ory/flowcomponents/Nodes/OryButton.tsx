// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import type { OryNodeButtonProps } from "@ory/elements-react";
import { FingerPrintIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { usePasswordMismatch } from "../PasswordField";

export function OryButton({
  node,
  attributes,
  onClick,
  ...rest
}: OryNodeButtonProps) {
  const label = node.meta.label?.text ?? "";
  const [clicked, setClicked] = useState(false);
  const {
    formState: { isSubmitting },
    setValue,
  } = useFormContext();
  const passwordsMismatch = usePasswordMismatch();

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
      data-testid={`${node.group}-submit`}
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
