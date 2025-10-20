import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Table, 
  Button, 
  Input, 
  Typography, 
  message,
  Space,
  Row,
  Col,
  Select,
  Tooltip
} from 'antd';
import { 
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  ClearOutlined
} from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { useAuth } from '../../../store/authStore';
import { pegawaiApi } from '../services/pegawaiApi';
// unitKerjaApi removed: options now fetched via pegawaiApi option endpoints
import type { Pegawai, PegawaiFilters } from '../types';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const PegawaiPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState<PegawaiFilters>({});
  
  // Filter options state
  const [satkerOptions, setSatkerOptions] = useState<Array<{label: string, value: string}>>([]);
  const [bidangOptions, setBidangOptions] = useState<Array<{label: string, value: string}>>([]);
  const [loadingSatker, setLoadingSatker] = useState(false);
  const [loadingBidang, setLoadingBidang] = useState(false);

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
      title: 'Kode Unit Kerja',
      dataIndex: 'kd_unit_kerja',
      key: 'kd_unit_kerja',
      width: 150,
      render: (kd_unit_kerja: string) => {
        if (!kd_unit_kerja) return '-';
        return (
          <code style={{ fontSize: '11px' }}>{kd_unit_kerja}</code>
        );
      },
    },
    {
      title: 'Nama Unit Kerja',
      dataIndex: 'nm_unit_kerja',
      key: 'nm_unit_kerja',
      width: 250,
      ellipsis: true,
      render: (nm_unit_kerja: string) => {
        if (!nm_unit_kerja) return '-';
        return (
          <Tooltip title={nm_unit_kerja}>
            <span style={{ fontSize: '12px' }}>{nm_unit_kerja}</span>
          </Tooltip>
        );
      },
    },
    {
      title: 'Satker',
      dataIndex: 'kdsatker',
      key: 'kdsatker',
      width: 100,
      render: (kdsatker: string, record: Pegawai) => {
        if (!kdsatker) return '-';
        return (
          <Tooltip title={record.satker?.nmsatker || 'Nama Satker tidak tersedia'}>
            <code style={{ fontSize: '11px', cursor: 'help' }}>{kdsatker}</code>
          </Tooltip>
        );
      },
    },
    {
      title: 'Bidang',
      dataIndex: 'bidangf',
      key: 'bidangf',
      width: 100,
      render: (bidangf: string, record: Pegawai) => {
        if (!bidangf) return '-';
        return (
          <Tooltip title={record.bidang?.nmbidang || 'Nama Bidang tidak tersedia'}>
            <code style={{ fontSize: '11px', cursor: 'help' }}>{bidangf}</code>
          </Tooltip>
        );
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
    if (isSuperAdmin) {
      fetchPegawai();
      fetchSatkerOptions(undefined);
    }
  }, [isSuperAdmin, pagination.current, pagination.pageSize, filters]);

  const handleTableChange = (
    pagination: TablePaginationConfig
  ) => {
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

  const handleSatkerFilter = (value: string) => {
    setFilters(prev => ({
      ...prev,
      id_satker: value || undefined,
      bidangf: undefined, // Reset bidang when Satker changes
    }));
    setBidangOptions([]);
    setPagination(prev => ({ ...prev, current: 1 }));
    
    // Jika memilih Satker yang bukan null, fetch bidang options
    if (value && value !== 'null') {
      fetchBidangOptions(value, undefined);
    }
  };

  const handleBidangFilter = (value: string) => {
    setFilters(prev => ({
      ...prev,
      bidangf: value || undefined,
    }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleDetail = (pegawai: Pegawai) => {
    navigate(`/pegawai/${pegawai.id}`);
  };

  // Fetch Satker options (Level 1)
  const fetchSatkerOptions = async (search?: string) => {
    try {
      setLoadingSatker(true);
      const optionsFromApi = await pegawaiApi.getSatkerOptions(search, 1, 50);
      const options = [
        { label: '🚫 Tanpa Satker', value: 'null' },
        ...optionsFromApi,
      ];
      setSatkerOptions(options);
    } catch (error) {
      console.error('Error fetching Satker options:', error);
      setSatkerOptions([]);
    } finally {
      setLoadingSatker(false);
    }
  };

  // Fetch Bidang options based on selected Satker (Level 2)
  const fetchBidangOptions = async (kdSatker: string, search?: string) => {
    try {
      setLoadingBidang(true);
      const optionsFromApi = await pegawaiApi.getBidangOptions(kdSatker, search, 1, 50);
      const options = [
        { label: '🚫 Tanpa Bidang', value: 'null' },
        ...optionsFromApi,
      ];
      setBidangOptions(options);
    } catch (error) {
      console.error('Error fetching Bidang options:', error);
      setBidangOptions([{ label: '🚫 Tanpa Bidang', value: 'null' }]);
    } finally {
      setLoadingBidang(false);
    }
  };


  const handleClearFilters = () => {
    setFilters({});
    setBidangOptions([]);
    setPagination(prev => ({ ...prev, current: 1 }));
    message.success('Filter berhasil dibersihkan');
  };

  const hasActiveFilters = filters.search || filters.id_satker || filters.bidangf;

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
            Data Pegawai
          </Title>
          
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Search
              placeholder="Cari nama pegawai atau NIP..."
              allowClear
              style={{ width: '100%' }}
              onSearch={handleSearch}
              prefix={<SearchOutlined />}
            />
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Pilih Satker untuk filter data..."
              allowClear
              style={{ width: '100%' }}
              value={filters.id_satker}
              onChange={handleSatkerFilter}
              loading={loadingSatker}
              showSearch
              optionFilterProp="children"
              notFoundContent="Tidak ada data"
              onSearch={(value) => fetchSatkerOptions(value)}
              onFocus={() => {
                if (satkerOptions.length === 0) {
                  fetchSatkerOptions();
                }
              }}
            >
              {satkerOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder={filters.id_satker ? "Pilih Bidang untuk filter data..." : "Pilih Satker terlebih dahulu"}
              allowClear
              style={{ width: '100%' }}
              value={filters.bidangf}
              onChange={handleBidangFilter}
              loading={loadingBidang}
              disabled={!filters.id_satker}
              showSearch
              optionFilterProp="children"
              notFoundContent="Tidak ada data"
              onSearch={(value) => filters.id_satker && fetchBidangOptions(filters.id_satker, value)}
              onFocus={() => {
                if (bidangOptions.length === 0 && filters.id_satker) {
                  fetchBidangOptions(filters.id_satker);
                }
              }}
            >
              {bidangOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Col>


          <Col xs={24} sm={12} md={8} lg={6}>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchPegawai}
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