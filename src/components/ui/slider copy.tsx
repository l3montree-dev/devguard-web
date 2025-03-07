import * as React from "react";

import { Badge } from "@/components/ui/badge";
import * as SliderPrimitive from "@radix-ui/react-slider";

export default function SliderWithStickyLabelDemo() {
  const [progress, setProgress] = React.useState([30]);

  return (
    <div className="relative flex w-full max-w-sm flex-col items-center">
      <SliderPrimitive.Root
        defaultValue={progress}
        max={100}
        step={1}
        onValueChange={setProgress}
        className="relative flex w-full touch-none select-none items-center"
      >
        <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>

        <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
          {/* Sticky label */}
          <Badge className="absolute -top-4 left-1/2 -translate-x-1/2 -translate-y-1/2">
            {progress[0]}%
          </Badge>
        </SliderPrimitive.Thumb>
      </SliderPrimitive.Root>
    </div>
  );
}
