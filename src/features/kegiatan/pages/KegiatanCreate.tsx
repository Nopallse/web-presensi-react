import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Card, message } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { kegiatanApi } from '../services/kegiatanApi';
import KegiatanForm from '../components/KegiatanForm';
import type { JadwalKegiatanFormData } from '../types';

const KegiatanCreate: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const formData: JadwalKegiatanFormData = {
        tanggal_kegiatan: values.tanggal_kegiatan,
        jenis_kegiatan: values.jenis_kegiatan,
        keterangan: values.keterangan
      };

      await kegiatanApi.create(formData);
      message.success('Kegiatan berhasil ditambahkan');
      navigate('/kegiatan');
    } catch (error: any) {
      console.error('Error creating kegiatan:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else if (error.response?.data?.error) {
        message.error(error.response.data.error);
      } else {
        message.error('Gagal menambahkan kegiatan');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/kegiatan');
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        marginBottom: '24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleCancel}
          >
            Kembali
          </Button>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
              Tambah Kegiatan
            </h1>
            <p style={{ color: '#666', margin: 0 }}>
              Tambah jadwal kegiatan baru
            </p>
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          jenis_kegiatan: '',
        }}
      >
        <Card title="Informasi Kegiatan">
          <KegiatanForm form={form} />
          
          <div style={{ 
            marginTop: 32, 
            display: 'flex', 
            gap: 12, 
            justifyContent: 'flex-end',
            borderTop: '1px solid #f0f0f0',
            paddingTop: 16
          }}>
            <Button
              onClick={handleCancel}
              size="large"
            >
              Batal
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={loading}
              onClick={handleSubmit}
              size="large"
            >
              Simpan Kegiatan
            </Button>
          </div>
        </Card>
      </Form>
    </div>
  );
};

export default KegiatanCreate;