import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { RiskHistory } from "@/types/api/api";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

export function RiskHistoryChart({ data }: { data: RiskHistory[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Trend</CardTitle>
        <CardDescription>
          The development of the overall risk value in the past months.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ChartContainer
            config={{
              sumClosedRisk: {
                label: "Fixed Risk",
                color: "hsl(var(--chart-2))",
              },
              sumOpenRisk: {
                label: "Open Risk",
                color: "hsl(var(--chart-1))",
              },
            }}
          >
            <AreaChart accessibilityLayer data={data}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => {
                  return new Date(value).toLocaleDateString("de-DE", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <YAxis />
              <ChartTooltip
                cursor={false}
                labelFormatter={(value) =>
                  new Date(value).toLocaleDateString("de-DE", {
                    month: "short",
                    day: "numeric",
                  })
                }
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    className="bg-background"
                  />
                }
              />
              <defs>
                <linearGradient id="fill-1" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--chart-1))"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--chart-1))"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fill-2" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--chart-2))"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--chart-2))"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <Area
                dataKey="sumOpenRisk"
                type="monotone"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                fill="url(#fill-1)"
                fillOpacity={0.4}
                dot={false}
              />
            </AreaChart>
          </ChartContainer>
        </ResponsiveContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none"></div>
        <div className="leading-none text-muted-foreground"></div>
      </CardFooter>
    </Card>
  );
}

// Custom Tooltip component
const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active: boolean;
  payload: any[];
  label: string;
}) => {
  if (active && payload && payload.length && payload[0].payload) {
    const avgRisk = payload[0].payload.assetAverageRisk;
    const maxRisk = payload[0].payload.assetMaxRisk;
    const minRisk = payload[0].payload.assetMinRisk;

    return (
      <div className="custom-tooltip">
        <p className="intro">{`Risk: ${payload[0].value}`}</p>
        <p className="label">{`average risk: ${avgRisk}`}</p>
        <p className="label">{`max risk: ${maxRisk}`}</p>
        <p className="label">{`min risk: ${minRisk}`}</p>
      </div>
    );
  }

  return null;
};
