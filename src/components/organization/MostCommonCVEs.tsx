import { FunctionComponent, useState } from "react";
import { CVEOccurrenceInOrg } from "src/types/api/api";
import { Card } from "src/components/ui/card";
import { beautifyPurl } from "src/utils/common";
import { ChevronDownIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";

interface Props {
  topCVEs: CVEOccurrenceInOrg[];
}

const MostCommonCVEs: FunctionComponent<Props> = ({ topCVEs }) => {
  const [isExpanded, setExpanded] = useState<boolean>(false);

  return (
    <div
      className={`${isExpanded ? "w-full " : "w-1/4"} lg:w-1/2`}
      onClick={() => {
        setExpanded(!isExpanded);
      }}
    >
      <Card className={`rounded-2xl py-4 text-center mb-4 hover:bg-muted`}>
        <div className="flex items-baseline justify-center align-center">
          <span className="font-semibold text-xl text-muted-foreground px-4">
            Most Common CVEs
          </span>
          {!isExpanded ? (
            <ChevronLeftIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronDownIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          )}
        </div>
      </Card>
      {isExpanded && (
        <div>
          <div className="overflow-hidden rounded-lg border">
            <div className="overflow-auto">
              <table className="w-full table-fixed overflow-x-auto text-sm">
                <thead className="border-b bg text-foreground">
                  <tr>
                    <th className="w-40 cursor-pointer break-normal p-4 text-left">
                      <div className="flex flex-row items-center gap-105">
                        <span>CVE</span>
                        <span>Amount</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="text-md text-foreground">
                  {topCVEs.map((entry, index) => (
                    <CVERow
                      key={entry.cveID}
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
    </div>
  );
};

interface cveRowProps {
  cveID: string;
  amount: number;
}

const CVERow: FunctionComponent<cveRowProps> = ({ cveID, amount }) => {
  return (
    <tr className="flex gap-40 border-b hover:bg-gray-50 dark:hover:bg-card">
      <td className="p-4 w-1/4">
        <span className="font-medium text-left truncate">{cveID}</span>
      </td>
      <td className="p-4 pl-47 text-left w-1/4">{amount}</td>
    </tr>
  );
};

export default MostCommonCVEs;
