"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { useLoader } from "@/hooks/useLoader";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "cursor-pointer inline-flex items-center hover:no-underline justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:grayscale-[50%]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-secondary text-destructive dark:border-destructive/50 border hover:bg-destructive/90 hover:text-destructive-foreground",
        destructiveOutline:
          "border-destructive border text-destructive hover:bg-destructive/10",
        outline:
          "border dark:border-foreground/20 !text-foreground hover:no-underline bg-transparent hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary !text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        xsicon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & { isSubmitting?: boolean }
>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
      disabled={props.disabled || props.isSubmitting}
    >
      {props.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {props.children}
    </Comp>
  );
});
Button.displayName = "Button";

const AsyncButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & { onClick: () => Promise<any> }
>(({ children, ...props }, ref) => {
  const { Loader, isLoading, waitFor } = useLoader();

  return (
    <Button
      disabled={isLoading}
      ref={ref}
      {...props}
      onClick={waitFor(props.onClick)}
    >
      <Loader />
      {children}
    </Button>
  );
});

AsyncButton.displayName = "AsyncButton";

export { Button, buttonVariants, AsyncButton };
