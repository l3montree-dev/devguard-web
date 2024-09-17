import { Badge } from "../ui/badge";

export const getClassNames = (severity: string) => {
  switch (severity) {
    case "CRITICAL":
      return "text-white bg-red-600 border border-red-600";
    case "HIGH":
      return "text-white border border-orange-500 bg-orange-500";
    case "MEDIUM":
      return "text-black bg-yellow-500 border border-yellow-500";
    case "LOW":
      return "text-black border bg-green-500 border-green-500";
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
