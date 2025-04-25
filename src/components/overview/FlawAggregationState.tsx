import {
  BoltIcon,
  BugAntIcon,
  CheckCircleIcon,
  WrenchIcon,
} from "@heroicons/react/24/outline";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { VulnAggregationStateAndChange } from "../../types/api/api";

function changeType(change: number) {
  if (change === 0) return "same";
  return change > 0 ? "increase" : "decrease";
}

export default function FlawAggregationState({
  data,
  totalRisk,
  description,
  title,
}: {
  data: VulnAggregationStateAndChange;
  totalRisk: number;
  description: string;
  title: string;
}) {
  const stats = {
    total: {
      id: 1,
      name: "Total Vulnerabilities",
      stat: data.now.fixed + data.now.open,
      icon: WrenchIcon,
      percentage: 0,
      change: data.now.fixed + data.now.open - (data.was.fixed + data.was.open),
      changeType: changeType(
        data.now.fixed + data.now.open - (data.was.fixed + data.was.open),
      ),
    },
    handled: {
      id: 2,
      name: "Handled Vulnerabilities",
      stat: data.now.fixed,
      icon: CheckCircleIcon,
      percentage: (data.now.fixed / (data.now.fixed + data.now.open)) * 100,
      change: data.now.fixed - data.was.fixed,
      changeType: changeType(data.now.fixed - data.was.fixed),
    },
    open: {
      id: 3,
      name: "Open Vulnerabilities",
      stat: data.now.open,
      percentage: (data.now.open / (data.now.fixed + data.now.open)) * 100,
      icon: BugAntIcon,
      change: data.now.open - data.was.open,
      changeType: changeType(data.now.open - data.was.open),
    },
  };

  return (
    <div className="flex flex-row gap-4">
      <Card className="flex-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <BoltIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalRisk.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
      <Card className="flex-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Open Vulnerabilities
          </CardTitle>
          <BugAntIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.open.stat} </div>
          <p className="text-xs text-muted-foreground">
            {stats.open.change} {stats.open.changeType} compared to last month
          </p>
        </CardContent>
      </Card>
      <Card className="flex-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Handled Vulnerabilities
          </CardTitle>
          <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.handled.stat} </div>
          <p className="text-xs text-muted-foreground">
            {stats.handled.change} {stats.handled.changeType} compared to last
            month
          </p>
        </CardContent>
      </Card>
      <Card className="flex-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Vulnerabilities
          </CardTitle>
          <WrenchIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total.stat}</div>
          <p className="text-xs text-muted-foreground">
            {stats.total.change} {stats.total.changeType} compared to last month
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
