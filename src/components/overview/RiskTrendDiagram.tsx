import { TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  XAxis,
  Tooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AssetRisks } from "@/types/api/api";

export function RiskTrend({ data }: { data: AssetRisks[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Trend</CardTitle>
        <CardDescription>
          The development of the overall risk value in the last 30 days.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}}>
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              top: 20,
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="dayOfScan"
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
            <Tooltip
              content={<CustomTooltip active={false} payload={[]} label={""} />}
            />

            <Line
              dataKey="assetAverageRisk"
              type="linear"
              stroke="blue"
              strokeWidth={2}
              dot={{
                fill: "blue",
              }}
              activeDot={{
                r: 6,
              }}
            ></Line>

            <Line
              dataKey="assetMaxRisk"
              type="linear"
              stroke="red"
              strokeWidth={2}
              dot={{
                fill: "red",
              }}
              activeDot={{
                r: 6,
              }}
            ></Line>

            <Line
              dataKey="assetMinRisk"
              type="linear"
              stroke="green"
              strokeWidth={2}
              dot={{
                fill: "green",
              }}
              activeDot={{
                r: 6,
              }}
            ></Line>

            <Line
              dataKey="assetSumRisk"
              type="linear"
              stroke="yellow"
              strokeWidth={2}
              dot={{
                fill: "yellow",
              }}
              activeDot={{
                r: 6,
              }}
            >
              <LabelList
                dataKey="assetSumRisk"
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Line>
          </LineChart>
        </ChartContainer>
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
