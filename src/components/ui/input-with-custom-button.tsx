// Copyright 2025 rafaeishikho.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import * as React from "react";

import { cn } from "@/lib/utils";
import { Label } from "./label";
import { Button, ButtonProps } from "./button";
import { Input } from "./input";

interface InputWithButtonProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  value: string;
  onClick: () => void;
  buttonChildren?: React.ReactNode;
  buttonVariant?: ButtonProps["variant"];
}

const InputWithCustomButton = (props: InputWithButtonProps) => {
  return (
    <div className="flex flex-col items-stretch gap-2 pt-4">
      <Label>{props.label}</Label>
      <div
        className={cn(
          "flex h-15 w-full rounded-md border border-input bg-card px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        <div className="flex flex-row justify-between items-center w-full">
          <p className="w-full bg-transparent">{props.value ?? ""}</p>
          <Button
            onClick={() => props.onClick()}
            variant={props.buttonVariant ?? "secondary"}
            className=""
          >
            {props.buttonChildren}
          </Button>
        </div>
      </div>
    </div>
  );
};

InputWithCustomButton.displayName = "InputWithCustomButton";

export { InputWithCustomButton };
