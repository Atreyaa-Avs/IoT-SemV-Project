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

const App = () => {
  return (
    <div className="max-h-svh">
      <div className="mx-6">
        <Toaster position="bottom-right" reverseOrder={false} />
        <NavBar />
        <Hero />
        {/* <Timer /> */}
        <div className="grid grid-cols-2 gap-3">
          <Bill />
          {/* <Timer /> */}
          <div className="grid grid-cols-2 gap-4 rounded-xl shadow-lg bg-accent mt-2 h-full p-2">
            <TimerCustom />
            <Threshold />
            <IdleLoad />
            <EnergyEfficiency />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default App;
