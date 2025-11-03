"use client";
import { useEffect, useState } from "react";
import Switcher from "./Switcher";
import { Lightbulb, Tv, AirVent } from "lucide-react";
import Reading from "./Readings";
import { subscribeToReadings } from "../lib/readings";

const Hero = () => {
  const [rating, setRating] = useState(Ratings[0].title);
  const [power, setPower] = useState(0);

  // Subscribe to live power readings via MQTT
  useEffect(() => {
    const unsubscribe = subscribeToReadings((data) => {
      setPower(data.power || 0);
    });
    return () => unsubscribe();
  }, []);

  // Dynamically adjust power load category based on power (W)
  useEffect(() => {
    if (power === 0) setRating(Ratings[0].title);
    else if (power > 0 && power <= 10) setRating(Ratings[1].title);
    else if (power > 10 && power <= 30) setRating(Ratings[2].title);
    else if (power > 30) setRating(Ratings[3].title);
  }, [power]);

  const activeRating = Ratings.find((r) => r.title === rating);

  return (
    <div className="flex bg-accent p-4 mt-4 rounded-xl gap-6">
      {/* Left: Device Info + Switch */}
      <div className="flex items-center gap-4 w-max">
        {/* Image */}
        <div>
          <div className="overflow-hidden rounded-2xl size-72">
            <img
              src={activeRating?.image}
              alt={rating}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5 mt-2">
          <h1 className="inline-flex flex-col text-lg">
            Smart Plug is Connected to:{" "}
            <span
              className={`text-2xl font-bold ${
                rating.includes("Low")
                  ? "text-green-500"
                  : rating.includes("Medium")
                  ? "text-yellow-500"
                  : "text-red-500"
              }`}
            >
              {rating}
            </span>
          </h1>

          {/* Relay Toggle via MQTT */}
          <div className="flex flex-col w-fit gap-1">
            <div className="flex justify-between text-sm font-medium text-gray-700">
              <p>Off</p>
              <p>On</p>
            </div>
            {/* Pass broker + topic here */}
            <Switcher
              size={1.5}
              brokerUrl="wss://test.mosquitto.org:8081"
              topic="power/relay"
            />
          </div>

          {/* Appliance Info */}
          <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm text-sm text-gray-100 space-y-2">
            <h2
              className={`font-semibold flex items-center gap-2 -ml-4 ${
                rating.includes("Low")
                  ? "text-green-800"
                  : rating.includes("Medium")
                  ? "text-yellow-800"
                  : "text-red-800"
              }`}
            >
              {rating.includes("Low") && <Lightbulb className="size-5" />}
              {rating.includes("Medium") && <Tv className="size-5" />}
              {rating.includes("High") && <AirVent className="size-5" />}
              {activeRating?.heading}
            </h2>
            <ul className="list-disc list-inside">
              {activeRating?.appliances.map((item, i) => (
                <li key={i} className="text-black">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Right: Live Readings (MQTT updates) */}
      <div className="grid mt-2 grid-cols-2 3xl:grid-cols-3 gap-4">
        <Reading
          title="Current"
          titleSvg="/Current.svg"
          unit="A"
          graphColor="var(--chart-2)"
        />
        <Reading
          title="Voltage"
          titleSvg="/Voltage.svg"
          unit="V"
          graphColor="var(--chart-3)"
        />
        <Reading
          title="Power"
          titleSvg="/Power.svg"
          unit="W"
          graphColor="var(--chart-1)"
        />
        <Reading
          title="Energy"
          titleSvg="/Energy.svg"
          unit="kWh"
          graphColor="var(--chart-4)"
        />
        <Reading
          title="Frequency"
          titleSvg="/Frequency.svg"
          unit="Hz"
          graphColor="var(--chart-5)"
        />
        <Reading
          title="Power Factor"
          titleSvg="/PowerFactor.svg"
          graphColor="var(--chart-6)"
        />
      </div>
    </div>
  );
};

export default Hero;

// -------------------- Power Rating Categories --------------------
const Ratings = [
  {
    title: "No Load (0W)",
    image: "/lowload.jpg",
    heading: "No Power Consumption",
    appliances: ["No devices currently consuming power"],
  },
  {
    title: "Low Power Load (0-10W)",
    image: "/lowload.jpg",
    heading: "Typical Low Power Devices",
    appliances: [
      "LED bulbs, chargers, Wi-Fi routers",
      "Clocks, mobile devices, or small lamps",
    ],
  },
  {
    title: "Medium Power Load (10-30W)",
    image: "/mediumload.jpg",
    heading: "Typical Medium Power Devices",
    appliances: [
      "Televisions, refrigerators, desktop PCs",
      "Microwaves, fans, or water pumps",
    ],
  },
  {
    title: "High Power Load (Above 30W)",
    image: "/highload.jpg",
    heading: "Typical High Power Devices",
    appliances: [
      "Air conditioners, geysers, or irons",
      "Heaters, washing machines, induction cooktops",
    ],
  },
];
