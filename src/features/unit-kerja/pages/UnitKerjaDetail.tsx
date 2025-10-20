import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Button,
  Typography,
  Space,
  Tag,
  Row,
  Col,
  Spin,
  message,
  Badge,
  Table
} from 'antd';
import {
  ArrowLeftOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  UserOutlined,
  EditOutlined,
  ClusterOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { unitKerjaApi } from '../services/unitKerjaApi';
import { lokasiApi } from '../../lokasi/services/lokasiApi';
import type { UnitKerja } from '../types';
import type { ColumnsType } from 'antd/es/table';
import LocationModal from '../components/LocationModal';

// Interface untuk lokasi dari API
interface Lokasi {
  lokasi_id: number;
  lat: number;
  lng: number;
  range: number;
  nama_lokasi?: string;
  alamat?: string;
  ket?: string;
  status: boolean;
  is_inherited?: boolean;
}

const { Title, Text } = Typography;

// Interface untuk pegawai
interface Pegawai {
  id: number;
  username: string;
  email: string;
  level: string;
  status: string;
  nama: string;
  nip: string;
  kdskpd: string;
  kdsatker: string;
  bidangf: string;
  kdpangkat: string;
  jenis_jabatan: string;
  kdjenkel: number;
  tempatlhr: string;
  tgllhr: string;
  agama: number;
  alamat: string;
  notelp: string;
  noktp: string;
  foto: string;
  jenis_pegawai: string;
  status_aktif: string;
  nm_unit_kerja: string;
  kd_unit_kerja: string;
}

const UnitKerjaDetail: React.FC = () => {
  const { kd_unit_kerja } = useParams<{ kd_unit_kerja: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [loadingLokasi, setLoadingLokasi] = useState(false);
  const [unitKerja, setUnitKerja] = useState<UnitKerja | null>(null);
  const [lokasi, setLokasi] = useState<Lokasi | null>(null);
  const [pegawai, setPegawai] = useState<Pegawai[]>([]);
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  useEffect(() => {
    if (kd_unit_kerja) {
      fetchUnitKerjaDetail();
      fetchLokasiDetail();
    }
  }, [kd_unit_kerja]);

  const fetchUnitKerjaDetail = async () => {
    try {
      setLoading(true);
      const response = await unitKerjaApi.getById(kd_unit_kerja!);
      setUnitKerja(response);
      
      // Set data pegawai jika ada
      if ((response as any).pegawai) {
        setPegawai((response as any).pegawai);
      }
    } catch (error) {
      console.error('Error fetching unit kerja detail:', error);
      message.error('Gagal memuat detail unit kerja');
    } finally {
      setLoading(false);
    }
  };

  const fetchLokasiDetail = async () => {
    try {
      setLoadingLokasi(true);
      const response = await lokasiApi.getEffectiveLocation(kd_unit_kerja!);
      setLokasi(response);
    } catch (error: any) {
      console.error('Error fetching lokasi:', error);
      // Lokasi tidak wajib ada, jadi tidak perlu error message
      // Hanya log error untuk debugging
      if (error.code !== 'ECONNABORTED') {
        console.warn('Lokasi tidak tersedia untuk unit kerja ini');
      }
    } finally {
      setLoadingLokasi(false);
    }
  };

  const formatCoordinate = (lat: number, lng: number) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  const getGoogleMapsUrl = (lat: number, lng: number) => {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  };

  const getJenisKelamin = (kdjenkel: number) => {
    return kdjenkel === 1 ? 'Laki-laki' : 'Perempuan';
  };

  const getAgama = (agama: number) => {
    const agamaMap: { [key: number]: string } = {
      1: 'Islam',
      2: 'Kristen',
      3: 'Katolik',
      4: 'Hindu',
      5: 'Buddha',
      6: 'Konghucu'
    };
    return agamaMap[agama] || 'Tidak diketahui';
  };

  const formatTanggal = (tanggal: string) => {
    if (!tanggal) return '-';
    return new Date(tanggal).toLocaleDateString('id-ID');
  };

  const handleLocationModalSuccess = async () => {
    setLocationModalVisible(false);
    await fetchLokasiDetail(); // Refresh lokasi data
  };

  // Kolom untuk tabel pegawai
  const pegawaiColumns: ColumnsType<Pegawai> = [
   
    {
      title: 'Nama Lengkap',
      dataIndex: 'nama',
      key: 'nama',
      width: 200,
      render: (nama: string) => (
        <Text strong style={{ fontSize: '13px' }}>{nama}</Text>
      ),
    },
    {
      title: 'NIP',
      dataIndex: 'nip',
      key: 'nip',
      width: 140,
      render: (nip: string) => (
        <Text code style={{ fontSize: '12px' }}>{nip}</Text>
      ),
    },
   
    {
      title: 'Jenis Pegawai',
      dataIndex: 'jenis_pegawai',
      key: 'jenis_pegawai',
      width: 100,
      render: (jenis: string) => (
        <Tag color={jenis === 'PNS' ? 'blue' : jenis === 'P3K' ? 'green' : 'orange'}>
          {jenis}
        </Tag>
      ),
    },
   
    {
      title: 'Jenis Kelamin',
      dataIndex: 'kdjenkel',
      key: 'kdjenkel',
      width: 90,
      render: (kdjenkel: number) => (
        <Text style={{ fontSize: '12px' }}>{getJenisKelamin(kdjenkel)}</Text>
      ),
    },
    {
      title: 'Agama',
      dataIndex: 'agama',
      key: 'agama',
      width: 80,
      render: (agama: number) => (
        <Text style={{ fontSize: '12px' }}>{getAgama(agama)}</Text>
      ),
    },
    {
      title: 'Tempat Lahir',
      dataIndex: 'tempatlhr',
      key: 'tempatlhr',
      width: 120,
      ellipsis: true,
      render: (tempat: string) => (
        <Text style={{ fontSize: '12px' }}>{tempat || '-'}</Text>
      ),
    },
    {
      title: 'Tanggal Lahir',
      dataIndex: 'tgllhr',
      key: 'tgllhr',
      width: 100,
      render: (tanggal: string) => (
        <Text style={{ fontSize: '12px' }}>{formatTanggal(tanggal)}</Text>
      ),
    },
    {
      title: 'No. Telp',
      dataIndex: 'notelp',
      key: 'notelp',
      width: 120,
      render: (notelp: string) => (
        <Text style={{ fontSize: '12px' }}>{notelp || '-'}</Text>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ padding: '24px', maxWidth: '100%', overflow: 'hidden' }}>
        <Card>
          <div style={{ marginBottom: '16px' }}>
            <Title level={3} style={{ margin: 0, marginBottom: '4px' }}>
              Detail Unit Kerja
            </Title>
            <Text type="secondary">Memuat data unit kerja...</Text>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '300px' 
          }}>
            <Spin size="large" />
          </div>
        </Card>
      </div>
    );
  }

  if (!unitKerja) {
    return (
      <div style={{ padding: '24px', maxWidth: '100%', overflow: 'hidden' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <ClusterOutlined style={{ fontSize: '64px', color: '#ff4d4f', marginBottom: '16px' }} />
            <Title level={3}>Unit Kerja Tidak Ditemukan</Title>
            <Text type="secondary" style={{ marginBottom: '24px', display: 'block' }}>
              Unit kerja yang Anda cari tidak dapat ditemukan atau telah dihapus.
            </Text>
            <Button 
              type="primary"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/unit-kerja')}
            >
              Kembali ke Daftar Unit Kerja
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <Title level={2} style={{ margin: 0, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ClusterOutlined style={{ color: '#1890ff', fontSize: '28px' }} />
            Detail Unit Kerja
          </Title>
          <Space size="middle">
            <Text strong style={{ fontSize: '16px' }}>
              {unitKerja.nm_unit_kerja}
            </Text>
          </Space>
        </div>
        
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/unit-kerja')}
            size="large"
          >
            Kembali
          </Button>
        </Space>
      </div>

      {/* Main Content */}
      <Row gutter={[24, 24]}>
        {/* Informasi Detail */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <FileTextOutlined style={{ color: '#1890ff' }} />
                <span>Informasi Detail</span>
              </Space>
            }
            style={{ height: '100%' }}
          >
            <Descriptions column={1} size="middle" styles={{ label: { fontWeight: 600, width: '200px' } }}>
              {unitKerja.kd_unit_atasan && (
                <Descriptions.Item label="Unit Kerja Atasan">
                  <Text>{unitKerja.kd_unit_atasan}</Text>
                </Descriptions.Item>
              )}

              {unitKerja.relasi_data && (
                <>
                  {/* Level 1 - Satker */}
                  {unitKerja.jenis === 'satker_tbl' && unitKerja.relasi_data.kd_satker && (
                    <>
                      <Descriptions.Item label="Kode Satker">
                        <Text code>{unitKerja.relasi_data.kd_satker}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Nama Satker">
                        <Text>{unitKerja.relasi_data.nm_satker}</Text>
                      </Descriptions.Item>
                      {unitKerja.relasi_data.nama_jabatan && (
                        <Descriptions.Item label="Nama Jabatan">
                          <Text>{unitKerja.relasi_data.nama_jabatan}</Text>
                        </Descriptions.Item>
                      )}
                      
                    </>
                  )}

                  {/* Level 2 - Bidang */}
                  {unitKerja.jenis === 'bidang_tbl' && (
                    <>
                      <Descriptions.Item label="Kode Bidang">
                        <Text code>{unitKerja.relasi_data.bidangf}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Nama Bidang">
                        <Text>{unitKerja.relasi_data.nm_bidang}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Satker Induk">
                        <Text>{unitKerja.relasi_data.nm_satker}</Text>
                      </Descriptions.Item>
                      {unitKerja.relasi_data.sub_bidang_count !== undefined && (
                        <Descriptions.Item label="Jumlah Sub Bidang">
                          <Badge count={unitKerja.relasi_data.sub_bidang_count} showZero />
                        </Descriptions.Item>
                      )}
                    </>
                  )}

                  {/* Level 3 - Sub Bidang */}
                  {unitKerja.jenis === 'bidang_sub' && (
                    <>
                      <Descriptions.Item label="Kode Sub Bidang">
                        <Text code>{unitKerja.relasi_data.subf}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Nama Sub Bidang">
                        <Text>{unitKerja.relasi_data.nm_sub}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Bidang Induk">
                        <Text>{unitKerja.relasi_data.nm_bidang}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Satker Induk">
                        <Text>{unitKerja.relasi_data.nm_satker}</Text>
                      </Descriptions.Item>
                    </>
                  )}
                </>
              )}
            </Descriptions>
          </Card>
        </Col>

        {/* Informasi Lokasi */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <EnvironmentOutlined style={{ color: '#52c41a' }} />
                <span>Lokasi</span>
              </Space>
            }
            loading={loadingLokasi}
            style={{ height: '100%' }}
          >
            {lokasi ? (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <Text strong style={{ fontSize: '16px', display: 'block', marginBottom: '4px' }}>
                    {lokasi.nama_lokasi || 'Lokasi Unit Kerja'}
                  </Text>
                  <Badge 
                    status={lokasi.status ? 'success' : 'error'} 
                    text={lokasi.status ? 'Aktif' : 'Non-Aktif'}
                  />
                </div>
                
                <div style={{ marginBottom: '12px' }}>
                  <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>Koordinat</Text>
                  <Text code style={{ fontSize: '13px' }}>
                    {formatCoordinate(lokasi.lat, lokasi.lng)}
                  </Text>
                </div>
                
                <div style={{ marginBottom: '12px' }}>
                  <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>Radius</Text>
                  <Text>{lokasi.range} meter</Text>
                </div>
                
                {lokasi.alamat && (
                  <div style={{ marginBottom: '12px' }}>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>Alamat</Text>
                    <Text style={{ fontSize: '13px' }}>{lokasi.alamat}</Text>
                  </div>
                )}
                
                {lokasi.ket && (
                  <div style={{ marginBottom: '12px' }}>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>Keterangan</Text>
                    <Text type="secondary" style={{ fontSize: '13px' }}>{lokasi.ket}</Text>
                  </div>
                )}
                
                {lokasi.is_inherited && (
                  <div style={{ marginBottom: '12px' }}>
                    <Tag color="orange" style={{ fontSize: '11px' }}>Diwariskan dari Parent</Tag>
                  </div>
                )}
                
                <Space style={{ width: '100%', marginTop: '8px' }}>
                  <Button 
                    type="primary" 
                    size="small"
                    icon={<EnvironmentOutlined />}
                    href={getGoogleMapsUrl(lokasi.lat, lokasi.lng)}
                    target="_blank"
                    style={{ flex: 1 }}
                  >
                    Lihat di Google Maps
                  </Button>
                  <Button 
                    type="default" 
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => setLocationModalVisible(true)}
                  >
                    Edit
                  </Button>
                </Space>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <EnvironmentOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginBottom: '16px' }}>
                  Lokasi belum diatur
                </Text>
                <Button 
                  type="dashed"
                  size="small"
                  onClick={() => setLocationModalVisible(true)}
                >
                  Atur Lokasi
                </Button>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Data Pegawai */}
      <Card 
        title={
          <Space>
            <TeamOutlined style={{ color: '#722ed1' }} />
            <span>Data Pegawai</span>
            <Badge count={pegawai.length} showZero style={{ backgroundColor: '#52c41a' }} />
          </Space>
        }
        
        style={{ marginTop: '24px' }}
      >
        {pegawai.length > 0 ? (
          <Table
            columns={pegawaiColumns}
            dataSource={pegawai}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} dari ${total} pegawai`,
              pageSizeOptions: ['5', '10', '20', '50'],
            }}
            size="small"
            scroll={{ x: 1000 }}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <UserOutlined style={{ fontSize: '64px', color: '#d9d9d9', marginBottom: '16px' }} />
            <Title level={4} style={{ color: '#8c8c8c', marginBottom: '8px' }}>
              Belum ada pegawai
            </Title>
            <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginBottom: '16px' }}>
              Data pegawai akan muncul setelah pegawai ditugaskan ke unit kerja ini
            </Text>
            <Button 
              type="primary"
              onClick={() => navigate('/pegawai')}
            >
              Lihat Semua Pegawai
            </Button>
          </div>
        )}
      </Card>

      {/* Location Modal */}
      <LocationModal
        visible={locationModalVisible}
        onCancel={() => setLocationModalVisible(false)}
        onSuccess={handleLocationModalSuccess}
        kdUnitKerja={kd_unit_kerja!}
        existingLocation={lokasi as any || null}
      />
    </div>
  );
};

export default UnitKerjaDetail;
