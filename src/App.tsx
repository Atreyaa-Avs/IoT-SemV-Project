import { Toaster } from "react-hot-toast";
import Bill from "./components/Bill";
import Hero from "./components/Hero";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
// import Timer from "./components/Timer";
import TimerCustom from "./components/TimerCustom";
import Threshold from "./components/Threshold";
import IdleLoad from "./components/IdleLoad";
import EnergyEfficiency from "./components/EnergyEfficiency";
import TimerRange from "./components/TimerRange";
import IntervalTimer from "./components/IntervalTimer";

const App = () => {
  return (
    <div className="min-h-svh ">
      <div className="mx-6 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-size-[6rem_4rem]">
        <Toaster position="bottom-right" reverseOrder={false} />
        <NavBar />
        <Hero />
        {/* <Timer /> */}
        <div className="col-span-3 gap-3">
          <Bill />
          {/* <Timer /> */}
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4 rounded-xl shadow-lg bg-accent bg-[radial-gradient(circle,#6b7280_1px,transparent_1px)] bg-size-[10px_10px] h-full p-4">
          <TimerCustom
            brokerUrl="wss://broker.hivemq.com:8884/mqtt"
            topic="power/relay"
          />
          <Threshold
            brokerUrl="wss://broker.hivemq.com:8884/mqtt"
            topic="power/relay"
          />
          <div className="flex gap-4 flex-1">
            <div className="bg-white">
              <IdleLoad />
            </div>
            <EnergyEfficiency />
          </div>
          <div className="flex gap-4 flex-1">
            <TimerRange
              brokerUrl="wss://broker.hivemq.com:8884/mqtt"
              topic="power/relay"
            />
            <IntervalTimer
              brokerUrl="wss://broker.hivemq.com:8884/mqtt"
              topic="power/relay"
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default App;
