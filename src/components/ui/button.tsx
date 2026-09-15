import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:transition-transform [&_svg]:duration-200",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow-md",
        outline:
          "border border-input bg-background shadow-sm hover:bg-secondary hover:text-foreground hover:border-foreground/30",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        /* Minimalist luxury storefront variants */
        luxe: "bg-slate-900 text-white font-medium text-xs sm:text-sm hover:bg-slate-800 shadow-sm hover:shadow-lg hover:-translate-y-0.5 rounded-md",
        luxeOutline:
          "border border-slate-300 bg-white text-slate-800 font-medium text-xs sm:text-sm hover:bg-slate-50 hover:text-slate-900 hover:border-slate-400 shadow-sm hover:shadow-md hover:-translate-y-0.5 rounded-md",
        onImage:
          "border border-white/60 bg-white/20 text-white backdrop-blur-md font-medium text-xs sm:text-sm hover:bg-white hover:text-slate-900 hover:-translate-y-0.5 rounded-md",
        gold: "bg-amber-700 text-white font-medium text-xs sm:text-sm hover:bg-amber-800 shadow-sm hover:shadow-lg hover:-translate-y-0.5 rounded-md",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-6 text-sm",
        icon: "h-9 w-9",
        luxe: "h-11 px-6",
        luxeLg: "h-12 px-8",
        luxeSm: "h-9 px-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
