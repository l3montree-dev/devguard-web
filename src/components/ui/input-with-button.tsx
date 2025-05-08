// Copyright 2025 rafaeishikho.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import * as React from "react";

import { cn } from "@/lib/utils";
import { Label } from "./label";
import { Button } from "./button";
import { Input } from "./input";

interface InputWithButtonProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  value: string;
  message?: string;
  onClick: () => void;
  svg?: React.ReactNode;
}

const InputWithButton = (props: InputWithButtonProps) => {
  return (
    <div className="flex flex-col items-stretch gap-2 pt-4">
      <Label>{props.label}</Label>
      <div className="flex flex-row items-start justify-between">
        <Input value={props.value ?? "No webhook secret set"} />
        <Button variant="secondary" onClick={() => props.onClick()}>
          <div className="h-4 w-4">{props.svg}</div>
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">{props.message}</p>
    </div>
  );
};

InputWithButton.displayName = "InputWithButton";

export { InputWithButton };
