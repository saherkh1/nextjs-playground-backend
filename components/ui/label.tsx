import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/* provenance: agent=UI-DESIGNER action=updated timestamp=2025-09-07T21:26:00Z */

const labelVariants = cva(
  "font-brand leading-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-50 transition-colors duration-fast",
  {
    variants: {
      variant: {
        default: "text-sm font-medium text-text-primary",
        small: "text-xs font-medium text-text-primary",
        large: "text-base font-medium text-text-primary",
        caption: "text-sm font-normal text-text-muted",
        metadata: "text-xs font-normal text-gallery-metadata",
        required: "text-sm font-medium text-text-primary after:content-['*'] after:text-error after:ml-1",
        error: "text-sm font-medium text-error",
        success: "text-sm font-medium text-success",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
    VariantProps<typeof labelVariants> {
  required?: boolean
  error?: boolean
  success?: boolean
}

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, variant, required, error, success, ...props }, ref) => {
  // Determine variant based on state
  const labelVariant = error ? 'error' : success ? 'success' : required ? 'required' : variant
  
  return (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(labelVariants({ variant: labelVariant }), className)}
      {...props}
    />
  )
})
Label.displayName = LabelPrimitive.Root.displayName

export { Label, labelVariants }