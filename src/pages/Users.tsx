import React, { useEffect, useState } from 'react';
import { Table, Button, message, Form, Input, Select, Space, Card, Row, Col, Typography } from 'antd';
import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import MainLayout from '../components/MainLayout';
import { API_URL } from '../config/config';
import { axiosInstance } from '../services/authService';

const { Option } = Select;
const { Search } = Input;
const { Title } = Typography;

interface User {
  _id: string;
  email: string;
  username: string;
  contactNumber: string;
  role: string;
  createdAt: string;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axiosInstance.get(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.data);
      setFilteredUsers(response.data.data);
    } catch (error: any) {
      console.error('Error details:', error);
      message.error(error.response?.data?.message || 'Kullanıcılar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1);
    const searchLower = value.toLowerCase();
    const filtered = users.filter(user => 
      user.email.toLowerCase().includes(searchLower) ||
      user.username.toLowerCase().includes(searchLower)
    );
    setFilteredUsers(filtered);
  };

  const handleDelete = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.delete(`${API_URL}/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success('Kullanıcı başarıyla silindi');
      fetchUsers();
    } catch (error: any) {
      console.error('Error details:', error);
      message.error(error.response?.data?.message || 'Kullanıcı silinirken bir hata oluştu');
    }
  };

  const handleUpdateUser = async (userId: string, values: any) => {
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.patch(`${API_URL}/api/admin/users/${userId}`, values, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success('Kullanıcı başarıyla güncellendi');
      fetchUsers();
      setExpandedRowKeys(expandedRowKeys.filter(key => key !== userId));
    } catch (error: any) {
      console.error('Error details:', error);
      message.error(error.response?.data?.message || 'Kullanıcı güncellenirken bir hata oluştu');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const expandedRowRender = (record: User) => {
    return (
      <Card bordered={false}>
        <Form
          layout="vertical"
          initialValues={{
            email: record.email,
            username: record.username,
            contactNumber: record.contactNumber,
            role: record.role
          }}
          onFinish={(values) => handleUpdateUser(record._id, values)}
        >
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Email zorunludur' },
                  { type: 'email', message: 'Geçerli bir email adresi girin' }
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <Form.Item
                name="username"
                label="Kullanıcı Adı"
                rules={[{ required: true, message: 'Kullanıcı adı zorunludur' }]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <Form.Item
                name="contactNumber"
                label="İletişim Numarası"
              >
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <Form.Item
                name="role"
                label="Rol"
                rules={[{ required: true, message: 'Lütfen bir rol seçin' }]}
              >
                <Select>
                  <Option value="user">Kullanıcı</Option>
                  <Option value="admin">Admin</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <Form.Item
                name="password"
                label="Şifre"
                extra="Şifreyi değiştirmek istemiyorsanız boş bırakın"
              >
                <Input.Password />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Kaydet
              </Button>
              <Button 
                onClick={() => setExpandedRowKeys(expandedRowKeys.filter(key => key !== record._id))}
              >
                İptal
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    );
  };

  const columns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: '30%',
      render: (text: string) => (
        <span style={{ color: '#1890ff', cursor: 'pointer' }}>{text}</span>
      )
    },
    {
      title: 'Kullanıcı Adı',
      dataIndex: 'username',
      key: 'username',
      width: '25%',
    },
    {
      title: 'Rol',
      dataIndex: 'role',
      key: 'role',
      width: '15%',
      render: (role: string) => (
        <span style={{ 
          padding: '4px 8px',
          borderRadius: '4px',
          backgroundColor: role === 'admin' ? 'rgba(24, 144, 255, 0.1)' : 'rgba(82, 196, 26, 0.1)',
          color: role === 'admin' ? '#1890ff' : '#52c41a'
        }}>
          {role === 'admin' ? 'Admin' : 'Kullanıcı'}
        </span>
      )
    },
    {
      title: 'Oluşturulma Tarihi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '20%',
      render: (date: string) => new Date(date).toLocaleDateString('tr-TR')
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: '10%',
      align: 'right' as const,
      render: (_: any, record: User) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record._id)}
        />
      ),
    },
  ];

  return (
    <MainLayout>
      <div style={{ padding: '24px' }}>
        <Card bordered={false}>
          <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
            <Col>
              <Title level={2} style={{ margin: 0 }}>Kullanıcılar</Title>
            </Col>
            <Col>
              <Search
                placeholder="Email veya kullanıcı adı ile ara..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={handleSearch}
                onChange={e => handleSearch(e.target.value)}
                style={{ width: 300 }}
              />
            </Col>
          </Row>
          <Table
            columns={columns}
            dataSource={filteredUsers}
            loading={loading}
            rowKey="_id"
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: filteredUsers.length,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `Toplam ${total} kullanıcı`,
              pageSizeOptions: ['10', '20', '50', '100'],
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              }
            }}
            expandable={{
              expandedRowRender,
              expandRowByClick: true,
              expandedRowKeys,
              onExpand: (expanded, record) => {
                setExpandedRowKeys(
                  expanded 
                    ? [...expandedRowKeys, record._id]
                    : expandedRowKeys.filter(key => key !== record._id)
                );
              }
            }}
            scroll={{ x: 800 }}
          />
        </Card>
      </div>
    </MainLayout>
  );
};

export default Users; 