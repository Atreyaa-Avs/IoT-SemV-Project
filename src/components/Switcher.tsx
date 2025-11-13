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

  // Log relay state
  useEffect(() => {
    console.log(isChecked ? "Relay ON" : "Relay OFF");
  }, [isChecked]);

  // Handle switch toggle
  const handleChange = () => {
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

  return (
    <div
      className="relative mt-2 ml-5"
      style={{
        transform: `scale(${size})`,
        width: 100,
        height: 35,
        background: "#d6d6d6",
        borderRadius: "50px",
        boxShadow: "inset -8px -8px 16px #ffffff, inset 8px 8px 16px #b0b0b0",
      }}
    >
      {/* Hidden checkbox */}
      <input
        id="toggle-switch"
        type="checkbox"
        checked={isChecked}
        onChange={handleChange}
        className="hidden"
      />

      {/* Label as clickable area */}
      <label
        htmlFor="toggle-switch"
        className="absolute top-1/2 left-0 w-full h-full -translate-y-1/2 rounded-[50px] overflow-hidden cursor-pointer"
      >
        {/* Toggle Knob */}
        <div
          className={`absolute flex items-center justify-start px-2 rounded-[50px] transition-all duration-300 ease-in-out ${
            isChecked
              ? "left-[40px] bg-linear-to-br from-[#cfcfcf] to-[#a9a9a9]"
              : "left-[5px] bg-linear-to-br from-[#d9d9d9] to-[#bfbfbf]"
          }`}
          style={{
            width: 50,
            height: 25,
            top: 5,
            boxShadow: isChecked
              ? "-4px -4px 8px #ffffff, 4px 4px 8px #8a8a8a"
              : "-4px -4px 8px #ffffff, 4px 4px 8px #b0b0b0",
          }}
        >
          {/* LED Light */}
          <div
            className={`relative rounded-full transition-all duration-300 ease-in-out ${
              isChecked
                ? "left-[25px] bg-green-500 shadow-[0_0_15px_4px_rgba(255,255,0,0.8)]"
                : "left-0 bg-gray-500 shadow-[0_0_10px_2px_rgba(0,0,0,0.2)]"
            }`}
            style={{ width: 10, height: 10, top: 1 }}
          ></div>
        </div>
      </label>
    </div>
  );
};

export default Switcher;
