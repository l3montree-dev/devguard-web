// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import type { OryNodeInputProps } from "@ory/elements-react";
import { Label } from "@/components/ui/label";
import {
  CONFIRM_PASSWORD_LABEL,
  PasswordField,
  usePasswordMismatch,
} from "../PasswordField";
import { OryInput } from "./OryInput";

export function OryRegistrationInput(props: OryNodeInputProps) {
  const { node, attributes, onClick } = props;
  const { register } = useFormContext();
  const mismatch = usePasswordMismatch();
  const [confirmTouched, setConfirmTouched] = useState(false);
  const { value, name, autocomplete, maxlength, ...rest } = attributes;

  // Only the password field gets the extra confirmation field. Every other
  // node (email, name, hidden, csrf, …) renders exactly like the standard
  // input, so we delegate to OryInput rather than duplicating that logic.
  if (rest.type !== "password") {
    return <OryInput {...props} />;
  }

  // Show the mismatch error only once the confirm field has been touched, but
  // keep it watch-driven so it clears live as soon as the values match.
  const showMismatch = confirmTouched && mismatch;

  return (
    <div className="flex flex-col gap-1">
      <PasswordField
        field={register(name, { value })}
        label="password"
        placeholder={node.meta.label?.text}
        maxLength={maxlength}
        autoComplete={autocomplete}
        required={rest.required}
        disabled={rest.disabled}
        pattern={rest.pattern}
        onClick={onClick}
        className="mb-3"
      />
      <Label htmlFor="confirm-password" className="text-sm font-medium">
        {CONFIRM_PASSWORD_LABEL}
      </Label>
      <PasswordField
        id="confirm-password"
        field={register("confirmPassword")}
        label="confirm password"
        placeholder={CONFIRM_PASSWORD_LABEL}
        autoComplete="new-password"
        required={rest.required}
        disabled={rest.disabled}
        onBlur={() => setConfirmTouched(true)}
      />
      {showMismatch && (
        <p className="text-sm text-destructive">Passwords do not match.</p>
      )}
    </div>
  );
}
