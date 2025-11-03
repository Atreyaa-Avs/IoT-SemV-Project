import React, { useEffect, useState } from "react";
import clsx from "clsx";

interface CircularTimerProps {
  duration: number;
  circleWidth?: number;
  strokeColor?: string;
  className?: string;
}

const CircularTimer: React.FC<CircularTimerProps> = ({
  duration,
  circleWidth = 250,
  strokeColor = "#12c2e9",
  className = "",
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  const radius = 30;
  const strokeWidth = 8;
  const normalizedRadius = radius + strokeWidth / 2;
  const dashArray = 2 * Math.PI * radius;

  // Start at 0% fill → goes to 100%
  const percentage = duration > 0 ? ((duration - timeLeft) / duration) * 100 : 0;
  const dashOffset = dashArray - (dashArray * percentage) / 100;

  useEffect(() => {
    if (duration <= 0) return;

    setTimeLeft(duration);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [duration]);

  return (
    <div
      className={clsx(
        "relative aspect-square w-full h-auto max-w-[150px]",
        className
      )}
      style={{ width: `${circleWidth}px` }}
    >
      <svg
        viewBox={`0 0 ${normalizedRadius * 2} ${normalizedRadius * 2}`}
        className="w-full h-full"
      >
        {/* Background circle */}
        <circle
          cx={normalizedRadius}
          cy={normalizedRadius}
          r={radius}
          strokeWidth={strokeWidth}
          className="fill-none stroke-[#d3d3d4]"
        />

        {/* Progress circle */}
        <circle
          cx={normalizedRadius}
          cy={normalizedRadius}
          r={radius}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="fill-none"
          style={{
            stroke: strokeColor,
            strokeDasharray: dashArray,
            strokeDashoffset: dashOffset,
            transition: "stroke-dashoffset 1s linear", // smooth one-way
          }}
          transform={`rotate(-90 ${normalizedRadius} ${normalizedRadius})`}
        />
      </svg>

      {/* Center countdown */}
      <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-black">
        {timeLeft}s
      </div>
    </div>
  );
};

export default CircularTimer;
