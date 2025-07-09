// Copyright 2025 rafaeishikho.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import * as React from "react";

import { cn } from "@/lib/utils";
import { Label } from "./label";
import { Button } from "./button";
import { Input } from "./input";
import { toast } from "sonner";

import { ClipboardDocumentIcon } from "@heroicons/react/24/outline";

interface InputWithButtonProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  value: string;
  message?: string;
  onClick?: () => void;
  SVG?: React.ReactNode;
  copyable?: boolean;
}

const InputWithButton = (props: InputWithButtonProps) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(props.value ?? "");
    toast("Copied to clipboard", {
      description: "The code has been copied to your clipboard.",
    });
  };
  return (
    <div className="flex flex-col items-stretch gap-2 pt-4">
      <Label>{props.label}</Label>
      <div
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        <div className="flex flex-row  justify-between w-full">
          <input
            value={props.value ?? ""}
            className="w-full bg-transparent focus:outline-none"
          />
          <div className="flex flex-row items-center gap-2">
            {props.copyable && (
              <button onClick={handleCopy}>
                <ClipboardDocumentIcon className="h-4 w-4" />
              </button>
            )}
            {props.SVG && (
              <button onClick={() => props.onClick && props.onClick()}>
                <div className="h-4 w-4">{props.SVG}</div>
              </button>
            )}
          </div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{props.message}</p>
    </div>
  );
};

InputWithButton.displayName = "InputWithButton";

export { InputWithButton };
