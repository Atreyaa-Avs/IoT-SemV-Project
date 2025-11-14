"use client";
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type Point = { time: string; energy: number };

interface GraphDemoProps {
  actualData: Point[];
  predictedData: Point[];
}

const GraphforPredictiton = ({ actualData, predictedData }: GraphDemoProps) => {
  // Prepare combined data with separate keys
  const combined = actualData.map((d, i) => ({
    time: d.time,
    actual: d.energy,
    predicted: predictedData[i]?.energy ?? null, // align indices
  }));

  return (
    <div style={{ width: "100%", height: 350 }}>
      <ResponsiveContainer>
        <LineChart data={combined}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" minTickGap={25} />
          <YAxis tickFormatter={(v) => v.toFixed(3)} />{" "}
          {/* show small values */}
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="actual"
            name="Actual"
            stroke="#007BFF"
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="predicted"
            name="Predicted"
            stroke="#FF7300"
            dot={false}
            strokeDasharray="5 5"
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraphforPredictiton;
