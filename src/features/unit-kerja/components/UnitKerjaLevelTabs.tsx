import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Input, 
  Select,
  Space, 
  Row, 
  Col, 
  Alert,
  Tabs
} from 'antd';
import { 
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  BankOutlined,
  ApartmentOutlined,
  TeamOutlined
} from '@ant-design/icons';
import type { TablePaginationConfig } from 'antd/es/table';
import type { 
  ViewDaftarUnitKerja, 
  ViewDaftarUnitKerjaFilters
} from '../types/viewDaftarUnitKerja';
import { unitKerjaApi } from '../services/unitKerjaApi';

const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface UnitKerjaLevelTabsProps {
  onItemClick?: (item: ViewDaftarUnitKerja) => void;
}

const UnitKerjaLevelTabs: React.FC<UnitKerjaLevelTabsProps> = ({ onItemClick }) => {
  const [data, setData] = useState<ViewDaftarUnitKerja[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('level1');
  const [filters, setFilters] = useState<ViewDaftarUnitKerjaFilters>({
    page: 1,
    limit: 10,
    search: '',
    jenis: 'satker_tbl'
  });
  const [additionalFilters, setAdditionalFilters] = useState({
    satker: '',
    bidang: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  
  // State untuk data filter dengan loading states
  const [satkerOptions, setSatkerOptions] = useState<ViewDaftarUnitKerja[]>([]);
  const [bidangOptions, setBidangOptions] = useState<ViewDaftarUnitKerja[]>([]);
  const [loadingSatkerOptions, setLoadingSatkerOptions] = useState(false);
  const [loadingBidangOptions, setLoadingBidangOptions] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      switch (activeTab) {
        case 'level1':
          response = await unitKerjaApi.getLevel1Data({
            page: pagination.current,
            limit: pagination.pageSize,
            search: filters.search
          });
          break;
        case 'level2':
          response = await unitKerjaApi.getLevel2Data({
            page: pagination.current,
            limit: pagination.pageSize,
            search: filters.search,
            satker: additionalFilters.satker
          });
          break;
        case 'level3':
          response = await unitKerjaApi.getLevel3Data({
            page: pagination.current,
            limit: pagination.pageSize,
            search: filters.search,
            satker: additionalFilters.satker,
            bidang: additionalFilters.bidang
          });
          break;
        default:
          response = await unitKerjaApi.getLevel1Data({
            page: pagination.current,
            limit: pagination.pageSize,
            search: filters.search
          });
      }
      
      setData(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.totalItems,
      }));
    } catch (err) {
      setError('Gagal memuat data unit kerja');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };


  const fetchSatkerOptions = async (search?: string) => {
    try {
      setLoadingSatkerOptions(true);
      const satkerResponse = await unitKerjaApi.getFilterOptionsHierarchy(undefined, undefined, search, 50);
      setSatkerOptions(satkerResponse.data.map(item => ({
        id_unit_kerja: item.kd_unit_kerja,
        kd_unit_kerja: item.kd_unit_kerja,
        nm_unit_kerja: item.nm_unit_kerja,
        jenis: 'satker_tbl',
        status: '1',
        kd_unit_atasan: undefined,
        relasi_data: {}
      })));
    } catch (err) {
      console.error('Error fetching satker options:', err);
    } finally {
      setLoadingSatkerOptions(false);
    }
  };

  const fetchBidangOptions = async (search?: string, satkerKd?: string) => {
    try {
      setLoadingBidangOptions(true);
      // Gunakan parameter satkerKd jika ada, atau fallback ke additionalFilters.satker
      const selectedSatker = satkerKd || additionalFilters.satker;
      console.log('fetchBidangOptions called with:', { search, selectedSatker, satkerKd, additionalFiltersSatker: additionalFilters.satker });
      
      if (!selectedSatker) {
        console.warn('No satker selected, skipping fetch');
        return;
      }
      
      const bidangResponse = await unitKerjaApi.getFilterOptionsHierarchy(selectedSatker, undefined, search, 50);
      console.log('Bidang response:', bidangResponse);
      
      setBidangOptions(bidangResponse.data.map(item => ({
        id_unit_kerja: item.kd_unit_kerja,
        kd_unit_kerja: item.kd_unit_kerja,
        nm_unit_kerja: item.nm_unit_kerja,
        jenis: 'bidang_tbl',
        status: '1',
        kd_unit_atasan: undefined,
        relasi_data: {}
      })));
    } catch (err) {
      console.error('Error fetching bidang options:', err);
    } finally {
      setLoadingBidangOptions(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters.search, pagination.current, pagination.pageSize, additionalFilters.satker, additionalFilters.bidang, activeTab]);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    let jenis: 'satker_tbl' | 'bidang_tbl' | 'bidang_sub';
    
    switch (key) {
      case 'level1':
        jenis = 'satker_tbl';
        break;
      case 'level2':
        jenis = 'bidang_tbl';
        break;
      case 'level3':
        jenis = 'bidang_sub';
        break;
      default:
        jenis = 'satker_tbl';
    }
    
    setFilters(prev => ({ ...prev, jenis }));
    setPagination(prev => ({ ...prev, current: 1 })); // Reset ke halaman 1 saat ganti tab
    
    // Reset additional filters ketika pindah tab
    setAdditionalFilters({
      satker: '',
      bidang: ''
    });
    setSatkerOptions([]);
    setBidangOptions([]);
  };

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleSatkerChange = (value: string) => {
    console.log('handleSatkerChange called with:', value, 'activeTab:', activeTab);
    
    setAdditionalFilters(prev => ({ 
      ...prev, 
      satker: value || '',
      bidang: '' // Reset bidang ketika satker berubah
    }));
    setBidangOptions([]); // Clear bidang options
    setPagination(prev => ({ ...prev, current: 1 }));
    
    // Jika ada value (satker dipilih), fetch bidang options dengan parameter langsung
    if (value && activeTab === 'level3') {
      console.log('About to fetch bidang options with satker:', value);
      fetchBidangOptions(undefined, value); // Pass value sebagai satkerKd
    }
  };

  const handleTableChange = (
    pagination: TablePaginationConfig
  ) => {
    setPagination(prev => ({
      ...prev,
      current: pagination.current || 1,
      pageSize: pagination.pageSize || 10,
    }));
  };

  const getLevelInfo = (level: string) => {
    switch (level) {
      case 'level1':
        return {
          title: 'Level 1 - Satuan Kerja (SKPD)',
          icon: <BankOutlined style={{ color: '#1890ff' }} />,
          description: 'Unit kerja tingkat tertinggi dalam struktur organisasi',
          color: 'blue'
        };
      case 'level2':
        return {
          title: 'Level 2 - Bidang',
          icon: <ApartmentOutlined style={{ color: '#52c41a' }} />,
          description: 'Unit kerja tingkat menengah yang berada di bawah Satuan Kerja',
          color: 'green'
        };
      case 'level3':
        return {
          title: 'Level 3 - Sub Bidang',
          icon: <TeamOutlined style={{ color: '#722ed1' }} />,
          description: 'Unit kerja tingkat terendah dalam struktur organisasi',
          color: 'purple'
        };
      default:
        return {
          title: 'Level 1 - Satuan Kerja (SKPD)',
          icon: <BankOutlined style={{ color: '#1890ff' }} />,
          description: 'Unit kerja tingkat tertinggi dalam struktur organisasi',
          color: 'blue'
        };
    }
  };


  const getTableColumns = (): any[] => {
    const baseColumns: any[] = [
      {
        title: 'ID Unit Kerja',
        dataIndex: 'id_unit_kerja',
        key: 'id_unit_kerja',
        width: 150,
        render: (text: string) => (
          <div>
            <code style={{ fontSize: '11px', color: '#666' }}>{text}</code>
          </div>
        ),
      },
      {
        title: 'Nama Unit Kerja',
        dataIndex: 'nm_unit_kerja',
        key: 'nm_unit_kerja',
        ellipsis: true,
        render: (text: string, record: ViewDaftarUnitKerja) => (
          <div>
            <strong style={{ fontSize: '13px' }}>{text}</strong>
            <div style={{ fontSize: '11px', color: '#666' }}>
              {record.kd_unit_atasan && `Satuan Kerja: ${record.kd_unit_atasan}`}
            </div>
          </div>
        ),
      },
    ];

    
    if (activeTab === 'level3') {
      baseColumns.push({
        title: 'Bidang',
        key: 'bidang_info',
        width: 200,
        render: (_: any, record: ViewDaftarUnitKerja) => {
          if (record.relasi_data && record.relasi_data.nm_bidang) {
            return (
              <div>
                <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                  {record.relasi_data.nm_bidang}
                </div>
                <div style={{ fontSize: '10px', color: '#666' }}>
                  Kode: {record.relasi_data.bidangf}
                </div>
              </div>
            );
          }
          return <span style={{ color: '#ccc' }}>-</span>;
        },
      });
    }

    // Tambahkan kolom berdasarkan level
    if (activeTab === 'level2' || activeTab === 'level3') {
      baseColumns.push({
        title: 'Satuan Kerja',
        key: 'satker_info',
        width: 200,
        render: (_: any, record: ViewDaftarUnitKerja) => {
          if (record.relasi_data && record.relasi_data.nm_satker) {
            return (
              <div>
                <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                  {record.relasi_data.nm_satker}
                </div>
                <div style={{ fontSize: '10px', color: '#666' }}>
                  Kode: {record.relasi_data.kd_satker}
                </div>
              </div>
            );
          }
          return <span style={{ color: '#ccc' }}>-</span>;
        },
      });
    }

   


    // Tambahkan kolom status dan aksi
    baseColumns.push(
      {
        title: 'Aksi',
        key: 'actions',
        width: 60,
        render: (_: any, record: ViewDaftarUnitKerja) => (
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => onItemClick?.(record)}
            size="small"
            title="Lihat Detail"
          />
        ),
      }
    );

    return baseColumns;
  };

  const levelInfo = getLevelInfo(activeTab);

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
      />
    );
  }

  return (
    <div>
  

      {/* Tabs untuk level */}
      <Tabs 
        activeKey={activeTab} 
        onChange={handleTabChange}
        type="card"
        style={{ marginBottom: '16px' }}
      >
        <TabPane
          tab={
            <span>
              <BankOutlined />
              Level 1 - Satuan Kerja
            </span>
          }
          key="level1"
        />
        <TabPane
          tab={
            <span>
              <ApartmentOutlined />
              Level 2 - Bidang
            </span>
          }
          key="level2"
        />
        <TabPane
          tab={
            <span>
              <TeamOutlined />
              Level 3 - Sub Bidang
            </span>
          }
          key="level3"
        />
      </Tabs>

       {/* Filters */}
       <Card style={{ marginBottom: '16px' }}>
         <Row gutter={[16, 16]}>
           <Col xs={24} sm={16} md={12} lg={8}>
             <Search
               placeholder={`Cari ${levelInfo.title.toLowerCase()}...`}
               allowClear
               style={{ width: '100%' }}
               onSearch={handleSearch}
               prefix={<SearchOutlined />}
             />
           </Col>
           
           {/* Filter Satuan Kerja untuk Level 2 dan 3 */}
           {(activeTab === 'level2' || activeTab === 'level3') && (
             <Col xs={24} sm={8} md={6} lg={5}>
               <Select
                 placeholder="Pilih Satuan Kerja untuk filter data..."
                 allowClear
                 style={{ width: '100%' }}
                 value={additionalFilters.satker || undefined}
                 onChange={handleSatkerChange}
                 showSearch
                 optionFilterProp="children"
                 notFoundContent="Tidak ada data"
                 loading={loadingSatkerOptions}
                 onSearch={(value) => fetchSatkerOptions(value)}
                 onFocus={() => {
                   if (satkerOptions.length === 0) {
                     fetchSatkerOptions();
                   }
                 }}
               >
                 {satkerOptions.map(item => (
                   <Option key={item.kd_unit_kerja} value={item.kd_unit_kerja}>
                     {item.nm_unit_kerja}
                   </Option>
                 ))}
               </Select>
             </Col>
           )}
           
           {/* Filter Bidang untuk Level 3 */}
           {activeTab === 'level3' && (
             <Col xs={24} sm={8} md={6} lg={5}>
               <Select
                 placeholder={additionalFilters.satker ? "Pilih Bidang untuk filter data..." : "Pilih Satuan Kerja terlebih dahulu"}
                 allowClear
                 disabled={!additionalFilters.satker}
                 style={{ width: '100%' }}
                 value={additionalFilters.bidang || undefined}
                 onChange={(value) => setAdditionalFilters(prev => ({ ...prev, bidang: value || '' }))}
                 showSearch
                 optionFilterProp="children"
                 notFoundContent="Tidak ada data"
                 loading={loadingBidangOptions}
                 onSearch={(value) => fetchBidangOptions(value, additionalFilters.satker)}
                 onFocus={() => {
                   console.log('onFocus called:', { 
                     bidangOptionsLength: bidangOptions.length, 
                     satker: additionalFilters.satker 
                   });
                   if (bidangOptions.length === 0 && additionalFilters.satker) {
                     console.log('Fetching bidang options on focus with satker:', additionalFilters.satker);
                     fetchBidangOptions(undefined, additionalFilters.satker);
                   }
                 }}
               >
                 {bidangOptions.map(item => (
                   <Option key={item.kd_unit_kerja} value={item.kd_unit_kerja}>
                     {item.nm_unit_kerja}
                   </Option>
                 ))}
               </Select>
             </Col>
           )}
           
           <Col xs={24} sm={8} md={6} lg={6}>
             <Space>
               <Button
                 icon={<ReloadOutlined />}
                 onClick={fetchData}
                 loading={loading}
               >
                 Refresh
               </Button>
             </Space>
           </Col>
         </Row>
       </Card>

       {/* Data Table */}
       <Table
         columns={getTableColumns()}
        dataSource={data}
        rowKey="kd_unit_kerja"
        loading={loading}
        size="small"
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} dari ${total} unit kerja`,
        }}
        onChange={handleTableChange}
      />
    </div>
  );
};

export default UnitKerjaLevelTabs;
