import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from "antd";

const RobotStatus = () => {
  const [devices, setDevices] = useState([]);
  const [deviceData, setDeviceData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDevicesAndData = async () => {
      try {
        // Fetch devices
        const devicesResponse = await axios.get('http://192.168.0.239:5000/api/devices');
        const fetchedDevices = devicesResponse.data.result || [];
        setDevices(fetchedDevices);
        console.log(devicesResponse);

        // Fetch data for each device
        const dataPromises = fetchedDevices.map(async (device) => {
          try {
            const dataResponse = await axios.get(`http://192.168.0.239:5000/api/devices/${device.devEui}/data`);
            console.log('Fetched data for device:', device.devEui, dataResponse.data);
            return {
              devEui: device.devEui,
              data: dataResponse.data.data || null, // Accessing the "data" object
            };
          } catch (dataError) {
            console.error(`Error fetching data for device ${device.devEui}:`, dataError);
            let errorMessage = 'Error fetching data';
            if (dataError.response) {
              if (dataError.response.status === 404) {
                errorMessage = 'Device data not found';
              } else if (dataError.response.status === 500) {
                errorMessage = 'Server error';
              }
            }
            return {
              devEui: device.devEui,
              data: null,
              error: errorMessage,
            };
          }
        });

        const deviceDataResults = await Promise.all(dataPromises);
        const dataMap = deviceDataResults.reduce((acc, item) => {
          acc[item.devEui] = item;
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
    const deviceDataItem = deviceData[device.devEui];
  
    // If there's no data for this device, mark it as stopped and show gray LED
    if (!deviceDataItem || !deviceDataItem.data) {
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
            borderRadius: '8px',
          }}
        >
          <div
            className="led"
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              backgroundColor: '#888', // Gray if no data or stopped
              boxShadow: 'none',
            }}
          />
          <p style={{ marginTop: '10px', fontWeight: 'bold' }}>
            {device.name || device.devEui}
          </p>
          <p style={{ color: 'gray' }}>Stopped</p>
        </div>
      );
    }
  
    const { data, error } = deviceDataItem;
  
    // If there's an error fetching data or no valid CH2 value, show "Error" state in gray
    if (error || !data || data.CH2 === undefined) {
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
            borderRadius: '8px',
          }}
        >
          <div
            className="led"
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              backgroundColor: 'red', // Gray color for error or no data
              boxShadow: 'red',
            }}
          />
          <p style={{ marginTop: '10px', fontWeight: 'bold' }}>
            {device.name || device.devEui}
          </p>
          <p style={{ color: 'red' }}>
            {error || 'Error fetching data'}
          </p>
        </div>
      );
    }
  
    // If there's data, check if CH2 is 1 to determine if it's "Running"
    const isRunning = data.CH2 === 1;
  
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
          borderRadius: '8px',
        }}
      >
        <div
          className={`led ${isRunning ? 'running' : 'stopped'}`}
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            backgroundColor: isRunning ? 'green' : '#888', // Green if running, gray if stopped
            boxShadow: isRunning
              ? '0 0 20px green, inset 0 0 10px rgba(0, 255, 0, 0.94)'
              : 'none',
          }}
        />
        <p style={{ marginTop: '10px', fontWeight: 'bold' }}>
          {device.name || device.devEui}
        </p>
        {isRunning ? (
          <p style={{ color: 'green' }}>Running</p>
        ) : (
          <p style={{ color: 'gray' }}>Stopped</p>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      {loading ? (
        <div>Loading devices...</div>
      ) : devices.length === 0 ? (
        <div>No devices found</div>
      ) : (
        devices.map(renderLED)
      )}

<div
        style={{
          marginTop: '200px',
          display: 'flex',
          // // // flexDirection: 'column',
          alignItems: 'center',
          gap:"8px"
        }}
      >
        <div
          style={{
            width: '50px',
            height: '10px',
            backgroundColor: 'green',
            marginBottom: '10px',
            textAlign: 'center',
            padding: '2px',
          }}
        >
          ----- Running
        </div>
        <div
          style={{
            width: '50px',
            height: '10px',
            backgroundColor: 'gray',
            marginBottom: '10px',
            textAlign: 'center',
            padding: '2px',
          }}
        >
          -----  Stopped
        </div>
        <div
          style={{
            width: '50px',
            height: '10px',
            backgroundColor: 'red',
            marginBottom: '10px',
            textAlign: 'center',
            padding: '2px',
          
          }}
        >
          ----- Fault
        </div>
      </div>
    </div>
  );
};

export default RobotStatus;
