import { PropsWithChildren } from "react";
import { classNames } from "../../utils/common";

export const getClassNames = (severity: string) => {
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
