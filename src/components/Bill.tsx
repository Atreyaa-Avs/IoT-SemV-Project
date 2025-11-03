"use client";
import { useEffect, useState, useRef } from "react";
import { ExternalLink, ReceiptIndianRupee } from "lucide-react";
import ToolTip from "./ToolTip";
import { subscribeToReadings } from "../lib/readings";
import * as tf from "@tensorflow/tfjs";
import GraphforPredictiton from "./ui/GraphforPrediction";

type Point = { time: string; energy: number };

const MIN_POINTS = 30;
const PREDICT_STEPS = 30;

const Bill = () => {
  const [chartData, setChartData] = useState<Point[]>([]);
  const [predictedData, setPredictedData] = useState<Point[]>([]);
  const [isTraining, setIsTraining] = useState(false);

  const [billValues, setBillValues] = useState({
    energy: 0,
    fixed: 0,
    subtotal: 0,
    fac: 0,
    tax: 0,
    total: 0,
  });

  const energyRef = useRef<number[]>([]);

  // Subscribe to live readings
  useEffect(() => {
    const unsub = subscribeToReadings((data) => {
      const energy_kWh = Number(data.energy || 0);
      const predictedEnergy = energy_kWh * 1.02;

      const energyCharge = energy_kWh * 6.75;
      const fixedCharge = 50;
      const subtotal = energyCharge + fixedCharge;
      const fac = subtotal * 0.05;
      const tax = subtotal * 0.09 + 50;
      const total = subtotal + fac + tax;

      setBillValues({
        energy: energyCharge,
        fixed: fixedCharge,
        subtotal,
        fac,
        tax,
        total,
      });

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
        return next;
      });
    });
    return () => unsub?.();
  }, []);

  // When we have enough data, train regression and predict
  useEffect(() => {
    const energies = energyRef.current;
    if (energies.length >= MIN_POINTS && !isTraining) {
      runRegressionAndPredict(energies)
        .then((preds) => setPredictedData(preds))
        .catch((err) => console.error("Regression error:", err));
    }
  }, [chartData]);

  async function runRegressionAndPredict(energies: number[]): Promise<Point[]> {
    setIsTraining(true);

    // Prepare training data (x = index, y = energy)
    const xs = tf.tensor1d(energies.map((_, i) => i));
    const ys = tf.tensor1d(energies);

    // Simple Dense Regression model
    const model = tf.sequential();
    model.add(tf.layers.dense({ inputShape: [1], units: 16, activation: "relu" }));
    model.add(tf.layers.dense({ units: 8, activation: "relu" }));
    model.add(tf.layers.dense({ units: 1 }));

    model.compile({ optimizer: tf.train.adam(0.01), loss: "meanSquaredError" });

    // Train the model
    await model.fit(xs, ys, { epochs: 80, verbose: 0 });

    // Predict next N values
    const nextXs = tf.tensor1d(
      Array.from({ length: PREDICT_STEPS }, (_, i) => energies.length + i)
    );
    const predYs = model.predict(nextXs) as tf.Tensor;
    const preds = Array.from(await predYs.data());

    // Cleanup
    xs.dispose();
    ys.dispose();
    nextXs.dispose();
    predYs.dispose();
    model.dispose();
    tf.disposeVariables();

    // Build predicted data points with timestamps
    const lastTime = new Date();
    const predicted: Point[] = preds.map((p, i) => {
      const t = new Date(lastTime.getTime() + (i + 1) * 1000);
      return {
        time: t.toLocaleTimeString("en-IN", { minute: "2-digit", second: "2-digit" }),
        energy: p,
      };
    });

    setIsTraining(false);
    return predicted;
  }

  return (
    <div className="flex flex-col bg-accent rounded-xl mt-2 h-full p-3">
      <h3 className="inline-flex gap-1 text-2xl font-semibold items-center my-2">
        <ReceiptIndianRupee />
        Bill Estimation {isTraining ? "(Training...)" : ""}
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
        <div className="my-auto">
          <GraphforPredictiton actualData={chartData} predictedData={predictedData} />
        </div>

        {/* Right side Table */}
        <div className="bg-white rounded-xl p-4 overflow-x-auto shadow-md">
          <table className="min-w-full border border-gray-300 text-sm md:text-base text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="border-b border-gray-300 px-3 py-2 font-semibold">
                  Charges
                </th>
                <th className="border-b border-gray-300 px-3 py-2 font-semibold text-center">
                  Current
                </th>
                <th className="border-b border-gray-300 px-3 py-2 font-semibold text-center">
                  Predicted
                </th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td className="border-b px-3 py-2 flex items-center gap-2">
                  1. Energy Charges <ToolTip content="(energy_kWh × ₹6.75/kWh)" />
                </td>
                <td className="border-b px-3 py-2 text-center">
                  ₹ {billValues.energy.toFixed(2)}
                </td>
                <td className="border-b px-3 py-2 text-center">
                  ₹ {(billValues.energy * 1.02).toFixed(2)}
                </td>
              </tr>

              <tr>
                <td className="border-b px-3 py-2 flex items-center gap-2">
                  2. Fixed Charges <ToolTip content="(sanctioned_load × ₹50)" />
                </td>
                <td className="border-b px-3 py-2 text-center">
                  ₹ {billValues.fixed.toFixed(2)}
                </td>
                <td className="border-b px-3 py-2 text-center">
                  ₹ {billValues.fixed.toFixed(2)}
                </td>
              </tr>

              <tr>
                <td className="border-b px-3 py-2 flex items-center gap-2">
                  3. Subtotal <ToolTip content="(Energy + Fixed)" />
                </td>
                <td className="border-b px-3 py-2 text-center">
                  ₹ {billValues.subtotal.toFixed(2)}
                </td>
                <td className="border-b px-3 py-2 text-center">
                  ₹ {(billValues.subtotal * 1.02).toFixed(2)}
                </td>
              </tr>

              <tr>
                <td className="border-b px-3 py-2 flex items-center gap-2">
                  4. FAC <ToolTip content="5% of Subtotal" />
                </td>
                <td className="border-b px-3 py-2 text-center">
                  ₹ {billValues.fac.toFixed(2)}
                </td>
                <td className="border-b px-3 py-2 text-center">
                  ₹ {(billValues.fac * 1.02).toFixed(2)}
                </td>
              </tr>

              <tr>
                <td className="border-b px-3 py-2 flex items-center gap-2">
                  5. Electricity Taxes <ToolTip content="(Subtotal + FAC + ₹50)" />
                </td>
                <td className="border-b px-3 py-2 text-center">
                  ₹ {billValues.tax.toFixed(2)}
                </td>
                <td className="border-b px-3 py-2 text-center">
                  ₹ {(billValues.tax * 1.02).toFixed(2)}
                </td>
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
