import { classNames } from "@/utils/common";
import {
  AlertCircle,
  CheckCircle,
  InfoIcon,
  TriangleAlert,
  Lightbulb,
} from "lucide-react";
import type { FunctionComponent } from "react";

interface CalloutProps {
  intent: "info" | "success" | "warning" | "danger" | "neutral";
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
    neutral: Lightbulb,
  }[intent];

  return (
    <div
      className={classNames(
        "rounded-lg border p-3 text-sm",
        showIcon && "flex items-start gap-3",
        intent === "info" && "border-info bg-info-muted text-info",
        intent === "success" && "border-success bg-success-muted text-success",
        intent === "warning" && "border-warning bg-warning-muted text-warning",
        intent === "danger" &&
          "border-destructive bg-destructive-muted text-destructive",
        intent === "neutral" && "border-border bg-muted text-muted-foreground",
      )}
    >
      {showIcon && <Icon className="h-5 w-5 flex-shrink-0" />}
      <div className={showIcon ? "flex-1" : ""}>{children}</div>
    </div>
  );
};

export default Callout;
