import React from 'react';
import { Card, Empty, Tag, Space, Typography, Row, Col } from 'antd';
import { 
  CalendarOutlined, 
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import type { KegiatanHariIni } from '../services/dashboardApi';

const { Text } = Typography;

interface KegiatanHariIniCardProps {
  kegiatanList: KegiatanHariIni[];
  loading?: boolean;
}

const KegiatanHariIniCard: React.FC<KegiatanHariIniCardProps> = ({ 
  kegiatanList, 
  loading = false 
}) => {
  const formatTime = (timeString: string | null) => {
    if (!timeString) return '-';
    return timeString.substring(0, 5); // Format HH:mm
  };

  const getIncludeAbsenTag = (includeAbsen: string) => {
    const config = {
      'none': { color: 'default', text: 'Tidak Ada Absensi', icon: <CloseCircleOutlined /> },
      'apel': { color: 'blue', text: 'Apel Pagi', icon: <CheckCircleOutlined /> },
      'pagi': { color: 'blue', text: 'Apel Pagi', icon: <CheckCircleOutlined /> },
      'sore': { color: 'orange', text: 'Apel Sore', icon: <CheckCircleOutlined /> },
      'both': { color: 'green', text: 'Apel Pagi & Sore', icon: <CheckCircleOutlined /> }
    };

    const setting = config[includeAbsen as keyof typeof config] || config.none;

    return (
      <Tag color={setting.color} icon={setting.icon} style={{ margin: 0, fontSize: '11px' }}>
        {setting.text}
      </Tag>
    );
  };

  if (loading) {
    return (
      <Card 
        size="small"
        loading={true}
        style={{ borderRadius: '8px' }}
      />
    );
  }

  if (!kegiatanList || kegiatanList.length === 0) {
    return (
      <Card 
        size="small"
        style={{ borderRadius: '8px', textAlign: 'center' }}
      >
        <Empty 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<Text type="secondary">Tidak ada kegiatan hari ini</Text>}
          style={{ margin: '8px 0' }}
        />
      </Card>
    );
  }

  return (
    <Card 
      size="small"
      title={
        <Space>
          <CalendarOutlined style={{ color: '#1890ff' }} />
          <Text strong>Kegiatan Hari Ini ({kegiatanList.length})</Text>
        </Space>
      }
      style={{ 
        borderRadius: '8px',
        borderLeft: '4px solid #1890ff'
      }}
    >
      <Row gutter={[12, 12]}>
        {kegiatanList.map((kegiatan) => (
          <Col xs={24} sm={12} lg={8} key={kegiatan.id_kegiatan}>
            <Card
              size="small"
              style={{
                borderRadius: '6px',
                border: '1px solid #f0f0f0',
                height: '100%'
              }}
              bodyStyle={{ padding: '12px' }}
            >
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Text strong style={{ fontSize: '13px', flex: 1, marginRight: '8px' }}>
                    {kegiatan.keterangan || kegiatan.jenis_kegiatan}
                  </Text>
                  {getIncludeAbsenTag(kegiatan.include_absen)}
                </div>

                {/* Info */}
                <Space direction="vertical" size={4} style={{ width: '100%' }}>
                  <Space size="small">
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                      Jenis:
                    </Text>
                    <Tag color="blue" style={{ fontSize: '11px', margin: 0 }}>
                      {kegiatan.jenis_kegiatan}
                    </Tag>
                  </Space>
                  
                  {(kegiatan.jam_mulai || kegiatan.jam_selesai) && (
                    <Space size="small">
                      <ClockCircleOutlined style={{ color: '#8c8c8c', fontSize: '11px' }} />
                      <Text type="secondary" style={{ fontSize: '11px' }}>
                        {formatTime(kegiatan.jam_mulai)} - {formatTime(kegiatan.jam_selesai)}
                      </Text>
                    </Space>
                  )}
                </Space>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default KegiatanHariIniCard;
