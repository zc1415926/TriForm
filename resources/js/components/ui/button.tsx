import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-base font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 active:scale-95",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-colored hover:bg-blue-600 hover:shadow-lg hover:-translate-y-0.5",
        destructive:
          "bg-red-500 text-white shadow-lg shadow-red-500/30 hover:bg-red-600 hover:shadow-xl hover:-translate-y-0.5",
        outline:
          "border-2 border-blue-200 bg-white text-blue-600 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md",
        secondary:
          "bg-cyan-100 text-cyan-700 shadow-sm hover:bg-cyan-200 hover:shadow-md hover:-translate-y-0.5",
        ghost: 
          "hover:bg-gray-100 hover:text-gray-700",
        link: 
          "text-blue-600 underline-offset-4 hover:underline font-semibold",
        // 儿童友好特殊变体
        rainbow: 
          "bg-rainbow text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 animate-gradient-shift bg-[length:200%_auto] font-bold",
        success:
          "bg-green-500 text-white shadow-lg shadow-green-500/30 hover:bg-green-600 hover:shadow-xl hover:-translate-y-0.5",
        warning:
          "bg-amber-500 text-white shadow-lg shadow-amber-500/30 hover:bg-amber-600 hover:shadow-xl hover:-translate-y-0.5",
        fun:
          "bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow-lg shadow-pink-500/30 hover:shadow-xl hover:-translate-y-0.5 font-bold",
      },
      size: {
        default: "h-12 px-6 py-3 has-[>svg]:px-5",
        sm: "h-9 rounded-lg px-4 text-sm has-[>svg]:px-3",
        lg: "h-14 rounded-2xl px-8 text-lg has-[>svg]:px-6",
        xl: "h-16 rounded-2xl px-10 text-xl has-[>svg]:px-8",
        icon: "size-12 rounded-xl",
        "icon-sm": "size-9 rounded-lg",
        "icon-lg": "size-14 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
