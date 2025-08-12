// Copyright 2025 rafaeishikho.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import * as React from "react";

import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Label } from "./label";

import {
  ArrowPathIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";
import { classNames } from "../../utils/common";
import Alert from "../common/Alert";
interface InputWithButtonProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  value: string;
  message?: string;
  variant?: "default" | "onCard";
  copyable?: boolean;
  mutable?: boolean;
  update?: {
    update: () => void;
    updateConfirmTitle: string;
    updateConfirmDescription: string;
  };
}

const InputWithButton = (props: InputWithButtonProps) => {
  const {
    onClick,
    copyable,
    update,
    label,
    message,
    variant,
    mutable,
    ...inputProps
  } = props;

  const handleCopy = () => {
    navigator.clipboard.writeText(props.value ?? "");
    toast("Copied to clipboard", {
      description: "The code has been copied to your clipboard.",
    });
  };
  return (
    <div className="flex flex-col items-stretch gap-2 pt-4">
      <Label className="font-medium">{label}</Label>
      <div
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          variant === "onCard" ? "bg-background" : "bg-card",
        )}
      >
        <div className="flex flex-row  justify-between w-full">
          <input
            {...inputProps}
            value={props.value ?? ""}
            className={classNames("w-full bg-transparent focus:outline-none")}
            readOnly={!mutable}
          />
          <div className="flex flex-row items-center gap-2">
            {copyable && (
              <button
                className="cursor-pointer transition-all hover:opacity-100"
                type="button"
                onClick={handleCopy}
              >
                <ClipboardDocumentIcon className="h-4 w-4" />
              </button>
            )}

            {update && (
              <Alert
                title={update.updateConfirmTitle}
                description={update.updateConfirmDescription}
                onConfirm={() => update?.update()}
              >
                <ArrowPathIcon className="h-4 w-4" />
              </Alert>
            )}
          </div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
};

InputWithButton.displayName = "InputWithButton";

export { InputWithButton };
