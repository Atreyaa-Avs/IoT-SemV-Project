"use client";
import { useEffect, useState, useRef } from "react";
import { ExternalLink, ReceiptIndianRupee } from "lucide-react";
import ToolTip from "./ToolTip";
import { subscribeToReadings } from "../lib/readings";
import * as tf from "@tensorflow/tfjs";
import GraphforPrediction from "./ui/GraphforPrediction";

type Point = { time: string; energy: number };

const INPUT_SEQ = 60; // same as model input length
const FORECAST_STEPS = 30;

const Bill = () => {
  const [chartData, setChartData] = useState<Point[]>([]);
  const [predictedData, setPredictedData] = useState<Point[]>([]);
  const [billValues, setBillValues] = useState({
    energy: 0,
    fixed: 0,
    subtotal: 0,
    fac: 0,
    tax: 0,
    total: 0,
  });
  const [isForecasting, setIsForecasting] = useState(false);
  const [model, setModel] = useState<tf.LayersModel | null>(null);

  const energyRef = useRef<number[]>([]);

  // Tariff constants
  const RATE_PER_KWH = 6.75;
  const FIXED_CHARGE = 50;
  const FAC_RATE = 0.05;
  const TAX_RATE = 0.09;

  // -----------------------------
  // Load TensorFlow.js Model Once
  // -----------------------------
  useEffect(() => {
    async function loadModel() {
      try {
        const loadedModel = await tf.loadLayersModel("/models/forecast_model/model.json");
        setModel(loadedModel);
        console.log("✅ Model loaded successfully!");
      } catch (err) {
        console.error("❌ Error loading model:", err);
      }
    }
    loadModel();
  }, []);

  // -----------------------------
  // Live data subscription
  // -----------------------------
  useEffect(() => {
    const unsub = subscribeToReadings((data) => {
      const rawEnergyWh = Number(data.energy || 0);
      const energy_kWh = rawEnergyWh / 1000;

      // Apply slight drift for low loads
      const minChange = 0.000002;
      const amplify = 10;
      let adjustedEnergy = energy_kWh;

      if (chartData.length > 0) {
        const last = chartData[chartData.length - 1].energy;
        let delta = energy_kWh - last;
        if (Math.abs(delta) < minChange) {
          delta = minChange * (Math.random() > 0.5 ? 1 : -1);
        }
        adjustedEnergy = last + delta * amplify;
      }

      // Bill calculation
      const energyCharge = adjustedEnergy * RATE_PER_KWH;
      const fixedCharge = FIXED_CHARGE;
      const subtotal = energyCharge + fixedCharge;
      const fac = subtotal * FAC_RATE;
      const tax = subtotal * TAX_RATE;
      const total = subtotal + fac + tax;

      setBillValues({ energy: energyCharge, fixed: fixedCharge, subtotal, fac, tax, total });

      // Chart data update
      setChartData((prev) => {
        const next = [
          ...prev.slice(-99),
          {
            time: new Date().toLocaleTimeString("en-IN", {
              minute: "2-digit",
              second: "2-digit",
            }),
            energy: adjustedEnergy,
          },
        ];
        energyRef.current = next.map((d) => d.energy);
        return next;
      });
    });

    return () => unsub?.();
  }, []);

  // -----------------------------
  // Run Forecast when data updates
  // -----------------------------
  useEffect(() => {
    if (model && energyRef.current.length >= INPUT_SEQ && !isForecasting) {
      forecastNextSteps(model, energyRef.current);
    }
  }, [chartData, model]);

  // -----------------------------
  // Forecast Function
  // -----------------------------
  async function forecastNextSteps(model: tf.LayersModel, data: number[]) {
    try {
      setIsForecasting(true);
      const min = Math.min(...data);
      const max = Math.max(...data);
      const scaled = data.map((v) => (v - min) / (max - min));

      let input = scaled.slice(-INPUT_SEQ);
      let predictions: number[] = [];

      for (let i = 0; i < FORECAST_STEPS / 10; i++) {
        const inputTensor = tf.tensor(input).reshape([1, INPUT_SEQ, 1]);
        const predScaled = model.predict(inputTensor) as tf.Tensor;
        const predArray = Array.from(await predScaled.data());
        predictions.push(...predArray);
        input = input.slice(10).concat(predArray);
        inputTensor.dispose();
        predScaled.dispose();
      }

      const invScaled = predictions.map((v) => v * (max - min) + min);
      const lastTime = new Date();
      const predicted: Point[] = invScaled.map((p, i) => {
        const t = new Date(lastTime.getTime() + (i + 1) * 1000);
        return {
          time: t.toLocaleTimeString("en-IN", {
            minute: "2-digit",
            second: "2-digit",
          }),
          energy: p,
        };
      });

      setPredictedData(predicted);
    } catch (err) {
      console.error("❌ Forecast error:", err);
    } finally {
      setIsForecasting(false);
    }
  }

  // -----------------------------
  // UI Rendering
  // -----------------------------
  return (
    <div className="flex flex-col bg-accent rounded-xl mt-2 h-full p-3">
      <h3 className="inline-flex gap-1 text-2xl font-semibold items-center my-2">
        <ReceiptIndianRupee />
        Bill Estimation {isForecasting ? "(Forecasting...)" : ""}
        <a
          href="https://bescom.karnataka.gov.in/storage/pdf-files/RA%20section/ElectricityTariff2025.pdf"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="inline-flex text-xs font-normal items-center gap-1">
            (According to BESCOM Tariff) <ExternalLink size={15} />
          </span>
        </a>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-auto">
        {/* Left side Graph */}
        <div className="my-auto w-full">
          <GraphforPrediction actualData={chartData} predictedData={predictedData} />
        </div>

        {/* Right side Table */}
        <div className="bg-white rounded-xl p-4 overflow-x-auto shadow-md">
          <table className="min-w-full border border-gray-300 text-sm md:text-base text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="border-b border-gray-300 px-3 py-2 font-semibold">Charges</th>
                <th className="border-b border-gray-300 px-3 py-2 font-semibold text-center">Current</th>
                <th className="border-b border-gray-300 px-3 py-2 font-semibold text-center">Forecasted</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-b px-3 py-2 flex items-center gap-2">
                  1. Energy Charges <ToolTip content="(energy_kWh × ₹6.75/kWh)" />
                </td>
                <td className="border-b px-3 py-2 text-center">₹ {billValues.energy.toFixed(2)}</td>
                <td className="border-b px-3 py-2 text-center">₹ {(billValues.energy * 1.02).toFixed(2)}</td>
              </tr>
              <tr>
                <td className="border-b px-3 py-2 flex items-center gap-2">
                  2. Fixed Charges <ToolTip content="(flat ₹50)" />
                </td>
                <td className="border-b px-3 py-2 text-center">₹ {billValues.fixed.toFixed(2)}</td>
                <td className="border-b px-3 py-2 text-center">₹ {(billValues.fixed * 1.02).toFixed(2)}</td>
              </tr>
              <tr>
                <td className="border-b px-3 py-2 flex items-center gap-2">
                  3. Subtotal <ToolTip content="(Energy + Fixed)" />
                </td>
                <td className="border-b px-3 py-2 text-center">₹ {billValues.subtotal.toFixed(2)}</td>
                <td className="border-b px-3 py-2 text-center">₹ {(billValues.subtotal * 1.02).toFixed(2)}</td>
              </tr>
              <tr>
                <td className="border-b px-3 py-2 flex items-center gap-2">
                  4. FAC <ToolTip content="5% of Subtotal" />
                </td>
                <td className="border-b px-3 py-2 text-center">₹ {billValues.fac.toFixed(2)}</td>
                <td className="border-b px-3 py-2 text-center">₹ {(billValues.fac * 1.02).toFixed(2)}</td>
              </tr>
              <tr>
                <td className="border-b px-3 py-2 flex items-center gap-2">
                  5. Electricity Taxes <ToolTip content="(9% of Subtotal)" />
                </td>
                <td className="border-b px-3 py-2 text-center">₹ {billValues.tax.toFixed(2)}</td>
                <td className="border-b px-3 py-2 text-center">₹ {(billValues.tax * 1.02).toFixed(2)}</td>
              </tr>
              <tr className="font-semibold text-lg">
                <td className="px-3 py-3 flex items-center gap-2 text-xl">
                  Total <ToolTip content="(Sum of all charges)" />
                </td>
                <td className="px-3 py-3 text-center text-xl text-green-700 whitespace-nowrap">
                  ₹ {billValues.total.toFixed(2)}
                </td>
                <td className="px-3 py-3 text-center text-xl text-green-700 whitespace-nowrap">
                  ₹ {(billValues.total * 1.02).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Bill;
