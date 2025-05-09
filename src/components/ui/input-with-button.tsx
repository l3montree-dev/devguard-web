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
  SVG?: React.ReactNode;
}

const InputWithButton = (props: InputWithButtonProps) => {
  return (
    <div className="flex flex-col items-stretch gap-2 pt-4">
      <Label>{props.label}</Label>
      <div
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        <div className="flex flex-row  justify-between w-full">
          <input
            value={props.value ?? ""}
            className="w-full bg-transparent focus:outline-none"
          />
          <button onClick={() => props.onClick()}>
            <div className="h-4 w-4">{props.SVG}</div>
          </button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{props.message}</p>
    </div>
  );
};

InputWithButton.displayName = "InputWithButton";

export { InputWithButton };
