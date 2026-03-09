import { FunctionComponent } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface Props {
  amount: number | undefined;
}

const AverageOpenCodeRisks: FunctionComponent<Props> = ({ amount }) => {
  if (!amount) {
    amount = 0;
  }
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Open Code Risks</CardTitle>
        <CardDescription>
          Average amount of open code risk per project
        </CardDescription>
      </CardHeader>
      <CardContent className="mb-10">
        <p className="font-semibold text-center text-4xl pt-10">{amount}</p>
      </CardContent>
    </Card>
  );
};

export default AverageOpenCodeRisks;
