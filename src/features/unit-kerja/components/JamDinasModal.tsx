import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, message, Spin } from 'antd';
import { apiClient } from '../../../services/apiService';

interface JamDinasModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  idSatker: string;
  idBidang?: string;
  existingAssignment?: any;
}

interface JamDinas {
  id: number;
  nama: string;
  hari_kerja: number;
  menit: number;
  status: number;
}

const JamDinasModal: React.FC<JamDinasModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  idSatker,
  idBidang,
  existingAssignment
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [jamDinasList, setJamDinasList] = useState<JamDinas[]>([]);
  const [fetchingJamDinas, setFetchingJamDinas] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchJamDinasList();
      
      if (existingAssignment) {
        form.setFieldsValue({
          idJamDinas: existingAssignment.jamDinas.id
        });
      } else {
        form.resetFields();
      }
    } else {
      form.resetFields();
    }
  }, [visible, existingAssignment, form, idBidang]);

  const fetchJamDinasList = async () => {
    try {
      setFetchingJamDinas(true);
      const response = await apiClient.get('/admin/jam-dinas', {
        params: { limit: 100 } // Get all jam dinas for dropdown
      });
      setJamDinasList(response.data.data || []);
    } catch (error) {
      console.error('Error fetching jam dinas list:', error);
      message.error('Gagal memuat daftar jam dinas');
    } finally {
      setFetchingJamDinas(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const endpoint = idBidang 
        ? `/unit-kerja/${idSatker}/${idBidang}/jam-dinas`
        : `/unit-kerja/${idSatker}/jam-dinas`;

      // Hanya kirim idJamDinas, assignmentName akan otomatis di backend
      await apiClient.post(endpoint, { idJamDinas: values.idJamDinas });

      message.success(
        existingAssignment 
          ? 'Jam dinas berhasil diupdate' 
          : 'Jam dinas berhasil diassign'
      );
      
      onSuccess();
    } catch (error: any) {
      console.error('Error assigning jam dinas:', error);
      message.error(error.response?.data?.error || 'Gagal menyimpan jam dinas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={existingAssignment ? 'Edit Jam Dinas' : 'Tambah Jam Dinas'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText={existingAssignment ? 'Update' : 'Simpan'}
      cancelText="Batal"
      width={500}
    >
      <Spin spinning={fetchingJamDinas} tip="Memuat daftar jam dinas...">
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: '20px' }}
        >
          <Form.Item
            name="idJamDinas"
            label="Pilih Jam Dinas"
            rules={[{ required: true, message: 'Pilih jam dinas terlebih dahulu' }]}
          >
            <Select
              placeholder="Pilih jam dinas"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={jamDinasList.map(jd => ({
                value: jd.id,
                label: `${jd.nama} (${jd.hari_kerja} hari kerja)`,
                description: `${jd.menit} menit`
              }))}
              optionRender={(option) => (
                <div>
                  <div style={{ fontWeight: 500 }}>{option.label}</div>
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    {option.data.description}
                  </div>
                </div>
              )}
            />
          </Form.Item>

          <div style={{ 
            padding: '12px', 
            backgroundColor: '#f0f9ff', 
            borderRadius: '6px',
            fontSize: '12px',
            color: '#0369a1',
            lineHeight: '1.5'
          }}>
            <strong>Catatan:</strong> Jam dinas yang diassign akan diterapkan untuk{' '}
            {idBidang ? 'bidang ini' : 'satker ini'}. 
            {!idBidang && ' Semua bidang akan mengikuti jam dinas satker kecuali jika diatur khusus.'}
            <br />
            <strong>Nama assignment</strong> akan otomatis menggunakan nama satker.
          </div>
        </Form>
      </Spin>
    </Modal>
  );
};

export default JamDinasModal;
