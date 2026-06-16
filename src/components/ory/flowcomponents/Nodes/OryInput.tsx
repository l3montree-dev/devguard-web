// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import { useFormContext } from "react-hook-form";
import type { OryNodeInputProps } from "@ory/elements-react";
import { Input } from "@/components/ui/input";
import { PasswordField } from "../PasswordField";

export function OryInput({ node, attributes, onClick }: OryNodeInputProps) {
  const { register } = useFormContext();
  const { value, name, autocomplete, maxlength, ...rest } = attributes;

  if (rest.type === "hidden") {
    return <input type="hidden" {...register(name, { value })} />;
  }

  const field = register(name, { value });

  if (rest.type === "password") {
    return (
      <PasswordField
        field={field}
        label="password"
        data-testid={name}
        placeholder={node.meta.label?.text}
        maxLength={maxlength}
        autoComplete={autocomplete}
        required={rest.required}
        disabled={rest.disabled}
        pattern={rest.pattern}
        onClick={onClick}
      />
    );
  }

  const { ref, ...restRegister } = field;

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
      data-testid={name}
      {...restRegister}
    />
  );
}
