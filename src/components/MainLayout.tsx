import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  UserOutlined,
  DashboardOutlined,
  LogoutOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

const { Sider, Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/dashboard/users',
      icon: <UserOutlined />,
      label: 'Kullanıcılar',
    },
    {
      key: '/dashboard/pdf-summarizer',
      icon: <FileTextOutlined />,
      label: 'PDF Özetleyici',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Çıkış Yap',
      onClick: handleLogout,
      style: { marginTop: 'auto' }
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div style={{ 
          height: '64px', 
          margin: '16px',
          background: 'rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#fff',
          fontSize: '20px'
        }}>
          {!collapsed && 'Admin Panel'}
        </div>
        <Menu
          theme="dark"
          selectedKeys={[location.pathname]}
          mode="inline"
          items={menuItems}
          onClick={({ key }) => {
            if (key !== 'logout') {
              navigate(key);
            }
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100% - 96px)',
          }}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
        <Content style={{ margin: '24px 16px', overflow: 'initial' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 