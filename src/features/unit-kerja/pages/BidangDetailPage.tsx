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
  Tooltip
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  BankOutlined,
  ApartmentOutlined,
  TeamOutlined,
  ArrowLeftOutlined,
  ReloadOutlined,
  EnvironmentOutlined,
  EditOutlined
} from '@ant-design/icons';
import { unitKerjaV2Api, type Satker, type Bidang, type SubBidang } from '../services/unitKerjaV2Api';
import UnitKerjaBreadcrumb from '../components/UnitKerjaBreadcrumb';
import LocationModal from '../components/LocationModal';
import type { ColumnsType } from 'antd/es/table';

// Import GoogleMap component dynamically to avoid SSR issues
const GoogleMap = React.lazy(() => import('../../../components/GoogleMap'));

const { Title, Text } = Typography;
const { Search } = Input;

const BidangDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { idSatker, idBidang } = useParams<{ idSatker: string; idBidang: string }>();
  const [loading, setLoading] = useState(true);
  const [satker, setSatker] = useState<Satker | null>(null);
  const [bidang, setBidang] = useState<(Bidang & { totalSubBidangCount?: number }) | null>(null);
  const [subBidangList, setSubBidangList] = useState<SubBidang[]>([]);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    itemsPerPage: 10
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  useEffect(() => {
    if (idSatker && idBidang) {
      fetchBidangDetail();
    }
  }, [idSatker, idBidang]);

  const fetchBidangDetail = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const response = await unitKerjaV2Api.getBidangDetail(idSatker!, idBidang!, {
        page,
        limit: 10,
        search
      });
      
      setSatker(response.satker);
      setBidang(response.bidang);
      setSubBidangList(response.subBidang.data);
      setPagination(response.subBidang.pagination);
      setSearchQuery(response.searchQuery || '');
    } catch (error) {
      console.error('Error fetching bidang detail:', error);
      message.error('Gagal memuat detail bidang');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    fetchBidangDetail(1, value);
  };

  const handlePageChange = (page: number) => {
    fetchBidangDetail(page, searchQuery);
  };

  const handleViewSubBidangDetail = (subBidang: SubBidang) => {
    navigate(`/unit-kerja-v2/${idSatker}/${idBidang}/${subBidang.SUBF}`);
  };

  const handleLocationModalSuccess = () => {
    setLocationModalVisible(false);
    fetchBidangDetail(); // Refresh data untuk mendapatkan lokasi terbaru
  };

  const handleActivateLocation = async () => {
    try {
      setLoading(true);
      await unitKerjaV2Api.activateBidangLocation(idSatker!, idBidang!);
      message.success('Lokasi bidang berhasil diaktifkan');
      fetchBidangDetail(); // Refresh data untuk mendapatkan lokasi terbaru
    } catch (error) {
      console.error('Error activating location:', error);
      message.error('Gagal mengaktifkan lokasi bidang');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<SubBidang> = [
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
      title: 'Kode Sub Bidang',
      dataIndex: 'SUBF',
      key: 'SUBF',
      width: 120,
      render: (kode: string) => (
        <Text code style={{ fontSize: '12px' }}>{kode}</Text>
      ),
    },
    {
      title: 'Nama Sub Bidang',
      dataIndex: 'NMSUB',
      key: 'NMSUB',
      ellipsis: true,
      render: (nama: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TeamOutlined style={{ color: '#722ed1' }} />
          <Text strong style={{ fontSize: '13px' }}>{nama || '-'}</Text>
        </div>
      ),
    },
    {
      title: 'Nama Jabatan',
      dataIndex: 'NAMA_JABATAN',
      key: 'NAMA_JABATAN',
      width: 250,
      ellipsis: true,
      render: (jabatan: string) => (
        <Text style={{ fontSize: '13px' }}>{jabatan || '-'}</Text>
      ),
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
        
        // Tentukan level lokasi (hanya Bidang atau Satker)
        let levelText = '';
        let levelColor = '';
        
        if (lokasi.id_bidang) {
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
            {lokasi.alamat && (
              <div style={{ marginBottom: '4px' }}>
                <Text >Alamat: </Text>
                <Text >{lokasi.alamat}</Text>
              </div>
            )}
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
          onClick={() => handleViewSubBidangDetail(record)}
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
              Detail Bidang
            </Title>
            <Text type="secondary">Memuat data bidang...</Text>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '300px' 
          }}>
            <Spin size="large" tip="Memuat detail bidang..." />
          </div>
        </Card>
      </div>
    );
  }

  if (!satker || !bidang) {
    return (
      <div style={{ padding: '24px', maxWidth: '100%', overflow: 'hidden' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <ApartmentOutlined style={{ fontSize: '64px', color: '#ff4d4f', marginBottom: '16px' }} />
            <Title level={3}>Bidang Tidak Ditemukan</Title>
            <Text type="secondary" style={{ marginBottom: '24px', display: 'block' }}>
              Bidang yang Anda cari tidak dapat ditemukan atau telah dihapus.
            </Text>
            <Button 
              type="primary"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/unit-kerja-v2')}
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
            path: `/unit-kerja-v2/${idSatker}`,
            icon: <BankOutlined />
          },
          {
            title: bidang.NMBIDANG || 'Bidang',
            path: `/unit-kerja-v2/${idSatker}/${idBidang}`,
            icon: <ApartmentOutlined />
          }
        ]} 
      />
      
      <Card>
        {/* Header */}
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <Title level={3} style={{ margin: 0, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ApartmentOutlined style={{ color: '#52c41a' }} />
              Detail Bidang
            </Title>
            <Text type="secondary">
              Informasi lengkap bidang dan sub-bidangnya
            </Text>
          </div>
          
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(`/unit-kerja-v2/${idSatker}`)}
            >
              Kembali ke Satker
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
                  <span>Informasi Bidang & Lokasi</span>
                </div>
              }
            >
              {/* Informasi Bidang - Refined */}
              <div style={{ marginBottom: '24px' }}>
                <Descriptions
                  column={1}
                  bordered
                  size="middle"
                  labelStyle={{ width: 160 }}
                >
                  <Descriptions.Item label="Kode Bidang">
                    <Text code style={{ fontSize: 13 }}>{bidang.BIDANGF}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Nama Bidang">
                    <Text strong>{bidang.NMBIDANG || '-'}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Nama Jabatan">
                    <Text>{bidang.NAMA_JABATAN || '-'}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Sub Bidang">
                    <Tag color="purple">{bidang.totalSubBidangCount || pagination.totalItems} Sub Bidang</Tag>
                  </Descriptions.Item>
                </Descriptions>
              </div>

              {/* Informasi Lokasi - Di Bawah */}
              <div>
              {bidang.lokasi ? (
                <div>
                  {/* Map - Lebih Besar */}
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
                      center={[bidang.lokasi.lat, bidang.lokasi.lng]}
                      zoom={16}
                      height="400px"
                      selectedLocation={{
                        lat: bidang.lokasi.lat,
                        lng: bidang.lokasi.lng,
                        range: bidang.lokasi.range
                      }}
                    />
                  </React.Suspense>

                  {/* Informasi Level Lokasi - Lebih Modern */}
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
                        {bidang.lokasi.id_bidang ? 'Lokasi Bidang' : 'Lokasi Satker'}
                      </Text>
                      <Tag 
                        color={bidang.lokasi.id_bidang ? 'green' : 'blue'} 
                        style={{ fontSize: '11px', fontWeight: 'bold' }}
                      >
                        {bidang.lokasi.id_bidang ? 'Bidang' : 'Satker'}
                      </Tag>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Text style={{ fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
                        {bidang.lokasi.ket || 'Lokasi tersedia'}
                      </Text>
                      <Tag 
                        color={bidang.lokasi.status ? 'green' : 'red'} 
                        style={{ fontSize: '10px' }}
                      >
                        {bidang.lokasi.status ? 'Aktif' : 'Non-Aktif'}
                      </Tag>
                    </div>
                  </div>

                  {/* Detail Lokasi */}
                  <Descriptions bordered size="small" column={2} style={{ marginBottom: 20 }}>
                    <Descriptions.Item label="Koordinat GPS">
                      <Text code style={{ fontSize: 12 }}>
                        {bidang.lokasi.lat.toFixed(6)}, {bidang.lokasi.lng.toFixed(6)}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Radius Jangkauan">
                      <Text>{bidang.lokasi.range} meter</Text>
                    </Descriptions.Item>
                  </Descriptions>

                  {/* Alamat - Jika Ada */}
                  {bidang.lokasi.alamat && (
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
                        {bidang.lokasi.alamat}
                      </Text>
                    </div>
                  )}

                  {/* Action Buttons - Lebih Modern */}
                  <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
                    <Button 
                      type="primary" 
                      icon={<EnvironmentOutlined />}
                      href={`https://www.google.com/maps?q=${bidang.lokasi.lat},${bidang.lokasi.lng}`}
                      target="_blank"
                      block
                      size="large"
                      style={{ height: '44px', fontSize: '14px', fontWeight: '500' }}
                    >
                      Lihat di Google Maps
                    </Button>
                    {bidang.lokasi.id_bidang ? (
                      bidang.lokasi.status ? (
                        <Button 
                          icon={<EditOutlined />}
                          onClick={() => setLocationModalVisible(true)}
                          block
                          size="large"
                          style={{ height: '44px', fontSize: '14px' }}
                        >
                          Edit Lokasi
                        </Button>
                      ) : (
                        <Button 
                          icon={<EditOutlined />}
                          onClick={handleActivateLocation}
                          block
                          size="large"
                          style={{ height: '44px', fontSize: '14px' }}
                          loading={loading}
                        >
                          Aktifkan Lokasi Bidang
                        </Button>
                      )
                    ) : (
                      <div style={{ 
                        padding: '16px', 
                        backgroundColor: '#f0f9ff', 
                        borderRadius: '8px', 
                        border: '1px solid #bae7ff',
                        textAlign: 'center'
                      }}>
                        <Text style={{ fontSize: '13px', color: '#1890ff', display: 'block', marginBottom: '8px' }}>
                          Belum ada lokasi Bidang. Saat ini mengikuti lokasi Satker
                        </Text>
                        <Button 
                          type="primary" 
                          size="small"
                          onClick={() => setLocationModalVisible(true)}
                          loading={loading}
                          style={{ height: '32px', fontSize: '12px' }}
                        >
                          Buat Lokasi Bidang
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

      {/* Sub Bidang List */}
      <Card 
              style={{ marginTop: '24px' }}
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TeamOutlined />
                  <span>Daftar Sub Bidang</span>
                  <Search
                    placeholder="Cari sub bidang..."
                    allowClear
                    style={{ width: 200 }}
                    onSearch={handleSearch}
                    prefix={<SearchOutlined />}
                  />
                </div>
              }
              extra={
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => fetchBidangDetail(1, searchQuery)}
                    loading={loading}
                    size="small"
                  >
                    Refresh
                  </Button>
                </div>
              }
            >
              {subBidangList && subBidangList.length > 0 ? (
                <Table
                  columns={columns}
                  dataSource={subBidangList}
                  rowKey="SUBF"
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
                  description="Tidak ada sub bidang yang ditemukan"
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
        idBidang={idBidang!}
        existingLocation={bidang?.lokasi || null}
      />
    </div>
  );
};

export default BidangDetailPage;
