"use client";
import { Joystick } from "lucide-react";
import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Graph } from "./ui/Graph";
import { GraphDemo } from "./ui/GraphDemo";

const Threshold = () => {
  const [timerCustom, setTimerCustom] = useState<string>("");

  // sample data for graph
  const graphData = [
    { month: "Jan", desktop: 120, mobile: 60 },
    { month: "Feb", desktop: 150, mobile: 80 },
    { month: "Mar", desktop: 100, mobile: 70 },
    { month: "Apr", desktop: 180, mobile: 90 },
    { month: "May", desktop: 140, mobile: 75 },
    { month: "Jun", desktop: 160, mobile: 85 },
  ];

  return (
    <div className="flex flex-col bg-white p-2 rounded-xl">
      {/* Header */}
      <div className="flex mx-auto mt-2">
        <h3 className="inline-flex justify-center items-center text-xl text-center font-semibold">
          <Joystick />
          Threshold
        </h3>
      </div>

      {/* Input and Graph */}
      <div className="mt-4">
        <label
          htmlFor="timer-input"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Enter Threshold Value:
        </label>
        <Input
          id="timer-input"
          className="peer ps-3"
          placeholder="Enter threshold in Amperes"
          type="number"
          min={0}
          aria-label="Custom timer"
          value={timerCustom}
          onChange={(e) => setTimerCustom(e.target.value)} // keep as string
        />
        <Button className="mt-5 cursor-pointer w-full">Submit</Button>

        {/* Graph with dynamic data */}
        <GraphDemo />
      </div>
    </div>
  );
};

export default Threshold;
