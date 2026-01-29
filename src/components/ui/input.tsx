import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "onCard";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "default", ...props }, ref) => {
    // ensure value is never undefined to prevent controlled/uncontrolled switching
    const inputProps = { ...props };
    if ("value" in inputProps && inputProps.value === undefined) {
      inputProps.value = "";
    }

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          variant === "onCard" ? "bg-background/70" : "bg-card",
          className,
        )}
        ref={ref}
        {...inputProps}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
