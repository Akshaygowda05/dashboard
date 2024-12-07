import React, { useState, useEffect } from 'react';
import axios from 'axios';


const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Adjust the path if your routes are under a specific prefix
});


const RobotPerformanceTable = () => {
  const [performanceData, setPerformanceData] = useState({
    individualDevices: [],
    overallSummary: null
  });
  const [timeframe, setTimeframe] = useState('weekly');

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        let response;
        switch (timeframe) {
          case 'weekly':
             response = await api.get('/weekly-report');
            break;
          case 'monthly':
            response = await axios.get('/monthly-report');
            break;
          case 'yearly':
            response = await axios.get('/yearly-report');
            break;
          default:
            response = await axios.get('/weekly-report');
        }
        
        setPerformanceData(response.data);
      } catch (error) {
        console.error('Error fetching performance data:', error);
      }
    };

    fetchPerformanceData();
  }, [timeframe]);

  const handleDownload = async () => {
    try {
      const response = await axios.get(`/api/download-report/${timeframe}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${timeframe}_report.csv`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <button 
            className={`px-4 py-2 rounded ${timeframe === 'weekly' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setTimeframe('weekly')}
          >
            Weekly
          </button>
          <button 
            className={`px-4 py-2 rounded ${timeframe === 'monthly' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setTimeframe('monthly')}
          >
            Monthly
          </button>
          <button 
            className={`px-4 py-2 rounded ${timeframe === 'yearly' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setTimeframe('yearly')}
          >
            Yearly
          </button>
        </div>
        <button 
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={handleDownload}
        >
          Download {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} Report
        </button>
      </div>

      {/* Overall Summary */}
      {performanceData.overallSummary && (
        <div className="bg-gray-100 p-4 rounded mb-4">
          <h2 className="text-xl font-bold mb-2">Overall Summary</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="font-semibold">Total Robots</p>
              <p>{performanceData.overallSummary.total_robots}</p>
            </div>
            <div>
              <p className="font-semibold">Total Panels Cleaned</p>
              <p>{performanceData.overallSummary.overall_total_panels_cleaned}</p>
            </div>
            <div>
              <p className="font-semibold">Avg Battery Discharge</p>
              <p>{performanceData.overallSummary.overall_avg_battery_discharge}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Individual Devices Table */}
      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 text-left">Device ID</th>
              <th className="p-3 text-left">Total Panels Cleaned</th>
              <th className="p-3 text-left">Avg Battery Discharge</th>
              <th className="p-3 text-left">{timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} Start</th>
            </tr>
          </thead>
          <tbody>
            {performanceData.individualDevices.map((device, index) => (
              <tr 
                key={device.device_id} 
                className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
              >
                <td className="p-3">{device.device_id}</td>
                <td className="p-3">{device.total_panels_cleaned}</td>
                <td className="p-3">{device.avg_battery_discharge}%</td>
                <td className="p-3">
                  {new Date(device[`${timeframe.slice(0, -2)}_start`]).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RobotPerformanceTable;