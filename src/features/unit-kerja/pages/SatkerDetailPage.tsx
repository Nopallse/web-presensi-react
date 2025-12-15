import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  Table,
  Input,
  Button,
  Space,
  Typography,
  Tag,
  Row,
  Col,
  Spin,
  message,
  Divider,
  Empty,
  Descriptions,
  Alert,
  Tooltip
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  BankOutlined,
  ApartmentOutlined,
  ArrowLeftOutlined,
  ReloadOutlined,
  EnvironmentOutlined,
  EditOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { unitKerjaV2Api, type Satker, type Bidang } from '../services/unitKerjaV2Api';
import UnitKerjaBreadcrumb from '../components/UnitKerjaBreadcrumb';
import LocationModal from '../components/LocationModal';
import JamDinasModal from '../components/JamDinasModal';
import type { ColumnsType } from 'antd/es/table';

// Import GoogleMap component dynamically to avoid SSR issues
const GoogleMap = React.lazy(() => import('../../../components/GoogleMap'));

const { Title, Text } = Typography;
const { Search } = Input;

const SatkerDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { idSatker } = useParams<{ idSatker: string }>();
  const [loading, setLoading] = useState(true);
  const [satker, setSatker] = useState<Satker | null>(null);
  const [bidangList, setBidangList] = useState<Bidang[]>([]);
  const [jamDinasList, setJamDinasList] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    itemsPerPage: 10
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [jamDinasModalVisible, setJamDinasModalVisible] = useState(false);

  useEffect(() => {
    if (idSatker) {
      fetchSatkerDetail();
    }
  }, [idSatker]);

  const fetchSatkerDetail = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const response = await unitKerjaV2Api.getSatkerDetail(idSatker!, {
        page,
        limit: 10,
        search
      });
      
      setSatker(response.satker);
      setBidangList(response.bidang.data);
      setPagination(response.bidang.pagination);
      setJamDinasList(response.jamDinas || []);
      setSearchQuery(response.searchQuery || '');
    } catch (error) {
      console.error('Error fetching satker detail:', error);
      message.error('Gagal memuat detail satker');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    fetchSatkerDetail(1, value);
  };

  const handlePageChange = (page: number) => {
    fetchSatkerDetail(page, searchQuery);
  };

  const handleViewBidangDetail = (bidang: Bidang) => {
    navigate(`/unit-kerja/${idSatker}/${bidang.BIDANGF}`);
  };

  const handleLocationModalSuccess = () => {
    setLocationModalVisible(false);
    fetchSatkerDetail(); // Refresh data untuk mendapatkan lokasi terbaru
  };

  const handleActivateLocation = async () => {
    try {
      setLoading(true);
      await unitKerjaV2Api.activateSatkerLocation(idSatker!);
      message.success('Lokasi satker berhasil diaktifkan');
      fetchSatkerDetail(); // Refresh data untuk mendapatkan lokasi terbaru
    } catch (error) {
      console.error('Error activating location:', error);
      message.error('Gagal mengaktifkan lokasi satker');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<Bidang> = [
    {
      title: 'No',
      key: 'no',
      width: 60,
      render: (_, __, index) => {
        const { currentPage, itemsPerPage } = pagination;
        return (currentPage - 1) * itemsPerPage + index + 1;
      },
    },
    {
      title: 'Kode Bidang',
      dataIndex: 'BIDANGF',
      key: 'BIDANGF',
      width: 120,
      render: (kode: string) => (
        <Text code style={{ fontSize: '12px' }}>{kode}</Text>
      ),
    },
    {
      title: 'Nama Bidang',
      dataIndex: 'NMBIDANG',
      key: 'NMBIDANG',
      ellipsis: true,
      render: (nama: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Text strong style={{ fontSize: '13px' }}>{nama || '-'}</Text>
        </div>
      ),
    },
    {
      title: 'Total Sub Bidang',
      dataIndex: 'subBidangCount',
      key: 'subBidangCount',
      width: 120,
      render: (count: number) => (
        <Tag color="green" style={{ fontSize: '11px' }}>
          {count} Sub Bidang
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
        let levelText = '';
        let levelColor = '';
        
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
            <div style={{ cursor: 'pointer', fontSize: '11px' }}>
              <div style={{ marginBottom: '4px' }}>
                <Tag color={levelColor} style={{ fontSize: '10px', margin: 0 }}>
                  {levelText}
                </Tag>
              </div>
              <div style={{ color: '#666', lineHeight: '1.2' }}>
                {lokasi.ket || 'Lokasi tersedia'}
              </div>
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
          onClick={() => handleViewBidangDetail(record)}
          title="Lihat Detail"
        />
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ padding: '24px', maxWidth: '100%', overflow: 'hidden' }}>
        <Card>
          <div style={{ marginBottom: '16px' }}>
            <Title level={3} style={{ margin: 0, marginBottom: '4px' }}>
              Detail Satker
            </Title>
            <Text type="secondary">Memuat data satker...</Text>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '300px' 
          }}>
            <Spin size="large" tip="Memuat detail satker..." />
          </div>
        </Card>
      </div>
    );
  }

  if (!satker) {
    return (
      <div style={{ padding: '24px', maxWidth: '100%', overflow: 'hidden' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <BankOutlined style={{ fontSize: '64px', color: '#ff4d4f', marginBottom: '16px' }} />
            <Title level={3}>Satker Tidak Ditemukan</Title>
            <Text type="secondary" style={{ marginBottom: '24px', display: 'block' }}>
              Satker yang Anda cari tidak dapat ditemukan atau telah dihapus.
            </Text>
            <Button 
              type="primary"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/unit-kerja')}
            >
              Kembali ke Daftar Satker
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '100%', overflow: 'hidden' }}>
      {/* Breadcrumb */}
      <UnitKerjaBreadcrumb 
        items={[
          {
            title: satker.NMSATKER,
            path: `/unit-kerja/${idSatker}`,
            icon: <BankOutlined />
          }
        ]} 
      />
      
      <Card>
        {/* Header */}
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <Title level={3} style={{ margin: 0, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BankOutlined style={{ color: '#1890ff' }} />
              Detail Satker
            </Title>
            <Text type="secondary">
              Informasi lengkap satker dan bidang-bidangnya
            </Text>
          </div>
          
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/unit-kerja')}
            >
              Kembali
            </Button>
          </Space>
        </div>

        <Divider />

        {/* Main Content - 1 Kolom Penuh */}
        <Row gutter={[24, 24]}>
          <Col xs={24}>
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <EnvironmentOutlined style={{ color: '#52c41a' }} />
                  <span>Informasi Satker & Lokasi</span>
                </div>
              }
            >
              {/* Informasi Satker - Refined */}
              <div style={{ marginBottom: '24px' }}>
                <Descriptions
                  column={1}
                  bordered
                  size="middle"
                  labelStyle={{ width: 160 }}
                >
                  <Descriptions.Item label="Kode Satker">
                    <Text code style={{ fontSize: 13 }}>{satker.KDSATKER}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Nama Satker">
                    <Text strong>{satker.NMSATKER}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Nama Jabatan">
                    <Text>{satker.NAMA_JABATAN || '-'}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Bidang">
                    <Tag color="blue">{pagination.totalItems} Bidang</Tag>
                  </Descriptions.Item>
                </Descriptions>

                {/* Jam Dinas Info */}
                {jamDinasList && jamDinasList.length > 0 ? (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text strong style={{ fontSize: 14, color: '#666' }}>Jam Dinas</Text>
                      <Button type="link" size="small" onClick={() => setJamDinasModalVisible(true)} style={{ padding: 0 }}>
                        Kelola
                      </Button>
                    </div>
                    <Space size="small" wrap>
                      {jamDinasList.map((jd) => (
                        <Tag
                          key={jd.assignmentId}
                          color="processing"
                          icon={<ClockCircleOutlined />}
                          style={{ fontSize: 12, padding: '4px 10px' }}
                        >
                          {jd.jamDinas.nama} ({jd.jamDinas.hari_kerja} hari)
                        </Tag>
                      ))}
                    </Space>
                  </div>
                ) : (
                  <div style={{ marginTop: 16 }}>
                    <Alert
                      type="warning"
                      showIcon
                      message={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>
                            <ClockCircleOutlined style={{ marginRight: 6 }} /> Jam dinas belum diatur
                          </span>
                          <Button size="small" type="primary" onClick={() => setJamDinasModalVisible(true)}>
                            Atur Jam Dinas
                          </Button>
                        </div>
                      }
                    />
                  </div>
                )}
              </div>

              {/* Informasi Lokasi */}
              <div>
              {satker.lokasi ? (
                <div>
                  {/* Map */}
                  <React.Suspense 
                    fallback={
                      <div style={{ 
                        height: '400px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '8px',
                        marginBottom: '20px'
                      }}>
                        <Spin size="large" tip="Memuat peta..." />
                      </div>
                    }
                  >
                    <GoogleMap
                      center={[satker.lokasi.lat, satker.lokasi.lng]}
                      zoom={16}
                      height="400px"
                      selectedLocation={{
                        lat: satker.lokasi.lat,
                        lng: satker.lokasi.lng,
                        range: satker.lokasi.range
                      }}
                    />
                  </React.Suspense>

                  {/* Informasi Level Lokasi */}
                  <div style={{ 
                    marginBottom: '20px', 
                    padding: '16px', 
                    backgroundColor: '#f0f9ff', 
                    borderRadius: '8px', 
                    border: '1px solid #e0f2fe',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <EnvironmentOutlined style={{ color: '#1890ff', fontSize: '16px' }} />
                      <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                        {satker.lokasi.id_sub_bidang ? 'Lokasi Sub Bidang' : 
                         satker.lokasi.id_bidang ? 'Lokasi Bidang' : 'Lokasi Satker'}
                      </Text>
                      <Tag 
                        color={satker.lokasi.id_sub_bidang ? 'purple' : satker.lokasi.id_bidang ? 'green' : 'blue'} 
                        style={{ fontSize: '11px', fontWeight: 'bold' }}
                      >
                        {satker.lokasi.id_sub_bidang ? 'Sub Bidang' : 
                         satker.lokasi.id_bidang ? 'Bidang' : 'Satker'}
                      </Tag>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Text style={{ fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
                        {satker.lokasi.ket || 'Lokasi tersedia'}
                      </Text>
                      <Tag 
                        color={satker.lokasi.status ? 'green' : 'red'} 
                        style={{ fontSize: '10px' }}
                      >
                        {satker.lokasi.status ? 'Aktif' : 'Non-Aktif'}
                      </Tag>
                    </div>
                  </div>

                  {/* Detail Lokasi */}
                  <Descriptions bordered size="small" column={2} style={{ marginBottom: 20 }}>
                    <Descriptions.Item label="Koordinat GPS">
                      <Text code style={{ fontSize: 12 }}>
                        {satker.lokasi.lat.toFixed(6)}, {satker.lokasi.lng.toFixed(6)}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Radius Jangkauan">
                      <Text>{satker.lokasi.range} meter</Text>
                    </Descriptions.Item>
                  </Descriptions>

                  {/* Alamat - Jika Ada */}
                  {satker.lokasi.alamat && (
                    <div style={{ 
                      marginBottom: '20px', 
                      padding: '16px', 
                      backgroundColor: '#f9f9f9', 
                      borderRadius: '8px',
                      border: '1px solid #e8e8e8'
                    }}>
                      <div style={{ marginBottom: '8px' }}>
                        <Text strong style={{ fontSize: '14px', color: '#1890ff' }}>Alamat Lengkap</Text>
                      </div>
                      <Text style={{ fontSize: '14px', lineHeight: '1.5', color: '#333' }}>
                        {satker.lokasi.alamat}
                      </Text>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
                    <Button 
                      type="primary" 
                      icon={<EnvironmentOutlined />}
                      href={`https://www.google.com/maps?q=${satker.lokasi.lat},${satker.lokasi.lng}`}
                      target="_blank"
                      block
                      size="large"
                      style={{ height: '44px', fontSize: '14px', fontWeight: '500' }}
                    >
                      Lihat di Google Maps
                    </Button>
                    {satker.lokasi.id_satker ? (
                      <Button 
                        icon={<EditOutlined />}
                        onClick={satker.lokasi.status ? () => setLocationModalVisible(true) : handleActivateLocation}
                        loading={loading}
                        block
                        size="large"
                        style={{ height: '44px', fontSize: '14px' }}
                      >
                        {satker.lokasi.status ? 'Edit Lokasi' : 'Aktifkan Lokasi'}
                      </Button>
                    ) : (
                      <div style={{ 
                        padding: '16px', 
                        backgroundColor: '#fff7e6', 
                        borderRadius: '8px', 
                        border: '1px solid #ffd591',
                        textAlign: 'center'
                      }}>
                        <Text style={{ fontSize: '13px', color: '#d46b08', display: 'block', marginBottom: '8px' }}>
                          Lokasi diwariskan dari level yang lebih tinggi
                        </Text>
                        <Button 
                          type="link" 
                          size="small"
                          onClick={() => setLocationModalVisible(true)}
                          style={{ padding: '4px 0', height: 'auto', fontSize: '13px' }}
                        >
                          Atur Lokasi Khusus
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <EnvironmentOutlined style={{ fontSize: '64px', color: '#d9d9d9', marginBottom: '20px' }} />
                  <Text type="secondary" style={{ fontSize: '16px', display: 'block', marginBottom: '20px' }}>
                    Lokasi belum diatur
                  </Text>
                  <Button 
                    type="primary"
                    icon={<EnvironmentOutlined />}
                    onClick={() => setLocationModalVisible(true)}
                    block
                    size="large"
                    style={{ height: '44px', fontSize: '14px', fontWeight: '500' }}
                  >
                    Atur Lokasi
                  </Button>
                </div>
              )}
              </div>
            </Card>
          </Col>
        </Row>
      </Card>
      
      {/* Bidang List */}
            <Card 
              style={{ marginTop: '24px' }}
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ApartmentOutlined />
                  <span>Daftar Bidang</span>
                </div>
              }
              extra={
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Search
                    placeholder="Cari bidang..."
                    allowClear
                    style={{ width: 200 }}
                    onSearch={handleSearch}
                    prefix={<SearchOutlined />}
                  />
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => fetchSatkerDetail(1, searchQuery)}
                    loading={loading}
                    size="small"
                  >
                    Refresh
                  </Button>
                </div>
              }
            >
              {bidangList && bidangList.length > 0 ? (
                <Table
                  columns={columns}
                  dataSource={bidangList}
                  rowKey="BIDANGF"
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
                />
              ) : (
                <Empty
                  description="Tidak ada bidang yang ditemukan"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Card>
      {/* Location Modal */}
      <LocationModal
        visible={locationModalVisible}
        onCancel={() => setLocationModalVisible(false)}
        onSuccess={handleLocationModalSuccess}
        idSatker={idSatker!}
        existingLocation={satker?.lokasi || null}
      />

      {/* Jam Dinas Modal */}
      <JamDinasModal
        visible={jamDinasModalVisible}
        onCancel={() => setJamDinasModalVisible(false)}
        onSuccess={() => {
          setJamDinasModalVisible(false);
          fetchSatkerDetail();
        }}
        idSatker={idSatker!}
        existingAssignment={jamDinasList && jamDinasList.length > 0 ? jamDinasList[0] : undefined}
      />
    </div>
  );
};

export default SatkerDetailPage;
