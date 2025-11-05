import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "../../lib/utils";

// Create a Tabs component using Radix UI
const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center rounded-xl bg-neutral-800/50 backdrop-blur-lg border border-neutral-700/60 p-1.5 text-text-secondary",
      className
    )}
    {...props}
  />
));

TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-base font-medium transition-all duration-300 ease-in-out",
      "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700/60",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-lime focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      "data-[state=active]:bg-lime-500/30 data-[state=active]:text-lime-50 data-[state=active]:border data-[state=active]:border-lime-400/50 data-[state=active]:shadow-lg data-[state=active]:shadow-lime-500/20",
      className
    )}
    {...props}
  />
));

TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-violet focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));

TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
