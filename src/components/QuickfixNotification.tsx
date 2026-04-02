import { FunctionComponent } from "react";
import { ArrowRightIcon, FileTextIcon, WrenchIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";
import Image from "next/image";

interface Props {
  totalAmount: number;
  fixableAmount: number;
  isLoading: boolean;
}

const QuickfixNotification: FunctionComponent<Props> = ({
  totalAmount,
  fixableAmount,
  isLoading = false,
}) => {
  if (isLoading || fixableAmount <= 0 || totalAmount <= 0) {
    return null;
  }
  const fixableCount = Math.min(fixableAmount, totalAmount);
  const manualReportCount = Math.max(0, totalAmount - fixableCount);

  return (
    <Card className="w-full shadow-sm">
      <CardContent className="space-y-4 p-4">
        <div className="rounded-xl border p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 border-r border-border/60 pr-4">
              <div className="flex items-center gap-2 text-3xl font-semibold text-yellow-500">
                <WrenchIcon className="h-5 w-5" />
                <span>{fixableCount}</span>
              </div>
              <div className="text-sm text-muted-foreground">Quick-fixable</div>
            </div>

            <div className="space-y-1 pl-4">
              <div className="flex items-center gap-2 text-3xl font-semibold text-muted-foreground">
                <FileTextIcon className="h-5 w-5" />
                <span>{manualReportCount}</span>
              </div>
              <div className="text-sm text-muted-foreground">Manual report</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{totalAmount}</span>
            <span>total vulnerabilities</span>
          </div>

          <Button variant="default" className="gap-2">
            <Image
              src="/assets/renovate.svg"
              alt="Renovate icon"
              width={16}
              height={16}
            />
            Create PR
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickfixNotification;
