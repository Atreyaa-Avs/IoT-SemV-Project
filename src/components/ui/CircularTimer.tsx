import React, { useEffect, useState } from "react";

const CircularTimer = ({ duration = 10 }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  const radius = 60;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;

  const strokeDashoffset =
    circumference - (timeLeft / duration) * circumference;

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  return (
    <div className="relative flex justify-center items-center">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="-rotate-90" // so progress starts from top
      >
        {/* Background Circle */}
        <circle
          stroke="#d1d5db"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />

        {/* Progress Circle */}
        <circle
          stroke="#22c55e"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          cx={radius}
          cy={radius}
          style={{
            transition: "stroke-dashoffset 1s linear",
          }}
        />
      </svg>

      {/* Center Text */}
      <div className="absolute text-black text-xl font-semibold">
        {timeLeft}
      </div>
    </div>
  );
};

export default CircularTimer;
