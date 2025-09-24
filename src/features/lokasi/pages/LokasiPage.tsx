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
  Select,
  Tooltip
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
import { lokasiApi } from '../services/lokasiApi';
import { organizationApi } from '../services/organizationApi';
import type { Lokasi, LokasiFilters } from '../types';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const LokasiPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [lokasiList, setLokasiList] = useState<Lokasi[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState<LokasiFilters>({});
  
  // Filter options state
  const [skpdOptions, setSkpdOptions] = useState<Array<{label: string, value: string}>>([]);
  const [satkerOptions, setSatkerOptions] = useState<Array<{label: string, value: string}>>([]);
  const [bidangOptions, setBidangOptions] = useState<Array<{label: string, value: string}>>([]);
  const [loadingSkpd, setLoadingSkpd] = useState(false);
  const [loadingSatker, setLoadingSatker] = useState(false);
  const [loadingBidang, setLoadingBidang] = useState(false);

  // Check if user is super admin
  const isSuperAdmin = user?.role === 'super_admin';

  const columns: ColumnsType<Lokasi> = [
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
      title: 'SKPD',
      key: 'skpd',
      width: 120,
      ellipsis: true,
      render: (_, record) => {
        if (record.skpd_data) {
          return (
            <Tooltip 
              title={
                <div>
                  <div style={{ fontWeight: 'bold' }}>{record.skpd_data.NMSKPD.trim()}</div>
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>
                    Status: {record.skpd_data.StatusSKPD}
                  </div>
                </div>
              }
              placement="topLeft"
            >
              <div style={{ cursor: 'help' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', fontFamily: 'monospace' }}>
                  {record.skpd_data.KDSKPD}
                </div>
              </div>
            </Tooltip>
          );
        }
        return <span style={{ color: '#999', fontSize: '12px' }}>-</span>;
      },
    },
    {
      title: 'Satker',
      dataIndex: 'id_satker',
      key: 'id_satker',
      width: 100,
      render: (id_satker: string | null, record) => {
        if (id_satker && record.satker_data) {
          return (
            <Tooltip 
              title={
                <div>
                  <div style={{ fontWeight: 'bold' }}>{record.satker_data.NMSATKER}</div>
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>
                    Jabatan: {record.satker_data.NAMA_JABATAN}
                  </div>
                  <div style={{ fontSize: '12px' }}>
                    Eselon: {record.satker_data.KDESELON}
                  </div>
                </div>
              }
              placement="topLeft"
            >
              <span style={{ 
                fontSize: '12px', 
                fontFamily: 'monospace',
                cursor: 'help',
                textDecoration: 'underline',
                textDecorationStyle: 'dotted'
              }}>
                {id_satker}
              </span>
            </Tooltip>
          );
        } else if (id_satker) {
          return (
            <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>
              {id_satker}
            </span>
          );
        }
        return <span style={{ color: '#999', fontSize: '12px' }}>-</span>;
      },
    },
    {
      title: 'Bidang',
      dataIndex: 'id_bidang',
      key: 'id_bidang',
      width: 100,
      render: (id_bidang: string | null, record) => {
        if (id_bidang && record.bidang_data) {
          return (
            <Tooltip 
              title={
                <div>
                  <div style={{ fontWeight: 'bold' }}>{record.bidang_data.NMBIDANG}</div>
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>
                    Jabatan: {record.bidang_data.NAMA_JABATAN}
                  </div>
                  <div style={{ fontSize: '12px' }}>
                    Eselon: {record.bidang_data.KDESELON}
                  </div>
                </div>
              }
              placement="topLeft"
            >
              <span style={{ 
                fontSize: '12px', 
                fontFamily: 'monospace',
                cursor: 'help',
                textDecoration: 'underline',
                textDecorationStyle: 'dotted'
              }}>
                {id_bidang}
              </span>
            </Tooltip>
          );
        } else if (id_bidang) {
          return (
            <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>
              {id_bidang}
            </span>
          );
        }
        return <span style={{ color: '#999', fontSize: '12px' }}>-</span>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      filters: [
        { text: 'Aktif', value: '1' },
        { text: 'Tidak Aktif', value: '0' },
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
            title="Hapus Lokasi"
            description="Apakah Anda yakin ingin menghapus lokasi ini?"
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
      fetchSkpdOptions();
    }
  }, [isSuperAdmin, pagination.current, pagination.pageSize, filters]);

  // Fetch SKPD options
  const fetchSkpdOptions = async () => {
    try {
      setLoadingSkpd(true);
      const response = await organizationApi.searchSkpd('', 1, 100);
      const options = [
        { label: '🚫 Tanpa SKPD', value: 'null' },
        ...response.data.map(skpd => ({
          label: `${skpd.KDSKPD} - ${skpd.NMSKPD.trim()}`,
          value: skpd.KDSKPD
        }))
      ];
      setSkpdOptions(options);
    } catch (error) {
      console.error('Error fetching SKPD options:', error);
    } finally {
      setLoadingSkpd(false);
    }
  };

  // Fetch Satker options based on selected SKPD
  const fetchSatkerOptions = async (kdSkpd: string) => {
    try {
      setLoadingSatker(true);
      const response = await organizationApi.searchSatker(kdSkpd, '', 1, 100);
      const options = [
        { label: '🚫 Tanpa Satker', value: 'null' },
        ...response.data.map(satker => ({
          label: `${satker.KDSATKER} - ${satker.NMSATKER}`,
          value: satker.KDSATKER
        }))
      ];
      setSatkerOptions(options);
    } catch (error) {
      console.error('Error fetching Satker options:', error);
      setSatkerOptions([]);
    } finally {
      setLoadingSatker(false);
    }
  };

  // Fetch Bidang options based on selected SKPD and Satker
  const fetchBidangOptions = async (kdSkpd: string, kdSatker: string) => {
    try {
      setLoadingBidang(true);
      const response = await organizationApi.searchBidang(kdSkpd, kdSatker, '', 1, 100);
      const options = [
        { label: '🚫 Tanpa Bidang', value: 'null' },
        ...response.data.map(bidang => ({
          label: `${bidang.BIDANGF} - ${bidang.NMBIDANG}`,
          value: bidang.BIDANGF
        }))
      ];
      setBidangOptions(options);
    } catch (error) {
      console.error('Error fetching Bidang options:', error);
      setBidangOptions([{ label: '🚫 Tanpa Bidang', value: 'null' }]);
    } finally {
      setLoadingBidang(false);
    }
  };

  const fetchLokasiList = async () => {
    try {
      setLoading(true);
      const response = await lokasiApi.getAll({
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
      console.error('Error fetching lokasi list:', error);
      message.error('Gagal memuat daftar lokasi');
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

  const handleSkpdFilter = (value: string) => {
    setFilters(prev => ({
      ...prev,
      id_skpd: value || undefined,
      id_satker: undefined, // Reset satker when SKPD changes
      id_bidang: undefined, // Reset bidang when SKPD changes
    }));
    setSatkerOptions([]);
    setBidangOptions([]);
    setPagination(prev => ({ ...prev, current: 1 }));
    
    // Jika memilih SKPD yang bukan null, fetch satker options
    if (value && value !== 'null') {
      fetchSatkerOptions(value);
    } else if (value === 'null') {
      // Jika memilih "Tanpa SKPD", set satker options dengan opsi null saja
      setSatkerOptions([{ label: '🚫 Tanpa Satker', value: 'null' }]);
    }
  };

  const handleSatkerFilter = (value: string) => {
    setFilters(prev => ({
      ...prev,
      id_satker: value || undefined,
      id_bidang: undefined, // Reset bidang when Satker changes
    }));
    setBidangOptions([]);
    setPagination(prev => ({ ...prev, current: 1 }));
    
    // Jika memilih Satker yang bukan null dan SKPD juga bukan null, fetch bidang options
    if (value && value !== 'null' && filters.id_skpd && filters.id_skpd !== 'null') {
      fetchBidangOptions(filters.id_skpd, value);
    } else if (value === 'null' || filters.id_skpd === 'null') {
      // Jika memilih "Tanpa Satker" atau SKPD adalah null, set bidang options dengan opsi null saja
      setBidangOptions([{ label: '🚫 Tanpa Bidang', value: 'null' }]);
    }
  };

  const handleBidangFilter = (value: string) => {
    setFilters(prev => ({
      ...prev,
      id_bidang: value || undefined,
    }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({});
    setSatkerOptions([]);
    setBidangOptions([]);
    setPagination(prev => ({ ...prev, current: 1 }));
    message.success('Filter berhasil dibersihkan');
  };

  const handleRefresh = () => {
    fetchLokasiList();
  };

  const handleDelete = async (lokasiId: number) => {
    try {
      await lokasiApi.delete(lokasiId);
      message.success('Lokasi berhasil dihapus');
      fetchLokasiList();
    } catch (error: any) {
      console.error('Error deleting lokasi:', error);
      message.error('Gagal menghapus lokasi');
    }
  };

  const hasActiveFilters = filters.search || filters.id_skpd || filters.id_satker || filters.id_bidang;

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
            Manajemen Lokasi
          </Title>
          
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/lokasi/create')}
          >
            Tambah Lokasi
          </Button>
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Search
              placeholder="Cari lokasi..."
              allowClear
              style={{ width: '100%' }}
              onSearch={handleSearch}
              prefix={<SearchOutlined />}
            />
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Filter SKPD"
              allowClear
              style={{ width: '100%' }}
              value={filters.id_skpd}
              onChange={handleSkpdFilter}
              loading={loadingSkpd}
              showSearch
              optionFilterProp="children"
            >
              {skpdOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Filter Satker"
              allowClear
              style={{ width: '100%' }}
              value={filters.id_satker}
              onChange={handleSatkerFilter}
              loading={loadingSatker}
              disabled={!filters.id_skpd}
              showSearch
              optionFilterProp="children"
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
              placeholder="Filter Bidang"
              allowClear
              style={{ width: '100%' }}
              value={filters.id_bidang}
              onChange={handleBidangFilter}
              loading={loadingBidang}
              disabled={!filters.id_satker}
              showSearch
              optionFilterProp="children"
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
              `${range[0]}-${range[1]} dari ${total} lokasi`,
          }}
          onChange={handleTableChange}
        />
      </Card>
    </div>
  );
};

export default LokasiPage;