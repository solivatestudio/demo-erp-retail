"use client";

import * as React from "react";
import { cn } from "../../lib/utils/format";

type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "destructive";
type ButtonSize = "sm" | "default" | "lg" | "icon";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  children,
  ...props
}: ButtonProps) {
  const computedClassName = cn("ui-button", `ui-button--${variant}`, `ui-button-size--${size}`, className);

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{ className?: string }>;
    return React.cloneElement(child, {
      className: cn(computedClassName, child.props.className),
    });
  }

  return (
    <button className={computedClassName} {...props}>
      {children}
    </button>
  );
}
