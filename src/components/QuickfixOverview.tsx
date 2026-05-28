import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { VulnWithCVE } from "@/types/api/api";
import {
  beautifyPurl,
  isValidPackagePurl,
  purlToDisplayString,
} from "@/utils/common";
import { ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { FunctionComponent } from "react";
import { CVSSBadge } from "./common/Severity";
import { Badge } from "./ui/badge";

interface Props {
  dependencyRisksHref: string;
  getVulnHref: (vuln: VulnWithCVE) => string;
  isLoading?: boolean;
  totalAmount: number;
  vulns: VulnWithCVE[];
}

const QuickfixOverview: FunctionComponent<Props> = ({
  dependencyRisksHref,
  getVulnHref,
  isLoading,
  totalAmount,
  vulns,
}) => {
  return (
    <Card className="col-span-2 flex flex-col">
      <CardHeader>
        <CardTitle className="flex w-full items-center justify-between gap-4">
          <span>Quick Fixes</span>
          <span className="flex items-center gap-3">
            <Badge variant="success">{totalAmount} available</Badge>
            <Link
              href={dependencyRisksHref}
              className="text-xs !text-muted-foreground"
            >
              See all
            </Link>
          </span>
        </CardTitle>
        <div className="flex items-center justify-between gap-4">
          <CardDescription className="text-left">
            Direct dependency upgrades that can resolve open vulnerabilities.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {isLoading
            ? Array.from(Array(3).keys()).map((el) => (
                <Skeleton key={el} className="h-[88px] w-full" />
              ))
            : null}

          {!isLoading && vulns.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No direct dependency quick fixes available.
            </p>
          ) : null}

          {!isLoading
            ? vulns.map((vuln) => (
                <QuickfixOverviewItem
                  href={getVulnHref(vuln)}
                  key={vuln.id}
                  vuln={vuln}
                />
              ))
            : null}
        </div>
      </CardContent>
    </Card>
  );
};

const QuickfixOverviewItem: FunctionComponent<{
  href: string;
  vuln: VulnWithCVE;
}> = ({ href, vuln }) => {
  const vulnerablePurl = vuln.vulnerabilityPath[0];
  const fixedVersionPurl = vuln.directDependencyFixedVersion;

  if (
    !vulnerablePurl ||
    !fixedVersionPurl ||
    !isValidPackagePurl(vulnerablePurl)
  ) {
    return null;
  }

  return (
    <Link
      href={href}
      className="block rounded-md border-b px-2 py-3 !text-foreground transition-colors last:border-b-0 hover:bg-accent/70"
    >
      <div className="mb-1 flex min-w-0 items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-sm font-semibold">{vuln.cveID}</span>
            {vuln.cve?.cvss != null && vuln.cve.cvss !== -1 ? (
              <CVSSBadge cvss={vuln.cve.cvss} />
            ) : null}
          </div>
          <div className="truncate text-sm text-muted-foreground">
            {beautifyPurl(vulnerablePurl)}
          </div>
        </div>
        <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
      </div>
      <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
        <span className="truncate font-mono">
          {purlToDisplayString(vulnerablePurl)}
        </span>
        <ArrowRight className="h-3 w-3 shrink-0" />
        <span className="truncate font-mono">
          {purlToDisplayString(fixedVersionPurl)}
        </span>
      </div>
    </Link>
  );
};

export default QuickfixOverview;
