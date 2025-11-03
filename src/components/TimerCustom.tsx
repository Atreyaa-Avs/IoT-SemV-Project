import { Timer } from "lucide-react";
import React, { useState } from "react";
import { Input } from "./ui/input";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { Button } from "./ui/button";
import CircularTimer from "./ui/CircularTimer";

const TimerCustom = () => {
  const [timerCustom, setTimerCustom] = useState<string>("");

  return (
    <div className="flex flex-col bg-white p-4 rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex justify-center mt-2">
        <h3 className="inline-flex items-center gap-2 text-xl font-semibold text-center">
          <Timer className="w-5 h-5" />
          Timer
        </h3>
      </div>

      {/* Input Section */}
      <div className="mt-4">
        <label
          htmlFor="timer-input"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Enter Time:
        </label>
        <Input
          id="timer-input"
          className="peer ps-3"
          placeholder="Enter time in seconds"
          type="number"
          min={0}
          aria-label="Custom timer"
          value={timerCustom}
          onChange={(e) => setTimerCustom(e.target.value)} // keep as string
        />
      </div>
      <Button className="mt-5 cursor-pointer">Submit</Button>
      <div className="mx-auto mt-5">
        <CircularTimer duration={30} />
      </div>
    </div>
  );
};

export default TimerCustom;
