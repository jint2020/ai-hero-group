import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "pixel-button inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        neon: "border-2 border-cyan-400 bg-gray-900 text-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:bg-gray-800 hover:shadow-[0_0_30px_rgba(0,255,255,0.5)]",
        neonPink: "border-2 border-pink-500 bg-gray-900 text-pink-500 shadow-[0_0_20px_rgba(255,0,128,0.3)] hover:bg-gray-800 hover:shadow-[0_0_30px_rgba(255,0,128,0.5)]",
        neonGreen: "border-2 border-green-500 bg-gray-900 text-green-500 shadow-[0_0_20px_rgba(57,255,20,0.3)] hover:bg-gray-800 hover:shadow-[0_0_30px_rgba(57,255,20,0.5)]",
        neonYellow: "border-2 border-yellow-500 bg-gray-900 text-yellow-500 shadow-[0_0_20px_rgba(255,255,0,0.3)] hover:bg-gray-800 hover:shadow-[0_0_30px_rgba(255,255,0,0.5)]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
