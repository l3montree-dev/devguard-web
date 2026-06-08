import type { PropsWithChildren } from "react";
import { classNames } from "../../utils/common";

export const getClassNames = (severity: string) => {
  switch (severity) {
    case "CRITICAL":
      return "text-destructive bg-destructive-muted";
    case "HIGH":
      return "text-severity-high bg-severity-high-muted";
    case "MEDIUM":
      return "text-warning bg-warning-muted";
    case "LOW":
      return "text-success bg-success-muted";
    default:
      return "text-muted-foreground bg-muted";
  }
};

const ColoredBadge = ({
  variant,
  children,
}: PropsWithChildren<{
  variant: "critical" | "high" | "medium" | "low";
}>) => {
  const cls = getClassNames(variant.toUpperCase());

  return (
    <span
      className={classNames(
        "px-2 text-xs font-medium items-center flex flex-row whitespace-nowrap rounded-full p-1",
        cls,
      )}
    >
      {children}
    </span>
  );
};

export default ColoredBadge;
