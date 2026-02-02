import * as React from "react"

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement>

export function Badge(props: BadgeProps) {
  return <span {...props} />
}
