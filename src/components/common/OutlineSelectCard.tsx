import { cn } from "@/lib/utils";
import type { ComponentType, ReactNode } from "react";

interface OutlineSelectCardProps {
  selected: boolean;
  onClick: () => void;
  icon?: ComponentType<{ className?: string }>;
  label: string;
  tag?: string | null;
  description?: string;
  children?: ReactNode;
}

const OutlineSelectCard = ({
  selected,
  onClick,
  icon: Icon,
  label,
  tag,
  description,
  children,
}: OutlineSelectCardProps) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "relative flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors",
      selected
        ? "border-primary bg-primary/5 ring-1 ring-primary"
        : "border-input dark:border-foreground/10 hover:border-muted-foreground/70 dark:hover:border-foreground/40",
    )}
  >
    {tag && (
      <span className="absolute right-3 top-3 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
        {tag}
      </span>
    )}
    <div className="flex items-center gap-2">
      {Icon && <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />}
      <span className="font-medium text-sm">{label}</span>
    </div>
    {description && (
      <p className="text-xs text-muted-foreground leading-relaxed">
        {description}
      </p>
    )}
    {children}
  </button>
);

export default OutlineSelectCard;
