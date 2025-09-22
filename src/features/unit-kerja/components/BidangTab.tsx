import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  message,
  Tag,
  Space,
  Tooltip,
  Typography,
  Alert
} from 'antd';
import { 
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  BankOutlined,
  ApartmentOutlined
} from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { unitKerjaApi } from '../services/unitKerjaApi';
import type { SKPD, SatkerData, BidangData, UnitKerjaFilters } from '../types';

const { Search } = Input;
const { Text } = Typography;

interface BidangTabProps {
  skpd: SKPD;
  satker: SatkerData;
}

const BidangTab: React.FC<BidangTabProps> = ({ skpd, satker }) => {
  const [loading, setLoading] = useState(false);
  const [bidangList, setBidangList] = useState<BidangData[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState<UnitKerjaFilters>({});

  const columns: ColumnsType<BidangData> = [
    {
      title: 'Kode Bidang',
      dataIndex: 'BIDANGF',
      key: 'BIDANGF',
      width: 120,
      render: (code: string) => (
        <code style={{ fontSize: '12px', fontWeight: 'bold' }}>{code}</code>
      ),
    },
    {
      title: 'Nama Bidang',
      dataIndex: 'NMBIDANG',
      key: 'NMBIDANG',
      ellipsis: {
        showTitle: false,
      },
      render: (nama: string) => (
        <Tooltip placement="topLeft" title={nama}>
          <Text strong style={{ fontSize: '13px' }}>{nama}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Nama Jabatan',
      dataIndex: 'NAMA_JABATAN',
      key: 'NAMA_JABATAN',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (jabatan: string) => (
        <Tooltip placement="topLeft" title={jabatan}>
          <Text>{jabatan}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Jenis Jabatan',
      dataIndex: 'JENIS_JABATAN',
      key: 'JENIS_JABATAN',
      width: 120,
      align: 'center',
      render: (jenis: string) => (
        <Tag color="purple">{jenis}</Tag>
      ),
    },
    {
      title: 'Eselon',
      dataIndex: 'KDESELON',
      key: 'KDESELON',
      width: 100,
      align: 'center',
      render: (eselon: string) => (
        <Tag color="orange">{eselon}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'STATUS_BIDANG',
      key: 'STATUS_BIDANG',
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
      title: 'Tanggal Dibuat',
      dataIndex: 'TANGGAL_DIBUAT',
      key: 'TANGGAL_DIBUAT',
      width: 120,
      render: (date: string) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('id-ID');
      },
    },
    {
      title: 'Aksi',
      key: 'actions',
      width: 80,
      align: 'center',
      render: (_) => (
        <Space size="small">
          <Tooltip title="Lihat Detail">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const fetchBidang = async () => {
    setLoading(true);
    try {
      const response = await unitKerjaApi.getAllBidang(
        skpd.KDSKPD, 
        satker.KDSATKER, 
        {
          ...filters,
          page: pagination.current,
          limit: pagination.pageSize,
        }
      );

      setBidangList(response.data);
      
      // Update pagination dengan data dari API
      setPagination(prev => ({
        ...prev,
        total: response.pagination.totalItems,
        current: response.pagination.currentPage,
        pageSize: response.pagination.itemsPerPage,
      }));
    } catch (error) {
      console.error('Error fetching Bidang:', error);
      message.error('Gagal memuat data Bidang');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (skpd?.KDSKPD && satker?.KDSATKER) {
      fetchBidang();
    }
  }, [skpd?.KDSKPD, satker?.KDSATKER, pagination.current, pagination.pageSize, filters]);

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

  const handleClearFilters = () => {
    setFilters({});
    setPagination(prev => ({ ...prev, current: 1 }));
    message.success('Filter berhasil dibersihkan');
  };

  if (!skpd || !satker) {
    return (
      <Alert
        message="Pilih SKPD dan Satuan Kerja terlebih dahulu"
        description="Untuk melihat data Bidang, silakan pilih SKPD dan Satuan Kerja dari tab sebelumnya."
        type="info"
        showIcon
      />
    );
  }

  return (
    <div>
      <Space direction="vertical" size="small" style={{ width: '100%', marginBottom: '16px' }}>
        <Alert
          message={
            <Space>
              <BankOutlined />
              <Text strong>SKPD: {skpd.NMSKPD}</Text>
              <Text type="secondary">({skpd.KDSKPD})</Text>
            </Space>
          }
          type="info"
          showIcon={false}
        />
        <Alert
          message={
            <Space>
              <ApartmentOutlined />
              <Text strong>Satker: {satker.NMSATKER}</Text>
              <Text type="secondary">({satker.KDSATKER})</Text>
            </Space>
          }
          type="info"
          showIcon={false}
        />
      </Space>

      <div style={{ 
        marginBottom: '16px', 
        display: 'flex', 
        gap: '12px', 
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <Search
          placeholder="Cari kode atau nama Bidang..."
          allowClear
          style={{ width: 300, minWidth: 250 }}
          onSearch={handleSearch}
          prefix={<SearchOutlined />}
        />

        <Button
          icon={<ReloadOutlined />}
          onClick={fetchBidang}
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
        dataSource={bidangList}
        rowKey="BIDANGF"
        loading={loading}
        size="small"
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} dari ${total} Bidang`,
        }}
        onChange={handleTableChange}
      />
    </div>
  );
};

export default BidangTab;