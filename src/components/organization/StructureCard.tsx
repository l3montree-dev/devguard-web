import { FunctionComponent } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "src/components/ui/card";
import { Skeleton } from "src/components/ui/skeleton";
import { VulnDistributionInStructure } from "src/types/api/api";
import CVERainbowBadge from "src/components/CVERainbowBadge";
import { classNames, truncateMiddle } from "src/utils/common";
import useDecodedPathname from "src/hooks/useDecodedPathname";
import Link from "next/link";

interface Props {
  currentAmount: number;
  type: "Projects" | "Assets" | "Artifacts";
  mode: "risk" | "cvss";
  topEntries: VulnDistributionInStructure[];
  isLoading: boolean;
}

const StructureCard: FunctionComponent<Props> = ({
  currentAmount,
  isLoading,
  topEntries,
  type,
  mode,
}) => {
  const pathname = useDecodedPathname();

  const maxLen = 30;

  const getHref = (entry: VulnDistributionInStructure): string => {
    if (type === "Projects") {
      return pathname + "/../projects/" + entry.slug;
    }
    if (type === "Assets") {
      return (
        pathname + "/../projects/" + entry.projectSlug + "/assets/" + entry.slug
      );
    }
    return (
      pathname +
      "/../projects/" +
      entry.projectSlug +
      "/assets/" +
      entry.assetSlug +
      "/refs/" +
      entry.assetVersionName +
      "?artifact=" +
      encodeURIComponent(entry.name)
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-40 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-[42px]" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="mb-4">
          <span className="text-5xl">{currentAmount}</span>
          <span className="ml-3 text-2xl text-muted-foreground font-medium">
            {type}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          {topEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No vulnerable {type.toLowerCase()} found.
            </p>
          ) : (
            topEntries.map((entry, i, arr) => (
              <Link
                key={entry.name || i}
                href={getHref(entry)}
                className={classNames(
                  "no-underline !text-foreground hover:bg-accent/70 transition-colors rounded-lg -mx-2 px-2 block",
                )}
              >
                <div
                  className={classNames(
                    "flex h-16 items-center justify-between gap-4 py-4",
                    // i === arr.length - 1 ? "pt-4" : "border-b py-4",
                  )}
                >
                  <span className="text-sm font-medium">
                    {truncateMiddle(entry.name, maxLen)}
                  </span>
                  <CVERainbowBadge
                    low={mode === "risk" ? entry.lowRisk : entry.lowCVSS}
                    medium={
                      mode === "risk" ? entry.mediumRisk : entry.mediumCVSS
                    }
                    high={mode === "risk" ? entry.highRisk : entry.highCVSS}
                    critical={
                      mode === "risk" ? entry.criticalRisk : entry.criticalCVSS
                    }
                  />
                </div>
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StructureCard;
