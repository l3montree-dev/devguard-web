"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

function ItemGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="list"
      data-slot="item-group"
      className={cn("group/item-group flex flex-col", className)}
      {...props}
    />
  );
}

function ItemSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="separator"
      data-slot="item-separator"
      className={cn("bg-border my-0 h-px w-full shrink-0", className)}
      {...props}
    />
  );
}

const itemVariants = cva(
  "group/item flex flex-wrap items-center rounded-md border border-transparent text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border-border bg-card",
        muted: "bg-muted/50",
      },
      size: {
        default: "gap-4 p-4",
        sm: "gap-2.5 px-3 py-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ItemProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof itemVariants> {
  asChild?: boolean;
}

const Item = React.forwardRef<HTMLDivElement, ItemProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";
    return (
      <Comp
        ref={ref}
        data-slot="item"
        data-variant={variant}
        data-size={size}
        className={cn(itemVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);
Item.displayName = "Item";

const itemMediaVariants = cva(
  "flex shrink-0 items-center justify-center gap-2 [&_svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "",
        icon: "size-8 rounded-md border bg-muted [&_svg:not([class*='size-'])]:size-4",
        image:
          "size-10 overflow-hidden rounded-md [&_img]:size-full [&_img]:object-cover",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface ItemMediaProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof itemMediaVariants> {}

const ItemMedia = React.forwardRef<HTMLDivElement, ItemMediaProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="item-media"
      data-variant={variant}
      className={cn(itemMediaVariants({ variant, className }))}
      {...props}
    />
  ),
);
ItemMedia.displayName = "ItemMedia";

const ItemContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="item-content"
    className={cn("flex min-w-0 flex-1 flex-col gap-0.5", className)}
    {...props}
  />
));
ItemContent.displayName = "ItemContent";

const ItemTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="item-title"
    className={cn(
      "flex w-full items-center gap-2 text-sm font-medium leading-snug",
      className,
    )}
    {...props}
  />
));
ItemTitle.displayName = "ItemTitle";

const ItemDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="item-description"
    className={cn(
      "text-muted-foreground line-clamp-2 text-xs font-normal leading-normal",
      className,
    )}
    {...props}
  />
));
ItemDescription.displayName = "ItemDescription";

const ItemActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="item-actions"
    className={cn("flex items-center gap-2", className)}
    {...props}
  />
));
ItemActions.displayName = "ItemActions";

export {
  Item,
  ItemGroup,
  ItemSeparator,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
};
