import { Timer } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import CircularTimer from "./ui/CircularTimer";
import mqtt, { MqttClient } from "mqtt";

interface TimerCustomProps {
  brokerUrl: string; // e.g. "ws://192.168.1.42:9001"
  topic: string;     // e.g. "esp32/relay"
}

const TimerCustom = ({ brokerUrl, topic }: TimerCustomProps) => {
  const [timerCustom, setTimerCustom] = useState<string>("");
  const [client, setClient] = useState<MqttClient | null>(null);
  const [connected, setConnected] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  // MQTT connection setup (same logic as Switcher)
  useEffect(() => {
    const mqttClient = mqtt.connect(brokerUrl);
    setClient(mqttClient);

    mqttClient.on("connect", () => {
      console.log("✅ Connected to MQTT Broker");
      setConnected(true);
    });

    mqttClient.on("error", (err) => {
      console.error("❌ MQTT Connection Error:", err);
      mqttClient.end();
    });

    return () => {
      mqttClient.end();
    };
  }, [brokerUrl]);

  const handleSubmit = () => {
    const duration = parseInt(timerCustom, 10);
    if (isNaN(duration) || duration <= 0) {
      alert("Please enter a valid duration in seconds.");
      return;
    }

    if (!client || !connected) {
      alert("MQTT not connected!");
      return;
    }

    // Step 1: Turn ON relay immediately
    const messageOn = "ON";
    client.publish(topic, messageOn);
    console.log(` Published "${messageOn}" to ${topic}`);
    console.log(" Relay ON");

    setIsRunning(true);
    console.log(` Timer started for ${duration} seconds`);

    //  Step 2: After X seconds, turn OFF relay
    setTimeout(() => {
      const messageOff = "OFF";
      if (client && connected) {
        client.publish(topic, messageOff);
        console.log(` Published "${messageOff}" to ${topic}`);
        console.log(" Relay OFF");
      } else {
        console.warn(" Not connected to MQTT broker");
      }
      setIsRunning(false);
    }, duration * 1000);
  };

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
          Enter Time (in seconds):
        </label>
        <Input
          id="timer-input"
          className="peer ps-3"
          placeholder="Enter time in seconds"
          type="number"
          min={0}
          aria-label="Custom timer"
          value={timerCustom}
          onChange={(e) => setTimerCustom(e.target.value)}
          disabled={isRunning}
        />
      </div>

      <Button
        className="mt-5 cursor-pointer"
        onClick={handleSubmit}
        disabled={isRunning || !connected}
      >
        {isRunning ? "Running..." : "Start Timer"}
      </Button>

      <div className="mx-auto mt-12">
        {isRunning ? (
          <CircularTimer duration={parseInt(timerCustom) || 0} />
        ) : (
          <CircularTimer duration={0} />
        )}
      </div>
    </div>
  );
};

export default TimerCustom;
