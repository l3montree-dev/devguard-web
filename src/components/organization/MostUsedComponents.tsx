import { FunctionComponent, useState } from "react";
import { ComponentUsageInOrg } from "src/types/api/api";
import { Card, CardHeader, CardTitle } from "src/components/ui/card";
import { beautifyPurl } from "src/utils/common";
import { ChevronDownIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";
import EcosystemImage from "../common/EcosystemImage";

interface Props {
  topComponents: ComponentUsageInOrg[];
}

const MostUsedComponents: FunctionComponent<Props> = ({ topComponents }) => {
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
              <span className="w-90/100">Most used Components</span>
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
                          <span className="w-82/100">Package</span>
                          <span>Occurrences</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-md text-foreground">
                    {topComponents.map((entry, index) => (
                      <ComponentRow
                        key={entry.purl}
                        purl={entry.purl}
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

interface componentRowProps {
  purl: string;
  amount: number;
}

const ComponentRow: FunctionComponent<componentRowProps> = ({
  purl,
  amount,
}) => {
  return (
    <tr className="flex h-15 border-b hover:bg-gray-50 dark:hover:bg-card">
      <td className="p-4 w-5/9">
        <div className="flex items-center gap-2">
          <EcosystemImage size={24} packageName={purl} />
          <span className="font-medium truncate">{beautifyPurl(purl)}</span>
        </div>
      </td>
      <td className="p-4 pl-47 text-left">{amount}</td>
    </tr>
  );
};

export default MostUsedComponents;
