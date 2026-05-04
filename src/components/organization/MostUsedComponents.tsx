import type { FunctionComponent } from "react";
import type { ComponentUsageInOrg } from "@/types/api/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { beautifyPurl, extractVersion } from "@/utils/common";
import EcosystemImage from "../common/EcosystemImage";
import Link from "next/link";
import { documentationLinks } from "@/const/documentationLinks";

interface Props {
  topComponents: ComponentUsageInOrg[];
}

const MostUsedComponents: FunctionComponent<Props> = ({ topComponents }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top Components</CardTitle>
        <CardDescription>
          Top 5 most used components across the organization
        </CardDescription>
      </CardHeader>
      <CardContent>
        {topComponents.length === 0 ? (
          <p className="py-2 text-xs text-muted-foreground">
            No components found.
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="border-b text-foreground">
                <tr>
                  <th className="p-4 text-left font-medium">Package</th>
                  <th className="p-4 text-right font-medium">Occurrences</th>
                </tr>
              </thead>
              <tbody>
                {topComponents.map((entry) => {
                  const version = extractVersion(entry.purl);
                  return (
                    <tr
                      key={entry.purl}
                      className="border-b last:border-0 even:bg-muted/40"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-foreground/20 bg-muted">
                            <EcosystemImage
                              size={16}
                              packageName={entry.purl}
                            />
                          </div>
                          <Link
                            href={documentationLinks.packageInspector(
                              entry.purl,
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="truncate !text-foreground"
                          >
                            {beautifyPurl(entry.purl)}
                          </Link>
                          {version && (
                            <span className="text-xs text-muted-foreground">
                              {version}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right">{entry.totalAmount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MostUsedComponents;
