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
  EyeOutlined,
  DownloadOutlined,
  ReloadOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { presensiApi } from '../services/presensiApi';
import { lokasiApi } from '../../lokasi/services/lokasiApi';
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
  const navigate = useNavigate();
  
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

  // Selected lokasi state to store complete lokasi info
  const [selectedHarianLokasi, setSelectedHarianLokasi] = useState<{key: string; label: string; value: string} | undefined>();
  const [selectedBulananLokasi, setSelectedBulananLokasi] = useState<{key: string; label: string; value: string} | undefined>();

  // Lokasi fetch function for DebounceSelect
  const fetchLokasiOptions = async (search: string): Promise<Array<{ key: string; label: string; value: string }>> => {
    try {
      const response = await lokasiApi.getAll({ 
        search: search || undefined, 
        status: true, 
        limit: 20 // Limit results for better performance
      });
      
      return response.data.map(lokasi => ({
        key: lokasi.lokasi_id.toString(),
        label: lokasi.ket,
        value: lokasi.lokasi_id.toString()
      }));
    } catch (error: any) {
      console.error('Error fetching lokasi options:', error);
      message.error('Gagal memuat data lokasi');
      return [];
    }
  };

  // Harian filter state
  const [harianFilters, setHarianFilters] = useState<FilterState>({
    search: '',
    selectedDate: null,
    lokasi_id: '',
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
    lokasi_id: undefined,
    user_id: undefined
  });

  // Fetch data when component mounts or filters change
  useEffect(() => {
    // No need to fetch lokasi here since DebounceSelect handles it
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
  }, [activeTab, harianFilters.selectedDate, harianFilters.search, harianFilters.lokasi_id, harianFilters.status, harianFilters.pagination.current, harianFilters.pagination.pageSize]);

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
        // endDate not needed for single date filter
        lokasi_id: harianFilters.lokasi_id || undefined,
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

  // Handle view detail
  const handleViewDetail = (record: Kehadiran) => {
    navigate(`/presensi/${record.absen_id}`);
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
        search: harianFilters.search || undefined,
        status: (harianFilters.status as 'HAP' | 'TAP' | 'HAS' | 'CP') || undefined
      };
      
      await presensiApi.exportAndDownloadHarian(exportFilters);
      
      // Create descriptive success message
      let filterDesc = [];
      if (harianFilters.lokasi_id) filterDesc.push('lokasi dipilih');
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
        lokasi_id: bulananFilters.lokasi_id || undefined,
        user_id: bulananFilters.user_id || undefined
      };
      
      console.log('Export filters:', exportFilters); // Debug log
      console.log('Calling presensiApi.exportAndDownloadBulanan...'); // Debug API call
      await presensiApi.exportAndDownloadBulanan(exportFilters);
      console.log('Export completed successfully'); // Debug success
      
      // Create descriptive success message
      let filterDesc = [];
      if (bulananFilters.lokasi_id) filterDesc.push('lokasi dipilih');
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

  // Render status tags for harian
  const renderStatusTag = (record: Kehadiran) => {
    const tags = [];
    
    // Render absen_kat
    if (record.absen_kat) {
      tags.push(
        <Tag key="kat" color="blue">
          {record.absen_kat}
        </Tag>
      );
    }
    
    return <Space wrap>{tags}</Space>;
  };

  // Render apel status
  const renderApelStatus = (status: string | null | undefined, type: 'pagi' | 'sore') => {
    if (!status) return <Text type="secondary">-</Text>;
    
    let color = 'default';
    let text = status;
    
    if (type === 'pagi') {
      color = status === 'HAP' ? 'green' : 'orange';
      text = status === 'HAP' ? 'Hadir' : 'Telat';
    } else {
      color = status === 'HAS' ? 'green' : 'red';
      text = status === 'HAS' ? 'Hadir' : 'Cepat Pulang';
    }
    
    return <Tag color={color}>{text}</Tag>;
  };

  // Render combined check-in time with morning attendance status
  const renderJamMasukApelPagi = (record: Kehadiran) => {
    const time = record.absen_checkin;
    const apelStatus = record.absen_apel;
    
    return (
      <Space direction="vertical" size="small">
        <Space>
          <ClockCircleOutlined style={{ color: time ? '#52c41a' : '#ff4d4f' }} />
          <Text>{time || '-'}</Text>
        </Space>
        {apelStatus ? renderApelStatus(apelStatus, 'pagi') : <Text type="secondary">-</Text>}
      </Space>
    );
  };

  // Render combined check-out time with afternoon attendance status
  const renderJamKeluarApelSore = (record: Kehadiran) => {
    const time = record.absen_checkout;
    const apelStatus = record.absen_sore;
    
    return (
      <Space direction="vertical" size="small">
        <Space>
          <ClockCircleOutlined style={{ color: time ? '#52c41a' : '#ff4d4f' }} />
          <Text>{time || '-'}</Text>
        </Space>
        {apelStatus ? renderApelStatus(apelStatus, 'sore') : <Text type="secondary">-</Text>}
      </Space>
    );
  };

  // Harian table columns
  const harianColumns = [
    {
      title: 'Tanggal',
      dataIndex: 'absen_tgl',
      key: 'absen_tgl',
      width: 120,
      render: (date: string) => (
        <Space>
          <CalendarOutlined />
          <Text>{dayjs(date).format('DD/MM/YYYY')}</Text>
        </Space>
      ),
      sorter: true
    },
    {
      title: 'Username',
      key: 'username',
      width: 150,
      render: (_: any, record: Kehadiran) => (
        <Text strong>{record.User?.username || record.absen_nip}</Text>
      )
    },
    {
      title: 'Jam Masuk',
      key: 'jam_masuk_apel_pagi',
      width: 150,
      render: (_: any, record: Kehadiran) => renderJamMasukApelPagi(record)
    },
    {
      title: 'Jam Keluar',
      key: 'jam_keluar_apel_sore',
      width: 150,
      render: (_: any, record: Kehadiran) => renderJamKeluarApelSore(record)
    },
    {
      title: 'Lokasi',
      key: 'lokasi',
      width: 150,
      render: (_: any, record: Kehadiran) => (
        <Space>
          <EnvironmentOutlined />
          <Text>{record.Lokasi?.ket || record.lokasi_id}</Text>
        </Space>
      )
    },
    {
      title: 'Status',
      key: 'status',
      width: 70,
      render: (_: any, record: Kehadiran) => renderStatusTag(record)
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 80,
      fixed: 'right' as const,
      render: (_: any, record: Kehadiran) => (
        <Space>
          <Tooltip title="Lihat Detail">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
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
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
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
                        placeholder="Pilih Lokasi"
                        value={selectedHarianLokasi}
                        onChange={(value: any) => {
                          setSelectedHarianLokasi(value);
                          const selectedValue = value?.value || '';
                          setHarianFilters(prev => ({ ...prev, lokasi_id: selectedValue.toString() }));
                        }}
                        fetchOptions={fetchLokasiOptions}
                        style={{ width: '100%' }}
                        allowClear
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
                    <Col xs={24} lg={5}>
                      <Button
                        icon={<ReloadOutlined />}
                        onClick={() => {
                          setHarianFilters({
                            search: '',
                            selectedDate: null,
                            lokasi_id: '',
                            status: '',
                            pagination: { current: 1, pageSize: 10 }
                          });
                          setSelectedHarianLokasi(undefined);
                          setHarianPagination(prev => ({ ...prev, current: 1 }));
                        }}
                        loading={harianLoading}
                        style={{ width: '100%' }}
                      >
                        Reset Filter
                      </Button>
                    </Col>
                  </Row>
                  <Row style={{ marginTop: 8 }}>
                    <Col span={24}>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        💡 Data dan export otomatis difilter saat tanggal atau filter diubah
                      </Text>
                    </Col>
                  </Row>
                </Card>

                {/* Harian Table */}
                <Table
                  columns={harianColumns}
                  dataSource={harianData}
                  rowKey="absen_id"
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
                        placeholder="Filter Lokasi"
                        value={selectedBulananLokasi}
                        onChange={(value: any) => {
                          setSelectedBulananLokasi(value);
                          const selectedValue = value?.value || undefined;
                          handleBulananFilterChange('lokasi_id', selectedValue);
                        }}
                        fetchOptions={fetchLokasiOptions}
                        style={{ width: '100%' }}
                        allowClear
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
                        💡 Export akan menggunakan filter bulan/tahun dan lokasi yang sedang aktif di atas
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