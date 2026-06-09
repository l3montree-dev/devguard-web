// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import { useFormContext } from "react-hook-form";
import type { OryNodeInputProps } from "@ory/elements-react";
import { Input } from "@/components/ui/input";

export function OryCodeInput({ node, attributes, onClick }: OryNodeInputProps) {
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
