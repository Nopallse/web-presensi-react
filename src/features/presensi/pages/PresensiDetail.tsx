import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Descriptions,
  Tag,
  Button,
  Space,
  Spin,
  message,
  Divider,
  Alert
} from 'antd';
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { presensiApi } from '../services/presensiApi';
import type { Kehadiran } from '../types';

const { Title, Text } = Typography;

const PresensiDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [data, setData] = useState<Kehadiran | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchKehadiranDetail(id);
    }
  }, [id]);

  const fetchKehadiranDetail = async (kehadiranId: string) => {
    setLoading(true);
    try {
      const response = await presensiApi.getKehadiranById(kehadiranId);
      
      if (response.success) {
        setData(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching kehadiran detail:', error);
      message.error(error.message || 'Gagal memuat detail kehadiran');
    } finally {
      setLoading(false);
    }
  };

  const renderStatusInfo = (record: Kehadiran) => {
    const statusItems = [];

    // Kategori Kehadiran
    if (record.absen_kat) {
      statusItems.push({
        key: 'kategori',
        label: 'Kategori Kehadiran',
        children: (
          <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
            {record.absen_kat}
          </Tag>
        )
      });
    }

    // Status Apel Pagi
    if (record.absen_apel) {
      const isHadir = record.absen_apel === 'HAP';
      statusItems.push({
        key: 'apel',
        label: 'Status Apel Pagi',
        children: (
          <Tag 
            color={isHadir ? 'green' : 'orange'} 
            icon={isHadir ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
            style={{ fontSize: '14px', padding: '4px 12px' }}
          >
            {isHadir ? 'Hadir Apel Pagi' : 'Telat Apel Pagi'}
          </Tag>
        )
      });
    }

    // Status Apel Sore
    if (record.absen_sore) {
      const isHadir = record.absen_sore === 'HAS';
      statusItems.push({
        key: 'sore',
        label: 'Status Apel Sore',
        children: (
          <Tag 
            color={isHadir ? 'green' : 'red'} 
            icon={isHadir ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            style={{ fontSize: '14px', padding: '4px 12px' }}
          >
            {isHadir ? 'Hadir Apel Sore' : 'Cepat Pulang'}
          </Tag>
        )
      });
    }

    return statusItems;
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Memuat detail kehadiran...</Text>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <Alert
          message="Data Tidak Ditemukan"
          description="Detail kehadiran yang Anda cari tidak ditemukan."
          type="warning"
          showIcon
          action={
            <Button type="primary" onClick={() => navigate('/presensi')}>
              Kembali ke Daftar
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Row gutter={[0, 24]}>
        {/* Header */}
        <Col span={24}>
          <Card>
            <Row justify="space-between" align="middle">
              <Col>
                <Space>
                  <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/presensi')}
                  >
                    Kembali
                  </Button>
                  <Divider type="vertical" />
                  <div>
                    <Title level={3} style={{ margin: 0 }}>
                      Detail Presensi
                    </Title>
                    <Text type="secondary">
                      ID: {data.absen_id}
                    </Text>
                  </div>
                </Space>
              </Col>
              <Col>
                <Tag 
                  color="blue" 
                  icon={<CalendarOutlined />}
                  style={{ fontSize: '14px', padding: '6px 12px' }}
                >
                  {dayjs(data.absen_tgl).format('DD MMMM YYYY')}
                </Tag>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Basic Information */}
        <Col span={24}>
          <Card title="Informasi Dasar" bordered={false}>
            <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered>
              <Descriptions.Item 
                label={<><CalendarOutlined /> Tanggal</>}
                span={1}
              >
                <Text strong>
                  {dayjs(data.absen_tgl).format('dddd, DD MMMM YYYY')}
                </Text>
              </Descriptions.Item>
              
              <Descriptions.Item 
                label={<><ClockCircleOutlined /> Waktu Absen</>}
                span={1}
              >
                <Text>
                  {dayjs(data.absen_tgljam).format('HH:mm:ss')}
                </Text>
              </Descriptions.Item>
              
              <Descriptions.Item 
                label="NIP"
                span={1}
              >
                <Text code>{data.absen_nip}</Text>
              </Descriptions.Item>

              <Descriptions.Item 
                label={<><ClockCircleOutlined /> Check In</>}
                span={1}
              >
                <Text strong style={{ color: data.absen_checkin ? '#52c41a' : '#ff4d4f' }}>
                  {data.absen_checkin || 'Belum Check In'}
                </Text>
              </Descriptions.Item>

              <Descriptions.Item 
                label={<><ClockCircleOutlined /> Check Out</>}
                span={1}
              >
                <Text strong style={{ color: data.absen_checkout ? '#52c41a' : '#ff4d4f' }}>
                  {data.absen_checkout || 'Belum Check Out'}
                </Text>
              </Descriptions.Item>

              <Descriptions.Item 
                label={<><EnvironmentOutlined /> Lokasi ID</>}
                span={1}
              >
                <Text code>{data.lokasi_id}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* User Information */}
        {data.User && (
          <Col xs={24} lg={12}>
            <Card 
              title={<><UserOutlined /> Informasi Pegawai</>} 
              bordered={false}
            >
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Username">
                  <Text strong>{data.User.username}</Text>
                </Descriptions.Item>
                
                <Descriptions.Item label="Email">
                  <Text copyable>{data.User.email}</Text>
                </Descriptions.Item>
                
                <Descriptions.Item label="Level">
                  <Tag color="purple">{data.User.level}</Tag>
                </Descriptions.Item>
                
                <Descriptions.Item label="Status">
                  <Tag color={data.User.status === 'active' ? 'green' : 'red'}>
                    {data.User.status}
                  </Tag>
                </Descriptions.Item>

                {data.User.id_opd && (
                  <Descriptions.Item label="ID OPD">
                    <Text code>{data.User.id_opd}</Text>
                  </Descriptions.Item>
                )}

                {data.User.id_upt && (
                  <Descriptions.Item label="ID UPT">
                    <Text code>{data.User.id_upt}</Text>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          </Col>
        )}

        {/* Location Information */}
        {data.Lokasi && (
          <Col xs={24} lg={12}>
            <Card 
              title={<><EnvironmentOutlined /> Informasi Lokasi</>} 
              bordered={false}
            >
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Lokasi ID">
                  <Text code>{data.Lokasi.lokasi_id}</Text>
                </Descriptions.Item>
                
                <Descriptions.Item label="Keterangan">
                  <Text strong>{data.Lokasi.ket}</Text>
                </Descriptions.Item>
                
                <Descriptions.Item label="Koordinat">
                  <Space direction="vertical" size="small">
                    <Text>
                      <strong>Latitude:</strong> {data.Lokasi.lat}
                    </Text>
                    <Text>
                      <strong>Longitude:</strong> {data.Lokasi.lng}
                    </Text>
                  </Space>
                </Descriptions.Item>

                {data.Lokasi.range && (
                  <Descriptions.Item label="Jangkauan">
                    <Text>{data.Lokasi.range} meter</Text>
                  </Descriptions.Item>
                )}

                {data.Lokasi.status && (
                  <Descriptions.Item label="Status Lokasi">
                    <Tag color={data.Lokasi.status === 'active' ? 'green' : 'red'}>
                      {data.Lokasi.status}
                    </Tag>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          </Col>
        )}

        {/* Status Information */}
        <Col span={24}>
          <Card title="Status Kehadiran" bordered={false}>
            <Descriptions 
              column={{ xs: 1, sm: 2, md: 3 }} 
              bordered
              items={renderStatusInfo(data)}
            />
          </Card>
        </Col>

        {/* Summary Card */}
        <Col span={24}>
          <Card 
            title="Ringkasan" 
            bordered={false}
            style={{ backgroundColor: '#fafafa' }}
          >
            <Row gutter={16}>
              <Col span={8}>
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <div style={{ fontSize: '24px', color: '#1890ff', marginBottom: '8px' }}>
                    <CalendarOutlined />
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                    {dayjs(data.absen_tgl).format('DD/MM/YYYY')}
                  </div>
                  <div style={{ color: '#666', fontSize: '12px' }}>
                    Tanggal Absen
                  </div>
                </div>
              </Col>
              
              <Col span={8}>
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <div style={{ fontSize: '24px', color: '#52c41a', marginBottom: '8px' }}>
                    <CheckCircleOutlined />
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                    {data.absen_checkin || 'N/A'}
                  </div>
                  <div style={{ color: '#666', fontSize: '12px' }}>
                    Waktu Masuk
                  </div>
                </div>
              </Col>
              
              <Col span={8}>
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <div style={{ fontSize: '24px', color: '#ff4d4f', marginBottom: '8px' }}>
                    <CloseCircleOutlined />
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                    {data.absen_checkout || 'N/A'}
                  </div>
                  <div style={{ color: '#666', fontSize: '12px' }}>
                    Waktu Keluar
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PresensiDetail;