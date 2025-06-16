import { classNames } from "../../utils/common";

export const getClassNames = (severity: string, gray: boolean) => {
  if (gray) {
    return "text-gray-700 bg-gray-500/20 dark:text-gray-200";
  } else
    switch (severity) {
      case "CRITICAL":
        return "text-red-600 bg-red-600/20 dark:text-red-400";
      case "HIGH":
        return "text-orange-700 dark:text-orange-300 bg-orange-500/20";
      case "MEDIUM":
        return "text-yellow-700 dark:text-yellow-300 bg-yellow-500/20";
      case "LOW":
        return "dark:text-green-300 text-green-600 bg-green-500/20";
      default:
        return "text-gray-700 bg-gray-500/20 dark:text-gray-200";
    }
};

export const severityToColor = (severity: string, gray: boolean) => {
  if (gray) {
    return "gray";
  } else
    switch (severity) {
      case "CRITICAL":
        return "#ef4444";
      case "HIGH":
        return "#f97316";
      case "MEDIUM":
        return "#facc15";
      case "LOW":
        return "#22c55e";
      default:
        return "gray";
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
  const cls = getClassNames(riskToSeverity(risk), Boolean(gray));

  return (
    <span
      className={classNames(
        "px-2 text-xs font-medium items-center flex flex-row whitespace-nowrap rounded-full p-1",
        cls,
      )}
    >
      {riskToSeverity(risk)} ({risk.toFixed(1)})
    </span>
  );
};

export default Severity;
