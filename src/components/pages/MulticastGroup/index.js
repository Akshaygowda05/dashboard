import React, { useState, useEffect } from "react";
import { Card, Button, Checkbox, TimePicker, message } from "antd";
import axios from "axios";
import moment from "moment";

const API_BASE_URL = "http://localhost:5000/api";

const MulticastGroup = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [scheduleTime, setScheduleTime] = useState(null);
  const [isScheduleActive, setIsScheduleActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/multicast-groups`);
        setGroups(response.data.result);
      } catch (error) {
        message.error("Error fetching multicast groups.");
      }
    };

    fetchGroups();
  }, []);

  const handleCheckboxChange = (groupId) => {
    setSelectedGroups((prevSelected) =>
      prevSelected.includes(groupId)
        ? prevSelected.filter((id) => id !== groupId)
        : [...prevSelected, groupId]
    );
  };

  const sendDataToGroups = async (groupIds) => {
    setIsProcessing(true);
    try {
      const promises = groupIds.map(groupId => 
        axios.post(`${API_BASE_URL}/multicast-groups/${groupId}/queue`, {
          queueItem: {
            data: "af==",
            fCnt: 0,
            fPort: 1,
          },
        })
      );

      await Promise.all(promises);
      
      message.success("Successfully sent downlink to selected groups.");
    } catch (error) {
      message.error("Failed to send downlink.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImmediateStart = () => {
    if (selectedGroups.length === 0) {
      message.warning("Please select at least one group.");
      return;
    }
    
    sendDataToGroups(selectedGroups);
  };

  const handleScheduleSubmit = async () => {
    if (selectedGroups.length === 0) {
      message.error("Please select at least one group.");
      return;
    }
    if (!scheduleTime) {
      message.error("Please set a schedule time.");
      return;
    }

    // Ensure we're using the current date with the selected time
    const now = moment();
    const scheduledMoment = moment()
      .hours(scheduleTime.hour())  // Use .hour() instead of .hours()
      .minutes(scheduleTime.minute())  // Use .minute() instead of .minutes()
      .seconds(0);

    // If the scheduled time is in the past, schedule for the next day
    if (scheduledMoment.isBefore(now)) {
      scheduledMoment.add(1, 'day');
    }

    const timeUntilSchedule = scheduledMoment.diff(now);

    setIsScheduleActive(true);

    setTimeout(() => {
      sendDataToGroups(selectedGroups);
      setIsScheduleActive(false);
    }, timeUntilSchedule);

    message.success(`Downlink scheduled for ${scheduledMoment.format("YYYY-MM-DD HH:mm")}`);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Card 
        title="Multicast Group Management" 
        className="shadow-lg rounded-xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {groups.map((group) => (
            <Card 
              key={group.id} 
              className={`
                border-2 rounded-lg transition-all duration-300 
                ${selectedGroups.includes(group.id) 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-300'}
              `}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{group.name}</h3>
                  <p className="text-gray-600">{group.region}</p>
                </div>
                <Checkbox
                  checked={selectedGroups.includes(group.id)}
                  onChange={() => handleCheckboxChange(group.id)}
                  className="ml-4"
                />
              </div>
            </Card>
          ))}
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-4">
          <Button 
            type="primary" 
            onClick={handleImmediateStart}
            loading={isProcessing}
            className="bg-green-500 hover:bg-green-600 text-white"
            disabled={isProcessing}
          >
            Start Downlink
          </Button>
          
          <div className="flex items-center space-x-4">
            <TimePicker
              format="HH:mm"
              value={scheduleTime}
              onChange={(time) => setScheduleTime(time)}
              disabled={isScheduleActive}
              className="w-32"
            />
            <Button
              type="default" 
              onClick={handleScheduleSubmit}
              disabled={isScheduleActive}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {isScheduleActive ? "Scheduled" : "Schedule Downlink"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MulticastGroup;