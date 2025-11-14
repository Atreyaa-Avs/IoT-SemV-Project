"use client";

import { ActivityIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { subscribeToReadings } from "../lib/readings";

const IdleLoad = () => {
  const [isIdle, setIsIdle] = useState<boolean>(false);
  const [power, setPower] = useState<number>(0);
  const [lastActiveTime, setLastActiveTime] = useState<number>(Date.now());

  // Thresholds
  const ACTIVE_THRESHOLD = 0.5; // W — above = active
  const IDLE_THRESHOLD = 0.4; // W — below = idle
  const IDLE_DELAY = 2000; // ms — time to consider idle

  useEffect(() => {
    const unsubscribe = subscribeToReadings((data) => {
      const newPower = data.power ?? 0;
      setPower(newPower);

      // If new power crosses active threshold → reset idle timer
      if (newPower > ACTIVE_THRESHOLD) {
        setLastActiveTime(Date.now());
        setIsIdle(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const idleTooLong = now - lastActiveTime > IDLE_DELAY;

      // If load has stayed below threshold for delay duration → idle
      if (idleTooLong && power < IDLE_THRESHOLD) {
        setIsIdle(true);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [power, lastActiveTime]);

  return (
    <div className="flex flex-col p-4 rounded-xl shadow-sm gap-3 w-full">
      {/* Header */}
      <div className="flex flex-col justify-center mt-2 text-center">
        <h3 className="inline-flex justify-center items-center text-xl font-semibold text-center">
          <ActivityIcon className="mr-2" />
          Load Status
        </h3>

        <p className="text-sm text-gray-500 mt-1">
          <span className="">
            if (Power &lt; {IDLE_THRESHOLD} W) → <span className="text-red-500">IDLE</span> &nbsp; | &nbsp; else →
            <span className="text-green-500">ACTIVE</span>
          </span>
        </p>
      </div>

      {/* Power Display */}
      <div className="text-center mt-3">
        <p className="text-xl font-medium">
          ⚡ Power: <span className="font-semibold">{power.toFixed(2)} W</span>
        </p>
      </div>

      {/* Idle/Active Status */}
      <div className="text-center mt-5">
        {isIdle ? (
          <p className="text-4xl font-bold text-red-600 animate-pulse">IDLE</p>
        ) : (
          <p className="text-4xl font-bold text-green-500">ACTIVE</p>
        )}
      </div>
    </div>
  );
};

export default IdleLoad;
