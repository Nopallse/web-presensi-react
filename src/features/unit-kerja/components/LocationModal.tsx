import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Button,
  Space,
  message,
  Row,
  Col,
  Switch,
  Card,
  Slider,
  Tag
} from 'antd';
import {
  EnvironmentOutlined,
  SaveOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { unitKerjaV2Api, type Lokasi } from '../services/unitKerjaV2Api';

// Import GoogleMap component dynamically to avoid SSR issues
const GoogleMap = React.lazy(() => import('../../../components/GoogleMap'));


interface LocationFormData {
  lat: number;
  lng: number;
  range: number;
  alamat?: string;
  ket: string;
  status: boolean;
}

interface LocationModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  idSatker?: string;
  idBidang?: string;
  idSubBidang?: string;
  kdUnitKerja?: string;
  existingLocation?: Lokasi | null;
}

const LocationModal: React.FC<LocationModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  idSatker,
  idBidang,
  idSubBidang,
  kdUnitKerja,
  existingLocation
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number }>({
    lat: -0.6267, // Default koordinat Pariaman
    lng: 100.1207
  });
  const [radius, setRadius] = useState<number>(100);

  useEffect(() => {
    if (visible) {
      if (existingLocation) {
        setIsEdit(true);
        setSelectedLocation({
          lat: existingLocation.lat,
          lng: existingLocation.lng
        });
        setRadius(existingLocation.range || 100);
        form.setFieldsValue({
          lat: existingLocation.lat,
          lng: existingLocation.lng,
          range: existingLocation.range || 100,
          alamat: existingLocation.alamat || '',
          ket: existingLocation.ket || '',
          status: existingLocation.status
        });
      } else {
        setIsEdit(false);
        setSelectedLocation({
          lat: -0.6267,
          lng: 100.1207
        });
        setRadius(100);
        form.resetFields();
        form.setFieldsValue({
          range: 100,
          status: true,
          lat: -0.6267,
          lng: 100.1207
        });
      }
    }
  }, [visible, existingLocation, form]);

  const handleSubmit = async (values: LocationFormData) => {
    try {
      setLoading(true);
      const payload = {
        lat: values.lat,
        lng: values.lng,
        range: values.range,
        ket: values.ket,
        status: values.status
      };

      if (kdUnitKerja) {
        // Handle unit kerja location (legacy)
        message.success('Lokasi unit kerja berhasil disimpan');
      } else if (idSubBidang) {
        await unitKerjaV2Api.setSubBidangLocation(idSatker!, idBidang!, idSubBidang, payload);
        message.success('Lokasi sub-bidang berhasil disimpan');
      } else if (idBidang) {
        await unitKerjaV2Api.setBidangLocation(idSatker!, idBidang, payload);
        message.success('Lokasi bidang berhasil disimpan');
      } else if (idSatker) {
        await unitKerjaV2Api.setSatkerLocation(idSatker, payload);
        message.success('Lokasi satker berhasil disimpan');
      }
      
      onSuccess();
    } catch (error: any) {
      console.error('Error saving location:', error);
      message.error(error.response?.data?.error || 'Gagal menyimpan lokasi');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    form.setFieldsValue({ lat, lng });
  };

  const handleRadiusChange = (value: number) => {
    setRadius(value);
    form.setFieldsValue({ range: value });
  };

  const getLevelInfo = () => {
    if (idSubBidang) return { level: 'Sub Bidang', color: 'purple' };
    if (idBidang) return { level: 'Bidang', color: 'green' };
    return { level: 'Satker', color: 'blue' };
  };

  const levelInfo = getLevelInfo();

  return (
    <Modal
      title={
        <Space>
          <EnvironmentOutlined style={{ color: '#52c41a' }} />
          <span>{isEdit ? 'Edit Lokasi' : 'Atur Lokasi'}</span>
          <Tag color={levelInfo.color}>{levelInfo.level}</Tag>
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={1200}
      destroyOnHidden
    >
      

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          range: 100,
          status: true
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
                    200: '200m'
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
                label="Nama Lokasi"
                name="ket"
                rules={[
                  { required: true, message: 'Nama lokasi harus diisi' },
                  { max: 255, message: 'Nama lokasi maksimal 255 karakter' }
                ]}
              >
                <Input placeholder="Masukkan nama lokasi" />
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
                label="Alamat"
                name="alamat"
                rules={[
                  { max: 500, message: 'Alamat maksimal 500 karakter' }
                ]}
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Masukkan alamat lengkap lokasi"
                  showCount
                  maxLength={500}
                />
              </Form.Item>


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
                  {isEdit ? 'Update Lokasi' : 'Simpan Lokasi'}
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
    </Modal>
  );
};

export default LocationModal;