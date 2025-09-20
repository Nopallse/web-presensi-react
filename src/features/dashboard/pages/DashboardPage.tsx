import React from 'react';
import { Card, Row, Col, Statistic, Typography, Space } from 'antd';
import { 
  UserOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  CloseCircleOutlined 
} from '@ant-design/icons';

const { Title } = Typography;

const DashboardPage: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Page Header */}
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Dashboard
          </Title>
          <p style={{ color: '#666', margin: '8px 0 0' }}>
            Selamat datang di Sistem Presensi Pegawai Kota Pariaman
          </p>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Pegawai"
                value="Coming Soon"
                prefix={<UserOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Hadir Hari Ini"
                value="Coming Soon"
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Terlambat"
                value="Coming Soon"
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tidak Hadir"
                value="Coming Soon"
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Presensi Section */}
        <Card title="Presensi Terbaru" size="default">
          <div style={{ 
            textAlign: 'center', 
            padding: '48px 0', 
            color: '#999' 
          }}>
            Data presensi akan ditampilkan di sini
          </div>
        </Card>
      </Space>
    </div>
  );
};

export default DashboardPage;