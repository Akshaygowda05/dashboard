import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { 
  UserOutlined, 
  LockOutlined, 
  EyeInvisibleOutlined, 
  EyeTwoTone 
} from '@ant-design/icons';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();

  const handleLogin = (values) => {
    const { username, password } = values;

    // Hardcoded credentials check
    if (username === 'admin' && password === 'admin') {
      // Call the onLogin prop
      onLogin();

      // Show success message
      message.success('Login Successful!');

      // Navigate to devices page
      navigate('/');
    } else {
      message.error('Invalid username or password');
    }
  };

  return (
    <div 
      className="login-background"
    style={{
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  backgroundImage: "url('/solarpannel.jpg')",
  backgroundSize: 'cover',
  backgroundPosition: 'center center',
  backgroundBlendMode: 'multiply', // Use 'multiply' for stronger contrast with the background
  backgroundColor: 'rgba(0, 0, 0, 0.3)', // Darker, more subtle overlay for contrast
}}
    >
      <div 
        className="login-container"
        style={{
          width: 350, // Slightly wider
          padding: 30, // More padding
          backgroundColor: 'white',
          borderRadius: 12, // More rounded corners
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)', // Enhanced shadow
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(13, 179, 158, 0.2)', // Subtle border with primary color
        }}
      >
        {/* Decorative accent */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 5,
            backgroundColor: '#0DB39E',
          }}
        />

        {/* Company Logo */}
        <img
          src="Aegeus-technologies-logo.png"
          alt="Company Logo"
          style={{
            width: '120px', // Slightly larger
            marginBottom: 25,
            marginLeft:70,
            borderRadius: 8,
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          }}
        />

        <h2 style={{ 
          marginBottom: 30, 
          color: '#0DB39E',
          fontWeight: 600,
          fontSize: '1.8rem'
        }}>
          Welcome Back
        </h2>

        {/* Partner Logos */}
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginBottom: 25,
            opacity: 0.7,
          }}
        >
          <img
            src="vvdn-logo.webp"
            alt="Partner 1"
            style={{ 
              width: '90px', 
              margin: '0 15px',
              filter: 'grayscale(30%)',
              transition: 'transform 0.3s ease',
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          />
          <img
            src="orante.png"
            alt="Partner 2"
            style={{ 
              width: '90px', 
              margin: '0 15px',
              filter: 'grayscale(30%)',
              transition: 'transform 0.3s ease',
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          />
        </div>

        <Form
          name="login"
          onFinish={handleLogin}
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input 
              prefix={<UserOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
              placeholder="Username" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password 
              prefix={<LockOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
              placeholder="Password" 
              size="large"
              iconRender={(visible) => 
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{
                width: '100%',
                backgroundColor: '#0DB39E',
                borderColor: '#0DB39E',
                height: '45px', // Larger button
                fontSize: '16px',
                fontWeight: 600,
                borderRadius: 8,
                transition: 'all 0.3s ease',
              }}
              className="login-form-button"
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#0DA392';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#0DB39E';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Log In
            </Button>
          </Form.Item>
        </Form>

        {/* Optional: Forgot Password Link */}
        <div 
          style={{ 
            marginTop: 16, 
            color: '#0DB39E', 
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          Forgot Password?
        </div>
      </div>
    </div>
  );
};

export default Login;