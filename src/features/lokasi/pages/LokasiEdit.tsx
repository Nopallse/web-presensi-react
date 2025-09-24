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
  const [initialValues, setInitialValues] = useState<any>(null);
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
      
      // Prepare initial values for form and tracking
      const formValues: any = {
        ket: lokasiData.ket,
        lat: lokasiData.lat,
        lng: lokasiData.lng,
        range: lokasiData.range,
        status: lokasiData.status,
        id_skpd: null,
        id_satker: null,
        id_bidang: null
      };

      // Convert organizational data to DebounceSelect format
      if (lokasiData.id_skpd && lokasiData.skpd_data) {
        formValues.id_skpd = {
          label: `${lokasiData.skpd_data.KDSKPD} - ${lokasiData.skpd_data.NMSKPD.trim()}`,
          value: lokasiData.id_skpd
        };
      }

      if (lokasiData.id_satker && lokasiData.satker_data) {
        formValues.id_satker = {
          label: `${lokasiData.satker_data.KDSATKER} - ${lokasiData.satker_data.NMSATKER}`,
          value: lokasiData.id_satker
        };
      }

      if (lokasiData.id_bidang && lokasiData.bidang_data) {
        formValues.id_bidang = {
          label: `${lokasiData.bidang_data.BIDANGF} - ${lokasiData.bidang_data.NMBIDANG}`,
          value: lokasiData.id_bidang
        };
      }
      
      // Store initial values for comparison
      setInitialValues(formValues);
      
      // Set form values
      form.setFieldsValue(formValues);
    } catch (error: any) {
      console.error('Error fetching lokasi detail:', error);
      message.error('Gagal memuat data lokasi');
      navigate('/lokasi');
    } finally {
      setLoadingData(false);
    }
  };

  // Helper function to extract value from DebounceSelect format
  const extractValue = (field: any) => {
    if (field && typeof field === 'object' && field.value !== undefined) {
      return field.value;
    }
    return field;
  };

  // Helper function to detect changes between initial and current values
  const getChangedFields = (currentValues: any) => {
    if (!initialValues) return {};

    const changes: any = {};

    // Check basic fields
    const basicFields = ['ket', 'lat', 'lng', 'range', 'status'];
    basicFields.forEach(field => {
      if (currentValues[field] !== initialValues[field]) {
        changes[field] = currentValues[field];
      }
    });

    // Check organizational fields
    const orgFields = ['id_skpd', 'id_satker', 'id_bidang'];
    orgFields.forEach(field => {
      const currentValue = extractValue(currentValues[field]);
      const initialValue = extractValue(initialValues[field]);
      
      if (currentValue !== initialValue) {
        changes[field] = currentValue;
      }
    });

    return changes;
  };

  const handleSubmit = async () => {
    if (!lokasi || !initialValues) return;
    
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // Include current location and radius from state
      const currentValues = {
        ...values,
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        range: radius
      };

      console.log('Current form values:', currentValues);
      console.log('Initial values:', initialValues);
      
      // Get only changed fields
      const changedFields = getChangedFields(currentValues);
      
      console.log('Changed fields:', changedFields);

      // If no changes, show message and return
      if (Object.keys(changedFields).length === 0) {
        message.info('Tidak ada perubahan untuk disimpan');
        return;
      }

      // Send only changed fields to server
      await lokasiApi.update(lokasi.lokasi_id, changedFields);
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

  // Update form values when location/radius changes from map
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
              {initialValues && (
                <LokasiForm 
                  form={form} 
                  initialValues={initialValues}
                />
              )}
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