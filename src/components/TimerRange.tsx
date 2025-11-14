import { Timer } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import CircularTimer from "./ui/CircularTimer";
import mqtt, { MqttClient } from "mqtt";

interface TimerRangeProps {
  brokerUrl: string; // e.g. "ws://192.168.1.42:9001"
  topic: string;     // e.g. "esp32/relay"
}

const TimerRange = ({ brokerUrl, topic }: TimerRangeProps) => {
  const [startHH, setStartHH] = useState("");
  const [startMM, setStartMM] = useState("");
  const [startSS, setStartSS] = useState("");

  const [endHH, setEndHH] = useState("");
  const [endMM, setEndMM] = useState("");
  const [endSS, setEndSS] = useState("");

  const [client, setClient] = useState<MqttClient | null>(null);
  const [connected, setConnected] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

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

  const getTimeInSeconds = (hh: string, mm: string, ss: string) =>
    parseInt(hh || "0", 10) * 3600 +
    parseInt(mm || "0", 10) * 60 +
    parseInt(ss || "0", 10);

  const handleInputChange = (
    value: string,
    max: number,
    setFn: React.Dispatch<React.SetStateAction<string>>
  ) => {
    let cleaned = value.replace(/\D/g, "");
    if (cleaned) {
      const numeric = Math.min(parseInt(cleaned, 10), max);
      setFn(numeric.toString());
    } else {
      setFn("");
    }
  };

  const handleSchedule = () => {
    if (!client || !connected) {
      alert("MQTT not connected!");
      return;
    }

    const now = new Date();
    const currentSeconds =
      now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

    const startSeconds = getTimeInSeconds(startHH, startMM, startSS);
    const endSeconds = getTimeInSeconds(endHH, endMM, endSS);

    if (startSeconds === 0 && endSeconds === 0) {
      alert("Please enter valid start and end times.");
      return;
    }

    if (endSeconds <= startSeconds) {
      alert("End time must be after start time.");
      return;
    }

    const delayStart = (startSeconds - currentSeconds) * 1000;
    const delayEnd = (endSeconds - currentSeconds) * 1000;

    if (delayStart < 0) {
      alert("Start time already passed for today.");
      return;
    }

    setIsScheduled(true);
    setSecondsLeft(Math.floor(delayStart / 1000));

    // Countdown interval
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Schedule ON
    setTimeout(() => {
      client.publish(topic, "ON");
      console.log(" Relay ON");

      // Start countdown for OFF
      setSecondsLeft(Math.floor((delayEnd - delayStart) / 1000));
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, delayStart);

    // Schedule OFF
    setTimeout(() => {
      client.publish(topic, "OFF");
      console.log(" Relay OFF");
      setIsScheduled(false);
    }, delayEnd);

    console.log(
      `Scheduled relay from ${startHH.padStart(2, "0")}:${startMM.padStart(
        2,
        "0"
      )}:${startSS.padStart(2, "0")} to ${endHH.padStart(2, "0")}:${endMM.padStart(
        2,
        "0"
      )}:${endSS.padStart(2, "0")}`
    );
  };

  const renderTimeInputs = (
    label: string,
    hh: string,
    mm: string,
    ss: string,
    setHH: React.Dispatch<React.SetStateAction<string>>,
    setMM: React.Dispatch<React.SetStateAction<string>>,
    setSS: React.Dispatch<React.SetStateAction<string>>
  ) => (
    <div className="flex flex-col mt-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="flex gap-2">
        <Input
          type="number"
          placeholder="HH"
          min={0}
          max={23}
          value={hh}
          onChange={(e) => handleInputChange(e.target.value, 23, setHH)}
        />
        <Input
          type="number"
          placeholder="MM"
          min={0}
          max={59}
          value={mm}
          onChange={(e) => handleInputChange(e.target.value, 59, setMM)}
        />
        <Input
          type="number"
          placeholder="SS"
          min={0}
          max={59}
          value={ss}
          onChange={(e) => handleInputChange(e.target.value, 59, setSS)}
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col bg-white p-4 rounded-xl shadow-sm w-full">
      <div className="flex justify-center mt-2">
        <h3 className="inline-flex items-center gap-2 text-xl font-semibold text-center">
          <Timer className="w-5 h-5" />
          Scheduled Timer
        </h3>
      </div>

      {renderTimeInputs(
        "Start At:",
        startHH,
        startMM,
        startSS,
        setStartHH,
        setStartMM,
        setStartSS
      )}

      {renderTimeInputs(
        "End At:",
        endHH,
        endMM,
        endSS,
        setEndHH,
        setEndMM,
        setEndSS
      )}

      <Button
        className="mt-5 cursor-pointer"
        onClick={handleSchedule}
        disabled={isScheduled || !connected}
      >
        {isScheduled ? "Scheduled..." : "Schedule Timer"}
      </Button>

      <div className="mx-auto mt-12">
        {isScheduled && <CircularTimer duration={secondsLeft} />}
      </div>
    </div>
  );
};

export default TimerRange;
