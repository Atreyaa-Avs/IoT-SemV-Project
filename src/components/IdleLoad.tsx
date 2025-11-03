"use client";

import { ActivityIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { subscribeToReadings } from "../lib/readings"; // ✅ your existing function

const IdleLoad = () => {
  const [current, setCurrent] = useState<number>(0);
  const [idleStartTime, setIdleStartTime] = useState<number | null>(null);
  const [idleDuration, setIdleDuration] = useState<number>(0);
  const [isIdle, setIsIdle] = useState<boolean>(false);

  // Subscribe to current readings from MQTT / sensor
  useEffect(() => {
    const unsubscribe = subscribeToReadings((data) => {
      const newCurrent = data.current || 0;
      setCurrent(newCurrent);
    });

    return () => unsubscribe();
  }, []);

  // Logic to track idle state
  useEffect(() => {
    const idleMin = 0.05;
    const idleMax = 0.2;
    const idleThreshold = 300000; // 5 minutes (ms)

    if (current > idleMin && current < idleMax) {
      // If current is in idle range
      if (!idleStartTime) {
        setIdleStartTime(Date.now());
      } else {
        const duration = Date.now() - idleStartTime;
        setIdleDuration(duration);

        if (duration > idleThreshold) {
          setIsIdle(true);
        }
      }
    } else {
      // Reset if load becomes active again
      setIdleStartTime(null);
      setIdleDuration(0);
      setIsIdle(false);
    }
  }, [current]);

  // Convert ms to seconds for display
  const idleSeconds = Math.floor(idleDuration / 1000);

  return (
    <div className="flex flex-col bg-white p-4 rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex justify-center mt-2">
        <h3 className="inline-flex justify-center items-center text-xl font-semibold text-center">
          <ActivityIcon className="mr-2" />
          Is Idle?
        </h3>
      </div>

      {/* Condition Display */}
      <p className="text-center text-sm mt-2 text-gray-600">
        {"(current > 0.05 && current < 0.2 && idleTime > 300000)"}
      </p>

      {/* Current + Idle Time
      <div className="mt-5 text-center">
        <p className="text-lg font-medium">
          ⚡ Current: <span className="font-semibold">{current.toFixed(3)} A</span>
        </p>

        <p className="text-lg font-medium mt-2">
          ⏱ Idle Time:{" "}
          <span className="font-semibold">{idleSeconds}s</span>
        </p>
      </div> */}

      {/* Idle Status */}
      <div className="text-center mt-5">
        {isIdle ? (
          <p className="text-4xl font-bold text-green-600 animate-pulse">IDLE</p>
        ) : (
          <p className="text-4xl font-bold text-red-500">ACTIVE</p>
        )}
      </div>
    </div>
  );
};

export default IdleLoad;
