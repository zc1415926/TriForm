import * as React from "react"

import { cn } from "@/lib/utils"

function Card({ className, variant = "default", ...props }: React.ComponentProps<"div"> & { variant?: "default" | "soft" | "colored" | "bordered" | "rainbow" }) {
  const variants = {
    default: "bg-white text-card-foreground flex flex-col gap-4 rounded-2xl border border-gray-100 p-6 shadow-soft hover:shadow-soft-lg transition-all duration-300",
    soft: "bg-gradient-to-br from-white to-gray-50 text-card-foreground flex flex-col gap-4 rounded-3xl p-6 shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300",
    colored: "bg-gradient-to-br from-blue-50 to-cyan-50 text-card-foreground flex flex-col gap-4 rounded-3xl border-2 border-blue-100 p-6 shadow-soft hover:shadow-lg hover:border-blue-200 transition-all duration-300",
    bordered: "bg-white text-card-foreground flex flex-col gap-4 rounded-3xl border-4 border-dashed border-blue-200 p-6 hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-300",
    rainbow: "bg-white text-card-foreground flex flex-col gap-4 rounded-3xl p-6 shadow-soft relative overflow-hidden",
  }

  return (
    <div
      data-slot="card"
      className={cn(variants[variant], className)}
      {...props}
    >
      {variant === "rainbow" && (
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-500 via-green-500 via-yellow-500 via-pink-500 to-purple-500" />
      )}
      {props.children}
    </div>
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-bold text-xl text-gray-800", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-gray-500 text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-1", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-1 [.border-t]:pt-4", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
