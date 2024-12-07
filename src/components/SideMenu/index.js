import React, { useState } from 'react';
import { Menu } from 'antd';
import {
  HomeOutlined,
  LaptopOutlined,
  DeploymentUnitOutlined,
  BarChartOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const SideMenu = ({ collapsed, onCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);

  const toggleCollapsed = () => {
    onCollapse(!collapsed);
  };

  const menuItems = [
    {
      label: 'Home',
      key: '/',
      icon: <HomeOutlined />,
      color: '#0DB39E'
    },
    {
      label: 'Devices',
      key: '/devices',
      icon: <LaptopOutlined />,
      color: '#0DB39E'
    },
    {
      label: 'Multicast Group',
      key: '/multicast',
      icon: <DeploymentUnitOutlined />,
      color: '#0DB39E'
    },
    {
      label: 'Reports',
      key: '/reports',
      icon: <BarChartOutlined />,
      color: '#0DB39E'
    }
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  return (
    <div 
      className="side-menu-container" 
      style={{ 
        width: collapsed ? '80px' : '250px', 
        backgroundColor: '#F5F5F5', 
        height: '100%', 
        transition: 'width 0.3s ease',
        boxShadow: '2px 0 8px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'  // Ensures the absolute positioning works for the toggle button
      }}
    >
      {/* Toggle Collapse Button (Positioned to the top-right) */}
      <div 
        className="menu-toggle"
        onClick={toggleCollapsed}
        style={{
          position: 'absolute',  // This positions the button absolutely inside the sidebar
          top: '16px',           // Adjusts the distance from the top
          right: '16px',         // Adjusts the distance from the right side
          padding: '8px',
          cursor: 'pointer',
          backgroundColor: '#F5F5F5',
          border: 'none',
          zIndex: 1,             // Ensure it's above other content
        }}
      >
        {collapsed ? <MenuUnfoldOutlined style={{ fontSize: '24px',}} /> : <MenuFoldOutlined style={{ fontSize: '24px',}} />}
      </div>
      
      {/* Menu */}
      <Menu
        mode="inline"
        inlineCollapsed={collapsed}
        onClick={handleMenuClick}
        style={{ 
          marginTop:'50px',
          backgroundColor: 'transparent', 
          border: 'none', 
          flex: 1 
        }}
      >
        {menuItems.map((item) => (
          <Menu.Item 
            key={item.key}
            style={{
              margin: '8px 16px',
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              backgroundColor: location.pathname === item.key 
                ? item.color 
                : (hoveredItem === item.key 
                  ? 'rgba(13, 179, 158, 0.1)' 
                  : 'transparent'),
              display: 'flex',
              justifyContent: 'center',  // Align content to the right
              alignItems: 'center',
              padding: '10px 16px',
            }}
            onMouseEnter={() => setHoveredItem(item.key)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            {/* Icon */}
            {React.cloneElement(item.icon, {
              style: {
                color: location.pathname === item.key
                  ? 'white'
                  : (hoveredItem === item.key 
                    ? '#0DB39E' 
                    : '#8C8C8C'),
                fontSize: '18px',
                marginRight: collapsed ? '8px' : '12px',  // Adjust the margin based on collapsed state
                transition: 'color 0.3s ease'
              }
            })}
            {/* Label */}
            {!collapsed && (
              <span 
                style={{
                  color: location.pathname === item.key 
                    ? 'white' 
                    : 'black',
                  fontWeight: location.pathname === item.key 
                    ? 'bold' 
                    : 'normal'
                }}
              >
                {item.label}
              </span>
            )}
          </Menu.Item>
        ))}
      </Menu>
    </div>
  );
};

export default SideMenu;
