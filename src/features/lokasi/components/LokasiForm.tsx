import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Select, Row, Col, message } from 'antd';
import type { LokasiFormData } from '../types';
import DebounceSelect from '../../../components/DebounceSelect';
import { organizationApi, type SkpdData, type SatkerData, type BidangData } from '../services/organizationApi';

const { Option } = Select;

interface LokasiFormProps {
  form: any;
  initialValues?: Partial<LokasiFormData>;
}

const LokasiForm: React.FC<LokasiFormProps> = ({ 
  form, 
  initialValues
}) => {
  const [selectedSkpd, setSelectedSkpd] = useState<string | null>(null);
  const [selectedSatker, setSelectedSatker] = useState<string | null>(null);

  useEffect(() => {
    if (initialValues) {
      // Convert initial values to proper format for DebounceSelect
      const convertedInitialValues = { ...initialValues };
      
      // Convert SKPD to object format if it's a string
      if (initialValues.id_skpd && typeof initialValues.id_skpd === 'string') {
        convertedInitialValues.id_skpd = {
          value: initialValues.id_skpd,
          label: `${initialValues.id_skpd}` // We'll let DebounceSelect load the proper label
        };
        setSelectedSkpd(initialValues.id_skpd);
      } else if (initialValues.id_skpd && typeof initialValues.id_skpd === 'object') {
        setSelectedSkpd(initialValues.id_skpd.value);
      }
      
      // Convert Satker to object format if it's a string
      if ((initialValues as any).id_satker && typeof (initialValues as any).id_satker === 'string') {
        convertedInitialValues.id_satker = {
          value: (initialValues as any).id_satker,
          label: `${(initialValues as any).id_satker}`
        };
        setSelectedSatker((initialValues as any).id_satker);
      } else if ((initialValues as any).id_satker && typeof (initialValues as any).id_satker === 'object') {
        setSelectedSatker((initialValues as any).id_satker.value);
      }
      
      // Convert Bidang to object format if it's a string
      if ((initialValues as any).id_bidang && typeof (initialValues as any).id_bidang === 'string') {
        convertedInitialValues.id_bidang = {
          value: (initialValues as any).id_bidang,
          label: `${(initialValues as any).id_bidang}`
        };
      }
      
      form.setFieldsValue(convertedInitialValues);
    }
  }, [form, initialValues]);

  // Watch for form field changes to update internal state
  useEffect(() => {
    const currentValues = form.getFieldsValue();
    
    // Handle SKPD value changes
    if (currentValues.id_skpd) {
      const skpdValue = typeof currentValues.id_skpd === 'string' 
        ? currentValues.id_skpd 
        : currentValues.id_skpd?.value;
      if (skpdValue && skpdValue !== selectedSkpd) {
        setSelectedSkpd(skpdValue);
      }
    }
    
    // Handle Satker value changes
    if (currentValues.id_satker) {
      const satkerValue = typeof currentValues.id_satker === 'string' 
        ? currentValues.id_satker 
        : currentValues.id_satker?.value;
      if (satkerValue && satkerValue !== selectedSatker) {
        setSelectedSatker(satkerValue);
      }
    }
  }, [form, selectedSkpd, selectedSatker]);

  // Fetch SKPD options
  const fetchSkpdOptions = async (search: string) => {
    try {
      const response = await organizationApi.searchSkpd(search, 1, 20);
      return response.data.map((skpd: SkpdData) => ({
        label: `${skpd.KDSKPD} - ${skpd.NMSKPD.trim()}`,
        value: skpd.KDSKPD,
      }));
    } catch (error) {
      console.error('Error fetching SKPD:', error);
      message.error('Gagal memuat daftar SKPD');
      return [];
    }
  };

  // Fetch Satker options
  const fetchSatkerOptions = async (search: string) => {
    if (!selectedSkpd) return [];
    
    try {
      const response = await organizationApi.searchSatker(selectedSkpd, search, 1, 20);
      return response.data.map((satker: SatkerData) => ({
        label: `${satker.KDSATKER} - ${satker.NMSATKER}`,
        value: satker.KDSATKER,
      }));
    } catch (error) {
      console.error('Error fetching Satker:', error);
      message.error('Gagal memuat daftar Satker');
      return [];
    }
  };

  // Fetch Bidang options
  const fetchBidangOptions = async (search: string) => {
    if (!selectedSkpd || !selectedSatker) return [];
    
    try {
      const response = await organizationApi.searchBidang(selectedSkpd, selectedSatker, search, 1, 20);
      return response.data.map((bidang: BidangData) => ({
        label: `${bidang.BIDANGF} - ${bidang.NMBIDANG}`,
        value: bidang.BIDANGF,
      }));
    } catch (error) {
      console.error('Error fetching Bidang:', error);
      message.error('Gagal memuat daftar Bidang');
      return [];
    }
  };

  const handleSkpdChange = (value: any) => {
    const selectedValue = Array.isArray(value) ? value[0] : value;
    setSelectedSkpd(selectedValue?.value || null);
    setSelectedSatker(null);
    form.setFieldsValue({ 
      id_skpd: selectedValue,
      id_satker: null,
      id_bidang: null 
    });
  };

  const handleSatkerChange = (value: any) => {
    const selectedValue = Array.isArray(value) ? value[0] : value;
    setSelectedSatker(selectedValue?.value || null);
    form.setFieldsValue({ 
      id_satker: selectedValue,
      id_bidang: null 
    });
  };

  const handleBidangChange = (value: any) => {
    const selectedValue = Array.isArray(value) ? value[0] : value;
    form.setFieldsValue({ id_bidang: selectedValue });
  };

  return (
    <>
      <Form.Item
        name="ket"
        label="Keterangan"
        rules={[
          { required: true, message: 'Keterangan wajib diisi' },
          { min: 3, message: 'Keterangan minimal 3 karakter' },
          { max: 100, message: 'Keterangan maksimal 100 karakter' }
        ]}
      >
        <Input 
          placeholder="Masukkan keterangan lokasi"
          size="large"
        />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="lat"
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
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="lng"
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
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="range"
        label="Radius (meter)"
        rules={[
          { required: true, message: 'Radius wajib diisi' },
          { type: 'number', min: 1, max: 10000, message: 'Radius harus antara 1 dan 10000 meter' }
        ]}
        help="Jarak maksimal untuk presensi dari lokasi ini"
      >
        <InputNumber
          placeholder="100"
          style={{ width: '100%' }}
          size="large"
          min={1}
          max={10000}
        />
      </Form.Item>

      <Form.Item
        name="id_skpd"
        label="SKPD"
        rules={[
          { required: true, message: 'SKPD wajib dipilih' }
        ]}
      >
        <DebounceSelect
          placeholder="Ketik untuk mencari SKPD..."
          allowClear
          size="large"
          onChange={handleSkpdChange}
          fetchOptions={fetchSkpdOptions}
          debounceTimeout={500}
        />
      </Form.Item>

      <Form.Item
        name="id_satker"
        label="Satker"
      >
        <DebounceSelect
          placeholder={selectedSkpd ? "Ketik untuk mencari Satker..." : "Pilih SKPD terlebih dahulu"}
          allowClear
          size="large"
          disabled={!selectedSkpd}
          onChange={handleSatkerChange}
          fetchOptions={fetchSatkerOptions}
          debounceTimeout={500}
        />
      </Form.Item>

      <Form.Item
        name="id_bidang"
        label="Bidang"
      >
        <DebounceSelect
          placeholder={selectedSatker ? "Ketik untuk mencari Bidang..." : "Pilih Satker terlebih dahulu"}
          allowClear
          size="large"
          disabled={!selectedSatker}
          onChange={handleBidangChange}
          fetchOptions={fetchBidangOptions}
          debounceTimeout={500}
        />
      </Form.Item>

      <Form.Item
        name="status"
        label="Status Aktif"
        rules={[
          { required: true, message: 'Status wajib dipilih' }
        ]}
        help="Lokasi dapat digunakan untuk presensi"
      >
        <Select
          placeholder="Pilih status"
          size="large"
        >
          <Option value={true}>Aktif</Option>
          <Option value={false}>Tidak Aktif</Option>
        </Select>
      </Form.Item>
    </>
  );
};

export default LokasiForm;