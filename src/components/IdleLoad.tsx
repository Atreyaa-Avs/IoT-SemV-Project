import { ActivityIcon, Joystick } from "lucide-react";
import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const IdleLoad = () => {
  const [timerCustom, setTimerCustom] = useState<string>("");
  return (
    <div className="flex flex-col bg-white p-2 rounded-xl">
      <div className="flex mx-auto mt-2">
        <h3 className="inline-flex justify-center items-center text-xl text-center font-semibold">
          <span className="mr-2">
            <ActivityIcon />
          </span>
          Is Idle?
        </h3>
      </div>
      <div className="mt-4">
        <div className="">
          <p className="text-center text-sm">{"(current > 0.05 && current < 0.2 && idleTime > 300000)"}</p>
          <p className="text-center text-6xl mt-4">32</p>
        </div>
      </div>
    </div>
  );
};

export default IdleLoad;
