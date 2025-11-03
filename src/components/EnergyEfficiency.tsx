import { Leaf } from "lucide-react";

const EnergyEfficiency = () => {
  return (
    <div className="flex flex-col bg-white p-2 rounded-xl">
      <div className="flex mx-auto mt-2">
        <h3 className="inline-flex justify-center items-center text-xl text-center font-semibold">
          <span className="mr-1">
              <Leaf fill="green"/>
          </span>
          Energy Efficiency Score
        </h3>
      </div>
      <div className="mt-4">
        <p className="text-center">((todayUsage - avgUsage)/avgUsage)*100</p>
        <p className="text-center text-6xl mt-4">32</p>
      </div>
    </div>
  );
};

export default EnergyEfficiency;
