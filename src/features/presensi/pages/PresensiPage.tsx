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
  Alert
} from 'antd';
import {
  SearchOutlined,
  DownloadOutlined,
  CalendarOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { presensiApi } from '../services/presensiApi';
import DebounceSelect from '../../../components/DebounceSelect';
import { useAdminAutoFilter, useEffectiveFilter } from '../hooks/useAdminAutoFilter';
import { useAuthStore } from '../../../store/authStore';
import type {
  Kehadiran,
  KehadiranFilters,
  FilterState,
  ExportFilters
} from '../types';

const { Option } = Select;
const { Title, Text } = Typography;

const PresensiPage: React.FC = () => {
  
  // Admin auto-filter hooks
  const autoFilter = useAdminAutoFilter();
  
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
    // Untuk Admin OPD/UPT, gunakan satker dari auto-filter
    const user = useAuthStore.getState().user;
    let satkerToUse = harianFilters.satker;
    
    if (user?.role === 'admin-opd' && user.admin_opd) {
      satkerToUse = user.admin_opd.id_satker;
    } else if (user?.role === 'admin-upt' && user.admin_upt) {
      satkerToUse = user.admin_upt.id_satker;
    }
    
    if (!satkerToUse || satkerToUse === 'null') {
      return [{ label: '🚫 Tanpa Bidang', value: 'null' }];
    }
    
    try {
      const options = await presensiApi.getBidangOptions(satkerToUse, search);
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

  // Effective filters untuk harian
  const harianEffectiveFilter = useEffectiveFilter(harianFilters.satker, harianFilters.bidang);

  // Fetch data when component mounts or filters change
  useEffect(() => {
    // Load initial Satker options
    fetchSatkerOptions();
  }, []);

  // Auto-filter when filters change (no manual filter button needed)
  // Use debounce for search to avoid too many API calls
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchHarianData();
    }, harianFilters.search ? 500 : 0); // 500ms debounce for search, immediate for other filters

    return () => clearTimeout(debounceTimer);
  }, [harianFilters.selectedDate, harianFilters.search, harianFilters.lokasi_id, harianFilters.satker, harianFilters.bidang, harianFilters.status, harianFilters.pagination.current, harianFilters.pagination.pageSize]);

  // Load bidang options when satker changes atau untuk Admin OPD/UPT
  useEffect(() => {
    const user = useAuthStore.getState().user;
    let satkerToUse = harianFilters.satker;
    
    // Untuk Admin OPD/UPT, gunakan satker dari auto-filter
    if (user?.role === 'admin-opd' && user.admin_opd) {
      satkerToUse = user.admin_opd.id_satker;
    } else if (user?.role === 'admin-upt' && user.admin_upt) {
      satkerToUse = user.admin_upt.id_satker;
    }
    
    if (satkerToUse && satkerToUse !== 'null') {
      fetchBidangOptions(satkerToUse);
    } else {
      setBidangOptions([{ label: '🚫 Tanpa Bidang', value: 'null' }]);
    }
  }, [harianFilters.satker]);

  const fetchHarianData = async () => {
    setHarianLoading(true);
    try {
      const apiFilters: KehadiranFilters = {
        page: harianFilters.pagination.current,
        limit: harianFilters.pagination.pageSize,
        search: harianFilters.search || undefined,
        startDate: harianFilters.selectedDate || undefined,
        lokasi_id: harianFilters.lokasi_id || undefined,
        satker: harianEffectiveFilter.satker || undefined,
        bidang: harianEffectiveFilter.bidang || undefined,
        status: harianFilters.status as any || undefined
      };

      console.log('Harian API Filters:', apiFilters);
      console.log('Auto-filter reason:', harianEffectiveFilter.filterReason);

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
        satker: harianEffectiveFilter.satker || undefined,
        bidang: harianEffectiveFilter.bidang || undefined,
        search: harianFilters.search || undefined,
        status: (harianFilters.status as 'HAP' | 'TAP' | 'HAS' | 'CP') || undefined
      };
      
      console.log('Export Harian Filters:', exportFilters);
      console.log('Auto-filter reason:', harianEffectiveFilter.filterReason);
      
      await presensiApi.exportAndDownloadHarian(exportFilters);
      
      // Create descriptive success message
      let filterDesc = [];
      if (harianFilters.lokasi_id) filterDesc.push('lokasi dipilih');
      if (harianEffectiveFilter.satker) filterDesc.push(`satker ${harianEffectiveFilter.satker}${harianEffectiveFilter.isAutoFiltered ? ' (auto-filter)' : ''}`);
      if (harianEffectiveFilter.bidang) filterDesc.push(`bidang ${harianEffectiveFilter.bidang}${harianEffectiveFilter.isAutoFiltered ? ' (auto-filter)' : ''}`);
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
      title: 'Unit Kerja & Jabatan',
      key: 'unit_kerja_jabatan',
      width: 250,
      render: (_: any, record: Kehadiran) => {
        // Gunakan data historis jika ada, jika tidak gunakan data pegawai saat ini
        const kdsatker = record.KDSATKER || record.pegawai.kdsatker || '-';
        const bidangf = record.BIDANGF || record.pegawai.bidangf || '-';
        const subf = record.SUBF || record.pegawai.subf || null;
        const nmUnitKerja = record.NM_UNIT_KERJA || record.pegawai.nm_unit_kerja || '-';
        const namaJabatan = record.nama_jabatan || '-';
        
        const unitKerjaId = subf 
          ? `${kdsatker}/${bidangf}/${subf}` 
          : `${kdsatker}/${bidangf}`;
        
        return (
          <div>
            <div>
              <Tooltip title={nmUnitKerja !== '-' ? nmUnitKerja : 'Nama unit kerja tidak tersedia'}>
                <Text code>{unitKerjaId}</Text>
              </Tooltip>
            </div>
            {namaJabatan && namaJabatan !== '-' && (
              <div><Text>{namaJabatan}</Text></div>
            )}
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
                </Space>
              </Col>
            </Row>

            {/* Auto-filter Alert */}
            {autoFilter.isAutoFiltered && (
              <Alert
                message="Filter Otomatis Aktif"
                description={autoFilter.filterReason}
                type="info"
                icon={<InfoCircleOutlined />}
                style={{ marginBottom: 16 }}
                showIcon
              />
            )}

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
                {/* Filter Satker - hanya tampil untuk Superadmin */}
                {useAuthStore.getState().user?.role === 'super_admin' && (
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
                )}
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
                    disabled={
                      // Untuk Superadmin: disabled jika tidak ada satker yang dipilih
                      useAuthStore.getState().user?.role === 'super_admin' 
                        ? (!harianFilters.satker || harianFilters.satker === 'null')
                        // Untuk Admin OPD/UPT: selalu enabled karena satker sudah auto-set
                        : false
                    }
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
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PresensiPage;