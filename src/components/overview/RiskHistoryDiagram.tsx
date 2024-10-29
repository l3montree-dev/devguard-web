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
import { generateColor } from "@/utils/view";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

export function RiskHistoryChart({
  data,
}: {
  data: Array<{ label: string; history: RiskHistory[] }>;
}) {
  const reduced = useMemo(() => {
    if (data.length === 0) {
      return [];
    }

    const res = Array(data[0].history.length);
    for (let i = 0; i < data.length; i++) {
      const label = data[i].label;
      for (let j = 0; j < data[i].history.length; j++) {
        if (!Boolean(res[j])) {
          res[j] = {
            [label]: data[i].history[j].sumOpenRisk,
            day: data[i].history[j].day,
          };
        } else {
          res[j] = {
            ...res[j],
            day: data[i].history[j].day,
            [label]: data[i].history[j].sumOpenRisk,
          };
        }
      }
    }
    return res;
  }, [data]);

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
            config={data.reduce(
              (acc, d, i) => ({
                ...acc,
                [d.label]: {
                  label: d.label,
                  color: generateColor(d.label),
                },
              }),
              {},
            )}
          >
            <AreaChart accessibilityLayer data={reduced}>
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
                {data.map((d, i) => (
                  <linearGradient
                    key={d.label}
                    id={"fill-" + (i + 1)}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={generateColor(d.label)}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={generateColor(d.label)}
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                ))}
              </defs>
              {data.map((d, i) => (
                <Area
                  key={d.label}
                  dataKey={d.label}
                  type="monotone"
                  stroke={generateColor(d.label)}
                  strokeWidth={2}
                  fill={"url(#fill-" + (i + 1) + ")"}
                  fillOpacity={0.4}
                  dot={false}
                />
              ))}
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
