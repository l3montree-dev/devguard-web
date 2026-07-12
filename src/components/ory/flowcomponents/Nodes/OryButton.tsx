// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import type { OryNodeButtonProps } from "@ory/elements-react";
import { FingerPrintIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { usePasswordMismatch } from "@/hooks/usePasswordMismatch";

export function OryButton({ node, buttonProps }: OryNodeButtonProps) {
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
      name={buttonProps.name}
      type={buttonProps.type === "button" ? "button" : "submit"}
      value={buttonProps.value?.toString()}
      disabled={buttonProps.disabled || isSubmitting || passwordsMismatch}
      variant={node.group === "passkey" ? "default" : "secondary"}
      data-testid={`${node.group}-submit`}
      onClick={(e) => {
        buttonProps.onClick(e);
        setClicked(true);
        if (node.attributes.type !== "button") {
          setValue(node.attributes.name, node.attributes.value);
        }
      }}
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
