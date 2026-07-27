import type { ReactNode } from "react";
import { classNames } from "../../utils/common";

export const getSeverityClassNames = (severity: string, gray: boolean) => {
  if (gray) {
    return "text-muted-foreground bg-muted";
  } else
    switch (severity) {
      case "CRITICAL":
        return "text-severity-critical bg-severity-critical-muted";
      case "HIGH":
        return "text-severity-high bg-severity-high-muted";
      case "MEDIUM":
        return "text-severity-medium bg-severity-medium-muted";
      case "LOW":
        return "text-severity-low bg-severity-low-muted";
      default:
        return "text-muted-foreground bg-muted";
    }
};

export const severityToColor = (
  severity: string,
  gray?: boolean,
  opacity: number = 100,
) => {
  // opacity is a percentage (0-100); 100 renders the color fully opaque.
  const color = (variable: string) => `hsl(var(${variable}) / ${opacity}%)`;

  if (gray) {
    return color("--muted-foreground");
  }

  switch (severity) {
    case "CRITICAL":
      return color("--severity-critical");
    case "HIGH":
      return color("--severity-high");
    case "MEDIUM":
      return color("--severity-medium");
    case "LOW":
      return color("--severity-low");
    default:
      return color("--muted-foreground");
  }
};

export const riskToSeverity = (risk: number) => {
  if (risk >= 9) return "CRITICAL";
  if (risk >= 7) return "HIGH";
  if (risk >= 4) return "MEDIUM";
  if (risk > 0) return "LOW";
  return "NONE";
};

const Severity = ({ risk, gray }: { risk: number; gray?: boolean }) => {
  const rounded = Math.floor(risk * 10) / 10;
  const cls = getSeverityClassNames(riskToSeverity(rounded), Boolean(gray));

  return (
    <span
      className={classNames(
        "px-2 text-xs font-medium items-center flex flex-row whitespace-nowrap rounded-full p-1",
        cls,
      )}
    >
      {riskToSeverity(rounded)} ({rounded.toFixed(1)})
    </span>
  );
};

export const FlatBadge = ({
  children,
  variant,
}: {
  children: ReactNode;
  variant: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
}) => {
  const cls = getSeverityClassNames(variant, false);

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

export const CVSSBadge = ({ cvss, gray }: { cvss: number; gray?: boolean }) => {
  const rounded = Math.floor(cvss * 10) / 10;
  const severity = riskToSeverity(rounded);
  const cls = getSeverityClassNames(severity, Boolean(gray));

  return (
    <span
      className={classNames(
        "px-2 text-xs font-medium whitespace-nowrap rounded-full py-1",
        cls,
      )}
    >
      {severity} ({rounded.toFixed(1)})
    </span>
  );
};

export default Severity;
