import mqtt from "mqtt"; // ✅ ensures proper bundling in browsers

type ReadingData = {
  current: number;
  voltage: number;
  power: number;
  energy: number;
  frequency: number;
  powerfactor: number; // ✅ lowercase and consistent
  apparentpower: number;
  reactivepower: number;
};

// Initialize readings
const readings: ReadingData = {
  current: 0,
  voltage: 0,
  power: 0,
  energy: 0,
  frequency: 0,
  powerfactor: 0,
  apparentpower: 0,
  reactivepower: 0,
};

// List of callbacks (for live updates in components)
let subscribers: ((data: ReadingData) => void)[] = [];

console.log("🌐 Connecting to MQTT broker...");
const client = mqtt.connect("wss://broker.hivemq.com:8884/mqtt", {
  reconnectPeriod: 1000,
});

client.on("connect", () => {
  console.log("✅ Connected to MQTT Broker!");

  const topics = [
    "power/current",
    "power/voltage",
    "power/power",
    "power/energy",
    "power/frequency",
    "power/powerfactor",
    "power/apparentpower",
    "power/reactivepower",
  ];

  topics.forEach((topic) => {
    client.subscribe(topic, (err) => {
      if (err) console.error(`❌ Failed to subscribe ${topic}:`, err);
      else console.log(`📡 Subscribed to: ${topic}`);
    });
  });
});

client.on("reconnect", () => {
  console.warn("♻️ Reconnecting to MQTT broker...");
});

client.on("close", () => {
  console.warn("🔌 MQTT connection closed");
});

client.on("offline", () => {
  console.warn("⚠️ MQTT client is offline");
});

client.on("error", (err) => {
  console.error("❌ MQTT Error:", err.message);
});

// -------------------- Handle Incoming Messages --------------------
client.on("message", (topic, message) => {
  const val = parseFloat(message.toString());
  console.log(`📩 Message received | ${topic}: ${val}`);

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
    case "power/apparentpower":
      readings.apparentpower = val;
      break;
    case "power/reactivepower":
      readings.reactivepower = val;
      break;
    default:
      console.warn("⚠️ Unknown topic:", topic);
  }

  // Notify all subscribers when data changes
  subscribers.forEach((cb) => cb({ ...readings }));
});

// -------------------- Public Functions --------------------

// ✅ Subscribe to live readings
export function subscribeToReadings(callback: (data: ReadingData) => void) {
  subscribers.push(callback);
  console.log("👂 New subscriber added. Total:", subscribers.length);
  // Send initial state immediately
  callback({ ...readings });

  // Return unsubscribe function
  return () => {
    subscribers = subscribers.filter((cb) => cb !== callback);
    console.log("❎ Subscriber removed. Total:", subscribers.length);
  };
}

// ✅ Optional: Get current readings without subscribing
export function getReadings(): ReadingData {
  return { ...readings };
}
