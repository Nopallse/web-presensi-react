import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  Tag,
  Tooltip,
  message,
  Typography,
  Row,
  Col,
  Divider,
  Popconfirm
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { jamDinasApi } from '../services/jamDinasApi';
import type { 
  JamDinas, 
  JamDinasFilters, 
  StatusJamDinas
} from '../types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../store/authStore';

const { Title, Text } = Typography;
const { Search } = Input;

const JamDinasPage: React.FC = () => {
  const [jamDinasList, setJamDinasList] = useState<JamDinas[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState<JamDinasFilters>({
    page: 1,
    limit: 10,
  });

  const { user } = useAuth();
  const navigate = useNavigate();
  const isSuperAdmin = user?.role === 'super_admin';

  useEffect(() => {
    if (isSuperAdmin) {
      fetchJamDinas();
    }
  }, [filters, isSuperAdmin]);

  const fetchJamDinas = async () => {
    try {
      setLoading(true);
      const response = await jamDinasApi.getAll(filters);
      setJamDinasList(response.data);
      setPagination({
        current: response.pagination.currentPage,
        pageSize: response.pagination.itemsPerPage,
        total: response.pagination.totalItems,
      });
    } catch (error: any) {
      console.error('Error fetching jam dinas:', error);
      message.error('Gagal memuat data jam dinas');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setFilters(prev => ({
      ...prev,
      search: value || undefined,
      page: 1,
    }));
  };

  const handleStatusFilter = (status: StatusJamDinas | 'all') => {
    setFilters(prev => ({
      ...prev,
      status: status === 'all' ? undefined : status,
      page: 1,
    }));
  };

  const handleTableChange = (pagination: any) => {
    setFilters(prev => ({
      ...prev,
      page: pagination.current,
      limit: pagination.pageSize,
    }));
  };

  const handleDelete = async (id: number) => {
    try {
      await jamDinasApi.delete(id);
      message.success('Jam dinas berhasil dihapus');
      fetchJamDinas();
    } catch (error: any) {
      console.error('Error deleting jam dinas:', error);
      message.error(error.response?.data?.message || 'Gagal menghapus jam dinas');
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await jamDinasApi.toggleStatus(id);
      message.success('Status jam dinas berhasil diubah');
      fetchJamDinas();
    } catch (error: any) {
      console.error('Error toggling status:', error);
      message.error(error.response?.data?.message || 'Gagal mengubah status');
    }
  };

  const showDetail = (id: number) => {
    navigate(`/jam-dinas/${id}`);
  };

  const getStatusColor = (status: StatusJamDinas) => {
    return status === 1 ? 'success' : 'default';
  };

  const getStatusText = (status: StatusJamDinas) => {
    return status === 1 ? 'Aktif' : 'Tidak Aktif';
  };

  const columns = [
    {
      title: 'Nama',
      dataIndex: 'nama',
      key: 'nama',
      render: (nama: string, record: JamDinas) => (
        <div>
          <Text strong>{nama}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            ID: {record.id}
          </Text>
        </div>
      ),
    },
    {
      title: 'Hari Kerja',
      dataIndex: 'hari_kerja',
      key: 'hari_kerja',
      width: 120,
      render: (hari_kerja: number) => (
        <div style={{ textAlign: 'center' }}>
          <Text strong>{hari_kerja}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>hari/minggu</Text>
        </div>
      ),
    },
    {
      title: 'Durasi',
      dataIndex: 'menit',
      key: 'menit',
      width: 120,
      render: (menit: number) => (
        <div style={{ textAlign: 'center' }}>
          <Text strong>{Math.floor(menit / 60)}:{(menit % 60).toString().padStart(2, '0')}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>jam/hari</Text>
        </div>
      ),
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
      title: 'Aksi',
      key: 'actions',
      width: 200,
      render: (record: JamDinas) => (
        <Space>
          <Tooltip title="Lihat Detail">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => showDetail(record.id)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => navigate(`/jam-dinas/${record.id}/edit`)}
            />
          </Tooltip>
          <Tooltip title={record.status === 1 ? 'Nonaktifkan' : 'Aktifkan'}>
            <Popconfirm
              title={`${record.status === 1 ? 'Nonaktifkan' : 'Aktifkan'} jam dinas ini?`}
              onConfirm={() => handleToggleStatus(record.id)}
              okText="Ya"
              cancelText="Batal"
            >
              <Button
                type="text"
                icon={<ClockCircleOutlined />}
                style={{ color: record.status === 1 ? '#ff4d4f' : '#52c41a' }}
              />
            </Popconfirm>
          </Tooltip>
          <Tooltip title="Hapus">
            <Popconfirm
              title="Yakin ingin menghapus jam dinas ini?"
              description="Data yang dihapus tidak dapat dikembalikan"
              onConfirm={() => handleDelete(record.id)}
              okText="Ya, Hapus"
              cancelText="Batal"
              okType="danger"
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Show access denied for non-super admin
  if (!isSuperAdmin) {
    return (
      <div style={{ padding: '24px', maxWidth: '100%', overflow: 'hidden' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <ClockCircleOutlined style={{ fontSize: '64px', color: '#ff4d4f', marginBottom: '16px' }} />
            <Title level={3}>Akses Ditolak</Title>
            <Text type="secondary">
              Hanya super admin yang dapat mengakses halaman jam dinas.
            </Text>
          </div>
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
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                    <ClockCircleOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                    Manajemen Jam Dinas
                  </Title>
                  <Text type="secondary">
                    Kelola jam kerja dan jadwal operasional untuk berbagai unit kerja
                  </Text>
                </div>
                <Space>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => fetchJamDinas()}
                    loading={loading}
                  >
                    Refresh
                  </Button>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/jam-dinas/create')}
                  >
                    Tambah Jam Dinas
                  </Button>
                </Space>
              </div>
            </div>

            <Divider />

            {/* Filters */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col xs={24} sm={12} md={8}>
                <Search
                  placeholder="Cari nama jam dinas..."
                  allowClear
                  onSearch={handleSearch}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Select
                  placeholder="Filter status"
                  allowClear
                  style={{ width: '100%' }}
                  onChange={handleStatusFilter}
                  options={[
                    { label: 'Semua Status', value: 'all' },
                    { label: 'Aktif', value: 1 },
                    { label: 'Tidak Aktif', value: 0 },
                  ]}
                />
              </Col>
            </Row>

            {/* Table */}
            <Table
              columns={columns}
              dataSource={jamDinasList}
              rowKey="id"
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} dari ${total} item`,
              }}
              onChange={handleTableChange}
              scroll={{ x: 900 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default JamDinasPage;