// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import { useFormContext } from "react-hook-form";
import type { OryNodeInputProps } from "@ory/elements-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function OryCheckbox({ node, attributes }: OryNodeInputProps) {
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
