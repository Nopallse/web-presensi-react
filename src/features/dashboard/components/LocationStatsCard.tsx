import React from 'react';
import { Card, Progress, Row, Col, Typography, Space } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

interface LocationStatsProps {
  totalLocations: number;
  activeLocations: number;
  inactiveLocations: number;
}

const LocationStatsCard: React.FC<LocationStatsProps> = ({
  totalLocations,
  activeLocations,
  inactiveLocations
}) => {
  const activePercentage = totalLocations > 0 ? (activeLocations / totalLocations) * 100 : 0;
  const inactivePercentage = totalLocations > 0 ? (inactiveLocations / totalLocations) * 100 : 0;

  return (
    <Card 
      title="Status Lokasi" 
      size="default"
      style={{ height: '100%' }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Text type="secondary">Total Lokasi Terdaftar</Text>
          <Title level={2} style={{ margin: '8px 0' }}>{totalLocations}</Title>
        </div>
        
        <div>
          <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
            <Col>
              <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} />
            </Col>
            <Col flex={1}>
              <Text>Lokasi Aktif</Text>
            </Col>
            <Col>
              <Text strong>{activeLocations}</Text>
            </Col>
          </Row>
          <Progress
            percent={activePercentage}
            strokeColor="#52c41a"
            showInfo={false}
            size="small"
          />
        </div>

        {inactiveLocations > 0 && (
          <div>
            <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
              <Col>
                <ExclamationCircleOutlined style={{ color: '#f5222d', fontSize: 16 }} />
              </Col>
              <Col flex={1}>
                <Text>Lokasi Tidak Aktif</Text>
              </Col>
              <Col>
                <Text strong>{inactiveLocations}</Text>
              </Col>
            </Row>
            <Progress
              percent={inactivePercentage}
              strokeColor="#f5222d"
              showInfo={false}
              size="small"
            />
          </div>
        )}
      </Space>
    </Card>
  );
};

export default LocationStatsCard;