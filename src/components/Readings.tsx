 "use client";
import { useEffect, useState } from "react";
import { Graph } from "./ui/Graph";
import { subscribeToReadings } from "../lib/readings";

interface ReadingProps {
  title: string;
  titleSvg?: string;
  titleSvgSize?: string;
  unit?: string;
}

const Reading = ({
  title,
  titleSvg,
  titleSvgSize = "size-7",
  unit,
}: ReadingProps) => {
  const [readingValue, setReadingValue] = useState(0);
  const [chartData, setChartData] = useState<{ time: string; value: number }[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToReadings((data) => {
      const key = title.toLowerCase().replace(" ", "") as keyof typeof data;
      const newValue = data[key] || 0;

      setReadingValue(newValue);

      // Keep the latest 10 data points for smooth graph animation
      setChartData((prev) => [
        ...prev.slice(-9),
        { time: new Date().toLocaleTimeString("en-IN", { minute: "2-digit", second: "2-digit" }), value: newValue },
      ]);
    });

    return () => unsubscribe();
  }, [title]);

  return (
    <div className="flex gap-4 w-fit bg-white rounded-xl py-3 px-4 select-none mb-2">
      <div className="flex flex-col gap-4 justify-between my-2">
        <div
          className={`flex items-center justify-center ${
            title === "Frequency" ? "gap-0" : "gap-2"
          }`}
        >
          {titleSvg && (
            <img
              src={titleSvg}
              alt={title}
              className={`${title === "Frequency" ? "size-5" : titleSvgSize}`}
            />
          )}
          <h2 className="text-lg font-bold">{title}:</h2>
        </div>
        <div className="flex items-end gap-1 pl-2 justify-end">
          <p className="text-5xl">{readingValue.toFixed(2)}</p>
          <p className="text-2xl font-light">{unit}</p>
        </div>
      </div>
      <div className="flex-1 min-w-3xs">
        <Graph data={chartData} />
      </div>
    </div>
  );
};

export default Reading;
