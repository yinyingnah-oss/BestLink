import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

const Button = React.forwardRef<HTMLButtonElement, any>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    let sizeClasses = "h-10 px-4 py-2";
    if (size === "sm") sizeClasses = "h-9 px-3 rounded-md";
    if (size === "lg") sizeClasses = "h-11 px-8 rounded-md";
    if (size === "icon") sizeClasses = "h-10 w-10";

    let variantClasses = "";
    if (variant === "default" && !className?.includes("bg-") && !className?.includes("border")) {
      variantClasses = "bg-stone-900 text-stone-50 hover:bg-stone-900/90";
    } else if (variant === "outline") {
      variantClasses = "border border-stone-200 bg-white hover:bg-stone-100 hover:text-stone-900 text-stone-900";
    } else if (variant === "ghost") {
      variantClasses = "hover:bg-stone-100 hover:text-stone-900";
    }
    
    return (
      <Comp
        className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${sizeClasses} ${variantClasses} ${className || ''}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
