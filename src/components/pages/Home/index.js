import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import axios from 'axios';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Box 
} from '@mui/material';
import { 
  DeviceHub as DeviceHubIcon,
  DevicesOther as DevicesIcon,
  CheckCircle as ActiveIcon,
  ErrorOutline as InactiveIcon
} from '@mui/icons-material';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    multicastGroups: {
      totalCount: 0,
      result: []
    },
    devices: {
      totalCount: 0,
      activeCount: 0,
      inactiveCount: 0
    },
    performanceData: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch Multicast Groups
        const multicastResponse = await axios.get('http://localhost:5000/api/multicast-groups');
        
        // Fetch Devices
        const devicesResponse = await axios.get('http://localhost:5000/api/devices');
        const devices = devicesResponse.data.result;
        
        const totalDevices = devices.length;
        const activeDevices = devices.filter(device => 
          device.lastSeenAt !== null && 
          device.deviceStatus !== null
        ).length;
        const inactiveDevices = totalDevices - activeDevices;

        // Fetch Performance Data
        const performanceResponse = await axios.get('http://localhost:5000/api/robot-performance/last-7-days');

        setDashboardData({
          multicastGroups: multicastResponse.data,
          devices: {
            totalCount: totalDevices,
            activeCount: activeDevices,
            inactiveCount: inactiveDevices
          },
          performanceData: performanceResponse.data
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    // Initial fetch
    fetchDashboardData();

    // Set up polling every 5 minutes
    const intervalId = setInterval(fetchDashboardData, 5 * 60 * 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Card styles
  const cardStyles = {
    multicastGroups: {
      background: 'linear-gradient(145deg, #e6f2ff, #b3d9ff)', // Light blue
      icon: { color: '#1976d2' }
    },
    totalDevices: {
      background: 'linear-gradient(145deg, #f0f0f0, #e0e0e0)', // Light gray
      icon: { color: '#616161' }
    },
    activeDevices: {
      background: 'linear-gradient(145deg, #e6ffe6, #b3ffb3)', // Light green
      icon: { color: '#2e7d32' }
    },
    inactiveDevices: {
      background: 'linear-gradient(145deg, #ffebee, #ffcdd2)', // Light red
      icon: { color: '#d32f2f' }
    }
  };

  // Render card component
  const renderStatCard = (title, count, style, Icon) => (
    <Grid item xs={12} sm={6} md={3}>
      <Card 
        sx={{ 
          background: style.background,
          boxShadow: 3,
          borderRadius: 2
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="subtitle1" color="text.secondary">
                {title}
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {count}
              </Typography>
            </Box>
            <Icon 
              sx={{ 
                ...style.icon, 
                fontSize: 48, 
                opacity: 0.7 
              }} 
            />
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* Multicast Groups Card */}
        {renderStatCard(
          'Multicast Groups', 
          dashboardData.multicastGroups.totalCount, 
          cardStyles.multicastGroups, 
          DeviceHubIcon
        )}

        {/* Total Devices Card */}
        {renderStatCard(
          'Total Devices', 
          dashboardData.devices.totalCount, 
          cardStyles.totalDevices, 
          DevicesIcon
        )}

        {/* Active Devices Card */}
        {renderStatCard(
          'Active Devices', 
          dashboardData.devices.activeCount, 
          cardStyles.activeDevices, 
          ActiveIcon
        )}

        {/* Inactive Devices Card */}
        {renderStatCard(
          'Inactive Devices', 
          dashboardData.devices.inactiveCount, 
          cardStyles.inactiveDevices, 
          InactiveIcon
        )}
      </Grid>

      {/* Performance Charts */}
      <Grid container spacing={2}>
        {/* Panels Cleaned Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Panels Cleaned
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboardData.performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis label={{ value: 'Panels', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  {dashboardData.performanceData.length > 0 && 
                    Object.keys(dashboardData.performanceData[0])
                      .filter(key => key.startsWith('device_'))
                      .map((deviceKey, index) => (
                        <Line 
                          key={deviceKey}
                          type="monotone" 
                          dataKey={deviceKey} 
                          stroke={`hsl(${index * 60}, 70%, 50%)`}
                          activeDot={{r: 8}}
                        />
                      ))
                  }
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Battery Discharge Cycle Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Battery Discharge Cycle 
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboardData.performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis label={{ value: 'Discharge Cycle', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  {dashboardData.performanceData.length > 0 && 
                    Object.keys(dashboardData.performanceData[0])
                      .filter(key => key.startsWith('battery_'))
                      .map((deviceKey, index) => (
                        <Line 
                          key={deviceKey}
                          type="monotone" 
                          dataKey={deviceKey} 
                          stroke={`hsl(${index * 60 + 180}, 70%, 50%)`}
                          activeDot={{r: 8}}
                        />
                      ))
                  }
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;