import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Table, 
  Button, 
  Input, 
  Typography, 
  message,
  Tag,
  Space,
  Popconfirm,
  Row,
  Col,
} from 'antd';
import { 
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ClearOutlined
} from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { useAuth } from '../../../store/authStore';
import { lokasiKegiatanApi } from '../services/lokasiKegiatanApi';
import type { LokasiKegiatan, LokasiKegiatanFilters } from '../types';

const { Title } = Typography;
const { Search } = Input;

const LokasiPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [lokasiList, setLokasiList] = useState<LokasiKegiatan[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState<LokasiKegiatanFilters>({});

  // Check if user is super admin
  const isSuperAdmin = user?.role === 'super_admin';

  const columns: ColumnsType<LokasiKegiatan> = [
    {
      title: 'No',
      key: 'index',
      width: 60,
      render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: 'Keterangan',
      dataIndex: 'ket',
      key: 'ket',
      width: 200,
      ellipsis: true,
      render: (ket: string) => <strong style={{ fontSize: '13px' }}>{ket}</strong>,
    },
    {
      title: 'Koordinat',
      key: 'coordinates',
      width: 150,
      render: (_, record) => (
        <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
          <div>Lat: {record.lat.toFixed(6)}</div>
          <div>Lng: {record.lng.toFixed(6)}</div>
        </div>
      ),
    },
    {
      title: 'Range (m)',
      dataIndex: 'range',
      key: 'range',
      width: 100,
      render: (range: number) => (
        <span style={{ fontSize: '12px', fontWeight: 'bold' }}>
          {range.toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      filters: [
        { text: 'Aktif', value: true },
        { text: 'Tidak Aktif', value: false },
      ],
      render: (status: boolean) => (
        <Tag color={status ? 'green' : 'red'} style={{ fontSize: '11px' }}>
          {status ? 'Aktif' : 'Tidak Aktif'}
        </Tag>
      ),
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/lokasi/${record.lokasi_id}`)}
            title="Lihat Detail"
          />
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/lokasi/${record.lokasi_id}/edit`)}
            title="Edit"
          />
          <Popconfirm
            title="Hapus Lokasi Kegiatan"
            description="Apakah Anda yakin ingin menghapus lokasi kegiatan ini?"
            onConfirm={() => handleDelete(record.lokasi_id)}
            okText="Ya"
            cancelText="Tidak"
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              title="Hapus"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    if (isSuperAdmin) {
      fetchLokasiList();
    }
  }, [isSuperAdmin, pagination.current, pagination.pageSize, filters]);

  const fetchLokasiList = async () => {
    try {
      setLoading(true);
      const response = await lokasiKegiatanApi.getAll({
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters,
      });

      setLokasiList(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.totalItems,
      }));
    } catch (error: any) {
      console.error('Error fetching lokasi kegiatan list:', error);
      message.error('Gagal memuat daftar lokasi kegiatan');
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (paginationConfig: TablePaginationConfig, tableFilters: any) => {
    setPagination(prev => ({
      ...prev,
      current: paginationConfig.current || 1,
      pageSize: paginationConfig.pageSize || 10,
    }));

    // Handle status filter
    if (tableFilters.status) {
      setFilters(prev => ({
        ...prev,
        status: tableFilters.status[0],
      }));
    } else {
      setFilters(prev => {
        const { status, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleSearch = (value: string) => {
    setFilters(prev => ({
      ...prev,
      search: value || undefined,
    }));
    setPagination(prev => ({ ...prev, current: 1 }));
    // fetchLokasiList akan dipanggil otomatis oleh useEffect karena filters berubah
  };

  const handleClearFilters = () => {
    setFilters({});
    setPagination(prev => ({ ...prev, current: 1 }));
    message.success('Filter berhasil dibersihkan');
  };

  const handleRefresh = () => {
    fetchLokasiList();
  };

  const handleDelete = async (lokasiId: number) => {
    try {
      await lokasiKegiatanApi.delete(lokasiId);
      message.success('Lokasi kegiatan berhasil dihapus');
      fetchLokasiList();
    } catch (error: any) {
      console.error('Error deleting lokasi kegiatan:', error);
      message.error('Gagal menghapus lokasi kegiatan');
    }
  };

  const hasActiveFilters = filters.search;

  // Don't render if not super admin
  if (!isSuperAdmin) {
    return (
      <div style={{ padding: '24px', maxWidth: '100%', overflow: 'hidden' }}>
        <Card>
          <div className="text-center py-8">
            <Title level={4}>Akses Ditolak</Title>
            <p>Anda tidak memiliki izin untuk mengakses halaman ini.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '100%', overflow: 'hidden' }}>
      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <Title level={3} style={{ margin: 0 }}>
            Manajemen Lokasi Kegiatan
          </Title>
          
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/lokasi/create')}
          >
            Tambah Lokasi Kegiatan
          </Button>
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Search
              placeholder="Cari lokasi kegiatan..."
              allowClear
              style={{ width: '100%' }}
              onSearch={handleSearch}
              prefix={<SearchOutlined />}
            />
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={loading}
              >
                Refresh
              </Button>

              {hasActiveFilters && (
                <Button
                  icon={<ClearOutlined />}
                  onClick={handleClearFilters}
                  type="dashed"
                >
                  Clear Filter
                </Button>
              )}
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={lokasiList}
          rowKey="lokasi_id"
          loading={loading}
          size="small"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} dari ${total} lokasi kegiatan`,
          }}
          onChange={handleTableChange}
        />
      </Card>
    </div>
  );
};

export default LokasiPage;