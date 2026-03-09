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

function durationToColor(duration: number): string {
  const days = duration / (60 * 60 * 24);

  if (days <= 364.25) {
    return "text-green-500";
  }

  if (days <= 2 * 364.25) {
    return "text-yellow-500";
  }

  if (days <= 5 * 364.25) {
    return "text-orange-500";
  }

  return "text-red-500";
}

const DependencyAge: FunctionComponent<Props> = ({ averageAge }) => {
  if (!averageAge) {
    averageAge = 0;
  }
  const { duration, type } = getHumanReadableDuration(averageAge);
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Dependency Age</CardTitle>
        <CardDescription>
          Average age of used dependency in Organization
        </CardDescription>
      </CardHeader>
      <CardContent className="mb-10">
        <p
          className={`font-semibold text-center ${durationToColor(averageAge)} text-4xl pt-10`}
        >
          {duration}
        </p>
        <p className="font-semibold text-center text-lg text-muted-foreground">
          {type}
        </p>
      </CardContent>
    </Card>
  );
};

export default DependencyAge;
