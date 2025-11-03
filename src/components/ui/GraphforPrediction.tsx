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
  const combined = [
    ...actualData.map((d) => ({ ...d, type: "Actual" })),
    ...predictedData.map((d) => ({ ...d, type: "Predicted" })),
  ];

  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer>
        <LineChart data={combined}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" minTickGap={25} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="energy"
            name="Actual"
            stroke="#007BFF"
            dot={false}
            isAnimationActive={false}
            data={actualData}
          />
          <Line
            type="monotone"
            dataKey="energy"
            name="Predicted"
            stroke="#FF7300"
            dot={false}
            strokeDasharray="5 5"
            isAnimationActive={false}
            data={predictedData}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraphforPredictiton;
