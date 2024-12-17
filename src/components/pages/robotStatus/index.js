import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Make sure to install axios: npm install axios

const RobotStatus = () => {
  const [devices, setDevices] = useState([]);
  const [deviceData, setDeviceData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDevicesAndData = async () => {
      try {
        // Fetch devices
        const devicesResponse = await axios.get('http://localhost:5000/api/devices');
        const fetchedDevices = devicesResponse.data.result || [];
        setDevices(fetchedDevices);

        // Fetch data for each device
        const dataPromises = fetchedDevices.map(async (device) => {
          try {
            const dataResponse = await axios.get(`http://localhost:5000/api/devices/${device.devEui}/data`);
            return {
              devEui: device.devEui,
              data: dataResponse.data
            };
          } catch (dataError) {
            // If data fetch fails, return default object
            return {
              devEui: device.devEui,
              data: { CH2: 0 }
            };
          }
        });

        const deviceDataResults = await Promise.all(dataPromises);
        const dataMap = deviceDataResults.reduce((acc, item) => {
          acc[item.devEui] = item.data;
          return acc;
        }, {});

        setDeviceData(dataMap);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching devices:', error);
        setLoading(false);
      }
    };

    fetchDevicesAndData();
    
    // Optional: Set up polling to refresh data periodically
    const intervalId = setInterval(fetchDevicesAndData, 30000); // Refresh every 30 seconds
    
    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const renderLED = (device) => {
    const deviceDataItem = deviceData[device.devEui] || {};
    const isRunning = deviceDataItem.CH2 === 1;

    return (
      <div 
        key={device.devEui} 
        className="led-container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          margin: '10px',
          padding: '10px',
          border: '1px solid #ddd',
          borderRadius: '8px'
        }}
      >
        <div 
          className={`led ${isRunning ? 'running' : 'stopped'}`}
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            backgroundColor: isRunning ? 'green' : '#888',
            boxShadow: isRunning 
              ? '0 0 20px green, inset 0 0 10px rgba(0,255,0,0.5)' 
              : 'none'
          }}
        />
        <p style={{ marginTop: '10px', fontWeight: 'bold' }}>
          {device.name || device.devEui}
        </p>
        <p style={{ color: isRunning ? 'green' : 'red' }}>
          {isRunning ? 'Running' : 'Stopped'}
        </p>
      </div>
    );
  };

  return (
    <div 
      style={{
        display: 'flex', 
        flexWrap: 'wrap', 
        justifyContent: 'center', 
        padding: '20px'
      }}
    >
      {loading ? (
        <div>Loading devices...</div>
      ) : devices.length === 0 ? (
        <div>No devices found</div>
      ) : (
        devices.map(renderLED)
      )}
    </div>
  );
};

export default RobotStatus;