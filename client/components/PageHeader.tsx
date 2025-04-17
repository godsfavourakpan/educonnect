import { ReactNode } from "react";

interface PageHeaderProps {
  heading: string;
  subheading?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({
  heading,
  subheading,
  icon,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div className="flex items-center gap-3">
        {icon && <div className="text-primary">{icon}</div>}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
          {subheading && (
            <p className="mt-1 text-muted-foreground">{subheading}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="ml-auto flex items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
