import { useState } from "react";

const Switcher = ({ size = 1 } : {size: number}) => {
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = () => setIsChecked(!isChecked);

  // Dynamic scaling — all dimensions multiply by `size`
  const scale = {
    trackWidth: 56 * size,
    trackHeight: 20 * size,
    dotSize: 24 * size,
    dotTranslate: 32 * size,
  };

  return (
    <label className="flex cursor-pointer select-none items-center">
      <div
        className="relative"
        style={{ width: scale.trackWidth, height: scale.dotSize }}
      >
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleCheckboxChange}
          className="sr-only"
        />

        {/* Track */}
        <div
          className={`rounded-full shadow-inner transition-colors duration-300 ${
            isChecked ? "bg-[#EAEEFB]" : "bg-gray-400"
          }`}
          style={{
            width: scale.trackWidth,
            height: scale.trackHeight,
          }}
        ></div>

        {/* Dot */}
        <div
          className={`absolute flex items-center justify-center rounded-full bg-white shadow-md transition-all duration-300 ease-in-out ${
            isChecked ? "translate-x-[calc(var(--tx))]" : "translate-x-0"
          }`}
          style={{
            width: scale.dotSize,
            height: scale.dotSize,
            top: `-${(scale.dotSize - scale.trackHeight) / 2}px`,
            ["--tx" as any]: `${scale.dotTranslate}px`,
          }}
        >
          <span
            className={`rounded-full border transition-colors duration-300 ${
              isChecked
                ? "bg-blue-500 border-white"
                : "bg-black border-white"
            }`}
            style={{
              width: 12 * size,
              height: 12 * size,
            }}
          ></span>
        </div>
      </div>
    </label>
  );
};

export default Switcher;