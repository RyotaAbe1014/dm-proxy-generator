import * as React from "react"

import { cn } from "@/lib/utils"

type BadgeVariant = "default" | "muted" | "success"

const variants: Record<BadgeVariant, string> = {
  default: "border-brand-100 bg-brand-50 text-brand-700",
  muted: "border-slate-200 bg-slate-50 text-slate-500",
  success: "border-emerald-100 bg-emerald-50 text-emerald-700",
}

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: BadgeVariant }) {
  return (
    <div
      className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold", variants[variant], className)}
      {...props}
    />
  )
}
