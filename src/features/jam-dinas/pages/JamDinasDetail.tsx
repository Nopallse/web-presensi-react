import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Tag,
  Typography,
  Row,
  Col,
  Table,
  message,
  Spin,
  Alert
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { jamDinasApi } from '../services/jamDinasApi';
import type { 
  JamDinas, 
  StatusJamDinas,
  JamDinasDetail
} from '../types';
import { useAuth } from '../../../store/authStore';

const { Title, Text } = Typography;

const JamDinasDetail: React.FC = () => {
  const [jamDinas, setJamDinas] = useState<JamDinas | null>(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  useEffect(() => {
    if (id && isSuperAdmin) {
      fetchJamDinas();
    }
  }, [id, isSuperAdmin]);

  const fetchJamDinas = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await jamDinasApi.getById(parseInt(id));
      setJamDinas(response.data);
    } catch (error: any) {
      console.error('Error fetching jam dinas detail:', error);
      message.error('Gagal memuat detail jam dinas');
      navigate('/jam-dinas');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5); // Remove seconds part
  };

  const getStatusColor = (status: StatusJamDinas) => {
    return status === 1 ? 'success' : 'default';
  };

  const getStatusText = (status: StatusJamDinas) => {
    return status === 1 ? 'Aktif' : 'Tidak Aktif';
  };

  const getTipeColor = (tipe: string) => {
    return tipe === 'normal' ? 'blue' : 'orange';
  };

  // Show access denied for non-super admin
  if (!isSuperAdmin) {
    return (
      <div style={{ padding: '24px', maxWidth: '100%', overflow: 'hidden' }}>
        <Card>
          <Alert
            message="Akses Ditolak"
            description="Hanya super admin yang dapat mengakses halaman jam dinas."
            type="error"
            showIcon
          />
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: '24px', maxWidth: '100%', overflow: 'hidden' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text type="secondary">Memuat detail jam dinas...</Text>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!jamDinas) {
    return (
      <div style={{ padding: '24px', maxWidth: '100%', overflow: 'hidden' }}>
        <Card>
          <Alert
            message="Data Tidak Ditemukan"
            description="Jam dinas yang dicari tidak ditemukan."
            type="warning"
            showIcon
          />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '100%', overflow: 'hidden' }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/jam-dinas')}
                    style={{ marginRight: 16 }}
                  >
                    Kembali
                  </Button>
                  <div>
                    <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                      <ClockCircleOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                      Detail Jam Dinas
                    </Title>
                    <Text type="secondary">
                      Informasi lengkap jam dinas dan jadwal kerja
                    </Text>
                  </div>
                </div>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/jam-dinas/${jamDinas.id}/edit`)}
                >
                  Edit Jam Dinas
                </Button>
              </div>
            </div>

            {/* Basic Info */}
            <Card 
              size="small" 
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <ClockCircleOutlined style={{ marginRight: 8 }} />
                  Informasi Dasar
                </div>
              } 
              style={{ marginBottom: 16 }}
            >
              <Row gutter={[24, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>ID</Text>
                    <br />
                    <Text strong style={{ fontSize: '16px' }}>{jamDinas.id}</Text>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>Nama</Text>
                    <br />
                    <Text strong style={{ fontSize: '16px' }}>{jamDinas.nama}</Text>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>Status</Text>
                    <br />
                    <Tag color={getStatusColor(jamDinas.status)} style={{ fontSize: '14px', padding: '4px 8px' }}>
                      {getStatusText(jamDinas.status)}
                    </Tag>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>Hari Kerja</Text>
                    <br />
                    <Text strong style={{ fontSize: '16px' }}>{jamDinas.hari_kerja} hari/minggu</Text>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>Total Jam per Hari</Text>
                    <br />
                    <Text strong style={{ fontSize: '16px' }}>
                      {Math.floor(jamDinas.menit / 60)}:{(jamDinas.menit % 60).toString().padStart(2, '0')} jam
                    </Text>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>Total Menit</Text>
                    <br />
                    <Text strong style={{ fontSize: '16px' }}>{jamDinas.menit} menit</Text>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>Dibuat</Text>
                    <br />
                    <Text style={{ fontSize: '14px' }}>
                      {new Date(jamDinas.createdAt).toLocaleDateString('id-ID')}
                    </Text>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>Diperbarui</Text>
                    <br />
                    <Text style={{ fontSize: '14px' }}>
                      {new Date(jamDinas.updatedAt).toLocaleDateString('id-ID')}
                    </Text>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Detail Jadwal */}
            <Card 
              size="small" 
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarOutlined style={{ marginRight: 8 }} />
                  Detail Jadwal ({jamDinas.details?.length || 0} item)
                </div>
              } 
              style={{ marginBottom: 16 }}
            >
              <Table
                size="small"
                columns={[
                  {
                    title: 'No',
                    key: 'no',
                    width: 50,
                    render: (_, __, index) => index + 1,
                  },
                  {
                    title: 'Hari',
                    dataIndex: 'hari',
                    key: 'hari',
                    render: (hari: string) => 
                      hari.charAt(0).toUpperCase() + hari.slice(1)
                  },
                  {
                    title: 'Tipe',
                    dataIndex: 'tipe',
                    key: 'tipe',
                    render: (tipe: string) => (
                      <Tag color={getTipeColor(tipe)}>
                        {tipe.charAt(0).toUpperCase() + tipe.slice(1)}
                      </Tag>
                    )
                  },
                  {
                    title: 'Jam Masuk',
                    key: 'masuk',
                    render: (record: JamDinasDetail) => 
                      `${formatTime(record.jam_masuk_mulai)} - ${formatTime(record.jam_masuk_selesai)}`
                  },
                  {
                    title: 'Jam Pulang',
                    key: 'pulang',
                    render: (record: JamDinasDetail) => 
                      `${formatTime(record.jam_pulang_mulai)} - ${formatTime(record.jam_pulang_selesai)}`
                  },
                  {
                    title: 'Dibuat',
                    dataIndex: 'createdAt',
                    key: 'createdAt',
                    render: (date: string) => new Date(date).toLocaleDateString('id-ID')
                  },
                ]}
                dataSource={jamDinas.details}
                rowKey="id"
                pagination={false}
                scroll={{ x: 600 }}
              />
            </Card>

            {/* Unit Kerja Terkait */}
            {jamDinas.assignments && jamDinas.assignments.length > 0 && (
              <Card 
                size="small" 
                title={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <TeamOutlined style={{ marginRight: 8 }} />
                    Unit Kerja Terkait ({jamDinas.assignments.length} unit)
                  </div>
                }
              >
                <Table
                  size="small"
                  columns={[
                    {
                      title: 'No',
                      key: 'no',
                      width: 50,
                      render: (_, __, index) => index + 1,
                    },
                    {
                      title: 'Nama Unit Kerja',
                      dataIndex: 'dinset_nama',
                      key: 'dinset_nama',
                    },
                    {
                      title: 'SKPD',
                      dataIndex: 'id_skpd',
                      key: 'id_skpd',
                      width: 80,
                    },
                    {
                      title: 'Satker',
                      dataIndex: 'id_satker',
                      key: 'id_satker',
                      width: 80,
                    },
                    {
                      title: 'Bidang',
                      dataIndex: 'id_bidang',
                      key: 'id_bidang',
                      width: 80,
                    },
                    {
                      title: 'Status',
                      dataIndex: 'status',
                      key: 'status',
                      width: 100,
                      render: (status: StatusJamDinas) => (
                        <Tag color={getStatusColor(status)}>
                          {getStatusText(status)}
                        </Tag>
                      ),
                    },
                    {
                      title: 'Ditugaskan',
                      dataIndex: 'createdAt',
                      key: 'createdAt',
                      width: 120,
                      render: (date: string) => new Date(date).toLocaleDateString('id-ID')
                    },
                  ]}
                  dataSource={jamDinas.assignments}
                  rowKey="dinset_id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: false,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} dari ${total} unit kerja`,
                  }}
                  scroll={{ x: 800 }}
                />
              </Card>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default JamDinasDetail;