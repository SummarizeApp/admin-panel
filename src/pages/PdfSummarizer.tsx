import React, { useState, useEffect } from 'react';
import { Upload, Form, Input, Button, message, Card, Typography, List, Space, Collapse, Tag, Progress } from 'antd';
import { InboxOutlined, FileTextOutlined, DownloadOutlined, ClockCircleOutlined } from '@ant-design/icons';
import MainLayout from '../components/MainLayout';
import { axiosInstance } from '../services/authService';
import { API_URL } from '../config/config';
import PdfService from '../services/pdfService';

const { Dragger } = Upload;
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;

interface PdfSummary {
  _id: string;
  title: string;
  description: string;
  summary: string;
  fileUrl: string;
  summaryFileUrl: string;
  createdAt: string;
  stats: {
    processingTime: number;
    compressionRatio: number;
    originalLength: number;
    summaryLength: number;
  };
}

const PdfSummarizer: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [summaries, setSummaries] = useState<PdfSummary[]>([]);
  const [loadingSummaries, setLoadingSummaries] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<{ [key: string]: number }>({});

  const pdfService = PdfService.getInstance();

  const fetchSummaries = async () => {
    try {
      setLoadingSummaries(true);
      const response = await axiosInstance.get(`${API_URL}/api/cases`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSummaries(response.data.data);
    } catch (error: any) {
      message.error('Özetler yüklenirken bir hata oluştu');
    } finally {
      setLoadingSummaries(false);
    }
  };

  useEffect(() => {
    fetchSummaries();
  }, []);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', fileList[0].originFileObj);
      formData.append('title', values.title);
      formData.append('description', values.description);

      const token = localStorage.getItem('token');
      const response = await axiosInstance.post(`${API_URL}/api/admin/summarize-pdf`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      message.success('PDF başarıyla özetlendi');
      form.resetFields();
      setFileList([]);
      fetchSummaries();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'PDF özetlenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    beforeUpload: (file: File) => {
      if (file.type !== 'application/pdf') {
        message.error('Sadece PDF dosyaları yükleyebilirsiniz!');
        return false;
      }
      return false;
    },
    onChange: (info: any) => {
      setFileList(info.fileList.slice(-1));
    },
    fileList,
  };

  const handleDownload = async (url: string, title: string, isSummary: boolean = false) => {
    try {
      const fileId = `${title}-${isSummary ? 'summary' : 'original'}`;
      setDownloadProgress(prev => ({ ...prev, [fileId]: 0 }));

      if (isSummary) {
        await pdfService.downloadSummary(url, title);
      } else {
        await pdfService.downloadOriginal(url, title);
      }

      message.success('PDF başarıyla indirildi');
    } catch (error: any) {
      message.error(error.message || 'PDF indirme işlemi başarısız oldu');
    } finally {
      setDownloadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[`${title}-${isSummary ? 'summary' : 'original'}`];
        return newProgress;
      });
    }
  };

  return (
    <MainLayout>
      <div style={{ padding: '24px' }}>
        <Card style={{ marginBottom: '24px' }}>
          <Title level={2}>PDF Özetleyici</Title>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
          >
            <Form.Item
              name="title"
              label="Başlık"
              rules={[{ required: true, message: 'Lütfen bir başlık girin' }]}
            >
              <Input placeholder="PDF için bir başlık girin" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Açıklama"
              rules={[{ required: true, message: 'Lütfen bir açıklama girin' }]}
            >
              <TextArea rows={4} placeholder="PDF için bir açıklama girin" />
            </Form.Item>

            <Form.Item
              name="file"
              label="PDF Dosyası"
              rules={[{ required: true, message: 'Lütfen bir PDF dosyası yükleyin' }]}
            >
              <Dragger {...uploadProps}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">PDF dosyasını buraya sürükleyin veya tıklayarak seçin</p>
                <p className="ant-upload-hint">
                  Sadece PDF dosyaları desteklenmektedir
                </p>
              </Dragger>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} disabled={fileList.length === 0}>
                Özeti Oluştur
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card title="Özetlenmiş PDF'ler" loading={loadingSummaries}>
          <List
            dataSource={summaries}
            renderItem={(item) => (
              <List.Item>
                <Collapse 
                  style={{ width: '100%' }} 
                  expandIconPosition="start"
                  items={[
                    {
                      key: '1',
                      label: (
                        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                          <Space>
                            <FileTextOutlined />
                            <Text strong>{item.title}</Text>
                          </Space>
                          <Space>
                            <Tag color="blue">{Math.round(item.stats.compressionRatio)}% Sıkıştırma</Tag>
                            <Tag color="green">{(item.stats.processingTime / 1000).toFixed(1)}s</Tag>
                          </Space>
                        </Space>
                      ),
                      children: (
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <Text type="secondary">{item.description}</Text>
                          
                          <Card type="inner" title="Özet">
                            <Text>{item.summary}</Text>
                          </Card>
                          
                          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Space>
                              <Button 
                                type="primary" 
                                icon={<DownloadOutlined />}
                                onClick={() => handleDownload(item.summaryFileUrl, item.title, true)}
                                loading={!!downloadProgress[`${item.title}-summary`]}
                              >
                                {downloadProgress[`${item.title}-summary`] !== undefined ? (
                                  <span>İndiriliyor... {downloadProgress[`${item.title}-summary`]}%</span>
                                ) : (
                                  'Özet PDF İndir'
                                )}
                              </Button>
                              <Button 
                                icon={<DownloadOutlined />}
                                onClick={() => handleDownload(item.fileUrl, item.title)}
                                loading={!!downloadProgress[`${item.title}-original`]}
                              >
                                {downloadProgress[`${item.title}-original`] !== undefined ? (
                                  <span>İndiriliyor... {downloadProgress[`${item.title}-original`]}%</span>
                                ) : (
                                  'Orijinal PDF İndir'
                                )}
                              </Button>
                            </Space>
                          </div>

                          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Text type="secondary">
                              <ClockCircleOutlined /> Oluşturulma: {new Date(item.createdAt).toLocaleString('tr-TR')}
                            </Text>
                            <Text type="secondary">
                              Orijinal Uzunluk: {item.stats.originalLength} karakter
                            </Text>
                            <Text type="secondary">
                              Özet Uzunluk: {item.stats.summaryLength} karakter
                            </Text>
                          </Space>
                        </Space>
                      )
                    }
                  ]}
                />
              </List.Item>
            )}
          />
        </Card>
      </div>
    </MainLayout>
  );
};

export default PdfSummarizer; 