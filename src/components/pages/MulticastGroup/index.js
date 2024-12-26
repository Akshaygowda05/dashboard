import React, { useState, useEffect } from "react";
import { Card, Button, Checkbox, TimePicker, message, Table, Modal, Badge } from "antd";
import { ClockCircleOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import moment from "moment";

const API_BASE_URL = "http://192.168.0.239:5000/api";

const MulticastGroup = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [scheduleTime, setScheduleTime] = useState(null);
  const [scheduledTasks, setScheduledTasks] = useState([]);
  const [isScheduleModalVisible, setIsScheduleModalVisible] = useState(false);
  
  // Separate loading states
  const [isLoadingStart, setIsLoadingStart] = useState(false);
  const [isLoadingStop, setIsLoadingStop] = useState(false);
  const [isLoadingHome,setIsLoadingHome]=useState(false);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);

  useEffect(() => {
    fetchGroups();
    fetchScheduledTasks();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/multicast-groups`);
      setGroups(response.data.result || []);
    } catch (error) {
      message.error("Error fetching multicast groups.");
    }
  };

  const fetchScheduledTasks = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/scheduled-tasks`);
      setScheduledTasks(response.data.tasks || []);
    } catch (error) {
      message.error("Error fetching scheduled tasks.");
    }
  };

  const handleSelectAll = (checked) => {
    setSelectedGroups(checked ? groups.map(group => group.id) : []);
  };

  const handleCheckboxChange = (groupId) => {
    setSelectedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const sendDataToGroups = async (groupIds, action) => {
    let loadingState;
    switch (action) {
      case "start":
        loadingState = setIsLoadingStart;
        break;
      case "stop":
        loadingState = setIsLoadingStop;
        break;
      case "home":
        loadingState = setIsLoadingHome;
        break;
      default:
        message.error(`Unknown action: ${action}`);
        return;
    }

    loadingState(true);

    try {
      let data;
      switch (action) {
        case "start":
          data = "Ag=="; // data for starting action
          break;
        case "stop":
          data = "Aw=="; // data for stopping action
          break;
        case "home":
          data ="BA=="; // data for home action
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }

      const promises = groupIds.map(groupId =>
        axios.post(`${API_BASE_URL}/multicast-groups/${groupId}/queue`, {
          queueItem: { data, fCnt: 0, fPort: 1 },
        })
      );

      await Promise.all(promises);

      message.success(`Action ${action} successfully sent to selected groups.`);
    } catch (error) {
      message.error(`Failed to send ${action} to selected groups.`);
    } finally {
      loadingState(false);
    }
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

    setIsLoadingSchedule(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/schedule-downlink`, {
        groupIds: selectedGroups,
        scheduleTime: scheduleTime.format("YYYY-MM-DDTHH:mm:ss")
      });
      
      message.success(`Downlink scheduled for ${response.data.scheduledTime}`);
      fetchScheduledTasks();
      setIsScheduleModalVisible(false);
    } catch (error) {
      message.error("Failed to schedule downlink.");
    } finally {
      setIsLoadingSchedule(false);
    }
  };

  const cancelScheduledTask = async (taskId) => {
    try {
      await axios.delete(`${API_BASE_URL}/scheduled-tasks/${taskId}`);
      message.success("Scheduled task cancelled successfully");
      fetchScheduledTasks();
    } catch (error) {
      message.error("Failed to cancel scheduled task");
    }
  };

  const scheduledTaskColumns = [
    {
      title: 'Schedule Time',
      dataIndex: 'scheduleTime',
      render: time => moment(time).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: status => (
        <Badge 
          status={status === 'scheduled' ? 'processing' : 'default'} 
          text={status}
        />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => cancelScheduledTask(record.id)}
        >
          Cancel
        </Button>
      )
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Card 
        title={
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold">Block-wise / Plant Scheduling of Robots</span>
            <Button
              type="primary"
              icon={<ClockCircleOutlined />}
              onClick={() => setIsScheduleModalVisible(true)}
            >
              View Scheduled Tasks
            </Button>
          </div>
        }
        className="shadow-lg rounded-xl"
      >
        <div className="mb-4">
          <Checkbox
            onChange={(e) => handleSelectAll(e.target.checked)}
            checked={selectedGroups.length === groups.length}
            indeterminate={selectedGroups.length > 0 && selectedGroups.length < groups.length}
          >
            Select All Groups
          </Checkbox>
        </div>

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
                />
              </div>
            </Card>
          ))}
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-4">
     {/* Start Button */}
<Button
  type="primary"
  onClick={() => sendDataToGroups(selectedGroups, "start")}
  loading={isLoadingStart}
  className="bg-gradient-to-r from-teal-400 to-teal-600 hover:from-teal-500 hover:to-teal-700 text-white shadow-lg"
  disabled={selectedGroups.length === 0 || isLoadingStop || isLoadingHome}
>
  Start Now
</Button>

{/* Stop Button */}
<Button
  danger
  type="primary"
  onClick={() => sendDataToGroups(selectedGroups, "stop")}
  loading={isLoadingStop}
  className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white shadow-lg"
  disabled={selectedGroups.length === 0 || isLoadingStart || isLoadingHome}
>
  Stop Now
</Button>

{/* Home/Return to Dock Button */}
<Button
  type="primary"
  onClick={() => sendDataToGroups(selectedGroups, "home")}
  loading={isLoadingHome}
  className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white shadow-lg"
  disabled={selectedGroups.length === 0 || isLoadingStart || isLoadingStop}
>
  Return to Dock Now
</Button>

{/* Schedule Button */}
<div className="flex items-center space-x-4">
  <TimePicker
    format="HH:mm"
    value={scheduleTime}
    onChange={setScheduleTime}
    className="w-32"
  />
  <Button
    type="primary"
    onClick={handleScheduleSubmit}
    loading={isLoadingSchedule}
    disabled={selectedGroups.length === 0}
    className="bg-gradient-to-r from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white shadow-lg"
  >
    Schedule Now
  </Button>
          </div>
        </div>
      </Card>

      <Modal
        title="Scheduled Tasks"
        open={isScheduleModalVisible}
        onCancel={() => setIsScheduleModalVisible(false)}
        footer={null}
        width={800}
      >
        <Table
          dataSource={scheduledTasks}
          columns={scheduledTaskColumns}
          rowKey="id"
          pagination={false}
        />
      </Modal>
    </div>
  );
};

export default MulticastGroup;