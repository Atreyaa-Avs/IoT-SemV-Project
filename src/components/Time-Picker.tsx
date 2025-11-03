import type { WheelPickerOption } from "@/components/wheel-picker";
import { WheelPicker, WheelPickerWrapper } from "@/components/wheel-picker";

// Utility: Generate numeric hour/minute options
const createArray = (length: number, add = 0): WheelPickerOption[] =>
  Array.from({ length }, (_, i) => {
    const value = i + add;
    return {
      label: value.toString().padStart(2, "0"),
      value: value.toString(),
    };
  });

// Utility: Generate date options (e.g. "31 Oct, Friday")
const createDayOptions = (daysCount = 31): WheelPickerOption[] => {
  const options: WheelPickerOption[] = [];
  const today = new Date();

  for (let i = 0; i < daysCount; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" }); // Oct
    const weekday = date.toLocaleString("default", { weekday: "long" }); // Thursday

    options.push({
      label: `${day} ${month}, ${weekday}`,
      value: date.toISOString(), // ISO string for easier parsing later
    });
  }

  return options;
};

const dayOptions = createDayOptions(31);
const hourOptions = createArray(12, 1);
const minuteOptions = createArray(60);
const meridiemOptions: WheelPickerOption[] = [
  { label: "AM", value: "AM" },
  { label: "PM", value: "PM" },
];

interface TimePickerProps {
  time: {
    day: string;
    hours: string;
    minutes: string;
    meridiem: string;
  };
  setTime: (value: {
    day: string;
    hours: string;
    minutes: string;
    meridiem: string;
  }) => void;
}

function TimePicker({ time, setTime }: TimePickerProps) {
  const handleChange = (field: keyof typeof time, value: string) => {
    const updated = { ...time, [field]: value };
    setTime(updated);
  };

  return (
    <div className="w-xl">
      <WheelPickerWrapper>
        <div className="w-xs">
          <WheelPicker
            options={dayOptions}
            defaultValue={time.day}
            onValueChange={(val) => handleChange("day", val)}
          />
        </div>

        <WheelPicker
          options={hourOptions}
          defaultValue={time.hours}
          infinite
          scrollSensitivity={50}
          onValueChange={(val) => handleChange("hours", val)}
        />
        <WheelPicker
          options={minuteOptions}
          defaultValue={time.minutes}
          infinite
          onValueChange={(val) => handleChange("minutes", val)}
        />
        <WheelPicker
          options={meridiemOptions}
          defaultValue={time.meridiem}
          onValueChange={(val) => handleChange("meridiem", val)}
        />
      </WheelPickerWrapper>
    </div>
  );
}

export { TimePicker, dayOptions };
