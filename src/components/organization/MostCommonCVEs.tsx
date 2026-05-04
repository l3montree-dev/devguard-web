import type { FunctionComponent } from "react";
import type { CVEOccurrenceInOrg } from "@/types/api/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CVSSBadge } from "../common/Severity";
import Link from "next/link";
import { documentationLinks } from "@/const/documentationLinks";

interface Props {
  topCVEs: CVEOccurrenceInOrg[];
}

const MostCommonCVEs: FunctionComponent<Props> = ({ topCVEs }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Most Common CVEs</CardTitle>
        <CardDescription>
          Top 5 most frequent CVEs across the organization
        </CardDescription>
      </CardHeader>
      <CardContent>
        {topCVEs.length === 0 ? (
          <p className="py-2 text-xs text-muted-foreground">No CVEs found.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="border-b text-foreground">
                <tr>
                  <th className="p-4 text-left font-medium">CVE</th>
                  <th className="p-4 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {topCVEs.map((entry) => (
                  <tr
                    key={entry.cveID}
                    className="border-b last:border-0 even:bg-muted/40"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Link
                          href={documentationLinks.cveDetails(entry.cveID)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate !text-foreground"
                        >
                          {entry.cveID}
                        </Link>
                        <CVSSBadge cvss={entry.cvss} />
                      </div>
                    </td>
                    <td className="p-4 text-right">{entry.totalAmount}</td>
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

export default MostCommonCVEs;
