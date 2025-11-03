import mqtt from "mqtt";

type ReadingData = {
  current: number;
  voltage: number;
  power: number;
  energy: number;
  frequency: number;
  powerfactor: number; // ✅ lowercase and consistent
};

// Initialize readings
const readings: ReadingData = {
  current: 0,
  voltage: 0,
  power: 0,
  energy: 0,
  frequency: 0,
  powerfactor: 0,
};

// List of callbacks (for live updates in components)
let subscribers: ((data: ReadingData) => void)[] = [];

// MQTT Client Setup
const client = mqtt.connect("wss://test.mosquitto.org:8081");

client.on("connect", () => {
  console.log("✅ Connected to MQTT Broker!");

  const topics = [
    "power/current",
    "power/voltage",
    "power/power",
    "power/energy",
    "power/frequency",
    "power/powerfactor", // ✅ match ESP32 topic
  ];

  topics.forEach((topic) => client.subscribe(topic));
});

client.on("message", (topic, message) => {
  const val = parseFloat(message.toString());

  switch (topic) {
    case "power/current":
      readings.current = val;
      break;
    case "power/voltage":
      readings.voltage = val;
      break;
    case "power/power":
      readings.power = val;
      break;
    case "power/energy":
      readings.energy = val;
      break;
    case "power/frequency":
      readings.frequency = val;
      break;
    case "power/powerfactor":
      readings.powerfactor = val;
      break;
  }

  // Notify all subscribers when data changes
  subscribers.forEach((cb) => cb({ ...readings }));
});

// ✅ Subscribe to live readings
export function subscribeToReadings(callback: (data: ReadingData) => void) {
  subscribers.push(callback);
  // Send initial state immediately
  callback({ ...readings });

  // Return unsubscribe function
  return () => {
    subscribers = subscribers.filter((cb) => cb !== callback);
  };
}

// ✅ Optional: Get current readings without subscribing
export function getReadings(): ReadingData {
  return { ...readings };
}
