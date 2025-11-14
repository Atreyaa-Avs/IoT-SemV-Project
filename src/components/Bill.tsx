"use client";
import { useEffect, useState, useRef } from "react";
import { ExternalLink, ReceiptIndianRupee, TrendingUp } from "lucide-react";
import ToolTip from "./ToolTip";
import { subscribeToReadings } from "../lib/readings";
import * as tf from "@tensorflow/tfjs";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type Point = { time: string; energy: number };

const INPUT_SEQ = 3; // match model input length
const FORECAST_STEPS = 30;

const RATE_PER_KWH = 6.75;
const FIXED_CHARGE = 50;
const FAC_RATE = 0.05;
const TAX_RATE = 0.09;

const Bill = () => {
  const [chartData, setChartData] = useState<Point[]>([]);
  const [predictedData, setPredictedData] = useState<Point[]>([]);
  const [billValues, setBillValues] = useState({
    energy: 0,
    fixed: FIXED_CHARGE,
    subtotal: 0,
    fac: 0,
    tax: 0,
    total: 0,
  });
  const [forecastValues, setForecastValues] = useState({
    energy: 0,
    subtotal: 0,
    fac: 0,
    tax: 0,
    total: 0,
  });
  const [isForecasting, setIsForecasting] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [model, setModel] = useState<tf.LayersModel | null>(null);

  const energyRef = useRef<number[]>([]);

  // -----------------------------
  // Load TensorFlow.js Model Once
  // -----------------------------
  useEffect(() => {
    async function loadModel() {
      try {
        const loadedModel = await tf.loadLayersModel("/models/model.json");
        setModel(loadedModel);
        setModelLoaded(true);
        console.log("✅ Model loaded successfully!");
      } catch (err) {
        console.error("❌ Error loading model:", err);
        setModelLoaded(false);
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
      console.log("Raw Energy (Wh):", rawEnergyWh);
      const energy_kWh = rawEnergyWh / 1000;

      setChartData((prev) => {
        const next = [
          ...prev.slice(-99),
          {
            time: new Date().toLocaleTimeString("en-IN", {
              minute: "2-digit",
              second: "2-digit",
            }),
            energy: energy_kWh,
          },
        ];

        energyRef.current = next.map((d) => d.energy);

        // Calculate actual bill
        const totalEnergy = next.reduce((sum, p) => sum + p.energy, 0);
        const energyCharge = totalEnergy * RATE_PER_KWH;
        const subtotal = energyCharge + FIXED_CHARGE;
        const fac = subtotal * FAC_RATE;
        const tax = subtotal * TAX_RATE;
        const total = subtotal + fac + tax;

        setBillValues({
          energy: energyCharge,
          fixed: FIXED_CHARGE,
          subtotal,
          fac,
          tax,
          total,
        });

        return next;
      });
    });

    return () => unsub?.();
  }, []); // ✅ run once

  // -----------------------------
  // Trigger Forecast
  // -----------------------------
  useEffect(() => {
    if (!modelLoaded) return;
    if (
      energyRef.current.length >= INPUT_SEQ &&
      !isForecasting &&
      countdown === null
    ) {
      setCountdown(5); // short countdown for demo
    }
  }, [chartData, modelLoaded]);

  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      if (model) forecastNextSteps(model, energyRef.current);
      setCountdown(null);
      return;
    }

    const timer = setTimeout(
      () => setCountdown((prev) => (prev !== null ? prev - 1 : null)),
      1000
    );
    return () => clearTimeout(timer);
  }, [countdown]);

  // -----------------------------
  // Forecast Function
  // -----------------------------
  async function forecastNextSteps(model: tf.LayersModel, data: number[]) {
    try {
      setIsForecasting(true);

      const min = Math.min(...data);
      const max = Math.max(...data);
      const range = max - min || 1; // prevent division by zero
      const scaled = data.map((v) => (v - min) / range);

      let input = scaled.slice(-INPUT_SEQ);
      const predictions: number[] = [];

      for (let i = 0; i < FORECAST_STEPS; i++) {
        const inputTensor = tf.tensor(input).reshape([1, INPUT_SEQ, 1]);
        const predTensor = model.predict(inputTensor) as tf.Tensor;
        const predValue = (await predTensor.data())[0];
        predictions.push(predValue);
        console.log("Prediced Value:",predValue)

        input = input.slice(1).concat(predValue);

        inputTensor.dispose();
        predTensor.dispose();
      }

      const invScaled = predictions.map((v) => v * range + min);
      const lastTime = new Date();
      const predictedPoints: Point[] = invScaled.map((p, i) => ({
        time: new Date(lastTime.getTime() + (i + 1) * 1000).toLocaleTimeString(
          "en-IN",
          { minute: "2-digit", second: "2-digit" }
        ),
        energy: p,
      }));

      setPredictedData(predictedPoints);

      // Forecast billing
      const forecastEnergy = predictedPoints.reduce(
        (sum, p) => sum + p.energy,
        0
      );
      const forecastEnergyCharge = forecastEnergy * RATE_PER_KWH;
      const forecastSubtotal = forecastEnergyCharge + FIXED_CHARGE;
      const forecastFAC = forecastSubtotal * FAC_RATE;
      const forecastTax = forecastSubtotal * TAX_RATE;
      const forecastTotal = forecastSubtotal + forecastFAC + forecastTax;

      setForecastValues({
        energy: forecastEnergyCharge,
        subtotal: forecastSubtotal,
        fac: forecastFAC,
        tax: forecastTax,
        total: forecastTotal,
      });
    } catch (err) {
      console.error("❌ Forecast error:", err);
    } finally {
      setIsForecasting(false);
    }
  }

  // -----------------------------
  // Chart Data
  // -----------------------------
  const chartCombinedData = [
    ...chartData.map((d) => ({ time: d.time, actual: d.energy })),
    ...predictedData.map((d) => ({ time: d.time, predicted: d.energy })),
  ];

  const chartConfig = {
    actual: { label: "Actual", color: "var(--chart-1)" },
    predicted: { label: "Predicted", color: "var(--chart-2)" },
  } satisfies ChartConfig;

  // -----------------------------
  // UI Rendering
  // -----------------------------
  return (
    <div className="flex flex-col bg-accent rounded-xl mt-2 h-full p-4">
      <div className="flex justify-between items-center">
        <h3 className="inline-flex gap-1 text-3xl tracking-tight font-semibold items-center my-5">
          <ReceiptIndianRupee />
          Bill Estimation {isForecasting ? "(Forecasting...)" : ""}
          <a
            href="https://bescom.karnataka.gov.in/storage/pdf-files/RA%20section/ElectricityTariff2025.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="ml-1 inline-flex text-xs font-normal tracking-normal items-center gap-1">
              (According to BESCOM Tariff) <ExternalLink size={15} />
            </span>
          </a>
        </h3>
        <div>
          {!modelLoaded && (
            <p className="text-sm text-red-600">TensorFlow model loading...</p>
          )}
          {modelLoaded && countdown !== null && !isForecasting && (
            <p className="text-sm text-gray-700 -mt-4 mb-2">
              Forecast starts in:{" "}
              <span className="font-semibold">{countdown}s</span>
            </p>
          )}
          {isForecasting && (
            <p className="text-sm text-green-700 -mt-4 mb-2">
              Forecasting in progress...
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        {/* Left side Chart */}
        <div className="my-auto col-span-2 w-full">
          <Card>
            <CardHeader>
              <CardTitle>Energy Consumption</CardTitle>
              <CardDescription>
                Live + Forecasted energy usage (kWh)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <AreaChart
                  data={chartCombinedData}
                  margin={{ left: 12, right: 12 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="time"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />
                  <defs>
                    <linearGradient id="fillActual" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--color-actual)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-actual)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient
                      id="fillPredicted"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--color-predicted)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-predicted)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <Area
                    type="natural"
                    dataKey="actual"
                    stroke="var(--color-actual)"
                    fill="url(#fillActual)"
                    stackId="a"
                  />
                  <Area
                    type="natural"
                    dataKey="predicted"
                    stroke="var(--color-predicted)"
                    fill="url(#fillPredicted)"
                    stackId="a"
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
            <CardFooter>
              <div className="flex w-full items-start gap-2 text-sm">
                <div className="grid gap-2">
                  <div className="flex items-center gap-2 leading-none font-medium">
                    Trending up by forecast <TrendingUp className="h-4 w-4" />
                  </div>
                  <div className="text-muted-foreground flex items-center gap-2 leading-none">
                    Live & Predicted data
                  </div>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Right side Table */}
        <div className="flex flex-col h-full bg-white rounded-xl p-4 overflow-x-auto shadow-md">
          <table className="min-w-full border border-gray-300 text-sm md:text-base text-left my-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="border-b border-gray-300 px-5 py-4 text-xl font-semibold">
                  Charges
                </th>
                <th className="border-b border-gray-300 px-5 py-4 text-xl font-semibold text-center">
                  Current
                </th>
                <th className="border-b border-gray-300 px-5 py-4 text-xl font-semibold text-center">
                  Forecasted
                </th>
              </tr>
            </thead>
            <tbody className="min-h-full">
              <tr className="text-lg">
                <td className="border-b px-3 py-5 flex items-center gap-2 font-semibold">
                  1. Energy Charges{" "}
                  <ToolTip content="(energy_kWh x ₹6.75/kWh)" />
                </td>
                <td className="border-b px-3 py-2 text-center">
                  ₹ {billValues.energy.toFixed(2)}
                </td>
                <td className="border-b px-3 py-2 text-center">
                  ₹ {forecastValues.energy.toFixed(2)}
                </td>
              </tr>
              <tr className="text-lg">
                <td className="border-b px-3 py-5 flex items-center gap-2 font-semibold">
                  2. Fixed Charges <ToolTip content="(flat ₹50)" />
                </td>
                <td className="border-b px-3 py-2 text-center">
                  ₹ {billValues.fixed.toFixed(2)}
                </td>
                <td className="border-b px-3 py-2 text-center">
                  ₹ {billValues.fixed.toFixed(2)}
                </td>
              </tr>
              <tr className="text-lg">
                <td className="border-b px-3 py-5 flex items-center gap-2 font-semibold">
                  3. Subtotal <ToolTip content="(Energy + Fixed)" />
                </td>
                <td className="border-b px-3 py-2 text-center">
                  ₹ {billValues.subtotal.toFixed(2)}
                </td>
                <td className="border-b px-3 py-2 text-center">
                  ₹ {forecastValues.subtotal.toFixed(2)}
                </td>
              </tr>
              <tr className="text-lg">
                <td className="border-b px-3 py-5 flex items-center gap-2 font-semibold">
                  4. FAC <ToolTip content="5% of Subtotal" />
                </td>
                <td className="border-b px-3 py-2 text-center">
                  ₹ {billValues.fac.toFixed(2)}
                </td>
                <td className="border-b px-3 py-2 text-center">
                  ₹ {forecastValues.fac.toFixed(2)}
                </td>
              </tr>
              <tr className="text-lg">
                <td className="border-b px-3 py-5 flex items-center gap-2 font-semibold">
                  5. Electricity Taxes <ToolTip content="(9% of Subtotal)" />
                </td>
                <td className="border-b px-3 py-2 text-center">
                  ₹ {billValues.tax.toFixed(2)}
                </td>
                <td className="border-b px-3 py-2 text-center">
                  ₹ {forecastValues.tax.toFixed(2)}
                </td>
              </tr>
              <tr className="font-semibold text-lg">
                <td className="px-3 py-5 flex items-center gap-2 text-2xl">
                  Total <ToolTip content="(Sum of all charges)" />
                </td>
                <td className="px-3 py-3 text-center text-3xl font-bold text-green-700 whitespace-nowrap tracking-tight">
                  ₹ {billValues.total.toFixed(2)}
                </td>
                <td className="px-3 py-3 text-center text-3xl font-bold text-green-700 whitespace-nowrap tracking-tight">
                  ₹ {forecastValues.total.toFixed(2)}
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
