import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { Badge } from "@/components/ui/badge";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none flex-row items-center",
      className,
    )}
    {...props}
  >
    <SliderPrimitive.Track className="h-2 w-full grow overflow-hidden rounded-full bg-gradient-to-r from-yellow-500 to-orange-600 direction-reverse">
      <SliderPrimitive.Range className="absolute h-full bg-secondary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
      <Badge
        className="absolute -top-4 left-1/2 -translate-x-1/2  -translate-y-1/2 whitespace-nowrap text-left"
        variant="default"
      >
        {props.value}
      </Badge>
    </SliderPrimitive.Thumb>
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
