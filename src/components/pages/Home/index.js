import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import axios from 'axios';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Box, 
  Paper
} from '@mui/material';
import { 
  DeviceHub as DeviceHubIcon,
  DevicesOther as DevicesIcon,
  CheckCircle as ActiveIcon,
  ErrorOutline as InactiveIcon
} from '@mui/icons-material';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    multicastGroups: { totalCount: 0 },
    devices: { 
      totalCount: 0, 
      activeCount: 0, 
      inactiveCount: 0 
    },
    performanceData: [],
    energyStats: {
      totalEnergyGenerated: 0,
      totalPanelsCleaned: 0
    }
  });

  // Color Palette
  const colors = {
    primary: '#3f51b5',
    secondary: '#f50057',
    success: '#4caf50',
    info: '#2196f3',
    warning: '#ff9800',
    background: '#f4f6f8'
  };

  // Limit data points for better visualization
  const limitDataPoints = (data, maxPoints = 7) => {
    if (data.length <= maxPoints) return data;
    
    // Take last 7 data points
    return data.slice(-maxPoints);
  };

  // Styled Card Component
  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color = colors.primary 
  }) => (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        borderRadius: 2,
        background: `linear-gradient(145deg, ${color}33, ${color}11)`
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mr: 2 
      }}>
        <Icon 
          sx={{ 
            fontSize: 40, 
            color: color,
            opacity: 0.7 
          }} 
        />
      </Box>
      <Box>
        <Typography 
          variant="subtitle2" 
          color="text.secondary"
          sx={{ lineHeight: 1 }}
        >
          {title}
        </Typography>
        <Typography 
          variant="h5" 
          fontWeight="bold" 
          color="text.primary"
        >
          {value}
        </Typography>
      </Box>
    </Paper>
  );

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch data from your APIs
        const [
          multicastResponse,
          devicesResponse,
          performanceResponse
        ] = await Promise.all([
          axios.get('http://localhost:5000/api/multicast-groups'),
          axios.get('http://localhost:5000/api/devices'),
          axios.get('http://localhost:5000/api/robot-performance/last-7-days')
        ]);

        const devices = devicesResponse.data.result;
        const totalDevices = devices.length;
        const activeDevices = devices.filter(device => 
          device.lastSeenAt && 
          (new Date() - new Date(device.lastSeenAt)) <= 1800000
        ).length;
        const inactiveDevices = totalDevices - activeDevices;

        const performanceData = performanceResponse.data;

        setDashboardData({
          multicastGroups: {
            totalCount: multicastResponse.data.totalCount
          },
          devices: {
            totalCount: totalDevices,
            activeCount: activeDevices,
            inactiveCount: inactiveDevices
          },
          performanceData: performanceData,
          energyStats: {
            // Example calculations - adjust based on your actual data
            totalEnergyGenerated: performanceData.reduce((sum, day) => 
              sum + (day.total_panels_cleaned * 10), 0), // Hypothetical energy conversion
            totalPanelsCleaned: performanceData.reduce((sum, day) => 
              sum + day.total_panels_cleaned, 0)
          }
        });
      } catch (error) {
        console.error('Dashboard data fetch error:', error);
      }
    };

    fetchDashboardData();
    const intervalId = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Limit performance data to last 7 points
  const limitedPerformanceData = limitDataPoints(dashboardData.performanceData);

  return (
    <Box sx={{ 
      flexGrow: 1, 
      p: 3, 
      backgroundColor: colors.background 
    }}>
      {/* Statistics Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[
          { 
            title: 'Multicast Groups', 
            value: dashboardData.multicastGroups.totalCount,
            icon: DeviceHubIcon,
            color: colors.primary
          },
          { 
            title: 'Total Devices', 
            value: dashboardData.devices.totalCount,
            icon: DevicesIcon,
            color: colors.info
          },
          { 
            title: 'Active Devices', 
            value: dashboardData.devices.activeCount,
            icon: ActiveIcon,
            color: colors.success
          },
          { 
            title: 'Inactive Devices', 
            value: dashboardData.devices.inactiveCount,
            icon: InactiveIcon,
            color: colors.secondary
          }
        ].map((cardData, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard {...cardData} />
          </Grid>
        ))}
      </Grid>

      {/* Performance Visualizations */}
      <Grid container spacing={3}>
        {/* Panels Cleaned Bar Chart */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Panels Cleaned Over Time
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={limitedPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis label={{ value: 'Panels Cleaned', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Bar 
                    dataKey="total_panels_cleaned" 
                    fill={colors.primary} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Battery Discharge Line Chart */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Battery Discharge Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={limitedPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis label={{ value: 'Discharge (%)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="avg_battery_discharge" 
                    stroke={colors.secondary}
                    strokeWidth={2}
                  />
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