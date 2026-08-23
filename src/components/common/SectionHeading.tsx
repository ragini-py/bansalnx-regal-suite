import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  action,
  className,
}: {
  eyebrow?: string | undefined;
  title: string;
  description?: string | undefined;
  align?: "center" | "left" | undefined;
  action?: ReactNode | undefined;
  className?: string | undefined;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start text-left",
        action && "sm:flex-row sm:items-end sm:justify-between sm:text-left",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && !action && "mx-auto")}>
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h2 className="text-3xl leading-[1.15] sm:text-4xl lg:text-[2.75rem]">{title}</h2>
        {description && (
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string | undefined;
  action?: ReactNode | undefined;
  icon?: ReactNode | undefined;
}) {
  return (
    <div className="flex flex-col items-center justify-center border border-border/70 bg-card px-6 py-20 text-center">
      {icon && <div className="mb-6 text-gold">{icon}</div>}
      <h3 className="text-2xl">{title}</h3>
      {description && (
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}
