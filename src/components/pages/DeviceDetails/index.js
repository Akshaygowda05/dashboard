import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

// MUI Imports
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Box, 
  IconButton, 
  Tooltip,
  LinearProgress,
  Chip,
  CircularProgress
} from "@mui/material";
import {
  // System Info Icons
  DeviceHub as RobotIcon,
  Info as InfoIcon,
  Timer as ClockIcon,
  
  // Connectivity Icons
  SignalCellularAlt as SignalIcon,
  
  // Position Icons
  LocationOn as LocationIcon,
  TrendingUp as InclinationIcon,
  
  // Operations Icons
  AutoMode as AutoRunIcon,
  PanTool as ManualRunIcon,
  
  // Diagnostics Icons
  Warning as FaultIcon,
  Thermostat as TemperatureIcon,
  
  // Battery Icons
  BatteryFull as BatteryIcon,
  BatteryChargingFull as ChargingIcon,
  FlashOn as VoltageIcon,
  
  // Utility Icons
  Refresh as RefreshIcon,
  Error as ErrorIcon
} from "@mui/icons-material";

const API_BASE_URL = "http://localhost:5000/api";

const channelMapping = {
  "CH1": { name: "Robot Identifier", icon: RobotIcon },
  "CH2": { name: "Operational Status", icon: InfoIcon },
  "CH10": { name: "Odometer", icon: ClockIcon },
  "CH11": { name: "IBM", icon: InfoIcon },
  "CH12": { name: "IDMU", icon: InfoIcon },
  "CH13": { name: "IDML", icon: InfoIcon },
  "CH3": { name: "Signal Strength", icon: SignalIcon },
  "CH8": { name: "Inclination", icon: InclinationIcon },
  "CH9": { name: "Position", icon: LocationIcon },
  "CH15": { name: "Auto Run Count", icon: AutoRunIcon },
  "CH16": { name: "Manual Run Count", icon: ManualRunIcon },
  "CH7": { name: "Fault Code", icon: FaultIcon },
  "CH17": { name: "Temperature", icon: TemperatureIcon },
  "CH4": { name: "Battery SOC", icon: BatteryIcon },
  "CH5": { name: "Battery Voltage", icon: VoltageIcon },
  "CH6": { name: "Battery Discharge Cycles", icon: ChargingIcon },
  "CH14": { name: "Battery Current", icon: BatteryIcon },
};

const generateDefaultData = () => {
  return Object.keys(channelMapping).reduce((acc, channel) => {
    acc[channel] = 0;
    return acc;
  }, {});
};

function DeviceDetails() {
  const { devEui } = useParams();
  const [deviceData, setDeviceData] = useState(generateDefaultData());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshAttempt, setLastRefreshAttempt] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const fetchDeviceData = async (isManualRefresh = false) => {
    if (retryCount >= MAX_RETRIES) {
      setLoading(false);
      setError("Unable to fetch device data. Please check device connectivity.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/devices/${devEui}/data`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (!response.ok) {
        setRetryCount(prevCount => prevCount + 1);

        if (response.status === 404) {
          throw new Error("Device not found");
        } else if (response.status === 500) {
          throw new Error("Internal server error");
        } else {
          throw new Error("Failed to fetch device data");
        }
      }

      setRetryCount(0);

      const data = await response.json();
      
      const processedData = data.data && Object.keys(data.data).length > 0 
        ? data.data 
        : generateDefaultData();

      setDeviceData(processedData);
      
      if (isManualRefresh) {
        setLastRefreshAttempt(new Date().toLocaleString());
      }
    } catch (error) {
      console.error("Fetch Error:", error.message);
      setError(error.message);
      setDeviceData(generateDefaultData());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchWithDelay = () => {
      const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
      
      const timeoutId = setTimeout(() => {
        fetchDeviceData();
      }, delay);

      return () => clearTimeout(timeoutId);
    };

    const cleanup = fetchWithDelay();
    return cleanup;
  }, [devEui, retryCount]);

  const handleRefresh = async () => {
    try {
      const downlinkResponse = await fetch(`${API_BASE_URL}/devices/${devEui}/queue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          queueItem: {
            data: "AQ==",
            fCnt: 0,
            fPort: 1,
          },
        }),
      });

      if (!downlinkResponse.ok) {
        throw new Error("Failed to send refresh command");
      }

      setRetryCount(0);
      await fetchDeviceData(true);
    } catch (error) {
      console.error("Refresh error:", error);
      setError("Failed to refresh device data");
    }
  };

  if (loading) return (
    <Box sx={{ width: '100%', py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <CircularProgress />
      <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
        Loading device data...
      </Typography>
      <LinearProgress sx={{ width: '50%', mt: 2 }} />
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Device Details: {devEui}
        </Typography>
        <Tooltip title="Refresh Device Data">
          <IconButton 
            color="primary" 
            onClick={handleRefresh}
            sx={{ 
              bgcolor: 'primary.light', 
              '&:hover': { bgcolor: 'primary.main', color: 'white' } 
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {error && (
        <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText', mb: 2 }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
            <ErrorIcon sx={{ mr: 2 }} />
            <Typography variant="body1">{error}</Typography>
          </CardContent>
        </Card>
      )}

      {lastRefreshAttempt && (
        <Chip 
          label={`Last refresh: ${lastRefreshAttempt}`} 
          variant="outlined" 
          color="secondary" 
          sx={{ mb: 2 }} 
        />
      )}

      <Card sx={{ boxShadow: 3, mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            {Object.entries(channelMapping).map(([channel, mapping]) => {
              const ChannelIcon = mapping.icon;
              const value = deviceData[channel] ?? 0;

              return (
                <Grid item xs={6} sm={4} md={3} lg={2} key={channel}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      textAlign: 'center', 
                      p: 2, 
                      transition: 'all 0.3s ease',
                      '&:hover': { 
                        transform: 'scale(1.05)', 
                        boxShadow: 2 
                      } 
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <ChannelIcon 
                        color="primary" 
                        sx={{ 
                          fontSize: 40, 
                          mb: 1, 
                          color: '#0DB39E' 
                        }} 
                      />
                      <Typography variant="subtitle2" color="textSecondary">
                        {mapping.name}
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {value}
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}

export default DeviceDetails;