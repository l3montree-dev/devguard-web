"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import * as SliderPrimitive from "@radix-ui/react-slider";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>

>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
        defaultValue={[8]}
        max={10}
        step={1}
        onValueChange={setProgress}
        className="relative flex w-full touch-none select-none items-center"
      >
        <SliderPrimitive.Track className="slider-gradient relative h-1.5 w-full grow overflow-hidden rounded-full">
          <SliderPrimitive.Range className="absolute h-full bg-secondary" />
        </SliderPrimitive.Track>

        <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
          {/* Sticky label */}
          <Badge className="absolute -top-4 left-1/2 -translate-x-1/2 -translate-y-1/2">
            {progress[0]}
          </Badge>
        </SliderPrimitive.Thumb>
      </SliderPrimitive.Root>
));
};
