import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Typography, 
  message, 
  Tag, 
  Space, 
  Row, 
  Col, 
  Spin,
  Descriptions,
  Divider
} from 'antd';
import { 
  ArrowLeftOutlined, 
  EditOutlined, 
  DeleteOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import { lokasiKegiatanApi } from '../services/lokasiKegiatanApi';
import type { LokasiKegiatan } from '../types';

// Import GoogleMap component dynamically to avoid SSR issues
const GoogleMap = React.lazy(() => import('../../../components/GoogleMap'));

const { Title } = Typography;

const LokasiDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [lokasi, setLokasi] = useState<LokasiKegiatan | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number }>({
    lat: -0.6267,
    lng: 100.1207
  });
  const [radius, setRadius] = useState<number>(100);

  useEffect(() => {
    if (id) {
      fetchLokasiDetail();
    }
  }, [id]);

  const fetchLokasiDetail = async () => {
    try {
      setLoading(true);
      const response = await lokasiKegiatanApi.getById(parseInt(id!));
      setLokasi(response.data);
      setSelectedLocation({
        lat: response.data.lat,
        lng: response.data.lng
      });
      setRadius(response.data.range);
    } catch (error: any) {
      console.error('Error fetching lokasi detail:', error);
      message.error('Gagal memuat detail lokasi kegiatan');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await lokasiKegiatanApi.delete(parseInt(id!));
      message.success('Lokasi kegiatan berhasil dihapus');
      navigate('/lokasi');
    } catch (error: any) {
      console.error('Error deleting lokasi:', error);
      message.error('Gagal menghapus lokasi kegiatan');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!lokasi) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <div className="text-center py-8">
            <Title level={4}>Lokasi Kegiatan Tidak Ditemukan</Title>
            <p>Lokasi kegiatan yang Anda cari tidak ditemukan.</p>
            <Button type="primary" onClick={() => navigate('/lokasi')}>
              Kembali ke Daftar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/lokasi')}
            >
              Kembali
            </Button>
            <Space>
              <EnvironmentOutlined style={{ color: '#52c41a' }} />
              <Title level={3} style={{ margin: 0 }}>
                Detail Lokasi Kegiatan
              </Title>
            </Space>
          </div>
          
          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/lokasi/${id}/edit`)}
            >
              Edit
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleDelete}
            >
              Hapus
            </Button>
          </Space>
        </div>

        <Divider />

        <Row gutter={[24, 24]}>
          {/* Map Section */}
          <Col xs={24} lg={12}>
            <Card title="Peta Lokasi" style={{ height: '100%' }}>
              <React.Suspense fallback={<div style={{ height: '400px', width: '100%', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Map...</div>}>
                <GoogleMap
                  center={[selectedLocation.lat, selectedLocation.lng]}
                  zoom={15}
                  height="400px"
                  selectedLocation={{
                    lat: selectedLocation.lat,
                    lng: selectedLocation.lng,
                    range: radius
                  }}
                />
              </React.Suspense>
              <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: '6px' }}>
                <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#52c41a' }}>
                  Informasi Lokasi
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  <p style={{ margin: '4px 0' }}>• Koordinat: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}</p>
                  <p style={{ margin: '4px 0' }}>• Radius: {radius.toLocaleString()} meter</p>
                  <p style={{ margin: '4px 0' }}>• Status: {lokasi.status ? 'Aktif' : 'Tidak Aktif'}</p>
                </div>
              </div>
            </Card>
          </Col>

          {/* Information Section */}
          <Col xs={24} lg={12}>
            <Card title="Informasi Detail" style={{ height: '100%' }}>
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="ID Lokasi">
                  <strong style={{ fontFamily: 'monospace' }}>{lokasi.lokasi_id}</strong>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={lokasi.status ? 'green' : 'red'}>
                    {lokasi.status ? 'Aktif' : 'Tidak Aktif'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Keterangan">
                  <div style={{ 
                    padding: '8px', 
                    backgroundColor: '#f5f5f5', 
                    borderRadius: '4px',
                    minHeight: '60px',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {lokasi.ket}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Koordinat">
                  <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                    <div>Latitude: {lokasi.lat.toFixed(6)}</div>
                    <div>Longitude: {lokasi.lng.toFixed(6)}</div>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Range Presensi">
                  <strong style={{ color: '#1890ff' }}>{lokasi.range.toLocaleString()} meter</strong>
                </Descriptions.Item>
                <Descriptions.Item label="Dibuat">
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {new Date(lokasi.createdAt).toLocaleString('id-ID')}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Diperbarui">
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {new Date(lokasi.updatedAt).toLocaleString('id-ID')}
                  </div>
                </Descriptions.Item>
              </Descriptions>

              <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f0f9ff', border: '1px solid #91d5ff', borderRadius: '6px' }}>
                <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#1890ff' }}>
                  💡 Tips Penggunaan
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  <p style={{ margin: '4px 0' }}>• Lokasi ini dapat digunakan untuk presensi kegiatan</p>
                  <p style={{ margin: '4px 0' }}>• Radius menentukan area valid untuk presensi</p>
                  <p style={{ margin: '4px 0' }}>• Status aktif diperlukan agar lokasi dapat digunakan</p>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default LokasiDetail;
