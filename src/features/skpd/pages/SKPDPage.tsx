import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Input, 
  Typography, 
  message,
  Tag,
  Space,
  Tooltip,
  Badge
} from 'antd';
import { 
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined
} from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { useAuth } from '../../../store/authStore';
import { skpdApi } from '../services/skpdApi';
import type { SKPD, SKPDFilters } from '../types';
import SKPDDetailModal from '../components/SKPDDetailModal';

const { Title } = Typography;
const { Search } = Input;

const SKPDPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [skpdList, setSKPDList] = useState<SKPD[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState<SKPDFilters>({});
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedSKPD, setSelectedSKPD] = useState<SKPD | null>(null);

  // Check if user is super admin
  const isSuperAdmin = user?.role === 'super_admin';

  // Redirect if not super admin
  React.useEffect(() => {
    if (!isSuperAdmin) {
      message.error('Akses ditolak. Hanya super admin yang dapat mengakses halaman ini.');
      // Could add navigation back to dashboard here
    }
  }, [isSuperAdmin]);

  const columns: ColumnsType<SKPD> = [
    {
      title: 'Kode SKPD',
      dataIndex: 'KDSKPD',
      key: 'KDSKPD',
      width: 120,
      fixed: 'left',
      render: (code: string) => <code style={{ fontSize: '12px', fontWeight: 'bold' }}>{code}</code>,
    },
    {
      title: 'Nama SKPD',
      dataIndex: 'NMSKPD',
      key: 'NMSKPD',
      ellipsis: {
        showTitle: false,
      },
      render: (nama: string) => (
        <Tooltip placement="topLeft" title={nama}>
          <strong style={{ fontSize: '13px' }}>{nama}</strong>
        </Tooltip>
      ),
    },
    {
      title: 'Jumlah Pegawai',
      dataIndex: 'employee_count',
      key: 'employee_count',
      width: 120,
      align: 'center',
      render: (count: number) => (
        <Badge 
          count={count} 
          showZero 
          style={{ backgroundColor: '#52c41a' }}
          title={`${count} pegawai`}
        />
      ),
    },
    {
      title: 'Jumlah Admin',
      dataIndex: 'admin_count',
      key: 'admin_count',
      width: 120,
      align: 'center',
      render: (count: number) => (
        <Badge 
          count={count} 
          showZero 
          style={{ backgroundColor: '#1890ff' }}
          title={`${count} admin`}
        />
      ),
    },
       {
          title: 'Status',
          dataIndex: 'StatusSKPD',
          key: 'status',
          width: 100,
          align: 'center',
          render: (status: string) => {
        if (status === 'Aktif') {
          return <Tag color="green">Aktif</Tag>;
        } else if (status === 'NonAktif') {
          return <Tag color="red">Tidak Aktif</Tag>;
        } else {
          return <Tag color="orange">{status}</Tag>;
        }
          },
        },
        {
          title: 'Aksi',
          key: 'actions',
          width: 80,
          fixed: 'right',
          align: 'center',
          render: (_, record: SKPD) => (
        <Space size="small">
          <Tooltip title="Lihat Detail">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleDetail(record)}
              size="small"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const fetchSKPD = async () => {
    if (!isSuperAdmin) {
      return;
    }

    setLoading(true);
    try {
      const response = await skpdApi.getAll({
        ...filters,
        page: pagination.current,
        limit: pagination.pageSize,
      });

      setSKPDList(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.totalItems,
      }));
    } catch (error) {
      console.error('Error fetching SKPD:', error);
      message.error('Gagal memuat data SKPD');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchSKPD();
    }
  }, [pagination.current, pagination.pageSize, filters, isSuperAdmin]);

  const handleTableChange = (pag: TablePaginationConfig) => {
    setPagination(prev => ({
      ...prev,
      current: pag.current || 1,
      pageSize: pag.pageSize || 10,
    }));
  };

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleDetail = (skpd: SKPD) => {
    setSelectedSKPD(skpd);
    setDetailModalOpen(true);
  };

  const handleClearFilters = () => {
    setFilters({});
    setPagination(prev => ({ ...prev, current: 1 }));
    message.success('Filter berhasil dibersihkan');
  };

  // Don't render if not super admin
  if (!isSuperAdmin) {
    return null;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '100%', overflow: 'hidden' }}>
      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <Title level={3} style={{ margin: 0 }}>
            Data SKPD
          </Title>
          
        </div>

        <div style={{ 
          marginBottom: '16px', 
          display: 'flex', 
          gap: '12px', 
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <Search
            placeholder="Cari kode atau nama SKPD..."
            allowClear
            style={{ width: 300, minWidth: 250 }}
            onSearch={handleSearch}
            prefix={<SearchOutlined />}
          />

          <Button
            icon={<ReloadOutlined />}
            onClick={fetchSKPD}
            loading={loading}
          >
            Refresh
          </Button>

          {filters.search && (
            <Button
              onClick={handleClearFilters}
              type="dashed"
            >
              Clear Filter
            </Button>
          )}
        </div>

        <Table
          columns={columns}
          dataSource={skpdList}
          rowKey="KDSKPD"
          loading={loading}
          size="small"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} dari ${total} SKPD`,
          }}
          onChange={handleTableChange}
        />
      </Card>

      <SKPDDetailModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        skpd={selectedSKPD}
      />
    </div>
  );
};

export default SKPDPage;