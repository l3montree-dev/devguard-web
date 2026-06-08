import { FolderOpenIcon } from "@heroicons/react/24/outline";
import type { FunctionComponent } from "react";

interface Props {
  variant?: "card" | "row";
}

const EmptyGroupState: FunctionComponent<Props> = ({ variant = "card" }) => {
  const isCard = variant === "card";
  return (
    <div
      className={
        isCard
          ? "flex flex-col items-center justify-center gap-2 px-4 py-6 text-center text-sm text-muted-foreground"
          : "ml-3 mt-1 flex flex-col items-center justify-center gap-1 py-3 pl-6 text-center text-xs text-muted-foreground"
      }
    >
      <FolderOpenIcon className={isCard ? "h-6 w-6" : "h-5 w-5"} />
      <span>No subgroups or repositories yet</span>
    </div>
  );
};

export default EmptyGroupState;
