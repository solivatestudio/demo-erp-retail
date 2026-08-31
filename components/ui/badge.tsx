import * as React from "react";
import { cn } from "../../lib/utils/format";

type BadgeVariant = "default" | "secondary" | "outline" | "success" | "warning" | "destructive";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return <span className={cn("ui-badge", `ui-badge--${variant}`, className)} {...props} />;
}
