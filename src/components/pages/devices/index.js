import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { RobotFilled } from '@ant-design/icons';

const API_BASE_URL = "http://192.168.0.239:5000/api";
const ITEMS_PER_PAGE = 10; // Number of devices per page

function Devices({ humidityThreshold, rainThreshold, windSpeedThreshold }) {
  const [devices, setDevices] = useState([]); // State to store devices
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const [loading, setLoading] = useState(true); // Loading state
  const [buttonsDisabled, setButtonsDisabled] = useState(false); // Disable buttons if weather exceeds threshold
  const navigate = useNavigate(); // Navigation hook

  // Fetch devices and weather data from the API
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch weather data
        const weatherResponse = await fetch(`${API_BASE_URL}/gateway`);
        if (weatherResponse.ok) {
          const data = await weatherResponse.json();
          const weatherData = data.weather;

          // Check if weather conditions exceed thresholds
          const shouldDisableButtons = 
            weatherData.humidity > humidityThreshold ||
            weatherData.rain > rainThreshold ||
            weatherData.windSpeed > windSpeedThreshold;

          setButtonsDisabled(shouldDisableButtons); // Disable buttons if weather conditions exceed thresholds
        }

        // Fetch devices data
        const response = await fetch(`${API_BASE_URL}/devices`);
        if (!response.ok) throw new Error("Failed to fetch devices");
        const devicesData = await response.json();
        setDevices(devicesData.result); // Set devices data to state
      } catch (error) {
        console.error("Fetch error:", error);
        message.error("Failed to fetch weather data");
      } finally {
        setLoading(false); // Set loading to false once data is fetched
      }
    }

    fetchData(); // Call the fetch function when the component mounts
  }, [humidityThreshold, rainThreshold, windSpeedThreshold]); // Re-run when thresholds change

  // Calculate the number of pages for pagination
  const totalPages = Math.ceil(devices.length / ITEMS_PER_PAGE);

  // Get devices for the current page
  const currentDevices = devices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle device toggle (on/off/gohome)
  const handleToggleDevice = (devEui, state) => {
    if (buttonsDisabled) {
      alert("Cannot operate robot due to weather conditions");
      return;
    }
    toggleDeviceDownlink(devEui, state); // Send downlink command to the device
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Robot's <RobotFilled className="inline-block align-middle text-2xl" />
      </h1>

      {loading ? (
        <p>Loading devices...</p> // Show loading text when data is being fetched
      ) : (
        <>
          <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
            <thead>
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Robot Name</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Last Seen</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Description</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentDevices.map((device) => (
                <tr key={device.devEui} className="border-b hover:bg-gray-100">
                  <td className="px-6 py-4 text-sm text-gray-900">{device.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(device.lastSeenAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{device.description || "N/A"}</td>
                  <td className="px-6 py-4 space-x-2">
                    <button
                      onClick={() => handleToggleDevice(device.devEui, "on")}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm"
                    >
                      Turn On
                    </button>
                    <button
                      onClick={() => handleToggleDevice(device.devEui, "off")}
                      disabled={buttonsDisabled}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
                    >
                      Turn Off
                    </button>
                    <button
                      onClick={() => handleToggleDevice(device.devEui, "gohome")}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md text-sm"
                    >
                      Return To Dock
                    </button>
                    <button
                      onClick={() => navigate(`/device/${device.devEui}`)} // Navigate to device details page
                      disabled={buttonsDisabled}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="flex justify-center items-center mt-6">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              className="px-4 py-2 mx-2 bg-gray-300 hover:bg-gray-400 rounded-md text-sm"
              disabled={currentPage === 1}
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={`px-4 py-2 mx-2 rounded-md text-sm ${
                  currentPage === index + 1 ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              className="px-4 py-2 mx-2 bg-gray-300 hover:bg-gray-400 rounded-md text-sm"
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Toggle device downlink command
async function toggleDeviceDownlink(devEui, state) {
  const dataMap = {
    on: "Ag==",
    off: "Aw==",
    gohome: "BA==",
  };

  try {
    const response = await fetch(`${API_BASE_URL}/devices/${devEui}/queue`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        queueItem: {
          data: dataMap[state], // Command based on state
          fCnt: 0,
          fPort: 1,
        },
      }),
    });
    if (!response.ok) throw new Error("Failed to send command");
    alert(`Command ${state} sent successfully to device ${devEui}`);
  } catch (error) {
    console.error("Toggle error:", error);
    alert("Failed to send command");
  }
}

export default Devices;
