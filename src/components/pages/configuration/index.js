// src/pages/Configuration.js

import React, { useState, useEffect } from "react";

const Configuration = ({ setHumidityThreshold, setRainThreshold, setWindSpeedThreshold }) => {
  const [humidity, setHumidity] = useState(0);
  const [rain, setRain] = useState(0);
  const [windSpeed, setWindSpeed] = useState(0);

  const handleSave = () => {
    setHumidityThreshold(humidity);
    setRainThreshold(rain);
    setWindSpeedThreshold(windSpeed);
  };

  return (
    <div>
      <h2>Weather Configuration</h2>
      <div>
        <label>Humidity Threshold (%)</label>
        <input
          type="number"
          value={humidity}
          onChange={(e) => setHumidity(e.target.value)}
        />
      </div>
      <div>
        <label>Rain Threshold (mm)</label>
        <input
          type="number"
          value={rain}
          onChange={(e) => setRain(e.target.value)}
        />
      </div>
      <div>
        <label>Wind Speed Threshold (km/h)</label>
        <input
          type="number"
          value={windSpeed}
          onChange={(e) => setWindSpeed(e.target.value)}
        />
      </div>
      <button onClick={handleSave}>Save Configuration</button>
    </div>
  );
};

export default Configuration;
