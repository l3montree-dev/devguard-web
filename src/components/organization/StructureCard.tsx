import { FunctionComponent } from "react";
import { useActiveOrg } from "src/hooks/useActiveOrg";
import { useState } from "react";
import { ChevronDownIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";
import {
  Card,
} from "src/components/ui/card";
import { Skeleton } from "src/components/ui/skeleton";
import {ProjectVulnDistribution, AssetVulnDistribution,ArtifactVulnDistribution} from "src/types/api/api"

interface Props {
  currentAmount: number;
  mode: "Projects" | "Assets" | "Artifacts";
  topEntries:  ProjectVulnDistribution[] | AssetVulnDistribution[] | ArtifactVulnDistribution[];
  isLoading: boolean;
}

const StructureCard : FunctionComponent<Props> = ({
  currentAmount,
  isLoading,
  topEntries,
  mode,
}) => {
  const activeOrg = useActiveOrg();
  const [expanded, setExpanded] = useState<boolean>(false)
  console.log(topEntries)
  if (isLoading) {
    return (
      <Card className="px-32 rounded-full">
        <Skeleton className="w-full h-24" />
      </Card>
    );
  }
    
    return (   
    <Card className="rounded-full hover:bg-muted" onClick={() => setExpanded(!expanded)}>
         <div className="font-semibold flex items-baseline  gap-4 py-6 px-8">
            <div className="text-5xl">{currentAmount}</div>
            <div className="text-3xl text-muted-foreground">{mode}</div>
            {!expanded ? (
                <ChevronLeftIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            ):(
                <ChevronDownIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            )}
         </div>
         {expanded && topEntries.map((entry, index) => {
          const name = 
            mode === "Projects" ? (entry as ProjectVulnDistribution).projectName :
            mode === "Assets" ? (entry as AssetVulnDistribution).assetName :
            (entry as ArtifactVulnDistribution).artifactName
          
          return (
            <div key={name || index} className="flex items-center justify-between py-2 px-8 border-t">
              <span className="text-sm">{name}</span>
              <div className="flex gap-2 text-xs">
                <span className="text-red-500">{entry.criticalRisk} critical</span>
                <span className="text-orange-500">{entry.highRisk} high</span>
                <span className="text-yellow-500">{entry.mediumRisk} medium</span>
                <span className="text-green-500">{entry.lowRisk} low</span>
              </div>
            </div>
              );
            })}
    </Card>
  );
  
  
};

export default StructureCard;