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

export const severityToColor = (severity: string, gray?: boolean) => {
  if (gray) {
    return "hsl(var(--muted-foreground))";
  } else
    switch (severity) {
      case "CRITICAL":
        return "hsl(var(--severity-critical))";
      case "HIGH":
        return "hsl(var(--severity-high))";
      case "MEDIUM":
        return "hsl(var(--severity-medium))";
      case "LOW":
        return "hsl(var(--severity-low))";
      default:
        return "hsl(var(--muted-foreground))";
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

export const CVSSBadge = ({ cvss, gray }: { cvss: number; gray?: boolean }) => {
  const rounded = Math.floor(cvss * 10) / 10;
  const cls = getSeverityClassNames(riskToSeverity(rounded), Boolean(gray));

  return (
    <span
      className={classNames(
        "px-2 text-xs font-medium whitespace-nowrap rounded-full py-1",
        cls,
      )}
    >
      {rounded.toFixed(1)}
    </span>
  );
};

export default Severity;
