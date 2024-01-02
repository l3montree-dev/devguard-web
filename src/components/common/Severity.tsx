import { classNames } from "@/utils/common";

const Severity = ({ severity }: { severity: string }) => {
  const cls =
    severity === "CRITICAL"
      ? "bg-red-200 text-red-700 border border-red-300"
      : severity === "HIGH"
      ? "bg-orange-200 text-orange-700 border border-red-300"
      : severity === "MEDIUM"
      ? "bg-yellow-300 border border-yellow-500 text-yellow-900"
      : severity === "LOW"
      ? "text-green-700 border border-green-400 bg-green-200"
      : "text-white bg-gray-500";

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
