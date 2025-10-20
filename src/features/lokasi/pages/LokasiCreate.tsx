import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Form, 
  Input, 
  InputNumber, 
  Button, 
  Typography, 
  message, 
  Switch, 
  Row, 
  Col,
  Space,
  Divider,
  Slider
} from 'antd';
import { 
  ArrowLeftOutlined, 
  SaveOutlined,
  EnvironmentOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { lokasiKegiatanApi } from '../services/lokasiKegiatanApi';
import type { CreateLokasiKegiatanRequest } from '../types';

// Import GoogleMap component dynamically to avoid SSR issues
const GoogleMap = React.lazy(() => import('../../../components/GoogleMap'));

const { Title } = Typography;
const { TextArea } = Input;

const LokasiCreate: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number }>({
    lat: -0.6267, // Default koordinat Pariaman
    lng: 100.1207
  });
  const [radius, setRadius] = useState<number>(100);

  const handleSubmit = async (values: CreateLokasiKegiatanRequest) => {
    try {
      setLoading(true);
      await lokasiKegiatanApi.create(values);
      message.success('Lokasi kegiatan berhasil dibuat');
      navigate('/lokasi');
    } catch (error: any) {
      console.error('Error creating lokasi kegiatan:', error);
      message.error('Gagal membuat lokasi kegiatan');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/lokasi');
  };

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    form.setFieldsValue({ lat, lng });
  };

  const handleRadiusChange = (value: number) => {
    setRadius(value);
    form.setFieldsValue({ range: value });
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={handleCancel}
          >
            Kembali
          </Button>
          <Space>
            <EnvironmentOutlined style={{ color: '#52c41a' }} />
            <Title level={3} style={{ margin: 0 }}>
              Tambah Lokasi Kegiatan
            </Title>
          </Space>
        </div>

        <Divider />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: true,
            range: 100,
            lat: -0.6267,
            lng: 100.1207
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
                <Form.Item
                  label="Keterangan"
                  name="ket"
                  rules={[
                    { required: true, message: 'Keterangan wajib diisi' },
                    { max: 255, message: 'Keterangan maksimal 255 karakter' }
                  ]}
                >
                  <TextArea 
                    rows={3} 
                    placeholder="Masukkan keterangan lokasi kegiatan"
                    showCount
                    maxLength={255}
                  />
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Latitude"
                      name="lat"
                      rules={[
                        { required: true, message: 'Latitude harus diisi' },
                        { type: 'number', min: -90, max: 90, message: 'Latitude harus antara -90 dan 90' }
                      ]}
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        placeholder="Contoh: -0.123456"
                        precision={6}
                        step={0.000001}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Longitude"
                      name="lng"
                      rules={[
                        { required: true, message: 'Longitude harus diisi' },
                        { type: 'number', min: -180, max: 180, message: 'Longitude harus antara -180 dan 180' }
                      ]}
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        placeholder="Contoh: 100.123456"
                        precision={6}
                        step={0.000001}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label="Status"
                  name="status"
                  valuePropName="checked"
                >
                  <Switch
                    checkedChildren="Aktif"
                    unCheckedChildren="Non-Aktif"
                  />
                </Form.Item>

                {/* Action Buttons */}
                <div style={{ marginTop: '24px', display: 'flex', gap: '8px' }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={<SaveOutlined />}
                    style={{ flex: 1 }}
                  >
                    Simpan Lokasi
                  </Button>
                  <Button
                    onClick={handleCancel}
                    icon={<CloseOutlined />}
                  >
                    Batal
                  </Button>
                </div>
              </Card>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default LokasiCreate;
