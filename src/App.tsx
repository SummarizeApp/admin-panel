import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import PdfSummarizer from './pages/PdfSummarizer';

const darkTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#1890ff',
    colorBgBase: '#141414',
    colorBgContainer: '#1f1f1f',
    colorBgElevated: '#1f1f1f',
    colorBgLayout: '#141414',
    borderRadius: 6,
  },
};

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  console.log('PrivateRoute token check:', token ? 'Token var' : 'Token yok');
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  return (
    <ConfigProvider theme={darkTheme}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/dashboard/users" element={
          <PrivateRoute>
            <Users />
          </PrivateRoute>
        } />
        <Route path="/dashboard/pdf-summarizer" element={
          <PrivateRoute>
            <PdfSummarizer />
          </PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </ConfigProvider>
  );
};

export default App; 