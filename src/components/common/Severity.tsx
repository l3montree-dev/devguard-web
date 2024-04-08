import { classNames } from "@/utils/common";

const getClassNames = (severity: string) => {
  switch (severity) {
    case "CRITICAL":
      return "bg-red-200 text-red-700 border border-red-300";
    case "HIGH":
      return "bg-orange-200 text-orange-700 border border-red-300";
    case "MEDIUM":
      return "bg-yellow-300 border border-yellow-500 text-yellow-900";
    case "LOW":
      return "text-green-700 border border-green-400 bg-green-200";
    default:
      return "text-white bg-slate-500";
  }
};
const Severity = ({ severity }: { severity: string }) => {
  const cls = getClassNames(severity);

  return (
    <div className="flex">
      <div
        className={classNames(
          cls + " px-2 py-1 whitespace-nowrap font-semibold rounded-full",
        )}
      >
        {severity}
      </div>
    </div>
  );
};

export default Severity;
