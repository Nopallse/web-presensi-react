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
  Popconfirm,
  Typography,
  Row,
  Col,
  Divider,
  Statistic,
  Progress,
  Tooltip,
  Input
} from 'antd';
import { 
  ArrowLeftOutlined, 
  EditOutlined, 
  CalendarOutlined,
  EnvironmentOutlined,
  PlusOutlined,
  DeleteOutlined,
  FileTextOutlined,
  EyeOutlined,
  UserOutlined,
  CheckCircleOutlined,
  SearchOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { kegiatanApi } from '../services/kegiatanApi';
import type { JadwalKegiatan, LokasiWithSatker } from '../types';
import { JENIS_KEGIATAN_OPTIONS } from '../types';
import { dateFormatter } from '../../../utils/dateFormatter';
import AddLokasiModal from '../components/AddLokasiModal';
import EditLokasiModal from '../components/EditLokasiModal';
import MultiLocationMap from '../../../components/MultiLocationMap';

const { Title, Text } = Typography;

const KegiatanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [kegiatan, setKegiatan] = useState<JadwalKegiatan | null>(null);
  const [loading, setLoading] = useState(true);
  const [addLokasiModalVisible, setAddLokasiModalVisible] = useState(false);
  const [editLokasiModalVisible, setEditLokasiModalVisible] = useState(false);
  const [editingLokasi, setEditingLokasi] = useState<LokasiWithSatker | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-0.6267, 100.1207]); // Default center (Padang)
  const [mapZoom, setMapZoom] = useState(12);
  const [mapLocations, setMapLocations] = useState<Array<{
    lat: number;
    lng: number;
    range: number;
    ket: string;
    lokasi_id: number;
    satker_list?: string[];
  }>>([]);

  // State untuk data satker
  const [satkerData, setSatkerData] = useState<any[]>([]);
  const [satkerLoading, setSatkerLoading] = useState(false);
  const [satkerSearchText, setSatkerSearchText] = useState('');
  
  // State untuk loading download
  const [downloadBulkLoading, setDownloadBulkLoading] = useState(false);
  const [downloadSatkerLoading, setDownloadSatkerLoading] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchKegiatanDetail(parseInt(id));
      fetchSatkerData(parseInt(id));
    }
  }, [id]);

  const fetchKegiatanDetail = async (kegiatanId: number) => {
    try {
      setLoading(true);
      // Get basic kegiatan info
      const kegiatanResponse = await kegiatanApi.getById(kegiatanId);
      
      // Get locations for this kegiatan from lokasi kegiatan API
      const lokasiResponse = await kegiatanApi.getKegiatanLokasi(kegiatanId);
      
      // Transform lokasi kegiatan data to match LokasiWithSkpd interface
      const lokasiList = lokasiResponse.data?.lokasi_list?.map((lokasi: any) => ({
        lokasi_id: lokasi.lokasi_id,
        lat: lokasi.lat,
        lng: lokasi.lng,
        ket: lokasi.ket,
        status: lokasi.status,
        range: lokasi.range,
        satker_list: lokasi.satker_list || [] // Ubah dari skpd_list ke satker_list
      })) || [];
      
      setKegiatan({
        ...kegiatanResponse.data,
        lokasi_list: lokasiList
      });

      // Update map locations
      const locations = lokasiList.map((lokasi: LokasiWithSatker) => ({
        lat: lokasi.lat,
        lng: lokasi.lng,
        range: lokasi.range,
        ket: lokasi.ket,
        lokasi_id: lokasi.lokasi_id,
        satker_list: lokasi.satker_list
      }));
      setMapLocations(locations);

      // Update map center to first location or default
      if (locations.length > 0) {
        setMapCenter([locations[0].lat, locations[0].lng]);
        setMapZoom(15);
      }
    } catch (error: any) {
      console.error('Error fetching kegiatan detail:', error);
      message.error('Gagal memuat detail kegiatan');
      navigate('/kegiatan');
    } finally {
      setLoading(false);
    }
  };

  const fetchSatkerData = async (kegiatanId: number) => {
    try {
      setSatkerLoading(true);
      const response = await kegiatanApi.getAllSatkerKegiatan(kegiatanId);
      setSatkerData(response.data || []);
    } catch (error: any) {
      console.error('Error fetching satker data:', error);
      message.error('Gagal memuat data satker');
    } finally {
      setSatkerLoading(false);
    }
  };

  // Filter satker data berdasarkan search text
  const filteredSatkerData = satkerData.filter(satker => 
    satker.nama_satker.toLowerCase().includes(satkerSearchText.toLowerCase())
  );

  // Download Excel untuk semua satker
  const handleDownloadBulkExcel = async () => {
    try {
      setDownloadBulkLoading(true);
      const blob = await kegiatanApi.downloadBulkExcel(parseInt(id!));
      
      // Buat URL untuk download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Set filename berdasarkan data kegiatan
      const tanggalKegiatan = kegiatan?.tanggal_kegiatan 
        ? new Date(kegiatan.tanggal_kegiatan).toLocaleDateString('id-ID')
        : 'unknown';
      const jenisKegiatan = kegiatan?.jenis_kegiatan || 'kegiatan';
      link.download = `Data_Satker_Kegiatan_${jenisKegiatan.replace(/\s+/g, '_')}_${tanggalKegiatan.replace(/\//g, '-')}.xlsx`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup URL
      window.URL.revokeObjectURL(url);
      
      message.success('File Excel berhasil didownload');
    } catch (error: any) {
      console.error('Error downloading Excel:', error);
      message.error('Gagal mendownload file Excel');
    } finally {
      setDownloadBulkLoading(false);
    }
  };

  // Download Excel untuk satker tertentu
  const handleDownloadSatkerExcel = async (satkerId: string) => {
    try {
      setDownloadSatkerLoading(satkerId);
      const blob = await kegiatanApi.downloadSatkerExcel(parseInt(id!), satkerId);
      
      // Buat URL untuk download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Set filename berdasarkan data satker
      const satker = satkerData.find(s => s.id_satker === satkerId);
      const satkerName = satker?.nama_satker || 'satker';
      const tanggalKegiatan = kegiatan?.tanggal_kegiatan 
        ? new Date(kegiatan.tanggal_kegiatan).toLocaleDateString('id-ID')
        : 'unknown';
      link.download = `Laporan_Kehadiran_${satkerName.replace(/\s+/g, '_')}_${tanggalKegiatan.replace(/\//g, '-')}.xlsx`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup URL
      window.URL.revokeObjectURL(url);
      
      message.success('File Excel berhasil didownload');
    } catch (error: any) {
      console.error('Error downloading Excel:', error);
      message.error('Gagal mendownload file Excel');
    } finally {
      setDownloadSatkerLoading(null);
    }
  };

  const handleAddLokasi = async (data: { lokasi_id: number; kdsatker_list: string[] }) => {
    if (!kegiatan) return;
    
    try {
      await kegiatanApi.addLokasiToKegiatan(kegiatan.id_kegiatan, data);
      setAddLokasiModalVisible(false);
      // Refresh the data
      await fetchKegiatanDetail(kegiatan.id_kegiatan);
    } catch (error) {
      throw error; // Let the modal handle the error
    }
  };

  const handleRemoveLokasi = async (lokasiId: number) => {
    if (!kegiatan) return;
    
    try {
      setLoadingAction(true);
      await kegiatanApi.removeLokasiFromKegiatan(kegiatan.id_kegiatan, lokasiId);
      message.success('Lokasi berhasil dihapus dari kegiatan');
      // Refresh the data
      await fetchKegiatanDetail(kegiatan.id_kegiatan);
    } catch (error: any) {
      console.error('Error removing lokasi:', error);
      message.error('Gagal menghapus lokasi');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleEditLokasi = (lokasi: LokasiWithSatker) => {
    setEditingLokasi(lokasi);
    setEditLokasiModalVisible(true);
  };

  const handleEditLokasiSuccess = async () => {
    setEditLokasiModalVisible(false);
    setEditingLokasi(null);
    if (kegiatan) {
      await fetchKegiatanDetail(kegiatan.id_kegiatan);
    }
  };

  const getJenisKegiatanLabel = (value: string): string => {
    const option = JENIS_KEGIATAN_OPTIONS.find(opt => opt.value === value);
    return option?.label || value;
  };

  const lokasiColumns: ColumnsType<LokasiWithSatker> = [
    {
      title: 'Lokasi',
      dataIndex: 'ket',
      key: 'ket',
      render: (text: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <EnvironmentOutlined style={{ color: '#1890ff' }} />
          <Text strong style={{ fontSize: '13px' }}>{text}</Text>
        </div>
      ),
    },
    {
      title: 'Radius',
      dataIndex: 'range',
      key: 'range',
      width: 80,
      render: (range: number) => (
        <Text style={{ fontSize: '13px' }}>{range}m</Text>
      ),
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditLokasi(record)}
            title="Edit lokasi"
            style={{ padding: '4px' }}
          />
          <Popconfirm
            title="Hapus Lokasi"
            description="Apakah Anda yakin ingin menghapus lokasi ini dari kegiatan?"
            onConfirm={() => handleRemoveLokasi(record.lokasi_id)}
            okText="Ya"
            cancelText="Tidak"
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              danger
              size="small"
              loading={loadingAction}
              title="Hapus dari kegiatan"
              style={{ padding: '4px' }}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

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


        {/* Main Content */}
        <Row gutter={[24, 24]}>
          {/* Left Column - Informasi Kegiatan + Peta + Table */}
          <Col xs={24} lg={12}>
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
              {/* Overview Cards */}
              <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
          
                <Col xs={24} sm={12}>
                  <Card size="small" style={{ textAlign: 'center' }}>
                    <div>
                      <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                        Tanggal Kegiatan
                      </Text>
                      <Text strong style={{ fontSize: '14px', color: '#52c41a' }}>
                        {dateFormatter.toIndonesian(kegiatan.tanggal_kegiatan, 'dd MMM yyyy')}
                      </Text>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={12}>
                <Card size="small" style={{ textAlign: 'center' }}>
                    <div>
                      <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                        Jam Kegiatan
                      </Text>
                      <Text strong style={{ fontSize: '14px', color: '#1890ff' }}>
                        {kegiatan.jam_mulai && kegiatan.jam_selesai 
                          ? `${kegiatan.jam_mulai.substring(0, 5)} - ${kegiatan.jam_selesai.substring(0, 5)}`
                          : kegiatan.jam_mulai 
                            ? `Mulai: ${kegiatan.jam_mulai.substring(0, 5)}`
                            : kegiatan.jam_selesai
                              ? `Selesai: ${kegiatan.jam_selesai.substring(0, 5)}`
                              : 'Tidak ditentukan'
                        }
                      </Text>
                    </div>
                  </Card>
                  </Col>
              </Row>


              {/* Deskripsi */}
              <Card size="small" style={{ backgroundColor: '#f8f9fa' }}>
                <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div>
                    <Text type="secondary" style={{ fontSize: '13px', color: 'inherit' }}>
                      <span style={{ fontWeight: 600, fontSize: '13px', color: 'inherit' }}>
                        Jenis Kegiatan:
                      </span>
                      <span style={{ fontWeight: 600, fontSize: '13px', marginLeft: 4, color: 'inherit' }}>
                        {getJenisKegiatanLabel(kegiatan.jenis_kegiatan)}
                      </span>
                    </Text>
                  </div>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <Text strong style={{ fontSize: '14px' }}>
                    <span style={{ fontWeight: 600 }}>Deskripsi:</span>
                    <span style={{ fontWeight: 400, marginLeft: 6 }}>{kegiatan.keterangan}</span>
                  </Text>
                </div>
              </Card>
            </Card>

            {/* Table Lokasi Kegiatan */}
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <EnvironmentOutlined />
                  <span>Lokasi Kegiatan</span>
                </div>
              }
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  size="middle"
                  onClick={() => setAddLokasiModalVisible(true)}
                >
                  Tambah Lokasi
                </Button>
              }
              size="default"
            >
              {kegiatan.lokasi_list && kegiatan.lokasi_list.length > 0 ? (
                <Table
                  columns={lokasiColumns}
                  dataSource={kegiatan.lokasi_list}
                  rowKey="lokasi_id"
                  pagination={false}
                  size="small"
                  scroll={{ x: 400 }}
                />
              ) : (
                <Empty 
                  description={
                    <Text type="secondary" style={{ fontSize: '13px' }}>
                      Belum ada lokasi yang terkait dengan kegiatan ini
                    </Text>
                  }
                  style={{ padding: '30px 0' }}
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Card>
          </Col>

          {/* Right Column - Peta Lokasi Kegiatan */}
          <Col xs={24} lg={12}>
            {mapLocations.length > 0 ? (
              <Card 
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <EnvironmentOutlined />
                    <span>Peta Lokasi Kegiatan ({mapLocations.length} lokasi)</span>
                  </div>
                }
                size="default"
              >
                <div style={{ height: '500px', borderRadius: '8px', overflow: 'hidden' }}>
                  <MultiLocationMap
                    center={mapCenter}
                    zoom={mapZoom}
                    locations={mapLocations}
                    height="500px"
                    width="100%"
                  />
                </div>
                <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {mapLocations.map((location, index) => {
                    const lokasiData = kegiatan?.lokasi_list?.find(l => l.lokasi_id === location.lokasi_id);
                    return (
                      <Tag 
                        key={location.lokasi_id}
                        color={index === 0 ? 'blue' : 'green'}
                        style={{ fontSize: '12px' }}
                        title={`Satker: ${lokasiData?.satker_list?.join(', ') || 'Tidak ada'}`}
                      >
                        {location.ket} ({location.range}m)
                        {lokasiData?.satker_list?.length ? ` - ${lokasiData.satker_list.length} Satker` : ''}
                      </Tag>
                    );
                  })}
                </div>
              </Card>
            ) : (
              <Card 
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <EnvironmentOutlined />
                    <span>Peta Lokasi Kegiatan</span>
                  </div>
                }
                size="default"
              >
                <div style={{ 
                  height: '600px', 
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
          {/* Table Satker */}
          <Col span={24}>
            <Card 
              title={
                <Space>
                  <UserOutlined />
                  <span>Data Satker dan Kehadiran</span>
                </Space>
              }
              style={{ marginTop: '16px' }}
              extra={
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={handleDownloadBulkExcel}
                  loading={downloadBulkLoading}
                >
                  Download Excel
                </Button>
              }
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                <Input
                  placeholder="Cari nama satker..."
                  prefix={<SearchOutlined />}
                  value={satkerSearchText}
                  onChange={(e) => setSatkerSearchText(e.target.value)}
                  style={{ width: 300 }}
                  allowClear
                />
              </div>
              <Table
                dataSource={filteredSatkerData}
                loading={satkerLoading}
                rowKey="id_satker"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} satker`
                }}
                columns={[
                  {
                    title: 'Nama Satker',
                    dataIndex: 'nama_satker',
                    key: 'nama_satker',
                    width: '40%',
                    render: (text: string) => (
                      <Text strong style={{ fontSize: '14px' }}>
                        {text}
                      </Text>
                    )
                  },
                  {
                    title: 'Total Pegawai',
                    dataIndex: 'total_pegawai',
                    key: 'total_pegawai',
                    width: '15%',
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
                    width: '15%',
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
                    title: 'Persentase',
                    key: 'persentase',
                    width: '20%',
                    align: 'center',
                    sorter: (a: any, b: any) => {
                      const persentaseA = a.total_pegawai > 0 ? Math.round((a.total_kehadiran / a.total_pegawai) * 100) : 0;
                      const persentaseB = b.total_pegawai > 0 ? Math.round((b.total_kehadiran / b.total_pegawai) * 100) : 0;
                      return persentaseA - persentaseB;
                    },
                    render: (_, record: any) => {
                      const persentase = record.total_pegawai > 0 
                        ? Math.round((record.total_kehadiran / record.total_pegawai) * 100) 
                        : 0;
                      
                      return (
                        <Tooltip title={`${record.total_kehadiran} dari ${record.total_pegawai} pegawai`}>
                          <Progress
                            percent={persentase}
                            size="small"
                            strokeColor={persentase >= 80 ? '#52c41a' : persentase >= 50 ? '#faad14' : '#ff4d4f'}
                            format={() => `${persentase}%`}
                          />
                        </Tooltip>
                      );
                    }
                  },
                  {
                    title: 'Aksi',
                    key: 'action',
                    width: '15%',
                    align: 'center',
                    render: (_, record: any) => (
                      <Space size="small">
                        <Button
                          type="primary"
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => navigate(`/kegiatan/${id}/satker/${record.id_satker}`)}
                        >
                          Detail
                        </Button>
                        <Button
                          size="small"
                          icon={<DownloadOutlined />}
                          onClick={() => handleDownloadSatkerExcel(record.id_satker)}
                          loading={downloadSatkerLoading === record.id_satker}
                        >
                          Download
                        </Button>
                      </Space>
                    )
                  }
                ]}
              />
            </Card>
          </Col>
        </Row>

        {/* Modals */}
        <AddLokasiModal
          visible={addLokasiModalVisible}
          onCancel={() => setAddLokasiModalVisible(false)}
          onSuccess={() => setAddLokasiModalVisible(false)}
          kegiatanId={kegiatan.id_kegiatan}
          existingLokasiIds={kegiatan.lokasi_list?.map(l => l.lokasi_id) || []}
          onAddLokasi={handleAddLokasi}
        />

        {editingLokasi && (
          <EditLokasiModal
            visible={editLokasiModalVisible}
            onCancel={() => {
              setEditLokasiModalVisible(false);
              setEditingLokasi(null);
            }}
            onSuccess={handleEditLokasiSuccess}
            kegiatanId={kegiatan.id_kegiatan}
            currentLokasi={editingLokasi}
            existingLokasiIds={kegiatan.lokasi_list?.map(l => l.lokasi_id) || []}
          />
        )}
      </Card>
    </div>
  );
};

export default KegiatanDetail;