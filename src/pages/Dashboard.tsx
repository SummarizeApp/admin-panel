import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Spin, Typography, Table } from 'antd';
import { UserOutlined, FileOutlined, PercentageOutlined, ClockCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import MainLayout from '../components/MainLayout';
import { API_URL } from '../config/config';
import { axiosInstance } from '../services/authService';

const { Title } = Typography;

interface TopUser {
  username: string;
  caseCount: number;
}

interface DashboardStats {
  users: {
    total: number;
    admins: number;
    regularUsers: number;
    newLastWeek: number;
    topUsers: TopUser[];
  };
  cases: {
    total: number;
    newLastWeek: number;
    avgCompressionRatio: number;
    maxCompressionRatio: number;
    avgProcessingTime: number;
    totalTextLength: number;
    totalSummaryLength: number;
    avgOriginalLength: number;
    avgSummaryLength: number;
  };
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get(`${API_URL}/api/admin/dashboard/stats`);
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const topUserColumns = [
    {
      title: 'Kullanıcı Adı',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Case Sayısı',
      dataIndex: 'caseCount',
      key: 'caseCount',
    },
  ];

  if (loading) {
    return (
      <MainLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Spin size="large" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={{ padding: '24px' }}>
        <Title level={2} style={{ marginBottom: '24px' }}>Dashboard</Title>
        
        {/* Kullanıcı İstatistikleri */}
        <Title level={4} style={{ marginBottom: '16px' }}>Kullanıcı İstatistikleri</Title>
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Toplam Kullanıcı"
                value={stats?.users.total}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Admin Sayısı"
                value={stats?.users.admins}
                prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Normal Kullanıcı Sayısı"
                value={stats?.users.regularUsers}
                prefix={<UserOutlined style={{ color: '#52c41a' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Son 7 Gün Yeni Kullanıcı"
                value={stats?.users.newLastWeek}
                prefix={<UserOutlined style={{ color: '#faad14' }} />}
              />
            </Card>
          </Col>
        </Row>

        {/* Case İstatistikleri */}
        <Title level={4} style={{ marginBottom: '16px' }}>Case İstatistikleri</Title>
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Toplam Case"
                value={stats?.cases.total}
                prefix={<FileOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Son 7 Gün Yeni Case"
                value={stats?.cases.newLastWeek}
                prefix={<FileOutlined style={{ color: '#faad14' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Ortalama Sıkıştırma Oranı"
                value={stats?.cases.avgCompressionRatio}
                precision={2}
                suffix="%"
                prefix={<PercentageOutlined style={{ color: '#1890ff' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="En Yüksek Sıkıştırma Oranı"
                value={stats?.cases.maxCompressionRatio}
                precision={2}
                suffix="%"
                prefix={<PercentageOutlined style={{ color: '#52c41a' }} />}
              />
            </Card>
          </Col>
        </Row>

        {/* Detaylı İstatistikler */}
        <Title level={4} style={{ marginBottom: '16px' }}>Detaylı İstatistikler</Title>
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Ortalama İşlem Süresi"
                value={stats?.cases.avgProcessingTime}
                precision={2}
                suffix="sn"
                prefix={<ClockCircleOutlined style={{ color: '#722ed1' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Ortalama Metin Uzunluğu"
                value={Math.round(stats?.cases.avgOriginalLength || 0)}
                prefix={<FileTextOutlined style={{ color: '#eb2f96' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Ortalama Özet Uzunluğu"
                value={Math.round(stats?.cases.avgSummaryLength || 0)}
                prefix={<FileTextOutlined style={{ color: '#13c2c2' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Toplam İşlenen Metin"
                value={stats?.cases.totalTextLength}
                prefix={<FileTextOutlined style={{ color: '#fa541c' }} />}
              />
            </Card>
          </Col>
        </Row>

        {/* En Aktif Kullanıcılar */}
        <Title level={4} style={{ marginBottom: '16px' }}>En Aktif Kullanıcılar</Title>
        <Row>
          <Col span={24}>
            <Card>
              <Table
                dataSource={stats?.users.topUsers}
                columns={topUserColumns}
                pagination={false}
                size="small"
                rowKey={(record) => record.username}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </MainLayout>
  );
};

export default Dashboard; 