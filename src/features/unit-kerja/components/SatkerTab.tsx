import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  message,
  Tag,
  Space,
  Tooltip,
  Badge,
  Typography,
  Alert
} from 'antd';
import { 
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  RightOutlined,
  BankOutlined
} from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { unitKerjaApi } from '../services/unitKerjaApi';
import type { SKPD, SatkerData, UnitKerjaFilters } from '../types';

const { Search } = Input;
const { Text } = Typography;

interface SatkerTabProps {
  skpd: SKPD;
  onSelectSatker: (satker: SatkerData) => void;
}

const SatkerTab: React.FC<SatkerTabProps> = ({ skpd, onSelectSatker }) => {
  const [loading, setLoading] = useState(false);
  const [satkerList, setSatkerList] = useState<SatkerData[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState<UnitKerjaFilters>({});

  const columns: ColumnsType<SatkerData> = [
    {
      title: 'Kode Satker',
      dataIndex: 'KDSATKER',
      key: 'KDSATKER',
      width: 120,
      render: (code: string) => (
        <code style={{ fontSize: '12px', fontWeight: 'bold' }}>{code}</code>
      ),
    },
    {
      title: 'Nama Satuan Kerja',
      dataIndex: 'NMSATKER',
      key: 'NMSATKER',
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
        <Tag color="blue">{jenis}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'STATUS_SATKER',
      key: 'STATUS_SATKER',
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
      title: 'Jumlah Bidang',
      dataIndex: 'bidang_count',
      key: 'bidang_count',
      width: 120,
      align: 'center',
      render: (count: number) => (
        <Badge 
          count={count} 
          showZero 
          style={{ backgroundColor: '#722ed1' }}
          title={`${count} bidang`}
        />
      ),
    },
    {
      title: 'Aksi',
      key: 'actions',
      width: 150,
      align: 'center',
      render: (_, record: SatkerData) => (
        <Space size="small">
          <Tooltip title="Lihat Detail">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Lihat Bidang">
            <Button
              type="primary"
              icon={<RightOutlined />}
              onClick={() => onSelectSatker(record)}
              size="small"
            >
              Bidang
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const fetchSatker = async () => {
    setLoading(true);
    try {
      const response = await unitKerjaApi.getAllSatker(skpd.KDSKPD, {
        ...filters,
        page: pagination.current,
        limit: pagination.pageSize,
      });

      setSatkerList(response.data);
      
      // Update pagination dengan data dari API
      setPagination(prev => ({
        ...prev,
        total: response.pagination.totalItems,
        current: response.pagination.currentPage,
        pageSize: response.pagination.itemsPerPage,
      }));
    } catch (error) {
      console.error('Error fetching Satker:', error);
      message.error('Gagal memuat data Satuan Kerja');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (skpd?.KDSKPD) {
      fetchSatker();
    }
  }, [skpd?.KDSKPD, pagination.current, pagination.pageSize, filters]);

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

  if (!skpd) {
    return (
      <Alert
        message="Pilih SKPD terlebih dahulu"
        description="Untuk melihat data Satuan Kerja, silakan pilih SKPD dari tab sebelumnya."
        type="info"
        showIcon
      />
    );
  }

  return (
    <div>
      <Alert
        message={
          <Space>
            <BankOutlined />
            <Text strong>SKPD: {skpd.NMSKPD}</Text>
            <Text type="secondary">({skpd.KDSKPD})</Text>
          </Space>
        }
        type="info"
        style={{ marginBottom: '16px' }}
        showIcon={false}
      />

      <div style={{ 
        marginBottom: '16px', 
        display: 'flex', 
        gap: '12px', 
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <Search
          placeholder="Cari kode atau nama Satuan Kerja..."
          allowClear
          style={{ width: 300, minWidth: 250 }}
          onSearch={handleSearch}
          prefix={<SearchOutlined />}
        />

        <Button
          icon={<ReloadOutlined />}
          onClick={fetchSatker}
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
        dataSource={satkerList}
        rowKey="KDSATKER"
        loading={loading}
        size="small"
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} dari ${total} Satuan Kerja`,
        }}
        onChange={handleTableChange}
      />
    </div>
  );
};

export default SatkerTab;