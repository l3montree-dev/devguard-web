import type { FunctionComponent } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Props {
  amount: number | undefined;
}

const AverageOpenCodeRisks: FunctionComponent<Props> = ({ amount }) => {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-start pb-0">
        <CardTitle className="text-base">Open Code Risks</CardTitle>
        <CardDescription>
          Average amount of open code risk per project
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 items-center justify-start">
        <p className="text-4xl font-semibold">
          {(amount ?? 0).toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })}
        </p>
      </CardContent>
    </Card>
  );
};

export default AverageOpenCodeRisks;
