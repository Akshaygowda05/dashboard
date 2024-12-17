import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';

const Login = ({ onLogin }) => {
  const handleLogin = (values) => {
    const { username, password } = values;
    
    // Hardcoded credentials check
    if (username === 'admin' && password === 'admin') {
      // Call the onLogin prop passed from parent
      onLogin();
    } else {
      message.error('Invalid username or password');
    }
  };

  return (
    <div 
      style={{
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f0f2f5'
      }}
    >
      <Form
        name="login"
        style={{
          width: 300,
          padding: 24,
          backgroundColor: 'white',
          borderRadius: 8,
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}
        onFinish={handleLogin}
      >
        <h2 style={{ 
          textAlign: 'center', 
          marginBottom: 24,
          color: '#0DB39E'
        }}>
          Login
        </h2>
        <Form.Item
          name="username"
          rules={[{ required: true, message: 'Please input your username!' }]}
        >
          <Input placeholder="Username" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password placeholder="Password" />
        </Form.Item>
        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            style={{ 
              width: '100%', 
              backgroundColor: '#0DB39E', 
              borderColor: '#0DB39E' 
            }}
          >
            Log in
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;