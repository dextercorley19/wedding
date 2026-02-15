"use client";

import * as React from "react";
import * as Label from "@radix-ui/react-label";

import { cn } from "@/lib/utils";

const LabelComponent = React.forwardRef<
  React.ElementRef<typeof Label.Root>,
  React.ComponentPropsWithoutRef<typeof Label.Root>
>(({ className, ...props }, ref) => (
  <Label.Root
    ref={ref}
    data-slot="label"
    className={cn(
      "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
      className
    )}
    {...props}
  />
));
LabelComponent.displayName = Label.Root.displayName;

export { LabelComponent as Label };
