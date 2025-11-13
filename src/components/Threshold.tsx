"use client";

import { Joystick } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Graph } from "./ui/Graph";
import mqtt, { MqttClient } from "mqtt";
import { subscribeToReadings } from "../lib/readings";

interface ThresholdProps {
  brokerUrl: string; // e.g. "ws://192.168.1.42:9001"
  topic: string;     // e.g. "esp32/relay"
}

const Threshold = ({ brokerUrl, topic }: ThresholdProps) => {
  const [threshold, setThreshold] = useState<string>("");
  const [power, setPower] = useState<number>(0);
  const [client, setClient] = useState<MqttClient | null>(null);
  const [connected, setConnected] = useState(false);
  const [chartData, setChartData] = useState<{ time: string; value: number }[]>([]);

  // 🔹 Connect to MQTT broker (same as Switcher)
  useEffect(() => {
    const mqttClient = mqtt.connect(brokerUrl);
    setClient(mqttClient);

    mqttClient.on("connect", () => {
      console.log("Connected to MQTT Broker");
      setConnected(true);
    });

    mqttClient.on("error", (err) => {
      console.error("MQTT Connection Error:", err);
      mqttClient.end();
    });

    return () => {
      mqttClient.end();
    };
  }, [brokerUrl]);

  // 🔹 Subscribe to live power readings (sensor updates)
  useEffect(() => {
    const unsubscribe = subscribeToReadings((data) => {
      const newPower = data.power || 0;
      setPower(newPower);

      // Keep last 30 readings
      setChartData((prev) => [
        ...prev.slice(-29),
        {
          time: new Date().toLocaleTimeString("en-IN", {
            minute: "2-digit",
            second: "2-digit",
          }),
          value: newPower,
        },
      ]);
    });

    return () => unsubscribe();
  }, []);

  // 🔹 If power exceeds threshold → publish "OFF"
  useEffect(() => {
    const thresholdVal = parseFloat(threshold);
    if (thresholdVal > 0 && power > thresholdVal) {
      console.warn(` Power (${power}W) exceeded threshold (${thresholdVal}W)! Turning relay OFF.`);
      if (client && connected) {
        const message = "OFF";
        client.publish(topic, message);
        console.log(` Published "${message}" to ${topic}`);
        console.log(" Relay OFF");
      } else {
        console.warn(" Not connected to MQTT broker");
      }
    }
  }, [power, threshold, client, connected, topic]);

  // Optional: Turn ON again when power drops below threshold
  useEffect(() => {
    const thresholdVal = parseFloat(threshold);
    if (thresholdVal > 0 && power < thresholdVal * 0.9) { // hysteresis to prevent rapid toggling
      if (client && connected) {
        const message = "ON";
        client.publish(topic, message);
        console.log(`Published "${message}" to ${topic}`);
        console.log("Relay ON");
      }
    }
  }, [power, threshold, client, connected, topic]);

  return (
    <div className="flex flex-col bg-white p-4 rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex justify-center mt-2">
        <h3 className="inline-flex items-center gap-2 text-xl font-semibold text-center">
          <Joystick className="w-5 h-5" />
          Threshold
        </h3>
      </div>

      {/* Input Section */}
      <div className="mt-4">
        <label
          htmlFor="threshold-input"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Enter Threshold (in Watts):
        </label>
        <Input
          id="threshold-input"
          className="peer ps-3"
          placeholder="Enter threshold wattage"
          type="number"
          min={0}
          aria-label="Threshold value"
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
        />

        <Button
          className="mt-5 cursor-pointer w-full"
          onClick={() => console.log(`✅ Threshold set to ${threshold} W`)}
        >
          Submit
        </Button>

        {/* Live Power Graph */}
        <div className="mt-5">
          <Graph
            data={chartData}
            color="var(--chart-4)" // orange accent for power
          />
        </div>

        {/* Display current power */}
        <p className="text-center text-lg mt-3">
          ⚡ Current Power: <span className="font-semibold">{power.toFixed(2)} W</span>
        </p>
      </div>
    </div>
  );
};

export default Threshold;
