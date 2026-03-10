import { FunctionComponent, useState } from "react";
import { CVEOccurrenceInOrg } from "src/types/api/api";
import { Card, CardHeader, CardTitle } from "src/components/ui/card";
import { ChevronDownIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";
import { CVSSBadge } from "../common/Severity";

interface Props {
  topCVEs: CVEOccurrenceInOrg[];
}

const MostCommonCVEs: FunctionComponent<Props> = ({ topCVEs }) => {
  const [isExpanded, setExpanded] = useState<boolean>(false);

  return (
    <div
      className="w-full"
      onClick={() => {
        setExpanded(!isExpanded);
      }}
    >
      <Card className={`hover:bg-muted`}>
        <CardHeader>
          <CardTitle>
            <div className="flex flex-row items-center ">
              <span className="w-92/100">Most common CVEs</span>
              {!isExpanded ? (
                <ChevronLeftIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              ) : (
                <ChevronDownIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              )}
            </div>
          </CardTitle>
        </CardHeader>
        {isExpanded && (
          <div>
            <div className="overflow-hidden rounded-lg border">
              <div className="overflow-auto">
                <table className="w-full table-fixed overflow-x-auto text-sm">
                  <thead className="border-b bg text-foreground">
                    <tr>
                      <th className="w-40 cursor-pointer break-normal p-4 text-left">
                        <div className="flex flex-row items-center">
                          <span className="w-87/100">CVE</span>
                          <span>Amount</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-md text-foreground">
                    {topCVEs.map((entry, index) => (
                      <CVERow
                        key={entry.cveID}
                        cvss={entry.cvss}
                        cveID={entry.cveID}
                        amount={entry.totalAmount}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

interface cveRowProps {
  cvss: number;
  cveID: string;
  amount: number;
}

const CVERow: FunctionComponent<cveRowProps> = ({ cvss, cveID, amount }) => {
  return (
    <tr className="flex border-b h-15 hover:bg-gray-50 dark:hover:bg-card">
      <td className="flex gap-4 items-center p-4 w-87/100">
        <span className="font-medium text-left truncate">{cveID}</span>
        <CVSSBadge cvss={cvss} />
      </td>
      <td className="p-4">{amount}</td>
    </tr>
  );
};

export default MostCommonCVEs;
