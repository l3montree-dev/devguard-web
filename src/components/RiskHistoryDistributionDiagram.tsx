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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ReleaseRiskHistory } from "@/types/api/api";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { severityToColor } from "./common/Severity";

export function RiskHistoryDistributionDiagram({
  data,
  mode = "risk",
}: {
  data: ReleaseRiskHistory[];
  mode?: "risk" | "cvss";
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === "risk" ? "Risk" : "CVSS"} Distribution Trend
        </CardTitle>
        <CardDescription>
          The stacked distribution of critical, high, medium, and low{" "}
          {mode === "risk" ? "risk" : "CVSS"} values in the past months
          (combined across all projects).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ChartContainer
            config={{
              critical: {
                label: "Critical",
                color: severityToColor("CRITICAL"),
              },
              high: {
                label: "High",
                color: severityToColor("HIGH"),
              },
              medium: {
                label: "Medium",
                color: severityToColor("MEDIUM"),
              },
              low: {
                label: "Low",
                color: severityToColor("LOW"),
              },
            }}
          >
            <AreaChart accessibilityLayer data={data}>
              <ChartLegend content={<ChartLegendContent />} />
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
                {["critical", "high", "medium", "low"].map((level, i) => {
                  const sev = level.toUpperCase();
                  return (
                    <linearGradient
                      key={level}
                      id={`fill-${level}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={severityToColor(sev)}
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="95%"
                        stopColor={severityToColor(sev)}
                        stopOpacity={0.2}
                      />
                    </linearGradient>
                  );
                })}
              </defs>
              {["low", "medium", "high", "critical"].map((level) => (
                <Area
                  key={level}
                  dataKey={mode === "risk" ? level : level + "Cvss"}
                  type="monotone"
                  stackId="1"
                  stroke={severityToColor(level.toUpperCase())}
                  strokeWidth={2}
                  fill={`url(#fill-${level})`}
                  fillOpacity={0.8}
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
