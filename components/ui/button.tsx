import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/* provenance: agent=UI-DESIGNER action=updated timestamp=2025-09-07T21:05:00Z */
/* provenance: agent=WHIMSY-INJECTOR action=updated timestamp=2025-09-07T19:35:00Z */

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-fast ease-ease focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 font-brand transform-gpu active:scale-95 hover:scale-[1.02]",
  {
    variants: {
      variant: {
        // Primary - Professional teal for main actions
        default: "bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm hover:shadow-md rounded-base hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-fast",
        
        // Photographer - Special branded button for key photographer actions  
        photographer: "bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm hover:shadow-lg rounded-base px-button-x py-button-y font-medium hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 transition-all duration-fast group",
        
        // Destructive - For delete/dangerous actions
        destructive: "bg-error text-error-foreground hover:bg-error/90 shadow-sm hover:shadow-md rounded-base",
        
        // Outline - Subtle actions
        outline: "border border-input bg-surface hover:bg-surface-muted hover:text-text-primary rounded-base",
        
        // Secondary - Supporting actions
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary-hover rounded-base",
        
        // Ghost - Minimal actions
        ghost: "hover:bg-surface-muted hover:text-text-primary rounded-base",
        
        // Link - Text-only actions
        link: "text-primary underline-offset-4 hover:underline p-0 h-auto",
        
        // Success - Confirmation actions with celebration animation
        success: "bg-success text-success-foreground hover:bg-success/90 shadow-sm hover:shadow-md rounded-base hover:animate-pulse hover:shadow-success/50",
        
        // Gallery - Special styling for gallery controls
        gallery: "bg-gallery-controls text-text-primary hover:bg-gallery-controls/80 backdrop-blur-sm shadow-sm rounded-base border border-photo-border",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 py-1.5 text-sm rounded-base",
        lg: "h-11 px-8 py-3 text-lg rounded-lg",
        xl: "h-12 px-10 py-4 text-lg rounded-lg",
        icon: "h-10 w-10 rounded-base",
        "icon-sm": "h-8 w-8 rounded-base",
        "icon-lg": "h-12 w-12 rounded-lg",
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