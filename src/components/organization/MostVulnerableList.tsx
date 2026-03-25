import { FunctionComponent } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { VulnDistributionInStructure } from "@/types/api/api";
import CVERainbowBadge from "@/components/CVERainbowBadge";
import { truncateMiddle } from "@/utils/common";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import Link from "next/link";

function getHref(
  orgSlug: string,
  type: "Projects" | "Assets" | "Artifacts",
  entry: VulnDistributionInStructure,
): string {
  if (type === "Projects") {
    return `/${orgSlug}/projects/${entry.slug}`;
  }
  if (type === "Assets") {
    return `/${orgSlug}/projects/${entry.projectSlug}/assets/${entry.slug}`;
  }
  return `/${orgSlug}/projects/${entry.projectSlug}/assets/${entry.assetSlug}/refs/${entry.assetVersionName}?artifact=${encodeURIComponent(entry.name)}`;
}

interface Props {
  title: string;
  type: "Projects" | "Assets" | "Artifacts";
  entries: VulnDistributionInStructure[];
  mode: "risk" | "cvss";
  isLoading: boolean;
}

const MostVulnerableList: FunctionComponent<Props> = ({
  title,
  type,
  entries,
  mode,
  isLoading,
}) => {
  const activeOrg = useActiveOrg();
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-36" />
          <Skeleton className="mt-1 h-3 w-28" />
        </CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription className="text-sm">
          Top 5 by vulnerability count
        </CardDescription>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="py-2 text-xs text-muted-foreground">
            No vulnerable {type.toLowerCase()} found.
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <tbody>
                {entries.map((entry, i) => (
                  <tr
                    key={entry.name || i}
                    className="border-b last:border-0 even:bg-muted/40"
                  >
                    <td className="p-0">
                      <Link
                        href={getHref(activeOrg.slug, type, entry)}
                        className="!opacity-100 flex items-center justify-between px-3 py-2 hover:bg-accent/50 transition-colors"
                      >
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="!text-foreground truncate font-mono text-sm font-medium">
                              {truncateMiddle(entry.name, 24)}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <span className="font-mono">{entry.name}</span>
                          </TooltipContent>
                        </Tooltip>
                        <CVERainbowBadge
                          low={mode === "risk" ? entry.low : entry.lowCvss}
                          medium={
                            mode === "risk" ? entry.medium : entry.mediumCvss
                          }
                          high={mode === "risk" ? entry.high : entry.highCvss}
                          critical={
                            mode === "risk"
                              ? entry.critical
                              : entry.criticalCvss
                          }
                        />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MostVulnerableList;
