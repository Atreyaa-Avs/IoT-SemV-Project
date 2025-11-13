import React, { useEffect, useState } from "react";
import { Leaf } from "lucide-react";
import { subscribeToReadings } from "../lib/readings";

interface EnergyEfficiencyProps {
  avgUsage?: number; // default 5 kWh daily average
}

const EnergyEfficiency: React.FC<EnergyEfficiencyProps> = ({ avgUsage = 5 }) => {
  const [todayUsage, setTodayUsage] = useState(0); // accumulated kWh
  const [efficiency, setEfficiency] = useState(100);

  useEffect(() => {
    // Subscribe to live power/energy readings
    const unsubscribe = subscribeToReadings((data) => {
      // data.energy = cumulative Wh from PZEM / ESP32
      if (!isNaN(data.energy)) {
        // Convert Wh → kWh
        const kWh = data.energy / 1000;
        setTodayUsage(kWh);
      }
    });

    return () => unsubscribe();
  }, []);

  // Compute efficiency as "how much of avgUsage is saved"
  useEffect(() => {
    if (avgUsage > 0) {
      let score = ((avgUsage - todayUsage) / avgUsage) * 100;

      // Clamp between 0–100
      score = Math.min(Math.max(score, 0), 100);

      setEfficiency(score);
    }
  }, [todayUsage, avgUsage]);

  // Determine color category
  const color =
    efficiency > 70
      ? "text-green-600"
      : efficiency > 40
      ? "text-yellow-500"
      : "text-red-600";

  const leafFill =
    efficiency > 70
      ? "green"
      : efficiency > 40
      ? "gold"
      : "red";

  return (
    <div className="flex flex-col bg-white p-4 rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex justify-center mt-2">
        <h3 className="inline-flex items-center text-xl font-semibold text-center">
          <Leaf fill={leafFill} className="mr-2" />
          Energy Efficiency
        </h3>
      </div>

      {/* Formula display */}
      <p className="text-center text-sm mt-2 text-gray-500">
        Efficiency = ((Avg - Today) / Avg) × 100
      </p>

      {/* Score */}
      <p className={`text-center text-6xl font-bold mt-4 ${color}`}>
        {efficiency.toFixed(1)}%
      </p>

      {/* Usage info */}
      <p className="text-center text-sm mt-2 text-gray-500">
        Today: <span className="font-semibold">{todayUsage.toFixed(2)}</span> kWh |
        Target: <span className="font-semibold">{avgUsage}</span> kWh
      </p>

      {/* Status Message */}
      <p className="text-center text-sm mt-2 font-medium">
        {efficiency > 70
          ? "Excellent Efficiency"
          : efficiency > 40
          ? "Moderate Usage"
          : "High Consumption"}
      </p>
    </div>
  );
};

export default EnergyEfficiency;
