import { classNames } from "@/utils/common";
import { Badge } from "../ui/badge";

export const getClassNames = (severity: string) => {
  switch (severity) {
    case "CRITICAL":
      return "text-red-500 border border-red-500";
    case "HIGH":
      return "text-orange-500 border border-orange-500";
    case "MEDIUM":
      return "border border-yellow-400 text-yellow-300";
    case "LOW":
      return "text-green-400 border border-green-400";
    default:
      return "text-white bg-gray-500";
  }
};

export const severityToColor = (severity: string) => {
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
  return "LOW";
};

const Severity = ({ risk }: { risk: number }) => {
  const cls = getClassNames(riskToSeverity(risk));

  return (
    <Badge variant={"outline"} className={cls}>
      {riskToSeverity(risk)}
    </Badge>
  );
};

export default Severity;
