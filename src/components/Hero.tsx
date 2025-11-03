"use client";
import { useEffect, useState } from "react";
import Switcher from "./Switcher";
import { Lightbulb, Tv, AirVent } from "lucide-react";
import Reading from "./Readings";
import { subscribeToReadings } from "../lib/readings";

const Hero = () => {
  const [rating, setRating] = useState(Ratings[0].title);
  const [current, setCurrent] = useState(0);

  // Subscribe to live current readings via MQTT
  useEffect(() => {
    const unsubscribe = subscribeToReadings((data) => {
      setCurrent(data.current || 0);
    });
    return () => unsubscribe();
  }, []);

  // Dynamically adjust power load category
  useEffect(() => {
    if (current == 0) setRating(Ratings[0].title);
    else if (current > 0 && current <= 0.05) setRating(Ratings[2].title);
    else if (current > 10) setRating(Ratings[3].title);
    else setRating(Ratings[1].title);
  }, [current]);

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
            {/* 🔌 Pass broker + topic here */}
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
        />{" "}
        {/* Blue */}
        <Reading
          title="Voltage"
          titleSvg="/Voltage.svg"
          unit="V"
          graphColor="var(--chart-3)"
        />{" "}
        {/* Yellow */}
        <Reading
          title="Power"
          titleSvg="/Power.svg"
          unit="W"
          graphColor="var(--chart-1)"
        />{" "}
        {/* Red */}
        <Reading
          title="Energy"
          titleSvg="/Energy.svg"
          unit="kWh"
          graphColor="var(--chart-4)"
        />{" "}
        {/* Green */}
        <Reading
          title="Frequency"
          titleSvg="/Frequency.svg"
          unit="Hz"
          graphColor="var(--chart-5)"
        />{" "}
        {/* Purple */}
        <Reading
          title="Power Factor"
          titleSvg="/PowerFactor.svg"
          graphColor="var(--chart-6)"
        />{" "}
        {/* Orange */}
      </div>
    </div>
  );
};

export default Hero;

// -------------------- Power Rating Categories --------------------
const Ratings = [
  {
    title: "No Load (0A)",
    image: "/lowload.jpg",
    heading: "Typical Low Load Appliances",
    appliances: [
      "LED bulbs, lamps, or night lights",
      "Mobile and laptop chargers",
      "Wi-Fi routers and alarm clocks",
    ],
  },
  {
    title: "Low Power Load (5-10A)",
    image: "/lowload.jpg",
    heading: "Typical Low Load Appliances",
    appliances: [
      "LED bulbs, lamps, or night lights",
      "Mobile and laptop chargers",
      "Wi-Fi routers and alarm clocks",
    ],
  },
  {
    title: "Medium Power Load (15-30A)",
    image: "/mediumload.jpg",
    heading: "Typical Medium Load Appliances",
    appliances: [
      "Televisions, desktop PCs",
      "Refrigerators and microwave ovens",
      "Ceiling fans and water pumps",
    ],
  },
  {
    title: "High Power Load (30-50A)",
    image: "/highload.jpg",
    heading: "Typical High Load Appliances",
    appliances: [
      "Air conditioners and geysers",
      "Induction cooktops or irons",
      "Washing machines or heaters",
    ],
  },
];
