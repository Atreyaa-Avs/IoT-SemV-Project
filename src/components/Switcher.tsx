import { useEffect, useState } from "react";
import mqtt, { MqttClient } from "mqtt";

interface SwitcherProps {
  size?: number;
  brokerUrl: string; // e.g. "ws://192.168.1.42:9001"
  topic: string;     // e.g. "esp32/relay"
}

const Switcher = ({ size = 1, brokerUrl, topic }: SwitcherProps) => {
  const [isChecked, setIsChecked] = useState(false);
  const [client, setClient] = useState<MqttClient | null>(null);
  const [connected, setConnected] = useState(false);

  // Connect to MQTT broker
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

  // Log when relay state changes
  useEffect(() => {
    if (isChecked) {
      console.log("🔌 Relay ON");
    } else {
      console.log("⚡ Relay OFF");
    }
  }, [isChecked]);

  const handleCheckboxChange = () => {
    const newState = !isChecked;
    setIsChecked(newState);

    if (client && connected) {
      const message = newState ? "ON" : "OFF";
      client.publish(topic, message);
      console.log(`📡 Published "${message}" to ${topic}`);
    } else {
      console.warn("⚠️ Not connected to MQTT broker");
    }
  };

  const scale = {
    trackWidth: 56 * size,
    trackHeight: 20 * size,
    dotSize: 24 * size,
    dotTranslate: 32 * size,
  };

  return (
    <label className="flex cursor-pointer select-none items-center">
      <div
        className="relative"
        style={{ width: scale.trackWidth, height: scale.dotSize }}
      >
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleCheckboxChange}
          className="sr-only"
        />

        {/* Track */}
        <div
          className={`rounded-full shadow-inner transition-colors duration-300 ${
            isChecked ? "bg-[#EAEEFB]" : "bg-gray-400"
          }`}
          style={{
            width: scale.trackWidth,
            height: scale.trackHeight,
          }}
        ></div>

        {/* Dot */}
        <div
          className={`absolute flex items-center justify-center rounded-full bg-white shadow-md transition-all duration-300 ease-in-out ${
            isChecked ? "translate-x-[calc(var(--tx))]" : "translate-x-0"
          }`}
          style={{
            width: scale.dotSize,
            height: scale.dotSize,
            top: `-${(scale.dotSize - scale.trackHeight) / 2}px`,
            ["--tx" as any]: `${scale.dotTranslate}px`,
          }}
        >
          <span
            className={`rounded-full border transition-colors duration-300 ${
              isChecked ? "bg-blue-500 border-white" : "bg-black border-white"
            }`}
            style={{
              width: 12 * size,
              height: 12 * size,
            }}
          ></span>
        </div>
      </div>
    </label>
  );
};

export default Switcher;
