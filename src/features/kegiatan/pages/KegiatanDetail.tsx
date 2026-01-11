import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Tag, 
  Space, 
  message, 
  Spin, 
  Table,
  Empty,
  Typography,
  Row,
  Col,
  Divider,
  Statistic,
  Progress,
  Tooltip,
  Input,
  Badge
} from 'antd';
import { 
  ArrowLeftOutlined, 
  EditOutlined, 
  CalendarOutlined,
  EnvironmentOutlined,
  PlusOutlined,
  FileTextOutlined,
  EyeOutlined,
  UserOutlined,
  CheckCircleOutlined,
  SearchOutlined,
  DownloadOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { kegiatanApi } from '../services/kegiatanApi';
import { lokasiKegiatanApi } from '../../lokasi/services/lokasiKegiatanApi';
import type { JadwalKegiatan, LokasiWithSatker } from '../types';
import { JENIS_KEGIATAN_OPTIONS } from '../types';
import { dateFormatter } from '../../../utils/dateFormatter';
import GrupPesertaModal from '../components/GrupPesertaModal';
import ManagePesertaModal from '../components/ManagePesertaModal';
import ImportPesertaModal from '../components/ImportPesertaModal';
import MultiLocationMap from '../../../components/MultiLocationMap';
import type { GrupPesertaKegiatan } from '../types';

const { Title, Text } = Typography;

const KegiatanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [kegiatan, setKegiatan] = useState<JadwalKegiatan | null>(null);
  const [loading, setLoading] = useState(true);
  const [allLokasiList, setAllLokasiList] = useState<LokasiWithSatker[]>([]);
  
  // State untuk grup peserta
  const [grupPesertaList, setGrupPesertaList] = useState<GrupPesertaKegiatan[]>([]);
  const [grupPesertaModalVisible, setGrupPesertaModalVisible] = useState(false);
  const [editingGrup, setEditingGrup] = useState<GrupPesertaKegiatan | null>(null);
  const [selectedLokasiForGrup, setSelectedLokasiForGrup] = useState<number | null>(null);
  const [managePesertaModalVisible, setManagePesertaModalVisible] = useState(false);
  const [selectedGrupForManage, setSelectedGrupForManage] = useState<GrupPesertaKegiatan | null>(null);
  const [importPesertaModalVisible, setImportPesertaModalVisible] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-0.6267, 100.1207]);
  const [mapZoom, setMapZoom] = useState(12);
  const [mapLocations, setMapLocations] = useState<Array<{
    lat: number;
    lng: number;
    range: number;
    ket: string;
    lokasi_id: number;
    satker_list?: string[];
  }>>([]);

  // State untuk data grup peserta
  const [grupPesertaData, setGrupPesertaData] = useState<any[]>([]);
  const [grupPesertaDataLoading, setGrupPesertaDataLoading] = useState(false);
  const [grupPesertaSearchText, setGrupPesertaSearchText] = useState('');
  
  // State untuk loading download
  const [downloadBulkLoading, setDownloadBulkLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchKegiatanDetail(parseInt(id));
      fetchGrupPesertaData(parseInt(id));
      fetchGrupPeserta(parseInt(id));
      fetchAllLokasi();
    }
  }, [id]);

  const fetchAllLokasi = async () => {
    try {
      const response = await lokasiKegiatanApi.getAll({ page: 1, limit: 1000 });
      // Response structure: { data: LokasiKegiatan[], pagination: {...} }
      const lokasiData = response.data || [];
      const lokasiList = lokasiData
        .filter((lokasi: any) => lokasi.lat != null && lokasi.lng != null) // Filter out null/undefined
        .map((lokasi: any) => ({
          lokasi_id: lokasi.lokasi_id,
          lat: Number(lokasi.lat), // Ensure it's a number
          lng: Number(lokasi.lng), // Ensure it's a number
          ket: lokasi.ket,
          status: lokasi.status !== undefined ? lokasi.status : true,
          range: Number(lokasi.range) || 0,
          satker_list: []
        }));
      setAllLokasiList(lokasiList);
    } catch (error: any) {
      console.error('Error fetching all lokasi:', error);
      message.error('Gagal memuat daftar lokasi');
    }
  };

  const fetchGrupPeserta = async (kegiatanId: number) => {
    try {
      const response = await kegiatanApi.getAllGrupPeserta(kegiatanId);
      if (response.success && response.data) {
        setGrupPesertaList(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching grup peserta:', error);
    }
  };

  const fetchKegiatanDetail = async (kegiatanId: number) => {
    try {
      setLoading(true);
      const kegiatanResponse = await kegiatanApi.getById(kegiatanId);
      const kegiatanData = kegiatanResponse.data;
      
      // Jika ada lokasi_list, pastikan lat/lng adalah number
      if (kegiatanData.lokasi_list) {
        kegiatanData.lokasi_list = kegiatanData.lokasi_list.map((lokasi: any) => ({
          ...lokasi,
          lat: Number(lokasi.lat),
          lng: Number(lokasi.lng),
          range: Number(lokasi.range) || 0
        }));
      }
      
      setKegiatan(kegiatanData);
    } catch (error: any) {
      console.error('Error fetching kegiatan detail:', error);
      message.error('Gagal memuat detail kegiatan');
      navigate('/kegiatan');
    } finally {
      setLoading(false);
    }
  };

  const fetchGrupPesertaData = async (kegiatanId: number) => {
    try {
      setGrupPesertaDataLoading(true);
      const response = await kegiatanApi.getAllGrupPesertaKegiatan(kegiatanId);
      setGrupPesertaData(response.data || []);
    } catch (error: any) {
      console.error('Error fetching grup peserta data:', error);
      message.error('Gagal memuat data grup peserta');
    } finally {
      setGrupPesertaDataLoading(false);
    }
  };

  // Filter grup peserta data
  const filteredGrupPesertaData = grupPesertaData.filter(grup => 
    grup.nama_grup.toLowerCase().includes(grupPesertaSearchText.toLowerCase()) ||
    (grup.nama_satker && grup.nama_satker.toLowerCase().includes(grupPesertaSearchText.toLowerCase())) ||
    (grup.lokasi && grup.lokasi.ket.toLowerCase().includes(grupPesertaSearchText.toLowerCase()))
  );

  // Download Excel untuk semua satker
  const handleDownloadBulkExcel = async () => {
    try {
      setDownloadBulkLoading(true);
      const blob = await kegiatanApi.bulkDownloadGrupPesertaExcel(parseInt(id!));
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const tanggalKegiatan = kegiatan?.tanggal_kegiatan 
        ? new Date(kegiatan.tanggal_kegiatan).toLocaleDateString('id-ID')
        : 'unknown';
      const jenisKegiatan = kegiatan?.jenis_kegiatan || 'kegiatan';
      link.download = `Data_Grup_Peserta_Kegiatan_${jenisKegiatan.replace(/\s+/g, '_')}_${tanggalKegiatan.replace(/\//g, '-')}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success('File Excel berhasil didownload');
    } catch (error: any) {
      console.error('Error downloading Excel:', error);
      message.error('Gagal mendownload file Excel');
    } finally {
      setDownloadBulkLoading(false);
    }
  };





  const handleGrupPesertaSuccess = async () => {
    setGrupPesertaModalVisible(false);
    setEditingGrup(null);
    setSelectedLokasiForGrup(null);
    if (kegiatan) {
      await fetchGrupPeserta(kegiatan.id_kegiatan);
      await fetchKegiatanDetail(kegiatan.id_kegiatan);
      await fetchGrupPesertaData(kegiatan.id_kegiatan);
    }
  };

  const handleManagePesertaSuccess = async () => {
    if (kegiatan) {
      await fetchGrupPeserta(kegiatan.id_kegiatan);
      await fetchKegiatanDetail(kegiatan.id_kegiatan);
      await fetchGrupPesertaData(kegiatan.id_kegiatan);
    }
  };

  const getJenisKegiatanLabel = (value: string): string => {
    const option = JENIS_KEGIATAN_OPTIONS.find(opt => opt.value === value);
    return option?.label || value;
  };

  // Ambil lokasi unik dari grup peserta dan dari kegiatan untuk peta
  useEffect(() => {
    const lokasiMap = new Map<number, any>();
    
    // Ambil lokasi dari grup peserta
    if (grupPesertaData.length > 0) {
      grupPesertaData.forEach((grup: any) => {
        if (grup.lokasi) {
          if (Array.isArray(grup.lokasi)) {
            grup.lokasi.forEach((lok: any) => {
              // Ensure lat and lng are valid numbers
              const lat = Number(lok.lat);
              const lng = Number(lok.lng);
              if (!isNaN(lat) && !isNaN(lng) && !lokasiMap.has(lok.lokasi_id)) {
                lokasiMap.set(lok.lokasi_id, {
                  lokasi_id: lok.lokasi_id,
                  lat: lat,
                  lng: lng,
                  range: Number(lok.range) || 0,
                  ket: lok.ket || '',
                  satker_list: []
                });
              }
            });
          } else {
            // Ensure lat and lng are valid numbers
            const lat = Number(grup.lokasi.lat);
            const lng = Number(grup.lokasi.lng);
            if (!isNaN(lat) && !isNaN(lng) && !lokasiMap.has(grup.lokasi.lokasi_id)) {
              lokasiMap.set(grup.lokasi.lokasi_id, {
                lokasi_id: grup.lokasi.lokasi_id,
                lat: lat,
                lng: lng,
                range: Number(grup.lokasi.range) || 0,
                ket: grup.lokasi.ket || '',
                satker_list: []
              });
            }
          }
        }
      });
    }
    
    // Ambil lokasi dari kegiatan (jika ada lokasi_list)
    if (kegiatan?.lokasi_list && kegiatan.lokasi_list.length > 0) {
      kegiatan.lokasi_list.forEach((lokasi: LokasiWithSatker) => {
        const lat = Number(lokasi.lat);
        const lng = Number(lokasi.lng);
        if (!isNaN(lat) && !isNaN(lng) && !lokasiMap.has(lokasi.lokasi_id)) {
          lokasiMap.set(lokasi.lokasi_id, {
            lokasi_id: lokasi.lokasi_id,
            lat: lat,
            lng: lng,
            range: Number(lokasi.range) || 0,
            ket: lokasi.ket || '',
            satker_list: lokasi.satker_list || []
          });
        }
      });
    }
    
    const uniqueLocations = Array.from(lokasiMap.values());
    setMapLocations(uniqueLocations);
    
    if (uniqueLocations.length > 0 && !isNaN(uniqueLocations[0].lat) && !isNaN(uniqueLocations[0].lng)) {
      setMapCenter([uniqueLocations[0].lat, uniqueLocations[0].lng]);
      setMapZoom(15);
    }
  }, [grupPesertaData, kegiatan]);


  // Hitung total statistik
  // Ambil lokasi unik dari grup peserta
  const uniqueLokasiIds = new Set<number>();
  grupPesertaData.forEach((grup: any) => {
    if (grup.lokasi) {
      if (Array.isArray(grup.lokasi)) {
        grup.lokasi.forEach((lok: any) => uniqueLokasiIds.add(lok.lokasi_id));
      } else {
        uniqueLokasiIds.add(grup.lokasi.lokasi_id);
      }
    }
  });
  const totalLokasi = uniqueLokasiIds.size;
  const totalGrup = grupPesertaList.length;
  const totalPeserta = grupPesertaData.reduce((sum, g) => sum + (g.total_pegawai || 0), 0);
  const totalKehadiran = grupPesertaData.reduce((sum, g) => sum + (g.total_kehadiran || 0), 0);
  const totalPersentase = totalPeserta > 0 ? Math.round((totalKehadiran / totalPeserta) * 100) : 0;

  if (loading) {
    return (
      <div style={{ padding: '24px', maxWidth: '100%', overflow: 'hidden' }}>
        <Card>
          <div style={{ marginBottom: '16px' }}>
            <Title level={3} style={{ margin: 0, marginBottom: '4px' }}>
              Detail Kegiatan
            </Title>
            <Text type="secondary">Memuat data kegiatan...</Text>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '300px' 
          }}>
            <Spin size="large" tip="Memuat detail kegiatan..." />
          </div>
        </Card>
      </div>
    );
  }

  if (!kegiatan) {
    return (
      <div style={{ padding: '24px', maxWidth: '100%', overflow: 'hidden' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <CalendarOutlined style={{ fontSize: '64px', color: '#ff4d4f', marginBottom: '16px' }} />
            <Title level={3}>Kegiatan Tidak Ditemukan</Title>
            <Text type="secondary" style={{ marginBottom: '24px', display: 'block' }}>
              Kegiatan yang Anda cari tidak dapat ditemukan atau telah dihapus.
            </Text>
            <Button 
              type="primary"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/kegiatan')}
            >
              Kembali ke Daftar Kegiatan
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '100%', overflow: 'hidden' }}>
      <Card>
        {/* Header */}
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <Title level={3} style={{ margin: 0, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarOutlined style={{ color: '#1890ff' }} />
              Detail Kegiatan
            </Title>
            <Text type="secondary">
              Informasi lengkap jadwal dan lokasi kegiatan
            </Text>
          </div>
          
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/kegiatan')}
            >
              Kembali
            </Button>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/kegiatan/${kegiatan.id_kegiatan}/edit`)}
            >
              Edit Kegiatan
            </Button>
          </Space>
        </div>

        <Divider />

        {/* Summary Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Lokasi"
                value={totalLokasi}
                prefix={<EnvironmentOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Grup Peserta"
                value={totalGrup}
                prefix={<TeamOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Peserta"
                value={totalPeserta}
                prefix={<UserOutlined style={{ color: '#722ed1' }} />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Kehadiran"
                value={totalKehadiran}
                suffix={`/ ${totalPeserta}`}
                prefix={<CheckCircleOutlined style={{ color: totalKehadiran > 0 ? '#52c41a' : '#d9d9d9' }} />}
                valueStyle={{ color: totalKehadiran > 0 ? '#52c41a' : '#d9d9d9' }}
              />
              <Progress
                percent={totalPersentase}
                size="small"
                strokeColor={totalPersentase >= 80 ? '#52c41a' : totalPersentase >= 50 ? '#faad14' : '#ff4d4f'}
                style={{ marginTop: '8px' }}
              />
            </Card>
          </Col>
        </Row>

            {/* Informasi Kegiatan */}
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileTextOutlined />
                  <span>Informasi Kegiatan</span>
                </div>
              }
              style={{ marginBottom: '24px' }}
            >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
                    <div>
                <Text type="secondary" style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                        Tanggal Kegiatan
                      </Text>
                <Text strong style={{ fontSize: '15px', color: '#52c41a' }}>
                        {dateFormatter.toIndonesian(kegiatan.tanggal_kegiatan, 'dd MMM yyyy')}
                      </Text>
                    </div>
                </Col>
            <Col xs={24} sm={12} md={8}>
                    <div>
                <Text type="secondary" style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                        Jam Presensi Kegiatan
                      </Text>
                <Text strong style={{ fontSize: '15px', color: '#1890ff' }}>
                        {kegiatan.jam_mulai && kegiatan.jam_selesai 
                          ? `${kegiatan.jam_mulai.substring(0, 5)} - ${kegiatan.jam_selesai.substring(0, 5)}`
                          : kegiatan.jam_mulai 
                            ? `Mulai: ${kegiatan.jam_mulai.substring(0, 5)}`
                            : kegiatan.jam_selesai
                              ? `Selesai: ${kegiatan.jam_selesai.substring(0, 5)}`
                              : 'Tidak ditentukan'
                        }
                      </Text>
                      {(kegiatan.dispensasi_keterlambatan !== null && kegiatan.dispensasi_keterlambatan !== undefined) && (
                        <div style={{ marginTop: '4px' }}>
                          <Tag color="orange">Dispensasi: {kegiatan.dispensasi_keterlambatan} menit</Tag>
                        </div>
                      )}
                    </div>
                  </Col>
            <Col xs={24} sm={12} md={8}>
                  <div>
                <Text type="secondary" style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                  Jenis Kegiatan
                </Text>
                <Text strong style={{ fontSize: '15px' }}>
                        {getJenisKegiatanLabel(kegiatan.jenis_kegiatan)}
                    </Text>
                  </div>
            </Col>
            <Col xs={24}>
              <div>
                <Text type="secondary" style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                  Deskripsi
                  </Text>
                <Text style={{ fontSize: '14px' }}>{kegiatan.keterangan}</Text>
                </div>
            </Col>
          </Row>
            </Card>

        {/* Peta Lokasi */}
        <Row gutter={[24, 24]}>
          <Col xs={24}>
            {mapLocations.length > 0 ? (
              <Card 
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <EnvironmentOutlined />
                    <span>Peta Lokasi</span>
                  </div>
                }
              >
                <div style={{ height: '400px', borderRadius: '8px', overflow: 'hidden' }}>
                  <MultiLocationMap
                    center={mapCenter}
                    zoom={mapZoom}
                    locations={mapLocations}
                    height="400px"
                    width="100%"
                  />
                </div>
                <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {mapLocations.map((location, index) => (
                      <Tag 
                        key={location.lokasi_id}
                        color={index === 0 ? 'blue' : 'green'}
                        style={{ fontSize: '12px' }}
                      >
                        {location.ket} ({location.range}m)
                      </Tag>
                  ))}
                </div>
              </Card>
            ) : (
              <Card 
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <EnvironmentOutlined />
                    <span>Peta Lokasi</span>
                  </div>
                }
              >
                <div style={{ 
                  height: '400px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px'
                }}>
                  <Empty 
                    description={
                      <Text type="secondary" style={{ fontSize: '14px' }}>
                        Belum ada lokasi untuk ditampilkan di peta
                      </Text>
                    }
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </div>
              </Card>
            )}
          </Col>
        </Row>

        {/* Tabel Grup Peserta dan Kehadiran */}
        <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
          <Col span={24}>
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserOutlined />
                  <span>Data Grup Peserta dan Kehadiran</span>
                  {grupPesertaData.length > 0 && (
                    <Badge count={grupPesertaData.length} style={{ marginLeft: '8px' }} />
                  )}
                </div>
              }
              extra={
                <Space>
                <Button
                  type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setEditingGrup(null);
                      setSelectedLokasiForGrup(null);
                      setGrupPesertaModalVisible(true);
                    }}
                  >
                    Tambah Grup Peserta
                  </Button>
                  <Button
                  icon={<DownloadOutlined />}
                  onClick={handleDownloadBulkExcel}
                  loading={downloadBulkLoading}
                >
                  Download Excel
                </Button>
                </Space>
              }
            >
              <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Input
                  placeholder="Cari nama grup, satker, atau lokasi..."
                  prefix={<SearchOutlined />}
                  value={grupPesertaSearchText}
                  onChange={(e) => setGrupPesertaSearchText(e.target.value)}
                  style={{ width: 300 }}
                  allowClear
                />
              </div>

              <Table
                dataSource={filteredGrupPesertaData}
                loading={grupPesertaDataLoading}
                rowKey="id_grup_peserta"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} grup`
                }}
                columns={[
                  {
                    title: 'Nama Grup',
                    dataIndex: 'nama_grup',
                    key: 'nama_grup',
                    width: '25%',
                    render: (text: string) => (
                      <div>
                      <Text strong style={{ fontSize: '14px' }}>
                        {text}
                      </Text>
                      </div>
                    )
                  },
                  {
                    title: 'Jenis',
                    dataIndex: 'jenis_grup',
                    key: 'jenis_grup',
                    width: '10%',
                    render: (jenis: string) => (
                      <Tag color={jenis === 'opd' ? 'blue' : 'green'}>
                        {jenis === 'opd' ? 'OPD' : 'Khusus'}
                      </Tag>
                    )
                  },
                  {
                    title: 'Lokasi',
                    dataIndex: 'lokasi',
                    key: 'lokasi',
                    width: '20%',
                    render: (lokasi: any) => {
                      if (!lokasi) {
                        return <Text type="secondary" style={{ fontSize: '12px' }}>-</Text>;
                      }
                      // Jika lokasi adalah array (grup digabung dari beberapa lokasi)
                      if (Array.isArray(lokasi)) {
                        if (lokasi.length === 0) {
                          return <Text type="secondary" style={{ fontSize: '12px' }}>-</Text>;
                        }
                        if (lokasi.length === 1) {
                          return <Text style={{ fontSize: '12px' }}>{lokasi[0].ket}</Text>;
                        }
                        // Tampilkan semua lokasi dengan tooltip
                        const lokasiNames = lokasi.map((l: any) => l.ket).join(', ');
                        return (
                          <Tooltip title={lokasiNames}>
                            <Text style={{ fontSize: '12px' }}>
                              {lokasi.length} lokasi
                            </Text>
                          </Tooltip>
                        );
                      }
                      // Jika lokasi adalah object tunggal
                      return <Text style={{ fontSize: '12px' }}>{lokasi.ket}</Text>;
                    }
                  },
                  {
                    title: 'Total Pegawai',
                    dataIndex: 'total_pegawai',
                    key: 'total_pegawai',
                    width: '12%',
                    align: 'center',
                    sorter: (a: any, b: any) => a.total_pegawai - b.total_pegawai,
                    render: (value: number) => (
                      <Statistic
                        value={value}
                        valueStyle={{ fontSize: '16px', color: '#1890ff' }}
                        prefix={<UserOutlined />}
                      />
                    )
                  },
                  {
                    title: 'Kehadiran',
                    dataIndex: 'total_kehadiran',
                    key: 'total_kehadiran',
                    width: '12%',
                    align: 'center',
                    render: (value: number) => (
                      <Statistic
                        value={value}
                        valueStyle={{ fontSize: '16px', color: value > 0 ? '#52c41a' : '#d9d9d9' }}
                        prefix={<CheckCircleOutlined />}
                      />
                    )
                  },
                  {
                    title: 'Aksi',
                    key: 'action',
                    width: '20%',
                    align: 'center',
                    render: (_, record: any) => {
                      // Cari grup lengkap dari grupPesertaList
                      const grupFull = grupPesertaList.find(g => g.id_grup_peserta === record.id_grup_peserta);
                      
                      return (
                      <Space size="small">
                        <Button
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => {
                            if (grupFull) {
                              setSelectedGrupForManage(grupFull);
                              setManagePesertaModalVisible(true);
                            }
                          }}
                        >
                          Kelola
                        </Button>
                        <Button
                          size="small"
                          onClick={() => navigate(`/kegiatan/${id}/grup/${record.id_grup_peserta}`)}
                        >
                          Lihat Detail
                        </Button>
                      </Space>
                      );
                    }
                  }
                ]}
              />
            </Card>
          </Col>
        </Row>

        {/* Modals */}
        <GrupPesertaModal
          visible={grupPesertaModalVisible}
          onCancel={() => {
            setGrupPesertaModalVisible(false);
            setEditingGrup(null);
            setSelectedLokasiForGrup(null);
          }}
          onSuccess={handleGrupPesertaSuccess}
          kegiatanId={kegiatan?.id_kegiatan || 0}
          lokasiId={selectedLokasiForGrup || undefined}
          lokasiList={allLokasiList}
          editingGrup={editingGrup}
        />

        <ManagePesertaModal
          visible={managePesertaModalVisible}
          onCancel={() => {
            setManagePesertaModalVisible(false);
            setSelectedGrupForManage(null);
          }}
          onSuccess={handleManagePesertaSuccess}
          grup={selectedGrupForManage}
          kegiatanId={kegiatan?.id_kegiatan}
          onImportClick={() => {
            setManagePesertaModalVisible(false);
            setImportPesertaModalVisible(true);
          }}
        />

        <ImportPesertaModal
          visible={importPesertaModalVisible}
          onCancel={() => {
            setImportPesertaModalVisible(false);
          }}
          onSuccess={() => {
            setImportPesertaModalVisible(false);
            setManagePesertaModalVisible(true);
            handleManagePesertaSuccess();
          }}
          grup={selectedGrupForManage}
        />

      </Card>
    </div>
  );
};

export default KegiatanDetail;

