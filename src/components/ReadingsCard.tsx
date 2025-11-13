"use client";
import { useEffect, useState } from "react";
import { Graph } from "./ui/Graph";
import { subscribeToReadings } from "../lib/readings";

interface ReadingProps {
  title: string;
  titleSvg?: string;
  titleSvgSize?: string;
  unit?: string;
  graphColor?: string;
  formula?: string;
}

const ReadingCard = ({
  title,
  titleSvg,
  titleSvgSize = "size-7",
  unit,
  graphColor = "var(--chart-1)",
  formula,
}: ReadingProps) => {
  const [readingValue, setReadingValue] = useState(0);
  const [chartData, setChartData] = useState<{ time: string; value: number }[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToReadings((data) => {
      const key = title.toLowerCase().replace(" ", "") as keyof typeof data;
      const newValue = data[key] || 0;
      setReadingValue(newValue);

      // Maintain the latest 100 data points
      setChartData((prev) => [
        ...prev.slice(-100),
        {
          time: new Date().toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          }),
          value: newValue,
        },
      ]);
    });

    return () => unsubscribe();
  }, [title]);

  return (
    <div className="flex flex-col justify-between bg-accent rounded-2xl shadow-md p-4 border border-gray-100 hover:shadow-lg transition-all duration-200 w-full">
      {/* Header */}
      <div className="flex items-center gap-3">
        {titleSvg && (
          <img
            src={titleSvg}
            alt={title}
            className={`${titleSvgSize} object-contain`}
          />
        )}
        <h2
          className={`${
            title === "Power Factor" ? "text-base" : "text-lg"
          } font-semibold text-gray-800`}
        >
          {title}:
        </h2>
      </div>

      {/* Formula (optional) */}
      {formula && (
        <h3 className="text-center p-2 rounded-xl font-semibold bg-zinc-200 mt-2">
          {formula}
        </h3>
      )}

      {/* Graph */}
      <div className="my-3 flex-1 justify-center items-end overflow-hidden min-w-60 h-full">
        <Graph data={chartData} color={graphColor} />
      </div>

      {/* Reading Value */}
      <div className="flex items-baseline justify-center gap-1 mt-auto">
        <p className="text-4xl font-bold" style={{ color: graphColor }}>
          {readingValue.toFixed(2)}
        </p>
        {unit && <p className="text-lg text-gray-500">{unit}</p>}
      </div>
    </div>
  );
};

export default ReadingCard;
