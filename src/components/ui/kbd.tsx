import * as React from "react";

import { cn } from "@/lib/utils";

const KbdGroup = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <kbd
    ref={ref}
    className={cn("inline-flex items-center gap-1", className)}
    {...props}
  />
));
KbdGroup.displayName = "KbdGroup";

const Kbd = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <kbd
      ref={ref}
      className={cn(
        "pointer-events-none inline-flex h-5 min-w-5 select-none items-center justify-center gap-1 rounded border bg-muted px-1.5 font-sans text-[10px] font-medium text-muted-foreground",
        className,
      )}
      {...props}
    />
  ),
);
Kbd.displayName = "Kbd";

export { Kbd, KbdGroup };
