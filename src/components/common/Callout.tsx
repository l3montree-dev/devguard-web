import { classNames } from "@/utils/common";
import {
  AlertCircle,
  CheckCircle,
  InfoIcon,
  TriangleAlert,
} from "lucide-react";
import { FunctionComponent } from "react";

interface CalloutProps {
  intent: "info" | "success" | "warning" | "danger";
  showIcon?: boolean;
  children: React.ReactNode;
}
const Callout: FunctionComponent<CalloutProps> = ({
  children,
  intent,
  showIcon = false,
}) => {
  const Icon = {
    info: InfoIcon,
    success: CheckCircle,
    warning: TriangleAlert,
    danger: AlertCircle,
  }[intent];

  return (
    <div
      className={classNames(
        "rounded-lg border p-3 text-sm",
        showIcon && "flex items-start gap-3",
        intent === "info" &&
          "border-blue-500 bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-100",
        intent === "success" &&
          "border-green-500 bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-50",
        intent === "warning" &&
          " border-yellow-300 bg-yellow-500/20 text-yellow-950 dark:border-yellow-700 dark:text-yellow-100",
        intent === "danger" &&
          " border-red-500 bg-red-500/20  text-red-950 dark:text-red-100",
      )}
    >
      {showIcon && <Icon className="h-5 w-5 flex-shrink-0" />}
      <div className={showIcon ? "flex-1" : ""}>{children}</div>
    </div>
  );
};

export default Callout;
