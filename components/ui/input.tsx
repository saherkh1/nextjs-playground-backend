import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

/* provenance: agent=UI-DESIGNER action=updated timestamp=2025-09-07T21:07:00Z */
/* provenance: agent=WHIMSY-INJECTOR action=updated timestamp=2025-09-07T19:35:00Z */

const inputVariants = cva(
  "flex w-full border transition-all duration-fast ease-ease font-brand placeholder:text-input-placeholder focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 file:border-0 file:bg-transparent file:text-sm file:font-medium hover:border-primary/50 focus:scale-[1.01] active:scale-[0.99] transform-gpu",
  {
    variants: {
      variant: {
        default: "bg-input-bg border-input-border focus-visible:ring-input-focus focus-visible:border-input-focus focus-visible:shadow-md hover:shadow-sm",
        error: "bg-input-bg border-error focus-visible:ring-error focus-visible:border-error animate-pulse",
        success: "bg-input-bg border-success focus-visible:ring-success focus-visible:border-success shadow-success/20 shadow-sm",
        ghost: "bg-transparent border-transparent focus-visible:ring-primary focus-visible:bg-surface",
      },
      size: {
        default: "h-10 px-3 py-2 text-base rounded-base",
        sm: "h-9 px-3 py-1.5 text-sm rounded-base",
        lg: "h-11 px-4 py-3 text-lg rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  error?: boolean
  success?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, size, error, success, ...props }, ref) => {
    // Determine variant based on props
    const inputVariant = error ? 'error' : success ? 'success' : variant
    
    return (
      <input
        type={type}
        className={cn(
          inputVariants({ variant: inputVariant, size, className })
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }