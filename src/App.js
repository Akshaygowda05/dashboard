import React, { useState } from "react";
import { Layout } from "antd";
import { Navigate, Routes, Route } from "react-router-dom";
import "./App.css";
import AppHeader from "./components/AppHeader";
import SideMenu from "./components/SideMenu";
import PageContent from "./components/PageContent";
import AppFooter from "./components/AppFooter";
import Login from "./components/Login";

const { Sider, Content } = Layout;

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <Routes>
      {/* Login Route */}
      <Route 
        path="/login" 
        element={isLoggedIn ? <Navigate to="/devices" replace /> : <Login onLogin={handleLogin} />} 
      />

      {/* Protected Routes */}
      <Route 
        path="/*" 
        element={
          isLoggedIn ? (
            <Layout className="App" style={{ minHeight: "100vh" }}>
              <AppHeader onLogout={handleLogout} />
              <Layout className="SideMenuAndPageContent">
                <Sider
                  width={collapsed ? 80 : 250}
                  style={{
                    background: "#fff",
                    transition: "width 0.3s"
                  }}
                >
                  <SideMenu
                    collapsed={collapsed}
                    onCollapse={setCollapsed}
                    onLogout={handleLogout}
                  />
                </Sider>
                <Content
                  style={{
                    padding: "20px",
                    backgroundColor: "#fff",
                    width: `calc(100% - ${collapsed ? 80 : 250}px)`,
                    transition: "width 0.3s"
                  }}
                >
                  <PageContent />
                </Content>
              </Layout>
              <AppFooter />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

export default App;