// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import type { OryNodeCheckboxProps } from "@ory/elements-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function OryCheckbox({ node, inputProps }: OryNodeCheckboxProps) {
  const { name, checked, disabled, onChange, ref } = inputProps;
  return (
    <div className="flex items-center gap-2">
      <Checkbox
        ref={ref}
        id={name}
        name={name}
        checked={checked}
        required={node.attributes.required}
        disabled={disabled}
        onCheckedChange={(value) => onChange(value === true)}
      />
      {node.meta.label?.text && (
        <Label htmlFor={name} className="leading-none">
          {node.meta.label.text}
        </Label>
      )}
    </div>
  );
}
