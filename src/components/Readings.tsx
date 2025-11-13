"use client";

import { useEffect, useState } from "react";
import { Graph } from "./ui/Graph";
import { subscribeToReadings } from "../lib/readings";
import { BorderBeam } from "./ui/border-beam";

interface ReadingProps {
  title: string;
  titleSvg?: string;
  titleSvgSize?: string;
  unit?: string;
  graphColor?: string;
  formula?: string;
}

const Reading = ({
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
      // Convert title (e.g. "Power Factor") → "powerfactor"
      const key = title.toLowerCase().replace(/\s+/g, "") as keyof typeof data;
      const newValue = data[key] || 0;

      setReadingValue(newValue);

      // Keep the latest 100 points for smoother graph updates
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
    <div
      className={`relative overflow-hidden flex gap-4 bg-accent rounded-xl py-3 px-4 select-none mb-2 shadow-xl ${
        title === "Power" ? "bg-black text-white" : ""
      }`}
    >
      <div className="flex flex-col gap-4 justify-between my-2">
        <div
          className={`flex items-center justify-start ${
            title === "Frequency" ? "gap-0" : "gap-2"
          }`}
        >
          {titleSvg && (
            <img
              src={titleSvg}
              alt={title}
              className={`${title === "Frequency" ? "size-7" : titleSvgSize}`}
            />
          )}
          <h2
            className={`${
              title === "Power Factor" ? "text-base" : "text-lg"
            } font-bold`}
          >
            {title}:
          </h2>
        </div>

        {formula && (
          <h3
            className={`text-center p-1 rounded-xl font-semibold ${
              title === "Power" ? "bg-gray-800 text-white" : "bg-zinc-200"
            }`}
          >
            {formula}
          </h3>
        )}

        <div className="flex items-end gap-1 pl-2 justify-start">
          <p className="text-5xl">{readingValue.toFixed(2)}</p>
          {unit && <p className="text-2xl font-light">{unit}</p>}
        </div>
      </div>

      <div className="my-auto flex-1 justify-center items-end overflow-hidden min-w-60">
        <Graph data={chartData} color={graphColor} />
      </div>

      {title === "Power" && (
        <BorderBeam duration={8} size={150} borderWidth={5} />
      )}
    </div>
  );
};

export default Reading;
