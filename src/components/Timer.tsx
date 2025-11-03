import { useState, useEffect } from "react";
import { TimePicker, dayOptions } from "./Time-Picker";

const Timer = () => {
  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const meridiem = hours >= 12 ? "PM" : "AM";
    const hour12 = ((hours + 11) % 12) + 1;

    // Find the "dayOptions" entry that matches today's date
    const todayOption = dayOptions.find((opt) => {
      const optDate = new Date(opt.value);
      return (
        optDate.getDate() === now.getDate() &&
        optDate.getMonth() === now.getMonth() &&
        optDate.getFullYear() === now.getFullYear()
      );
    });

    return {
      day: todayOption?.value ?? dayOptions[0].value, // always valid ISO string
      hours: hour12.toString(),
      minutes: minutes.toString().padStart(2, "0"),
      meridiem,
    };
  };

  const [timer, setTimer] = useState(getCurrentTime);

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date()); // updates every minute
    }, 60 * 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(getCurrentTime());
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const selectedDayLabel =
    dayOptions.find((d) => d.value === timer.day)?.label ?? "";

  return (
    <div className="p-4">
      <TimePicker key={now.toISOString()} time={timer} setTime={setTimer} />
      <div className="mt-4 text-center text-gray-700">
        Selected Time: {selectedDayLabel} - {timer.hours}:{timer.minutes}{" "}
        {timer.meridiem}
      </div>
    </div>
  );
};

export default Timer;
