import React, { useState } from "react";
import { Layout } from "antd";
import "./App.css";
import AppHeader from "./components/AppHeader";
import SideMenu from "./components/SideMenu";
import PageContent from "./components/PageContent";
import AppFooter from "./components/AppFooter";

const { Sider, Content } = Layout;

function App() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout className="App" style={{ minHeight: "100vh" }}>
      <AppHeader />
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
  );
}

export default App;