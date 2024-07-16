import { classNames } from "@/utils/common";

const getClassNames = (severity: string) => {
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

const riskToSeverity = (risk: number) => {
  if (risk >= 9) return "CRITICAL";
  if (risk >= 7) return "HIGH";
  if (risk >= 4) return "MEDIUM";
  return "LOW";
};

const Severity = ({ risk }: { risk: number }) => {
  const cls = getClassNames(riskToSeverity(risk));

  return (
    <div className="flex">
      <div
        className={classNames(
          cls + " whitespace-nowrap rounded-full px-2 py-1 font-semibold",
        )}
      >
        {riskToSeverity(risk)}
      </div>
    </div>
  );
};

export default Severity;
