import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Card, Row, Col, message, Spin } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { kegiatanApi } from '../services/kegiatanApi';
import KegiatanForm from '../components/KegiatanForm';
import type { JadwalKegiatan, JadwalKegiatanFormData } from '../types';

const KegiatanEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [kegiatan, setKegiatan] = useState<JadwalKegiatan | null>(null);

  useEffect(() => {
    if (id) {
      fetchKegiatanDetail(parseInt(id));
    }
  }, [id]);

  const fetchKegiatanDetail = async (kegiatanId: number) => {
    try {
      setLoadingData(true);
      const response = await kegiatanApi.getById(kegiatanId);
      const kegiatanData = response.data;
      setKegiatan(kegiatanData);
      
      // Set form values
      const formValues = {
        tanggal_kegiatan: kegiatanData.tanggal_kegiatan ? dayjs(kegiatanData.tanggal_kegiatan) : undefined,
        jenis_kegiatan: kegiatanData.jenis_kegiatan,
        keterangan: kegiatanData.keterangan,
        jam_mulai: kegiatanData.jam_mulai ? dayjs(`2000-01-01T${kegiatanData.jam_mulai}`) : undefined,
        jam_selesai: kegiatanData.jam_selesai ? dayjs(`2000-01-01T${kegiatanData.jam_selesai}`) : undefined,
        include_absen: kegiatanData.include_absen || 'none',
        dispensasi_keterlambatan: kegiatanData.dispensasi_keterlambatan
      };
      
      console.log('Setting form values:', formValues);
      form.setFieldsValue(formValues);
    } catch (error: any) {
      console.error('Error fetching kegiatan detail:', error);
      message.error('Gagal memuat data kegiatan');
      navigate('/kegiatan');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async () => {
    if (!kegiatan) return;
    
    try {
      setLoading(true);
      
      // Get current form values directly
      const values = form.getFieldsValue();
      
      // Validate fields
      await form.validateFields();
      
      console.log('Form values before processing:', values);
      
      const formData: Partial<JadwalKegiatanFormData> = {
        tanggal_kegiatan: dayjs.isDayjs(values.tanggal_kegiatan) 
          ? values.tanggal_kegiatan.format('YYYY-MM-DD') 
          : values.tanggal_kegiatan,
        jenis_kegiatan: values.jenis_kegiatan,
        keterangan: values.keterangan,
        jam_mulai: values.jam_mulai ? dayjs(values.jam_mulai).format('HH:mm:ss') : undefined,
        jam_selesai: values.jam_selesai ? dayjs(values.jam_selesai).format('HH:mm:ss') : undefined,
        include_absen: values.include_absen || 'none',
        dispensasi_keterlambatan: values.dispensasi_keterlambatan !== undefined ? values.dispensasi_keterlambatan : null
      };

      console.log('Form data to send:', formData);

      await kegiatanApi.update(kegiatan.id_kegiatan, formData);
      message.success('Kegiatan berhasil diperbarui');
      navigate(`/kegiatan/${kegiatan.id_kegiatan}`);
    } catch (error: any) {
      console.error('Error updating kegiatan:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else if (error.response?.data?.error) {
        message.error(error.response.data.error);
      } else {
        message.error('Gagal memperbarui kegiatan');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (kegiatan) {
      navigate(`/kegiatan/${kegiatan.id_kegiatan}`);
    } else {
      navigate('/kegiatan');
    }
  };

  if (loadingData) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (!kegiatan) {
    return (
      <div className="text-center py-8">
        <p>Kegiatan tidak ditemukan</p>
        <Button onClick={() => navigate('/kegiatan')}>
          Kembali ke Daftar Kegiatan
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
              Edit Kegiatan
            </h1>
            <p style={{ color: '#666', margin: 0 }}>
              Edit informasi kegiatan
            </p>
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ marginTop: '24px' }}
      >
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card title="Informasi Kegiatan" style={{ height: '100%' }}>
              <KegiatanForm 
                form={form} 
                initialValues={undefined}
              />
              
              <div style={{ 
                marginTop: 32, 
                display: 'flex', 
                gap: 12, 
                justifyContent: 'flex-end',
                borderTop: '1px solid #f0f0f0',
                paddingTop: 16
              }}>
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={handleCancel}
                  size="large"
                >
                  Kembali
                </Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={loading}
                  onClick={handleSubmit}
                  size="large"
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

export default KegiatanEdit;