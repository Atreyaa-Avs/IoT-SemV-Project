"use client";
import { useEffect, useState } from "react";
import { ExternalLink, ReceiptIndianRupee } from "lucide-react";
import { Graph } from "./ui/Graph";
import ToolTip from "./ToolTip";
import { subscribeToReadings } from "../lib/readings";

const Bill = () => {
  // live and predicted data (example structure)
  const [chartData, setChartData] = useState<{ time: string; current: number; predicted: number }[]>([]);
  const [billValues, setBillValues] = useState({
    energy: 0,
    fixed: 0,
    subtotal: 0,
    fac: 0,
    tax: 0,
    total: 0,
  });

  useEffect(() => {
    const unsubscribe = subscribeToReadings((data) => {
      const currentEnergy = data.energy || 0;
      const predictedEnergy = currentEnergy * 1.02; // simulate +2% growth
      const energyCharge = currentEnergy * 6.75; // example tariff ₹6.75 per kWh
      const fixedCharge = 50; // example fixed charge
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

      setChartData((prev) => [
        ...prev.slice(-9),
        {
          time: new Date().toLocaleTimeString("en-IN", { minute: "2-digit", second: "2-digit" }),
          current: currentEnergy,
          predicted: predictedEnergy,
        },
      ]);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col bg-accent rounded-xl mt-2 h-full p-3">
      <h3 className="inline-flex gap-1 text-2xl font-semibold items-center my-2">
        <ReceiptIndianRupee />
        Bill Estimation
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
          <Graph
            data={chartData}
            config={{
              current: { label: "Current", color: "var(--chart-1)" },
              predicted: { label: "Predicted", color: "var(--chart-2)" },
            }}
          />
        </div>

        {/* Right side Table */}
        <div className="bg-white rounded-xl p-4 overflow-x-auto shadow-md">
          <table className="min-w-full border border-gray-300 text-sm md:text-base text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="border-b border-gray-300 px-3 py-2 font-semibold">Charges</th>
                <th className="border-b border-gray-300 px-3 py-2 font-semibold text-center">Current</th>
                <th className="border-b border-gray-300 px-3 py-2 font-semibold text-center">Predicted</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td className="border-b px-3 py-2 flex items-center gap-2">
                  1. Energy Charges <ToolTip content="(energy_kWh * ₹6.75/kWh)" />
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
                  2. Fixed Charges <ToolTip content="(sanctioned_load_kW * ₹50/kW)" />
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
