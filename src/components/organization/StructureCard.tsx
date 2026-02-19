import { FunctionComponent } from "react";
import { useActiveOrg } from "src/hooks/useActiveOrg";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "src/components/ui/card";
import { Skeleton } from "src/components/ui/skeleton";


interface Props {
  currentAmount: number;
  mode: "Projects" | "Assets" | "Artifacts";
  isLoading: boolean;
}

const StructureCard : FunctionComponent<Props> = ({
  currentAmount,
  isLoading,
  mode,
}) => {
  const activeOrg = useActiveOrg();
  const [expanded, setExpanded] = useState<boolean>(false)

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="w-full h-26" />
      </Card>
    );
  }
  if (!expanded) {
    return (   
    <Card onClick={() => setExpanded(!expanded)}>
         <div className="font-semibold flex items-baseline  gap-4 py-6 px-8">
            <div className="text-5xl">{currentAmount}</div>
            <div className="text-3xl text-muted-foreground">{mode}</div>
         </div>
    </Card>
  );
  }else{
    return (
    <Card onClick={() => setExpanded(!expanded)}>
         <div className="font-semibold flex items-baseline  gap-4 py-6 px-8">
            <div className="text-5xl">{currentAmount}</div>
            <div className="text-3xl text-muted-foreground">{mode}OPEN</div>
         </div>
    </Card>
    );
  }
  
};

export default StructureCard;