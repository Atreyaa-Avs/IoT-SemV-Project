import { Timer } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import CircularTimer from "./ui/CircularTimer";
import mqtt, { MqttClient } from "mqtt";

interface IntervalTimerProps {
  brokerUrl: string;
  topic: string;
}

const IntervalTimer = ({ brokerUrl, topic }: IntervalTimerProps) => {
  const [intervalSec, setIntervalSec] = useState(""); // ON/OFF duration in seconds
  const [client, setClient] = useState<MqttClient | null>(null);
  const [connected, setConnected] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isOn, setIsOn] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [brokerUrl]);

  const handleInputChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    setIntervalSec(cleaned);
  };

  const handleStart = () => {
    const duration = parseInt(intervalSec, 10);
    if (isNaN(duration) || duration <= 0) {
      alert("Enter a valid number of seconds (>0)");
      return;
    }
    if (!client || !connected) {
      alert("MQTT not connected!");
      return;
    }

    setIsRunning(true);
    setIsOn(true);
    setSecondsLeft(duration);
    client.publish(topic, "ON");
    console.log(" Relay ON");

    let currentState = true; // true = ON, false = OFF
    let counter = duration;

    intervalRef.current = setInterval(() => {
      counter -= 1;
      setSecondsLeft(counter);

      if (counter <= 0) {
        currentState = !currentState; // toggle state
        setIsOn(currentState);
        client.publish(topic, currentState ? "ON" : "OFF");
        console.log(` Relay ${currentState ? "ON" : "OFF"}`);
        counter = duration; // reset counter for next state
        setSecondsLeft(duration);
      }
    }, 1000);
  };

  const handleStop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (client) client.publish(topic, "OFF");
    setIsOn(false);
    setIsRunning(false);
    setSecondsLeft(0);
  };

  return (
    <div className="flex flex-col bg-white p-4 rounded-xl shadow-sm w-full">
      <div className="flex justify-center mt-2">
        <h3 className="inline-flex items-center gap-2 text-xl font-semibold text-center">
          <Timer className="w-5 h-5" />
          Interval Timer
        </h3>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ON/OFF Interval (seconds):
        </label>
        <Input
          type="number"
          min={1}
          placeholder="Seconds"
          value={intervalSec}
          onChange={(e) => handleInputChange(e.target.value)}
          disabled={isRunning}
        />
      </div>

      <div className="flex gap-2 mt-5">
        <Button onClick={handleStart} disabled={isRunning || !connected} className="flex-1">
          Start
        </Button>
        <Button onClick={handleStop} disabled={!isRunning} className="flex-1" variant="destructive">
          Stop
        </Button>
      </div>

      <div className="mx-auto mt-8">
        {isRunning && <CircularTimer duration={secondsLeft} />}
      </div>

      {isRunning && (
        <p className="text-center mt-2 font-medium">
          Relay is currently: <span className={isOn ? "text-green-600" : "text-red-600"}>{isOn ? "ON" : "OFF"}</span>
        </p>
      )}
    </div>
  );
};

export default IntervalTimer;
