import { FunctionComponent } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { getHumanReadableDuration } from "@/utils/common";

interface Props {
  averageAge: number | undefined;
}

const MAX_YEARS = 10;
const SECONDS_PER_YEAR = 365.25 * 24 * 60 * 60;

function durationToColor(seconds: number): string {
  const days = seconds / (60 * 60 * 24);
  if (days <= 364.25) return "text-green-500";
  if (days <= 2 * 364.25) return "text-yellow-500";
  if (days <= 5 * 364.25) return "text-orange-500";
  return "text-red-500";
}

function durationToMarkerColor(seconds: number): string {
  const days = seconds / (60 * 60 * 24);
  if (days <= 364.25) return "bg-green-500";
  if (days <= 2 * 364.25) return "bg-yellow-500";
  if (days <= 5 * 364.25) return "bg-orange-500";
  return "bg-red-500";
}

const DependencyAge: FunctionComponent<Props> = ({ averageAge }) => {
  if (!averageAge) {
    averageAge = 0;
  }
  const { duration, type } = getHumanReadableDuration(averageAge);

  const years = averageAge / SECONDS_PER_YEAR;
  const pct = Math.min((years / MAX_YEARS) * 100, 100);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-base">Dependency Age</CardTitle>
        <CardDescription className="text-center">
          Average age of dependencies by publish date in the organization
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col items-center justify-center gap-6 pt-6">
        <div className="flex flex-col items-center gap-1">
          <span
            className={`text-4xl font-semibold ${durationToColor(averageAge)}`}
          >
            {duration}
          </span>
          <span className="text-sm text-muted-foreground">{type}</span>
        </div>
        <div className="w-full max-w-[240px]">
          <div className="relative h-2 w-full overflow-hidden rounded-full">
            <div className="absolute inset-0 flex">
              <div className="h-full w-[10%] bg-green-500/20" />
              <div className="h-full w-[10%] bg-yellow-500/20" />
              <div className="h-full w-[30%] bg-orange-500/20" />
              <div className="h-full w-[50%] bg-red-500/20" />
            </div>
            <div
              className={`absolute top-0 h-full rounded-full ${durationToMarkerColor(averageAge)}`}
              style={{ width: `${Math.max(pct, 2)}%` }}
            />
          </div>
          <div className="relative mt-1.5 h-3 text-[10px] text-muted-foreground">
            <span className="absolute left-0 -translate-x-1/2">0</span>
            <span className="absolute left-[10%] -translate-x-1/2">1y</span>
            <span className="absolute left-[20%] -translate-x-1/2">2y</span>
            <span className="absolute left-[50%] -translate-x-1/2">5y</span>
            <span className="absolute right-0 translate-x-1/2">10y+</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DependencyAge;
