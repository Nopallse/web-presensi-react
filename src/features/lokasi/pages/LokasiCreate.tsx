import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Card, Row, Col, message, Slider } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { lokasiApi } from '../services/lokasiApi';
import LokasiForm from '../components/LokasiForm';

// Import GoogleMap component dynamically to avoid SSR issues
const GoogleMap = React.lazy(() => import('../../../components/GoogleMap'));

const LokasiCreate: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number }>({
    lat: -0.914865,
    lng: 100.461
  });
  const [radius, setRadius] = useState<number>(100);

  const handleSubmit = async () => {
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

      await lokasiApi.create(formData);
      message.success('Lokasi berhasil ditambahkan');
      navigate('/lokasi');
    } catch (error: any) {
      console.error('Error creating lokasi:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Gagal menambahkan lokasi');
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
    navigate('/lokasi');
  };

  return (
    <div style={{ padding: '24px', maxWidth: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Tambah Lokasi</h1>
            <p style={{ color: '#666', margin: 0 }}>Tambah lokasi presensi baru</p>
          </div>
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
          id_skpd: '',
          lat: selectedLocation.lat,
          lng: selectedLocation.lng
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
              <LokasiForm form={form} />
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button onClick={handleCancel}>
                    Batal
                </Button>
                <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    loading={loading}
                    onClick={handleSubmit}
                >
                    Simpan
                </Button>
                </div>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default LokasiCreate;