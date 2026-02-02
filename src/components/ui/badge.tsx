import * as React from "react"

export type BadgeVariant = "default" | "secondary" | "destructive" | "outline"

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant
}

export function Badge({
  variant = "default",
  className = "",
  ...props
}: BadgeProps) {
  const base =
    "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"

  const variants: Record<BadgeVariant, string> = {
    default: "bg-slate-900 text-white",
    secondary: "bg-slate-100 text-slate-900",
    destructive: "bg-red-600 text-white",
    outline: "border border-slate-200 text-slate-900",
  }

  return (
    <span
      className={`${base} ${variants[variant]} ${className}`.trim()}
      {...props}
    />
  )
}
