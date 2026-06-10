// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import { useState } from "react";
import type { FocusEventHandler, MouseEventHandler } from "react";
import { useFormContext, type UseFormRegisterReturn } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

const PASSWORD_FIELD_CLASS =
  "bg-background/70 flex h-10 w-full rounded-md border border-input text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 items-center";

export const CONFIRM_PASSWORD_LABEL = "Confirm Password";

export function usePasswordMismatch(): boolean {
  const { watch } = useFormContext();
  const password = watch("password");
  const confirmPassword = watch("confirmPassword");
  return (
    typeof confirmPassword === "string" &&
    confirmPassword.length > 0 &&
    password !== confirmPassword
  );
}

export function PasswordField({
  field,
  label,
  id,
  "data-testid": dataTestId,
  placeholder,
  maxLength,
  autoComplete,
  required,
  disabled,
  pattern,
  className,
  onClick,
  onBlur,
}: {
  field: UseFormRegisterReturn;
  label: string;
  id?: string;
  "data-testid"?: string;
  placeholder?: string;
  maxLength?: number;
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
  pattern?: string;
  className?: string;
  onClick?: MouseEventHandler<HTMLInputElement>;
  onBlur?: FocusEventHandler<HTMLInputElement>;
}) {
  const [reveal, setReveal] = useState(false);
  const { ref, onBlur: fieldOnBlur, ...fieldRest } = field;

  return (
    <div className={`${PASSWORD_FIELD_CLASS} ${className ?? ""}`}>
      <input
        id={id}
        ref={ref}
        type={reveal ? "text" : "password"}
        maxLength={maxLength}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        pattern={pattern}
        placeholder={placeholder}
        onClick={onClick}
        onBlur={(e) => {
          onBlur?.(e);
          fieldOnBlur(e);
        }}
        data-testid={dataTestId}
        {...fieldRest}
        className="w-full py-2 pl-3"
      />
      <Button
        className="bg-transparent hover:bg-transparent text-foreground"
        type="button"
        onClick={() => setReveal((prev) => !prev)}
        aria-label={reveal ? `Hide ${label}` : `Show ${label}`}
        aria-pressed={reveal}
      >
        {reveal ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
      </Button>
    </div>
  );
}
