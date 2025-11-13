import { Plug, Sprout } from "lucide-react";
import { Button } from "./ui/button";
import { AnimatedGradientText } from "./ui/animated-gradient-text";
import toast from "react-hot-toast";
import Modal from "./Modal";

const NavBar = () => {
  return (
    <nav className="mt-2 py-4 px-6 rounded-xl bg-zinc-200">
      <div className="grid grid-cols-3 items-center">
        <div className="flex items-center">
          <img src="/Logo.png" className="size-12 rounded-xl" alt="" />
          <h1 className="text-2xl font-bold ml-4">Smart - EcoPlug</h1>
        </div>

        <div className="justify-self-center bg-black py-2 px-6 rounded-xl">
          <AnimatedGradientText
            speed={2}
            colorFrom="#4ade80"
            colorTo="#06b6d4"
            className="text-xl font-semibold tracking-tight"
          >
            IoT Plug Dashboard
          </AnimatedGradientText>
        </div>

        <div className="flex justify-end gap-4">
          <div className="inline-flex items-center gap-2">
            Status: <StatusIcon />
            <span className="font-semibold tracking-tighter">Connected</span>
          </div>
          {/* <div className="inline-flex items-center gap-2">
            IP Address: <span>127.0.0.1</span>
            <Modal>
              <Button
                className="text-orange-500 bg-white hover:bg-orange-600 hover:text-white cursor-pointer transition-all duration-300"
                onClick={() => toast.success("Hello")}
              >
                <EditIcon />
                <h3>Edit IP</h3>
              </Button>{" "}
            </Modal>
          </div> */}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;

const StatusIcon = () => {
  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute size-2 rounded-full bg-green-400 animate-ping" />
      <div className="size-2 rounded-full bg-green-500" />
    </div>
  );
};

const EditIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      className="lucide lucide-pencil-icon lucide-pencil"
    >
      <g transform="">
        <g transform="scale(0.8) translate(3,0)">
          <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
          <path d="m15 5 4 4" />
        </g>
        <path d="M2 20 H22" />
      </g>
    </svg>
  );
};
