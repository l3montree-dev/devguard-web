import { FunctionComponent } from "react";
import { useState } from "react";
import { ChevronDownIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";
import {
  Card,
} from "src/components/ui/card";
import { Skeleton } from "src/components/ui/skeleton";
import {VulnDistributionInStructure} from "src/types/api/api"
import CVERainbowBadge from "src/components/CVERainbowBadge";
import { classNames, truncateMiddle} from "src/utils/common"
import useDecodedPathname from "src/hooks/useDecodedPathname";
import { useRouter } from "next/navigation";
interface Props {
  currentAmount: number;
  type: "Projects" | "Assets" | "Artifacts"
  mode: "risk" | "cvss"
  topEntries:  VulnDistributionInStructure[] 
  isLoading: boolean
}

const StructureCard : FunctionComponent<Props> = ({
  currentAmount,
  isLoading,
  topEntries,
  type,
  mode,
}) => {
  const [expanded, setExpanded] = useState<boolean>(false)
  const router = useRouter()

  const pathname = useDecodedPathname();

  var maxLen = 20
  if (type === "Artifacts"){
    maxLen = 40
  }

  const COLLAPSED_HEIGHT = 120; // px
  const EXPANDED_HEIGHT = 120 + 56 * 6; // px, adjust as needed

  console.log(topEntries)
  if (isLoading) {
    return (
      <Card className="px-32 rounded-full">
        <Skeleton className="w-full h-24" />
      </Card>
    );
  }
    
    return (   
    <Card className={classNames(
    "transition-all duration-300 overflow-hidden",
    "w-[340px]", // fixed width for all cards
    expanded ? "rounded-3xl" : "rounded-full",
    expanded ? `max-h-[${EXPANDED_HEIGHT}px]` : `max-h-[${COLLAPSED_HEIGHT}px]`,
    !expanded && "hover:bg-muted"
  )}
  style={{
    // Only transition max-height and background, NOT border-radius
    transition: "max-height 0.3s cubic-bezier(0.4,0,0.2,1), background 0.3s",
    maxHeight: expanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT,
  }}
  onClick={() => setExpanded(!expanded)}
>
         <div className="font-semibold flex items-baseline justify-center  gap-4 py-6 px-8">
            <div className="text-5xl">{currentAmount}</div>
            <div className="text-3xl text-muted-foreground">{type}</div>
            {!expanded ? (
                <ChevronLeftIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            ):(
                <ChevronDownIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            )}
         </div>
         {expanded && (
          <>
            <div className="text-center mt-2 mb-4">
              <span className="text-medium pl-4 gap-8 py-2">Top 5 vulnerable {type}</span>
            </div>
         {topEntries.map((entry, index) => {
          entry = (entry as VulnDistributionInStructure)
          
          return (
            <div key={entry.name || index} className="hover:bg-muted flex items-center justify-between gap-8 py-2 border-t" 
            onClick={(e) => {
                e.stopPropagation()
                const detailHref = type === "Projects" ? pathname + "/../projects/" + entry.slug :
                type === "Assets" ?  pathname + "/../projects/" + entry.projectSlug + "/assets/" + entry.slug :
                pathname + "/../projects/" + entry.projectSlug + "/assets/" + entry.assetSlug + "/refs/" + entry.assetVersionName + "?artifact=" + encodeURI(entry.name);
                router.push(detailHref)
            }}>
              <span className="text-sm pl-4">{truncateMiddle(entry.name,maxLen)}</span>
              <div className="pr-4">
                <CVERainbowBadge low={mode === "risk" ? entry.lowRisk : entry.lowCVSS} medium={mode === "risk" ? entry.mediumRisk : entry.mediumCVSS} high={mode === "risk" ? entry.highRisk : entry.highCVSS} critical={mode === "risk" ? entry.criticalRisk : entry.criticalCVSS}/>
              </div>
            </div>
            )})}
            </>
            )}
    </Card>
  );
  
  
};

export default StructureCard;