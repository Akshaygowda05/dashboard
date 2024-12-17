// import Home from "../pages/Home";
import Devices from "../pages/devices";
import MulticastGroup from "../pages/MulticastGroup";

import { Route,Routes } from "react-router-dom";
import DeviceDetails from "../pages/DeviceDetails";
import RobotStatus from "../pages/robotStatus";
import Reports from "../pages/reports";
import Home from "../pages/Home";


// import { Navigate } from "react-router-dom"; 


function AppRoutes() {
  return (
    
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/devices" element={<Devices />} />
        <Route path ="/device/:devEui" element={<DeviceDetails />} />
        <Route path="/multicast" element={<MulticastGroup />} />
        <Route path="/robotStatus" element={<RobotStatus />} />
        <Route path="/reports" element={<Reports />} />
        {/* <Route path="/" element={<Navigate to="/devices" replace />} /> */}
      </Routes>
   
  );
}

export default AppRoutes;