// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import { useState } from "react";
import type { FocusEventHandler, MouseEventHandler } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// mirrors the Input component; the ring uses focus-within because the wrapper itself never receives focus
const PASSWORD_FIELD_CLASS =
  "flex h-10 w-full items-center rounded-md border border-input text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50 dark:border-foreground/10";

export const CONFIRM_PASSWORD_LABEL = "Confirm Password";

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
  variant = "default",
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
  variant?: "default" | "onCard";
  onClick?: MouseEventHandler<HTMLInputElement>;
  onBlur?: FocusEventHandler<HTMLInputElement>;
}) {
  const [reveal, setReveal] = useState(false);
  const { ref, onBlur: fieldOnBlur, ...fieldRest } = field;

  return (
    <div
      className={cn(
        PASSWORD_FIELD_CLASS,
        variant === "onCard" ? "bg-background/70" : "bg-card",
        className,
      )}
    >
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
        className="w-full bg-transparent py-2 pl-3 placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed"
      />
      <Button
        className="bg-transparent hover:bg-transparent text-muted-foreground"
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
