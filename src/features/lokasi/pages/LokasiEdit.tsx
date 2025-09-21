import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Card, Row, Col, message, Spin, Slider } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { lokasiApi } from '../services/lokasiApi';
import LokasiForm from '../components/LokasiForm';
import type { Lokasi } from '../types';

// Import GoogleMap component dynamically to avoid SSR issues
const GoogleMap = React.lazy(() => import('../../../components/GoogleMap'));

const LokasiEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [lokasi, setLokasi] = useState<Lokasi | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number }>({
    lat: -0.914865,
    lng: 100.461
  });
  const [radius, setRadius] = useState<number>(100);

  useEffect(() => {
    if (id) {
      fetchLokasiDetail(parseInt(id));
    }
  }, [id]);

  const fetchLokasiDetail = async (lokasiId: number) => {
    try {
      setLoadingData(true);
      const response = await lokasiApi.getById(lokasiId);
      const lokasiData = response.data;
      setLokasi(lokasiData);
      
      // Set coordinate and radius state
      setSelectedLocation({ lat: lokasiData.lat, lng: lokasiData.lng });
      setRadius(lokasiData.range);
      
      // Set form values
      form.setFieldsValue({
        ket: lokasiData.ket,
        lat: lokasiData.lat,
        lng: lokasiData.lng,
        range: lokasiData.range,
        id_skpd: lokasiData.id_skpd,
        id_satker: lokasiData.id_satker,
        id_bidang: lokasiData.id_bidang,
        status: lokasiData.status
      });
    } catch (error: any) {
      console.error('Error fetching lokasi detail:', error);
      message.error('Gagal memuat data lokasi');
      navigate('/lokasi');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async () => {
    if (!lokasi) return;
    
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const formData = {
        ket: values.ket,
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        range: radius,
        id_skpd: values.id_skpd,
        id_satker: values.id_satker || null,
        id_bidang: values.id_bidang || null,
        status: values.status
      };

      await lokasiApi.update(lokasi.lokasi_id, formData);
      message.success('Lokasi berhasil diperbarui');
      navigate(`/lokasi/${lokasi.lokasi_id}`);
    } catch (error: any) {
      console.error('Error updating lokasi:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Gagal memperbarui lokasi');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    form.setFieldsValue({ lat, lng });
  };

  const handleRadiusChange = (value: number) => {
    setRadius(value);
    form.setFieldsValue({ range: value });
  };

  // Update form values when location changes
  React.useEffect(() => {
    form.setFieldsValue({
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
      range: radius
    });
  }, [selectedLocation, radius, form]);

  const handleCancel = () => {
    if (lokasi) {
      navigate(`/lokasi/${lokasi.lokasi_id}`);
    } else {
      navigate('/lokasi');
    }
  };

  if (loadingData) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (!lokasi) {
    return (
      <div className="text-center py-8">
        <p>Lokasi tidak ditemukan</p>
        <Button onClick={() => navigate('/lokasi')}>
          Kembali ke Daftar Lokasi
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Edit Lokasi</h1>
          <p style={{ color: '#666', margin: 0 }}>Edit informasi lokasi presensi</p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
            <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleCancel}
        >
          Kembali
        </Button>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ marginTop: '24px' }}
        initialValues={{
          status: true,
          range: 100,
          id_skpd: ''
        }}
      >
        <Row gutter={[24, 24]}>
          {/* Map Section */}
          <Col xs={24} lg={12}>
            <Card title="Peta Lokasi" style={{ height: '100%' }}>
              <React.Suspense fallback={<div style={{ height: '350px', width: '100%', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Map...</div>}>
                <GoogleMap
                  center={[selectedLocation.lat, selectedLocation.lng]}
                  zoom={15}
                  height="350px"
                  onMapClick={handleMapClick}
                  selectedLocation={{
                    lat: selectedLocation.lat,
                    lng: selectedLocation.lng,
                    range: radius
                  }}
                  onRadiusChange={handleRadiusChange}
                />
              </React.Suspense>
              <div style={{ marginTop: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Radius Presensi: {radius} meter</label>
                <Slider
                  min={50}
                  max={500}
                  value={radius}
                  onChange={handleRadiusChange}
                  marks={{
                    50: '50m',
                    100: '100m',
                    200: '200m',
                    300: '300m',
                    500: '500m'
                  }}
                />
              </div>
              <div style={{ marginTop: '12px', fontSize: '12px', color: '#666' }}>
                <p style={{ margin: '4px 0' }}>• Klik pada peta untuk mengatur koordinat lokasi</p>
                <p style={{ margin: '4px 0' }}>• Drag marker untuk memindahkan lokasi</p>
                <p style={{ margin: '4px 0' }}>• Gunakan slider untuk mengatur radius presensi</p>
                <p style={{ margin: '4px 0' }}>• Koordinat: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}</p>
              </div>
            </Card>
          </Col>

          {/* Form Section */}
          <Col xs={24} lg={12}>
            <Card title="Informasi Lokasi" style={{ height: '100%' }}>
              <LokasiForm 
                form={form} 
                initialValues={{
                  ket: lokasi.ket,
                  lat: lokasi.lat,
                  lng: lokasi.lng,
                  range: lokasi.range,
                  id_skpd: lokasi.id_skpd,
                  id_satker: lokasi.id_satker,
                  id_bidang: lokasi.id_bidang,
                  status: lokasi.status
                }}
              />
              <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
                <Button
                  onClick={handleCancel}
                  style={{ flex: 1 }}
                >
                  Batal
                </Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={loading}
                  onClick={handleSubmit}
                  style={{ flex: 1 }}
                >
                  Simpan Perubahan
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default LokasiEdit;