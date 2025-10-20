import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Select, Row, Col, message, Button, Card, Divider } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { LokasiKegiatanFormData } from '../types';
import DebounceSelect from '../../../components/DebounceSelect';
import { organizationApi } from '../services/organizationApi';

const { Option } = Select;

interface LokasiKegiatanFormProps {
  form: any;
  initialValues?: Partial<LokasiKegiatanFormData>;
}

const LokasiKegiatanForm: React.FC<LokasiKegiatanFormProps> = ({ 
  form, 
  initialValues
}) => {
  const [lokasiData, setLokasiData] = useState<{
    lat: number | null;
    lng: number | null;
    range: number;
    ket: string;
    status: boolean;
    id_satker: string;
    kdskpd?: string;
  }[]>([]);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        tanggal_kegiatan: initialValues.tanggal_kegiatan,
        jenis_kegiatan: initialValues.jenis_kegiatan,
        keterangan: initialValues.keterangan
      });
      
      if (initialValues.lokasiData && initialValues.lokasiData.length > 0) {
        setLokasiData(initialValues.lokasiData);
      } else {
        // Tambahkan satu lokasi kosong jika tidak ada data awal
        addLokasi();
      }
    } else {
      // Tambahkan satu lokasi kosong untuk form baru
      addLokasi();
    }
  }, [form, initialValues]);

  const addLokasi = () => {
    const newLokasi = {
      lat: null,
      lng: null,
      range: 100,
      ket: '',
      status: true,
      id_satker: '',
      kdskpd: ''
    };
    setLokasiData([...lokasiData, newLokasi]);
  };

  const removeLokasi = (index: number) => {
    if (lokasiData.length > 1) {
      const newLokasiData = lokasiData.filter((_, i) => i !== index);
      setLokasiData(newLokasiData);
    } else {
      message.warning('Minimal harus ada satu lokasi');
    }
  };

  const updateLokasi = (index: number, field: string, value: any) => {
    const newLokasiData = [...lokasiData];
    newLokasiData[index] = { ...newLokasiData[index], [field]: value };
    setLokasiData(newLokasiData);
    
    // Update form values
    form.setFieldsValue({ lokasiData: newLokasiData });
  };

  // Fetch SKPD options
  const fetchSkpdOptions = async (search: string) => {
    try {
      const response = await organizationApi.searchSatker(search, 1, 20);
      return response.data.map((satker: any) => ({
        label: `${satker.KDSATKER} - ${satker.NMSATKER.trim()}`,
        value: satker.KDSATKER,
      }));
    } catch (error) {
      console.error('Error fetching SKPD:', error);
      message.error('Gagal memuat daftar SKPD');
      return [];
    }
  };

  return (
    <>
      <Form.Item
        name="tanggal_kegiatan"
        label="Tanggal Kegiatan"
        rules={[
          { required: true, message: 'Tanggal kegiatan wajib diisi' }
        ]}
      >
        <Input 
          type="date"
          placeholder="Pilih tanggal kegiatan"
          size="large"
        />
      </Form.Item>

      <Form.Item
        name="jenis_kegiatan"
        label="Jenis Kegiatan"
        rules={[
          { required: true, message: 'Jenis kegiatan wajib diisi' },
          { min: 3, message: 'Jenis kegiatan minimal 3 karakter' },
          { max: 50, message: 'Jenis kegiatan maksimal 50 karakter' }
        ]}
      >
        <Input 
          placeholder="Contoh: Apel Gabungan, Wirid, Senam"
          size="large"
        />
      </Form.Item>

      <Form.Item
        name="keterangan"
        label="Keterangan"
        rules={[
          { required: true, message: 'Keterangan wajib diisi' },
          { min: 3, message: 'Keterangan minimal 3 karakter' },
          { max: 200, message: 'Keterangan maksimal 200 karakter' }
        ]}
      >
        <Input.TextArea 
          placeholder="Masukkan keterangan detail kegiatan"
          size="large"
          rows={3}
        />
      </Form.Item>

      <Divider orientation="left">Lokasi Kegiatan</Divider>

      {lokasiData.map((lokasi, index) => (
        <Card 
          key={index}
          title={`Lokasi ${index + 1}`}
          size="small"
          style={{ marginBottom: 16 }}
          extra={
            lokasiData.length > 1 && (
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />}
                onClick={() => removeLokasi(index)}
              />
            )
          }
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Latitude"
                rules={[
                  { required: true, message: 'Latitude wajib diisi' },
                  { type: 'number', min: -90, max: 90, message: 'Latitude harus antara -90 dan 90' }
                ]}
              >
                <InputNumber
                  placeholder="Masukkan latitude"
                  style={{ width: '100%' }}
                  size="large"
                  step={0.000001}
                  precision={6}
                  value={lokasi.lat}
                  onChange={(value) => updateLokasi(index, 'lat', value)}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Longitude"
                rules={[
                  { required: true, message: 'Longitude wajib diisi' },
                  { type: 'number', min: -180, max: 180, message: 'Longitude harus antara -180 dan 180' }
                ]}
              >
                <InputNumber
                  placeholder="Masukkan longitude"
                  style={{ width: '100%' }}
                  size="large"
                  step={0.000001}
                  precision={6}
                  value={lokasi.lng}
                  onChange={(value) => updateLokasi(index, 'lng', value)}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Radius (meter)"
                rules={[
                  { required: true, message: 'Radius wajib diisi' },
                  { type: 'number', min: 1, max: 10000, message: 'Radius harus antara 1 dan 10000 meter' }
                ]}
              >
                <InputNumber
                  placeholder="100"
                  style={{ width: '100%' }}
                  size="large"
                  min={1}
                  max={10000}
                  value={lokasi.range}
                  onChange={(value) => updateLokasi(index, 'range', value)}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Kode SKPD"
                rules={[
                  { required: true, message: 'Kode SKPD wajib dipilih' }
                ]}
              >
                <DebounceSelect
                  placeholder="Ketik untuk mencari SKPD..."
                  allowClear
                  size="large"
                  value={lokasi.kdskpd ? { value: lokasi.kdskpd, label: lokasi.kdskpd } : null}
                  onChange={(value) => updateLokasi(index, 'kdskpd', Array.isArray(value) ? value[0]?.value || '' : value?.value || '')}
                  fetchOptions={fetchSkpdOptions}
                  debounceTimeout={500}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Status Aktif"
                rules={[
                  { required: true, message: 'Status wajib dipilih' }
                ]}
              >
                <Select
                  placeholder="Pilih status"
                  size="large"
                  value={lokasi.status}
                  onChange={(value) => updateLokasi(index, 'status', value)}
                >
                  <Option value={true}>Aktif</Option>
                  <Option value={false}>Tidak Aktif</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Keterangan Lokasi"
          >
            <Input.TextArea 
              placeholder="Masukkan keterangan lokasi (opsional)"
              size="large"
              rows={2}
              value={lokasi.ket}
              onChange={(e) => updateLokasi(index, 'ket', e.target.value)}
            />
          </Form.Item>
        </Card>
      ))}

      <Form.Item>
        <Button 
          type="dashed" 
          onClick={addLokasi} 
          block 
          icon={<PlusOutlined />}
          size="large"
        >
          Tambah Lokasi
        </Button>
      </Form.Item>

      {/* Hidden field untuk menyimpan lokasiData */}
      <Form.Item name="lokasiData" style={{ display: 'none' }}>
        <Input value={JSON.stringify(lokasiData)} />
      </Form.Item>
    </>
  );
};

export default LokasiKegiatanForm;