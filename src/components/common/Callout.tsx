import { classNames } from "@/utils/common";
import { FunctionComponent } from "react";

interface CalloutProps {
  intent: "info" | "success" | "warning" | "danger";

  children: React.ReactNode;
}
const Callout: FunctionComponent<CalloutProps> = ({ children, intent }) => {
  return (
    <div
      className={classNames(
        "rounded-lg border p-2 text-sm",
        intent === "info" &&
          "border-blue-500 bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-100",
        intent === "success" && "border-green-500 bg-green-100 text-green-700",
        intent === "warning" &&
          " border-yellow-300 bg-yellow-500/20 text-yellow-950 dark:border-yellow-700 dark:text-yellow-100",
        intent === "danger" &&
          " border-red-500 bg-red-500/20  text-red-950 dark:text-red-100",
      )}
    >
      {children}
    </div>
  );
};

export default Callout;
