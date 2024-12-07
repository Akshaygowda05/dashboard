import Home from "../pages/Home";
import Devices from "../pages/devices";
import MulticastGroup from "../pages/MulticastGroup";
import Reports from "../pages/reports";
import { Route,Routes } from "react-router-dom";
import DeviceDetails from "../pages/DeviceDetails";

function AppRoutes() {
  return (
    
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/devices" element={<Devices />} />
        <Route path ="/device/:devEui" element={<DeviceDetails />} />
        <Route path="/multicast" element={<MulticastGroup />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
   
  );
}

export default AppRoutes;