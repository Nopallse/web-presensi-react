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
  Typography
} from 'antd';
import { 
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  RightOutlined
} from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { unitKerjaApi } from '../services/unitKerjaApi';
import type { SKPD, UnitKerjaFilters } from '../types';

const { Search } = Input;
const { Text } = Typography;

interface SKPDTabProps {
  onSelectSKPD: (skpd: SKPD) => void;
}

const SKPDTab: React.FC<SKPDTabProps> = ({ onSelectSKPD }) => {
  const [loading, setLoading] = useState(false);
  const [skpdList, setSKPDList] = useState<SKPD[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState<UnitKerjaFilters>({});

  const columns: ColumnsType<SKPD> = [
    {
      title: 'Kode SKPD',
      dataIndex: 'KDSKPD',
      key: 'KDSKPD',
      width: 120,
      render: (code: string) => (
        <code style={{ fontSize: '12px', fontWeight: 'bold' }}>{code}</code>
      ),
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
          <Text strong style={{ fontSize: '13px' }}>{nama}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'StatusSKPD',
      key: 'StatusSKPD',
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
      title: 'Aksi',
      key: 'actions',
      width: 150,
      align: 'center',
      render: (_, record: SKPD) => (
        <Space size="small">
          <Tooltip title="Lihat Detail">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Lihat Satuan Kerja">
            <Button
              type="primary"
              icon={<RightOutlined />}
              onClick={() => onSelectSKPD(record)}
              size="small"
            >
              Satker
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const fetchSKPD = async () => {
    setLoading(true);
    try {
      const response = await unitKerjaApi.getAllSkpd({
        ...filters,
        page: pagination.current,
        limit: pagination.pageSize,
      });

      setSKPDList(response.data);
      
      // Update pagination dengan data dari API
      setPagination(prev => ({
        ...prev,
        total: response.pagination.totalItems,
        current: response.pagination.currentPage,
        pageSize: response.pagination.itemsPerPage,
      }));
    } catch (error) {
      console.error('Error fetching SKPD:', error);
      message.error('Gagal memuat data SKPD');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSKPD();
  }, [pagination.current, pagination.pageSize, filters]);

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

  return (
    <div>
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
    </div>
  );
};

export default SKPDTab;