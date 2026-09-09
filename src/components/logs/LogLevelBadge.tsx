import { Badge } from "@/components/ui/badge";
import { LogLevel } from "@/types/view/logs";
import type { FunctionComponent } from "react";

const labelAndVariant: Record<
  LogLevel,
  { label: string; variant: "danger" | "yellow" | "blue" | "secondary" }
> = {
  [LogLevel.Error]: { label: "Error", variant: "danger" },
  [LogLevel.Warn]: { label: "Warning", variant: "yellow" },
  [LogLevel.Info]: { label: "Info", variant: "blue" },
  [LogLevel.Silent]: { label: "Silent", variant: "secondary" },
};

const LogLevelBadge: FunctionComponent<{ level: LogLevel }> = ({ level }) => {
  const { label, variant } = labelAndVariant[level] ?? {
    label: "Unknown",
    variant: "secondary",
  };
  return <Badge variant={variant}>{label}</Badge>;
};

export default LogLevelBadge;
