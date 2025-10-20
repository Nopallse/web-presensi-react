import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  DatePicker,
  Select,
  Space,
  Tag,
  message,
  Row,
  Col,
  Typography,
  Tooltip,
  Tabs
} from 'antd';
import {
  SearchOutlined,
  DownloadOutlined,
  ReloadOutlined,
  CalendarOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { presensiApi } from '../services/presensiApi';
import DebounceSelect from '../../../components/DebounceSelect';
import type {
  Kehadiran,
  KehadiranFilters,
  FilterState,
  ExportFilters,
  MonthlyAttendanceFilters,
  MonthlyAttendanceData
} from '../types';

const { Option } = Select;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const PresensiPage: React.FC = () => {
  
  // Active tab state
  const [activeTab, setActiveTab] = useState<'harian' | 'bulanan'>('harian');
  
  // Harian data state
  const [harianData, setHarianData] = useState<Kehadiran[]>([]);
  const [harianLoading, setHarianLoading] = useState(false);
  const [harianPagination, setHarianPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: ['10', '20', '50', '100']
  });

  // Bulanan data state
  const [bulananData, setBulananData] = useState<MonthlyAttendanceData | null>(null);
  const [bulananLoading, setBulananLoading] = useState(false);

  // Export loading
  const [exportLoading, setExportLoading] = useState(false);

  // Satker dan Bidang options state
  const [satkerOptions, setSatkerOptions] = useState<Array<{ label: string; value: string; }>>([]);
  const [bidangOptions, setBidangOptions] = useState<Array<{ label: string; value: string; }>>([]);
  const [loadingSatker, setLoadingSatker] = useState(false);
  const [loadingBidang, setLoadingBidang] = useState(false);

  // Fetch Satker options (Level 1) - untuk DebounceSelect
  const fetchSatkerOptionsForSelect = async (search: string): Promise<Array<{ label: string; value: string; }>> => {
    try {
      const options = await presensiApi.getSatkerOptions(search);
      return options;
    } catch (error) {
      console.error('Error fetching Satker options:', error);
      return [];
    }
  };

  // Fetch Bidang options based on selected Satker (Level 2) - untuk DebounceSelect
  const fetchBidangOptionsForSelect = async (search: string): Promise<Array<{ label: string; value: string; }>> => {
    if (!harianFilters.satker || harianFilters.satker === 'null') {
      return [{ label: '🚫 Tanpa Bidang', value: 'null' }];
    }
    
    try {
      const options = await presensiApi.getBidangOptions(harianFilters.satker, search);
      return options;
    } catch (error) {
      console.error('Error fetching Bidang options:', error);
      return [{ label: '🚫 Tanpa Bidang', value: 'null' }];
    }
  };

  // Fetch Satker options untuk initial load
  const fetchSatkerOptions = async (search?: string) => {
    try {
      setLoadingSatker(true);
      const options = await presensiApi.getSatkerOptions(search);
      setSatkerOptions(options);
    } catch (error) {
      console.error('Error fetching Satker options:', error);
      setSatkerOptions([]);
    } finally {
      setLoadingSatker(false);
    }
  };

  // Fetch Bidang options untuk initial load
  const fetchBidangOptions = async (kdSatker: string, search?: string) => {
    try {
      setLoadingBidang(true);
      const options = await presensiApi.getBidangOptions(kdSatker, search);
      setBidangOptions(options);
    } catch (error) {
      console.error('Error fetching Bidang options:', error);
      const defaultOptions = [{ label: '🚫 Tanpa Bidang', value: 'null' }];
      setBidangOptions(defaultOptions);
    } finally {
      setLoadingBidang(false);
    }
  };

  // Harian filter state
  const [harianFilters, setHarianFilters] = useState<FilterState>({
    search: '',
    selectedDate: null,
    lokasi_id: '',
    satker: '',
    bidang: '',
    status: '',
    pagination: {
      current: 1,
      pageSize: 10
    }
  });

  // Bulanan filter state
  const [bulananFilters, setBulananFilters] = useState<MonthlyAttendanceFilters>({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    satker: undefined,
    bidang: undefined,
    user_id: undefined
  });

  // Fetch data when component mounts or filters change
  useEffect(() => {
    // Load initial Satker options
    fetchSatkerOptions();
  }, []);

  // Auto-filter when filters change (no manual filter button needed)
  // Use debounce for search to avoid too many API calls
  useEffect(() => {
    if (activeTab === 'harian') {
      const debounceTimer = setTimeout(() => {
        fetchHarianData();
      }, harianFilters.search ? 500 : 0); // 500ms debounce for search, immediate for other filters

      return () => clearTimeout(debounceTimer);
    }
  }, [activeTab, harianFilters.selectedDate, harianFilters.search, harianFilters.lokasi_id, harianFilters.satker, harianFilters.bidang, harianFilters.status, harianFilters.pagination.current, harianFilters.pagination.pageSize]);

  // Load bidang options when satker changes
  useEffect(() => {
    if (harianFilters.satker && harianFilters.satker !== 'null') {
      fetchBidangOptions(harianFilters.satker);
    } else {
      setBidangOptions([{ label: '🚫 Tanpa Bidang', value: 'null' }]);
    }
  }, [harianFilters.satker]);

  useEffect(() => {
    if (activeTab === 'bulanan') {
      fetchBulananData();
    }
  }, [activeTab, bulananFilters]);

  const fetchHarianData = async () => {
    setHarianLoading(true);
    try {
      const apiFilters: KehadiranFilters = {
        page: harianFilters.pagination.current,
        limit: harianFilters.pagination.pageSize,
        search: harianFilters.search || undefined,
        startDate: harianFilters.selectedDate || undefined,
        lokasi_id: harianFilters.lokasi_id || undefined,
        satker: harianFilters.satker || undefined,
        bidang: harianFilters.bidang || undefined,
        status: harianFilters.status as any || undefined
      };

      const response = await presensiApi.getAllKehadiran(apiFilters);
      
      if (response.success) {
        setHarianData(response.data);
        setHarianPagination(prev => ({
          ...prev,
          current: response.pagination.currentPage,
          total: response.pagination.totalItems,
          pageSize: response.pagination.itemsPerPage
        }));
      }
    } catch (error: any) {
      console.error('Error fetching harian data:', error);
      message.error(error.message || 'Gagal memuat data harian');
    } finally {
      setHarianLoading(false);
    }
  };

  const fetchBulananData = async () => {
    setBulananLoading(true);
    try {
      const response = await presensiApi.getMonthlyAttendanceByFilter(bulananFilters);
      
      if (response.success) {
        setBulananData(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching bulanan data:', error);
      message.error(error.message || 'Gagal memuat data bulanan');
    } finally {
      setBulananLoading(false);
    }
  };

  // Handle bulanan filter change
  const handleBulananFilterChange = (key: keyof MonthlyAttendanceFilters, value: any) => {
    setBulananFilters(prev => ({ ...prev, [key]: value }));
  };

  // Handle table pagination change for harian
  const handleHarianTableChange = (pagination: any) => {
    setHarianFilters(prev => ({
      ...prev,
      pagination: {
        current: pagination.current,
        pageSize: pagination.pageSize
      }
    }));
  };


  // Handle export functions
  const handleExportHarian = async () => {
    if (!harianFilters.selectedDate) {
      message.warning('Pilih tanggal untuk export harian');
      return;
    }

    setExportLoading(true);
    try {
      const exportFilters: ExportFilters = {
        tanggal: harianFilters.selectedDate,
        lokasi_id: harianFilters.lokasi_id || undefined,
        satker: harianFilters.satker || undefined,
        bidang: harianFilters.bidang || undefined,
        search: harianFilters.search || undefined,
        status: (harianFilters.status as 'HAP' | 'TAP' | 'HAS' | 'CP') || undefined
      };
      
      await presensiApi.exportAndDownloadHarian(exportFilters);
      
      // Create descriptive success message
      let filterDesc = [];
      if (harianFilters.lokasi_id) filterDesc.push('lokasi dipilih');
      if (harianFilters.satker) filterDesc.push('satker dipilih');
      if (harianFilters.bidang) filterDesc.push('bidang dipilih');
      if (harianFilters.search) filterDesc.push(`pencarian "${harianFilters.search}"`);
      if (harianFilters.status) filterDesc.push(`status ${harianFilters.status}`);
      
      const filterText = filterDesc.length > 0 ? ` dengan filter: ${filterDesc.join(', ')}` : '';
      message.success(`Export harian berhasil diunduh${filterText}`);
    } catch (error: any) {
      message.error(error.message || 'Gagal export data harian');
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportBulanan = async () => {
    console.log('Export bulanan clicked'); // Debug log
    console.log('bulananFilters:', bulananFilters); // Debug filters
    
    setExportLoading(true);
    try {
      const exportFilters: ExportFilters = {
        month: bulananFilters.month,
        year: bulananFilters.year,
        satker: bulananFilters.satker || undefined,
        bidang: bulananFilters.bidang || undefined,
        user_id: bulananFilters.user_id || undefined
      };
      
      console.log('Export filters:', exportFilters); // Debug log
      console.log('Calling presensiApi.exportAndDownloadBulanan...'); // Debug API call
      await presensiApi.exportAndDownloadBulanan(exportFilters);
      console.log('Export completed successfully'); // Debug success
      
      // Create descriptive success message
      let filterDesc = [];
      if (bulananFilters.satker) filterDesc.push('satker dipilih');
      if (bulananFilters.bidang) filterDesc.push('bidang dipilih');
      if (bulananFilters.user_id) filterDesc.push('user dipilih');
      
      const filterText = filterDesc.length > 0 ? ` dengan filter: ${filterDesc.join(', ')}` : '';
      message.success(`Export bulanan berhasil diunduh${filterText}`);
    } catch (error: any) {
      console.error('Export error:', error); // Debug log
      message.error(error.message || 'Gagal export data bulanan');
    } finally {
      setExportLoading(false);
    }
  };

  // Render apel status
  const renderApelStatus = (status: string | null | undefined, type: 'pagi' | 'sore') => {
    if (!status) return <Text type="secondary">-</Text>;
    
    let color = 'default';
    let text = status;
    
    if (type === 'pagi') {
      color = status === 'HAP' ? 'green' : 'orange';
      text = status === 'HAP' ? 'HAP' : 'TAP';
    } else {
      color = status === 'HAS' ? 'green' : 'red';
      text = status === 'HAS' ? 'HAS' : 'CP';
    }
    
    return <Tag color={color}>{text}</Tag>;
  };


  // Harian table columns
  const harianColumns = [
    {
      title: 'NIP & Nama',
      key: 'nip_nama',
      width: 200,
      render: (_: any, record: Kehadiran) => (
        <div>
          <div><Text code>{record.pegawai.nip}</Text></div>
          <div><Text strong>{record.pegawai.nama}</Text></div>
        </div>
      )
    },
    {
      title: 'ID & Nama Unit Kerja',
      key: 'id_nama_unit_kerja',
      width: 250,
      render: (_: any, record: Kehadiran) => {
        const unitKerjaId = `${record.pegawai.kdsatker}/${record.pegawai.bidangf}/${record.pegawai.subf}`;
        return (
          <div>
            <div><Text code>{unitKerjaId}</Text></div>
            <div><Text>{record.pegawai.nm_unit_kerja}</Text></div>
          </div>
        );
      }
    },
    {
      title: 'Jam Masuk & Status',
      key: 'jam_masuk_status',
      width: 150,
      render: (_: any, record: Kehadiran) => {
        const time = record.absen_checkin;
        const apelStatus = record.absen_apel;
        
        // Format time to HH:MM (remove seconds)
        const formattedTime = time ? time.substring(0, 5) : '-';
        
        return (
          <div>
            <div><Text>{formattedTime}</Text></div>
            <div>{renderApelStatus(apelStatus, 'pagi')}</div>
          </div>
        );
      }
    },
    {
      title: 'Jam Keluar & Status',
      key: 'jam_keluar_status',
      width: 150,
      render: (_: any, record: Kehadiran) => {
        const time = record.absen_checkout;
        const apelStatus = record.absen_sore;
        
        // Format time to HH:MM (remove seconds)
        const formattedTime = time ? time.substring(0, 5) : '-';
        
        return (
          <div>
            <div><Text>{formattedTime}</Text></div>
            <div>{renderApelStatus(apelStatus, 'sore')}</div>
          </div>
        );
      }
    },
    {
      title: 'Tanggal',
      key: 'tanggal',
      width: 120,
      render: (_: any, record: Kehadiran) => (
        <Space>
          <CalendarOutlined />
          <Text>{dayjs(record.absen_tgl).format('DD/MM/YYYY')}</Text>
        </Space>
      )
    }
  ];

  // Bulanan table columns
  const bulananColumns = [
    {
      title: 'Tanggal',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date: string) => (
        <Space>
          <CalendarOutlined />
          <Text>{dayjs(date).format('DD/MM/YYYY')}</Text>
        </Space>
      )
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: 80,
      align: 'center' as const,
      render: (value: number) => (
        <Tag color="blue">{value}</Tag>
      )
    },
    {
      title: 'Hadir',
      dataIndex: 'HADIR',
      key: 'HADIR',
      width: 80,
      align: 'center' as const,
      render: (value: number) => (
        <Tag color={value > 0 ? 'green' : 'default'}>{value}</Tag>
      )
    },
    {
      title: 'HAP',
      dataIndex: 'HAP',
      key: 'HAP',
      width: 60,
      align: 'center' as const,
      render: (value: number) => (
        <Tag color={value > 0 ? 'green' : 'default'}>{value}</Tag>
      )
    },
    {
      title: 'TAP',
      dataIndex: 'TAP',
      key: 'TAP',
      width: 60,
      align: 'center' as const,
      render: (value: number) => (
        <Tag color={value > 0 ? 'orange' : 'default'}>{value}</Tag>
      )
    },
    {
      title: 'HAS',
      dataIndex: 'HAS',
      key: 'HAS',
      width: 60,
      align: 'center' as const,
      render: (value: number) => (
        <Tag color={value > 0 ? 'green' : 'default'}>{value}</Tag>
      )
    },
    {
      title: 'CP',
      dataIndex: 'CP',
      key: 'CP',
      width: 60,
      align: 'center' as const,
      render: (value: number) => (
        <Tag color={value > 0 ? 'red' : 'default'}>{value}</Tag>
      )
    }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '100%', overflow: 'hidden' }}>
      <Row gutter={[0, 16]}>
        <Col span={24}>
          <Card>
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
              <Col>
                <Title level={3} style={{ margin: 0 }}>
                  Data Presensi
                </Title>
                <Text type="secondary">
                  Kelola dan pantau data kehadiran pegawai
                </Text>
              </Col>
              <Col>
                <Space>
                  {activeTab === 'harian' ? (
                    <Tooltip 
                      title={!harianFilters.selectedDate 
                        ? 'Pilih tanggal terlebih dahulu' 
                        : 'Export data harian sesuai filter yang aktif'
                      }
                    >
                      <Button
                        icon={<DownloadOutlined />}
                        onClick={handleExportHarian}
                        loading={exportLoading}
                        disabled={!harianFilters.selectedDate}
                        type="primary"
                      >
                        Export Harian
                      </Button>
                    </Tooltip>
                  ) : (
                    <Button
                      icon={<DownloadOutlined />}
                      onClick={handleExportBulanan}
                      loading={exportLoading}
                      type="primary"
                    >
                      Export Bulanan
                    </Button>
                  )}
                </Space>
              </Col>
            </Row>

            <Tabs
              activeKey={activeTab}
              onChange={(key) => setActiveTab(key as 'harian' | 'bulanan')}
              size="large"
            >
              <TabPane
                tab={
                  <Space>
                    <CalendarOutlined />
                    Harian
                  </Space>
                }
                key="harian"
              >
                {/* Harian Filter Section */}
                <Card size="small" style={{ marginBottom: 16 }}>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} lg={5}>
                      <Input
                        placeholder="Cari pegawai atau NIP..."
                        prefix={<SearchOutlined />}
                        value={harianFilters.search}
                        onChange={(e) => setHarianFilters(prev => ({ ...prev, search: e.target.value }))}
                        allowClear
                      />
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                      <DatePicker
                        style={{ width: '100%' }}
                        placeholder="Pilih Tanggal"
                        value={harianFilters.selectedDate ? dayjs(harianFilters.selectedDate) : null}
                        onChange={(date) => {
                          setHarianFilters(prev => ({
                            ...prev,
                            selectedDate: date ? date.format('YYYY-MM-DD') : null
                          }));
                        }}
                        allowClear
                      />
                    </Col>
                    <Col xs={24} sm={12} lg={4}>
                      <DebounceSelect
                        placeholder="Pilih Satker"
                        value={harianFilters.satker ? { label: satkerOptions.find(opt => opt.value === harianFilters.satker)?.label || '', value: harianFilters.satker } : undefined}
                        onChange={(value: any) => {
                          const selectedValue = value?.value || '';
                          setHarianFilters(prev => ({ 
                            ...prev, 
                            satker: selectedValue,
                            bidang: '' // Reset bidang when satker changes
                          }));
                        }}
                        fetchOptions={fetchSatkerOptionsForSelect}
                        style={{ width: '100%' }}
                        allowClear
                        loading={loadingSatker}
                      />
                    </Col>
                    <Col xs={24} sm={12} lg={4}>
                      <DebounceSelect
                        placeholder="Pilih Bidang"
                        value={harianFilters.bidang ? { label: bidangOptions.find(opt => opt.value === harianFilters.bidang)?.label || '', value: harianFilters.bidang } : undefined}
                        onChange={(value: any) => {
                          const selectedValue = value?.value || '';
                          setHarianFilters(prev => ({ ...prev, bidang: selectedValue }));
                        }}
                        fetchOptions={fetchBidangOptionsForSelect}
                        style={{ width: '100%' }}
                        allowClear
                        loading={loadingBidang}
                        disabled={!harianFilters.satker || harianFilters.satker === 'null'}
                      />
                    </Col>
                    <Col xs={24} sm={12} lg={4}>
                      <Select
                        placeholder="Status"
                        value={harianFilters.status || undefined}
                        onChange={(value) => setHarianFilters(prev => ({ ...prev, status: value || '' }))}
                        style={{ width: '100%' }}
                        allowClear
                      >
                        <Option value="HAP">Hadir Apel Pagi</Option>
                        <Option value="TAP">Telat Apel Pagi</Option>
                        <Option value="HAS">Hadir Apel Sore</Option>
                        <Option value="CP">Cepat Pulang</Option>
                      </Select>
                    </Col>
                  </Row>
                </Card>

                {/* Harian Table */}
                <Table
                  columns={harianColumns}
                  dataSource={harianData}
                  rowKey={(record) => `${record.pegawai.nip}-${record.absen_tgl}`}
                  loading={harianLoading}
                  pagination={{
                    ...harianPagination,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} dari ${total} data`,
                  }}
                  onChange={handleHarianTableChange}
                  scroll={{ x: 900 }}
                  size="middle"
                />
              </TabPane>

              <TabPane
                tab={
                  <Space>
                    <BarChartOutlined />
                    Bulanan
                  </Space>
                }
                key="bulanan"
              >
                {/* Bulanan Filter Section */}
                <Card size="small" style={{ marginBottom: 16 }}>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={6}>
                      <DatePicker
                        picker="year"
                        placeholder="Pilih Tahun"
                        value={bulananFilters.year ? dayjs().year(bulananFilters.year) : null}
                        onChange={(date) => handleBulananFilterChange('year', date?.year())}
                        style={{ width: '100%' }}
                      />
                    </Col>
                    <Col xs={24} sm={6}>
                      <Select
                        placeholder="Pilih Bulan"
                        value={bulananFilters.month}
                        onChange={(value) => handleBulananFilterChange('month', value)}
                        style={{ width: '100%' }}
                      >
                        {Array.from({ length: 12 }, (_, i) => (
                          <Option key={i + 1} value={i + 1}>
                            {dayjs().month(i).format('MMMM')}
                          </Option>
                        ))}
                      </Select>
                    </Col>
                    <Col xs={24} sm={6}>
                      <DebounceSelect
                        placeholder="Filter Satker"
                        value={bulananFilters.satker ? { label: satkerOptions.find(opt => opt.value === bulananFilters.satker)?.label || '', value: bulananFilters.satker } : undefined}
                        onChange={(value: any) => {
                          const selectedValue = value?.value || undefined;
                          handleBulananFilterChange('satker', selectedValue);
                          handleBulananFilterChange('bidang', undefined); // Reset bidang when satker changes
                        }}
                        fetchOptions={fetchSatkerOptionsForSelect}
                        style={{ width: '100%' }}
                        allowClear
                        loading={loadingSatker}
                      />
                    </Col>
                    <Col xs={24} sm={6}>
                      <DebounceSelect
                        placeholder="Filter Bidang"
                        value={bulananFilters.bidang ? { label: bidangOptions.find(opt => opt.value === bulananFilters.bidang)?.label || '', value: bulananFilters.bidang } : undefined}
                        onChange={(value: any) => {
                          const selectedValue = value?.value || undefined;
                          handleBulananFilterChange('bidang', selectedValue);
                        }}
                        fetchOptions={fetchBidangOptionsForSelect}
                        style={{ width: '100%' }}
                        allowClear
                        loading={loadingBidang}
                        disabled={!bulananFilters.satker || bulananFilters.satker === 'null'}
                      />
                    </Col>
                    <Col xs={24} sm={6}>
                      <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchBulananData}
                        loading={bulananLoading}
                        style={{ width: '100%' }}
                      >
                        Refresh Data
                      </Button>
                    </Col>
                  </Row>
                  <Row style={{ marginTop: 8 }}>
                    <Col span={24}>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        💡 Export akan menggunakan filter bulan/tahun dan satker/bidang yang sedang aktif di atas
                      </Text>
                    </Col>
                  </Row>
                </Card>

                {/* Bulanan Table */}
                <Table
                  columns={bulananColumns}
                  dataSource={bulananData?.dailyBreakdown || []}
                  rowKey="date"
                  loading={bulananLoading}
                  pagination={false}
                  scroll={{ x: 600 }}
                  size="middle"
                />
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PresensiPage;