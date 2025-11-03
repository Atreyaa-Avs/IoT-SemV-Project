import React, { useEffect, useState } from "react";
import { Leaf } from "lucide-react";
import { subscribeToReadings } from "../lib/readings"; // ✅ your shared MQTT module

interface EnergyEfficiencyProps {
  avgUsage?: number; // default 5 kWh daily average
}

const EnergyEfficiency: React.FC<EnergyEfficiencyProps> = ({ avgUsage = 5 }) => {
  const [todayUsage, setTodayUsage] = useState(0); // accumulated kWh
  const [efficiency, setEfficiency] = useState(0);

  useEffect(() => {
    // Subscribe to live readings
    const unsubscribe = subscribeToReadings((data) => {
      // data.energy — cumulative Wh from your ESP32 PZEM
      if (!isNaN(data.energy)) {
        // convert Wh → kWh
        setTodayUsage(data.energy / 1000);
      }
    });

    return () => unsubscribe();
  }, []);

  // Calculate efficiency dynamically
  useEffect(() => {
    if (avgUsage > 0) {
      const score = ((avgUsage - todayUsage) / avgUsage) * 100;
      setEfficiency(score);
    }
  }, [todayUsage, avgUsage]);

  return (
    <div className="flex flex-col bg-white p-2 rounded-xl">
      <div className="flex mx-auto mt-2">
        <h3 className="inline-flex justify-center items-center text-xl text-center font-semibold">
          <span className="mr-1">
            <Leaf fill={efficiency > 0 ? "green" : "red"} />
          </span>
          Energy Efficiency Score
        </h3>
      </div>

      <div className="mt-4">
        <p className="text-center text-sm">
          ((avgUsage - todayUsage) / avgUsage) * 100
        </p>

        <p
          className={`text-center text-6xl mt-4 ${
            efficiency > 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {efficiency.toFixed(1)}%
        </p>

        <p className="text-center text-xs mt-2 text-gray-500">
          Today: {todayUsage.toFixed(2)} kWh | Avg: {avgUsage} kWh
        </p>
      </div>
    </div>
  );
};

export default EnergyEfficiency;
