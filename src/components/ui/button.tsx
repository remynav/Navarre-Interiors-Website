import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm transition-all duration-500 ease-elegant hover:bg-charcoal-light hover:shadow-elev1 hover:-translate-y-0.5 active:translate-y-0",
        destructive:
          "bg-destructive text-destructive-foreground transition-all duration-300 ease-quiet hover:bg-destructive/90",
        outline:
          "border border-input bg-background transition-all duration-300 ease-quiet hover:bg-accent hover:text-accent-foreground hover:border-gold/30 hover:shadow-sm",
        secondary:
          "bg-secondary text-secondary-foreground transition-all duration-300 ease-quiet hover:bg-secondary/80",
        ghost:
          "transition-colors duration-300 ease-quiet hover:bg-accent/80 hover:text-accent-foreground",
        link: "text-primary underline-offset-4 transition-colors duration-300 hover:underline hover:text-gold",
        gold:
          "group relative overflow-hidden border border-gold-dark/40 bg-gold text-primary-foreground shadow-goldSoft transition-all duration-500 ease-elegant hover:-translate-y-0.5 hover:bg-gold-dark hover:shadow-elev2 active:translate-y-0",
        "gold-outline":
          "border-2 border-gold bg-transparent text-gold transition-all duration-500 ease-elegant hover:bg-gold hover:text-primary-foreground hover:shadow-goldSoft hover:-translate-y-0.5 active:translate-y-0",
        hero:
          "bg-primary px-8 py-6 text-xs uppercase tracking-[0.18em] text-primary-foreground shadow-elev1 transition-all duration-500 ease-elegant hover:-translate-y-0.5 hover:bg-charcoal-light hover:shadow-elev2 active:translate-y-0",
        "hero-outline":
          "border border-primary/80 bg-transparent px-8 py-6 text-xs uppercase tracking-[0.18em] text-primary transition-all duration-500 ease-elegant hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-primary-foreground active:translate-y-0",
        "link-underline":
          "relative h-auto rounded-none bg-transparent p-0 font-normal text-foreground transition-colors duration-300 ease-quiet hover:text-gold after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-gold after:transition-transform after:duration-500 after:ease-elegant hover:after:scale-x-100",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-14 rounded-md px-10 text-base",
        icon: "h-10 w-10",
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

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
