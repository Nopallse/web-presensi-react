import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  Button,
  Space,
  Typography,
  Tag,
  Spin,
  message,
  Row,
  Col,
  Divider,
  Descriptions
} from 'antd';
import {
  BankOutlined,
  ApartmentOutlined,
  TeamOutlined,
  ArrowLeftOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import { unitKerjaV2Api, type Satker, type Bidang, type SubBidang } from '../services/unitKerjaV2Api';
import UnitKerjaBreadcrumb from '../components/UnitKerjaBreadcrumb';
// Sub Bidang mengikuti lokasi parent; tidak ada modal pengaturan lokasi di level ini

// Import GoogleMap component dynamically to avoid SSR issues
const GoogleMap = React.lazy(() => import('../../../components/GoogleMap'));

const { Title, Text } = Typography;

const SubBidangDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { idSatker, idBidang, idSubBidang } = useParams<{ 
    idSatker: string; 
    idBidang: string; 
    idSubBidang: string; 
  }>();
  const [loading, setLoading] = useState(true);
  const [satker, setSatker] = useState<Satker | null>(null);
  const [bidang, setBidang] = useState<Bidang | null>(null);
  const [subBidang, setSubBidang] = useState<SubBidang | null>(null);
  // Tidak ada modal lokasi untuk sub bidang karena mengikuti parent

  useEffect(() => {
    if (idSatker && idBidang && idSubBidang) {
      fetchSubBidangDetail();
    }
  }, [idSatker, idBidang, idSubBidang]);

  const fetchSubBidangDetail = async () => {
    try {
      setLoading(true);
      const response = await unitKerjaV2Api.getSubBidangDetail(idSatker!, idBidang!, idSubBidang!);
      
      setSatker(response.satker);
      setBidang(response.bidang);
      setSubBidang(response.subBidang);
    } catch (error) {
      console.error('Error fetching sub bidang detail:', error);
      message.error('Gagal memuat detail sub bidang');
    } finally {
      setLoading(false);
    }
  };

  // Tidak ada aksi aktivasi/buat lokasi untuk sub bidang

  if (loading) {
    return (
      <div style={{ padding: '24px', maxWidth: '100%', overflow: 'hidden' }}>
        <Card>
          <div style={{ marginBottom: '16px' }}>
            <Title level={3} style={{ margin: 0, marginBottom: '4px' }}>
              Detail Sub Bidang
            </Title>
            <Text type="secondary">Memuat data sub bidang...</Text>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '300px' 
          }}>
            <Spin size="large" tip="Memuat detail sub bidang..." />
          </div>
        </Card>
      </div>
    );
  }

  if (!satker || !bidang || !subBidang) {
    return (
      <div style={{ padding: '24px', maxWidth: '100%', overflow: 'hidden' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <TeamOutlined style={{ fontSize: '64px', color: '#ff4d4f', marginBottom: '16px' }} />
            <Title level={3}>Sub Bidang Tidak Ditemukan</Title>
            <Text type="secondary" style={{ marginBottom: '24px', display: 'block' }}>
              Sub bidang yang Anda cari tidak dapat ditemukan atau telah dihapus.
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
          },
          {
            title: subBidang.NMSUB || 'Sub Bidang',
            path: `/unit-kerja-v2/${idSatker}/${idBidang}/${idSubBidang}`,
            icon: <TeamOutlined />
          }
        ]} 
      />
      
      <Card>
        {/* Header */}
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <Title level={3} style={{ margin: 0, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TeamOutlined style={{ color: '#722ed1' }} />
              Detail Sub Bidang
            </Title>
            <Text type="secondary">
              Informasi lengkap sub bidang dan hierarki organisasi
            </Text>
          </div>
          
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(`/unit-kerja-v2/${idSatker}/${idBidang}`)}
            >
              Kembali ke Bidang
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
                  <span>Informasi Sub Bidang & Lokasi</span>
                </div>
              }
            >
              {/* Informasi Sub Bidang - Refined */}
              <div style={{ marginBottom: '24px' }}>
                <Descriptions
                  column={1}
                  bordered
                  size="middle"
                  labelStyle={{ width: 160 }}
                >
                  <Descriptions.Item label="Kode Sub Bidang">
                    <Text code style={{ fontSize: 13 }}>{subBidang.SUBF}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Nama Sub Bidang">
                    <Text strong>{subBidang.NMSUB || '-'}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Nama Jabatan">
                    <Text>{subBidang.NAMA_JABATAN || '-'}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Level Organisasi">
                    <Tag color="purple" style={{ fontSize: '12px', fontWeight: 'bold' }}>
                      Level 3 - Sub Bidang
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </div>

              {/* Informasi Lokasi - Di Bawah */}
              <div>
              {subBidang.lokasi ? (
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
                      center={[subBidang.lokasi.lat, subBidang.lokasi.lng]}
                      zoom={16}
                      height="400px"
                      selectedLocation={{
                        lat: subBidang.lokasi.lat,
                        lng: subBidang.lokasi.lng,
                        range: subBidang.lokasi.range
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
                        {subBidang.lokasi.id_sub_bidang ? 'Lokasi Sub Bidang' : 
                         subBidang.lokasi.id_bidang ? 'Lokasi Bidang' : 'Lokasi Satker'}
                      </Text>
                      <Tag 
                        color={subBidang.lokasi.id_sub_bidang ? 'purple' : subBidang.lokasi.id_bidang ? 'green' : 'blue'} 
                        style={{ fontSize: '11px', fontWeight: 'bold' }}
                      >
                        {subBidang.lokasi.id_sub_bidang ? 'Sub Bidang' : 
                         subBidang.lokasi.id_bidang ? 'Bidang' : 'Satker'}
                      </Tag>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Text style={{ fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
                        {subBidang.lokasi.ket || 'Lokasi tersedia'}
                      </Text>
                      <Tag 
                        color={subBidang.lokasi.status ? 'green' : 'red'} 
                        style={{ fontSize: '10px' }}
                      >
                        {subBidang.lokasi.status ? 'Aktif' : 'Non-Aktif'}
                      </Tag>
                    </div>
                  </div>

                  {/* Detail Lokasi */}
                  <Descriptions bordered size="small" column={2} style={{ marginBottom: 20 }}>
                    <Descriptions.Item label="Koordinat GPS">
                      <Text code style={{ fontSize: 12 }}>
                        {subBidang.lokasi.lat.toFixed(6)}, {subBidang.lokasi.lng.toFixed(6)}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Radius Jangkauan">
                      <Text>{subBidang.lokasi.range} meter</Text>
                    </Descriptions.Item>
                  </Descriptions>

                  {/* Alamat - Jika Ada */}
                  {subBidang.lokasi.alamat && (
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
                        {subBidang.lokasi.alamat}
                      </Text>
                    </div>
                  )}

                  {/* Action Buttons: hanya tautan Maps; sub bidang mengikuti lokasi parent */}
                  <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
                    <Button 
                      type="primary" 
                      icon={<EnvironmentOutlined />}
                      href={`https://www.google.com/maps?q=${subBidang.lokasi.lat},${subBidang.lokasi.lng}`}
                      target="_blank"
                      block
                      size="large"
                      style={{ height: '44px', fontSize: '14px', fontWeight: '500' }}
                    >
                      Lihat di Google Maps
                    </Button>
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
                    href={`https://www.google.com/maps?q=${satker.lokasi?.lat ?? 0},${satker.lokasi?.lng ?? 0}`}
                    target="_blank"
                    block
                    size="large"
                    style={{ height: '44px', fontSize: '14px', fontWeight: '500' }}
                  >
                    Lihat Lokasi Induk
                  </Button>
                </div>
              )}
              </div>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Tidak ada Location Modal untuk sub bidang */}
    </div>
  );
};

export default SubBidangDetailPage;
