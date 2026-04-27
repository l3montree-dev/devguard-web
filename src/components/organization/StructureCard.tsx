import type { FunctionComponent } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  currentAmount: number;
  type: "Projects" | "Assets" | "Artifacts";
  isLoading: boolean;
}

const StructureCard: FunctionComponent<Props> = ({
  currentAmount,
  isLoading,
  type,
}) => {
  if (isLoading) {
    return (
      <Card className="flex flex-col items-center justify-center p-6">
        <Skeleton className="h-10 w-16" />
        <Skeleton className="mt-2 h-4 w-20" />
      </Card>
    );
  }

  return (
    <Card className="flex flex-col items-center justify-center p-6">
      <span className="text-4xl font-semibold">{currentAmount}</span>
      <span className="mt-1 text-sm text-muted-foreground">
        {type === "Assets"
          ? "Repositories"
          : type === "Projects"
            ? "Groups"
            : type}
      </span>
    </Card>
  );
};

export default StructureCard;
