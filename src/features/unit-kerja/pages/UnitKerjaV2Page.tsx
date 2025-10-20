import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Table,
  Input,
  Button,
  Typography,
  Tag,
  message,
  Tooltip,
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  ReloadOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { unitKerjaV2Api, type Satker } from '../services/unitKerjaV2Api';
import UnitKerjaBreadcrumb from '../components/UnitKerjaBreadcrumb';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { Search } = Input;

const UnitKerjaV2Page: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [satkerList, setSatkerList] = useState<Satker[]>([]);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    itemsPerPage: 10
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSatker] = useState<Satker | null>(null);

  useEffect(() => {
    fetchSatkerList();
  }, []);

  const fetchSatkerList = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const response = await unitKerjaV2Api.getAllSatker({
        page,
        limit: 10,
        search
      });
      
      setSatkerList(response.data);
      setPagination(response.pagination);
      setSearchQuery(response.searchQuery || '');
    } catch (error) {
      console.error('Error fetching satker list:', error);
      message.error('Gagal memuat daftar satker');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    fetchSatkerList(1, value);
  };

  const handlePageChange = (page: number) => {
    fetchSatkerList(page, searchQuery);
  };

  const handleViewDetail = (satker: Satker) => {
    navigate(`/unit-kerja-v2/${satker.KDSATKER}`);
  };

  const columns: ColumnsType<Satker> = [
    {
      title: 'Kode Satker',
      dataIndex: 'KDSATKER',
      key: 'KDSATKER',
      width: 120,
      render: (kode: string) => (
        <Text code style={{ fontSize: '12px' }}>{kode}</Text>
      ),
    },
    {
      title: 'Nama Satker',
      dataIndex: 'NMSATKER',
      key: 'NMSATKER',
      width: 200,

      render: (nama: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Text strong style={{ fontSize: '13px' }}>{nama}</Text>
        </div>
      ),
    },
    // {
    //   title: 'Nama Jabatan',
    //   dataIndex: 'NAMA_JABATAN',
    //   key: 'NAMA_JABATAN',
    //   width: 250,
    //   ellipsis: true,
    //   render: (jabatan: string) => (
    //     <Text style={{ fontSize: '13px' }}>{jabatan}</Text>
    //   ),
    // },
    
    {
      title: 'Total Bidang',
      dataIndex: 'bidangCount',
      key: 'bidangCount',
      width: 100,
      render: (count: number) => (
        <Tag color="blue" style={{ fontSize: '11px' }}>
          {count} Bidang
        </Tag>
      ),
    },
    {
      title: 'Status Lokasi',
      dataIndex: 'lokasi',
      key: 'lokasi',
      width: 200,
      render: (lokasi: any) => {
        if (!lokasi) {
          return (
            <Tag color="orange" style={{ fontSize: '11px' }}>
              <EnvironmentOutlined /> Belum Diatur
            </Tag>
          );
        }

        // Tentukan level lokasi
        let levelColor = '';
        let levelText = '';

        if (lokasi.id_sub_bidang) {
          levelText = 'Sub Bidang';
          levelColor = 'purple';
        } else if (lokasi.id_bidang) {
          levelText = 'Bidang';
          levelColor = 'green';
        } else {
          levelText = 'Satker';
          levelColor = 'blue';
        }
        
        const tooltipContent = (
          <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
            <div style={{ marginBottom: '8px' }}>
              <Text strong >Informasi Lokasi:</Text>
            </div>
            <div style={{ marginBottom: '4px' }}>
              <Text >Level: </Text>
              <Tag color={levelColor} style={{ fontSize: '9px', margin: 0 }}>
                {levelText}
              </Tag>
            </div>
            <div style={{ marginBottom: '4px' }}>
              <Text >Koordinat: </Text>
              <Text code style={{ fontSize: '10px' }}>
                {lokasi.lat.toFixed(6)}, {lokasi.lng.toFixed(6)}
              </Text>
            </div>
            <div style={{ marginBottom: '4px' }}>
              <Text >Radius: </Text>
              <Text >{lokasi.range} meter</Text>
            </div>
          </div>
        );

        return (
          <Tooltip title={tooltipContent} placement="topLeft" overlayStyle={{ maxWidth: '300px' }}>
            <div style={{ cursor: 'pointer' }}>
              <div><Tag color={levelColor} style={{ fontSize: '10px', margin: 0 }}>{levelText}</Tag></div>
              <div><Text style={{ fontSize: '13px', color: '#666' }}>{lokasi.ket}</Text></div>
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
          title="Lihat Detail"
        />
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '100%', overflow: 'hidden' }}>
      {/* Breadcrumb */}
      <UnitKerjaBreadcrumb items={[]} />
      
      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <Title level={3} style={{ margin: 0 }}>
            Kelola Satuan Kerja
          </Title>
        </div>

        {/* Filters */}
        <div style={{ 
          marginBottom: '16px', 
          display: 'flex', 
          gap: '12px', 
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <Search
            placeholder="Cari satker..."
            allowClear
            style={{ width: 280, minWidth: 200 }}
            onSearch={handleSearch}
            prefix={<SearchOutlined />}
          />
          
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchSatkerList(1, searchQuery)}
            loading={loading}
          >
            Refresh
          </Button>
          
          {searchQuery && (
            <Tag closable onClose={() => handleSearch('')}>
              Pencarian: {searchQuery}
            </Tag>
          )}
        </div>

        <Table
              columns={columns}
              dataSource={satkerList}
              rowKey="KDSATKER"
              loading={loading}
              pagination={{
                current: pagination.currentPage,
                total: pagination.totalItems,
                pageSize: pagination.itemsPerPage,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total: number, range: [number, number]) => 
                  `${range[0]}-${range[1]} dari ${total} item`,
                onChange: handlePageChange,
              }}
              scroll={{ x: 900 }}
              size="small"
          
              rowClassName={(record) => 
                selectedSatker?.KDSATKER === record.KDSATKER ? 'ant-table-row-selected' : ''
              }
            />
      </Card>
    </div>
  );
};

export default UnitKerjaV2Page;
