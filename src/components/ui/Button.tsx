import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium transition-[color,background-color,transform,box-shadow] duration-300 ease-out disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold hover:-translate-y-px active:translate-y-0",
  {
    variants: {
      variant: {
        primary: "bg-accent text-accent-foreground hover:bg-[#2c2925] hover:shadow-md",
        secondary: "bg-surface-2 text-foreground hover:bg-border",
        ghost: "bg-transparent text-foreground hover:bg-surface-2",
        outline: "border border-border bg-surface hover:bg-surface-2",
        danger: "bg-danger text-white hover:bg-[#7d332a]",
      },
      size: {
        sm: "h-8 px-3",
        md: "h-10 px-4",
        lg: "h-12 px-5 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
