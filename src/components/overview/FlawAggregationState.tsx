import { FlawAggregationStateAndChange } from "@/types/api/api";
import {
  BugAntIcon,
  CheckCircleIcon,
  WrenchIcon,
} from "@heroicons/react/24/outline";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

function changeType(change: number) {
  if (change === 0) return "same";
  return change > 0 ? "increase" : "decrease";
}

export default function FlawAggregationState({
  data,
}: {
  data: FlawAggregationStateAndChange;
}) {
  const stats = {
    total: {
      id: 1,
      name: "Total Flaws",
      stat: data.now.fixed + data.now.open,
      icon: WrenchIcon,
      change: data.now.fixed + data.now.open - (data.was.fixed + data.was.open),
      changeType: changeType(
        data.now.fixed + data.now.open - (data.was.fixed + data.was.open),
      ),
    },
    handled: {
      id: 2,
      name: "Handled Flaws",
      stat: data.now.fixed,
      icon: CheckCircleIcon,
      change: data.now.fixed - data.was.fixed,
      changeType: changeType(data.now.fixed - data.was.fixed),
    },
    open: {
      id: 3,
      name: "Open Flaws",
      stat: data.now.open,
      icon: BugAntIcon,
      change: data.now.open - data.was.open,
      changeType: changeType(data.now.open - data.was.open),
    },
  };

  return (
    <div className="flex flex-row gap-4">
      <Card className="flex-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Flaws</CardTitle>
          <WrenchIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total.stat}</div>
          <p className="text-xs text-muted-foreground">
            {stats.total.change} {stats.total.changeType} compared to last month
          </p>
        </CardContent>
      </Card>
      <Card className="flex-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Handled Flaws</CardTitle>
          <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.handled.stat}</div>
          <p className="text-xs text-muted-foreground">
            {stats.handled.change} {stats.handled.changeType} compared to last
            month
          </p>
        </CardContent>
      </Card>
      <Card className="flex-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Open Flaws</CardTitle>
          <BugAntIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.open.stat}</div>
          <p className="text-xs text-muted-foreground">
            {stats.open.change} {stats.open.changeType} compared to last month
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
