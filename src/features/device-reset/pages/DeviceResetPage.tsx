import React from 'react';
import { Row, Col, Typography, Card } from 'antd';
import { MobileOutlined } from '@ant-design/icons';
import DeviceResetTable from '../components/DeviceResetTable';

const { Title, Text } = Typography;

const DeviceResetPage: React.FC = () => {
  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <Row gutter={[0, 16]}>
        <Col span={24}>
          <Card>
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
              <Col>
                <Title level={3} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MobileOutlined />
                  Reset Device
                </Title>
                <Text type="secondary">
                  Kelola permintaan reset device dari pengguna
                </Text>
              </Col>
            </Row>
            
            <DeviceResetTable />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DeviceResetPage;