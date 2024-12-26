// import Home from "../pages/Home";
import Devices from "../pages/devices";
import MulticastGroup from "../pages/MulticastGroup";
import { Route,Routes } from "react-router-dom";
import DeviceDetails from "../pages/DeviceDetails";
import RobotStatus from "../pages/robotStatus";
import Reports from "../pages/reports";
import Home from "../pages/Home";
import Configuration from "../pages/configuration";
import { useState } from "react";


function AppRoutes() {
  const [humidityThreshold, setHumidityThreshold] = useState(85); // Default value
  const [rainThreshold, setRainThreshold] = useState(1); // Default value
  const [windSpeedThreshold, setWindSpeedThreshold] = useState(20); // Default value

  return (
    
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/devices" element={<Devices humidityThreshold={humidityThreshold} rainThreshold={rainThreshold} windSpeedThreshold={windSpeedThreshold} />} />
        <Route path ="/device/:devEui" element={<DeviceDetails />} />
        <Route path="/multicast" element={<MulticastGroup />} />
        <Route path="/robotStatus" element={<RobotStatus/>} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/configuration" element={< Configuration
            setHumidityThreshold={setHumidityThreshold}
            setRainThreshold={setRainThreshold}
            setWindSpeedThreshold={setWindSpeedThreshold}
          />}/>
        {/* <Route path="/" element={<Navigate to="/devices" replace />} /> */}
      </Routes>
   
  );
}


export default AppRoutes;