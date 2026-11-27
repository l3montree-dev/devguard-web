// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import { useFormContext } from "react-hook-form";
import { useComponents } from "@ory/elements-react";
import type { OryNodeCheckboxProps } from "@ory/elements-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function OryCheckbox({ node, attributes }: OryNodeCheckboxProps) {
  const { register } = useFormContext();
  const { value, name, ...rest } = attributes;
  const { onChange, ...formProps } = register(name);
  const { Message } = useComponents();
  return (
    <div className="flex flex-col gap-1">
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
      {node.messages.map((message) => (
        <Message.Content key={message.id} message={message} />
      ))}
    </div>
  );
}
