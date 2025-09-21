import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Input, 
  Typography, 
  message,
  Tag
} from 'antd';
import { 
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined
} from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { useAuth } from '../../../store/authStore';
import { pegawaiApi } from '../services/pegawaiApi';
import { skpdApi } from '../../skpd/services/skpdApi';
import type { Pegawai, PegawaiFilters } from '../types';
import DebounceSelect from '../../../components/DebounceSelect';

const { Title } = Typography;
const { Search } = Input;

const PegawaiPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState<PegawaiFilters>({});
  const [selectedSKPD, setSelectedSKPD] = useState<{ label: string; value: string } | null>(null);

  // Check if user is super admin
  console.log('User role:', user?.role);
  const isSuperAdmin = user?.role === 'super_admin';

  const columns: ColumnsType<Pegawai> = [
    {
      title: 'NIP',
      dataIndex: 'nip',
      key: 'nip',
      width: 140,
      render: (nip: string) => <code style={{ fontSize: '12px' }}>{nip || '-'}</code>,
    },
    {
      title: 'Nama',
      dataIndex: 'nama',
      key: 'nama',
      width: 150,
      ellipsis: true,
      render: (nama: string) => <strong style={{ fontSize: '13px' }}>{nama || '-'}</strong>,
    },
    {
      title: 'Kode SKPD',
      dataIndex: 'kdskpd',
      key: 'kdskpd',
      width: 100,
      render: (kdskpd: string) => <code style={{ fontSize: '11px' }}>{kdskpd || '-'}</code>,
    },
    {
      title: 'SKPD',
      key: 'skpd_nama',
      width: 200,
      ellipsis: true,
      render: (_, record: Pegawai) => record.skpd?.nmskpd || '-',
    },
    {
      title: 'Status',
      dataIndex: 'status_aktif',
      key: 'status_aktif',
      width: 100,
      render: (status: string) => {
        const color = status === 'AKTIF' ? 'green' : status === 'NONAKTIF' ? 'red' : 'default';
        const text = status || 'TIDAK DIKETAHUI';
        return <Tag color={color} style={{ fontSize: '11px' }}>{text}</Tag>;
      },
    },
    {
      title: 'Aksi',
      key: 'actions',
      width: 60,
      render: (_, record: Pegawai) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => handleDetail(record)}
          size="small"
          title="Lihat Detail"
        />
      ),
    },
  ];

  const fetchPegawai = async () => {
    setLoading(true);
    try {
      console.log('Fetching pegawai with filters:', filters); // Log untuk debugging
      
      const response = await pegawaiApi.getAll({
        ...filters,
        page: pagination.current,
        limit: pagination.pageSize,
      });

      setPegawaiList(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.totalItems,
      }));
    } catch (error) {
      console.error('Error fetching pegawai:', error);
      message.error('Gagal memuat data pegawai');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPegawai();
  }, [pagination.current, pagination.pageSize, filters]);

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setPagination(prev => ({
      ...prev,
      current: pagination.current || 1,
      pageSize: pagination.pageSize || 10,
    }));
  };

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleSKPDFilter = (value: { label: string; value: string } | { label: string; value: string }[] | null) => {
    const singleValue = Array.isArray(value) ? value[0] : value;
    setSelectedSKPD(singleValue);
    setFilters(prev => ({ ...prev, kdskpd: singleValue?.value || undefined }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleDetail = (pegawai: Pegawai) => {
    // TODO: Navigate to detail page or show detail modal
    console.log('View detail for:', pegawai);
    message.info(`Detail untuk ${pegawai.nama} - fitur akan segera tersedia`);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSelectedSKPD(null);
    setPagination(prev => ({ ...prev, current: 1 }));
    message.success('Filter berhasil dibersihkan');
  };

  // Fetch SKPD options for filter
  const fetchSKPDOptions = async (search: string) => {
    try {
      if (!isSuperAdmin) {
        return [];
      }

      const response = await skpdApi.getAll({
        search: search || '',
        page: 1,
        limit: 20,
      });

      const options = response.data.map(skpd => ({
        label: `${skpd.KDSKPD} - ${skpd.NMSKPD}`,
        value: skpd.KDSKPD,
      }));

      return options;
    } catch (error) {
      console.error('Error fetching SKPD list:', error);
      message.error('Gagal memuat daftar SKPD');
      return [];
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '100%', overflow: 'hidden' }}>
      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <Title level={3} style={{ margin: 0 }}>
            Data Pegawai
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
            placeholder="Cari nama pegawai atau NIP..."
            allowClear
            style={{ width: 250, minWidth: 200 }}
            onSearch={handleSearch}
            prefix={<SearchOutlined />}
          />
          
          {isSuperAdmin && (
            <DebounceSelect
              placeholder="Filter SKPD"
              style={{ width: 250, minWidth: 200 }}
              allowClear
              value={selectedSKPD}
              onChange={handleSKPDFilter}
              fetchOptions={fetchSKPDOptions}
              debounceTimeout={500}
            />
          )}

          <Button
            icon={<ReloadOutlined />}
            onClick={fetchPegawai}
            loading={loading}
          >
            Refresh
          </Button>

          {(filters.search || filters.kdskpd) && (
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
          dataSource={pegawaiList}
          rowKey="id"
          loading={loading}
          size="small"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} dari ${total} pegawai`,
          }}
          onChange={handleTableChange}
        />
      </Card>
    </div>
  );
};

export default PegawaiPage;