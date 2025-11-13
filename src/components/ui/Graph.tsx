"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface GraphProps {
  data: any[];
  config?: ChartConfig;
  xKey?: string;
  color?: string; // custom color for chart
}

export function Graph({
  data,
  config,
  xKey = "time",
  color = "var(--chart-1)",
}: GraphProps) {
  // use config color or fallback
  const chartConfig =
    config ||
    ({
      value: {
        label: "Reading",
        color,
      },
    } satisfies ChartConfig);

  // ensure unique gradient IDs to prevent collisions between charts
  const gradientId = `fill-${Math.random().toString(36).substring(2, 8)}`;

  return (
    <Card className="p-2 px-0">
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart data={data} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={xKey}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) =>
                typeof value === "string" ? value.slice(0, 3) : value
              }
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />

            {/* Dynamic gradient tied to the color prop */}
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                {/* top gradient - bright color */}
                <stop offset="0%" stopColor={color} stopOpacity={0.85} />
                {/* bottom gradient - fade out to transparent */}
                <stop offset="100%" stopColor={color} stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <Area
              dataKey="value"
              type="monotone"
              stroke={color}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
