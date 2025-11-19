import React, { useState } from 'react';
import DebounceSelect from '../../../components/DebounceSelect';
import { 
  Modal, 
  Form, 
  Button, 
  message
} from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { lokasiKegiatanApi } from '../../lokasi/services/lokasiKegiatanApi';
import { kegiatanApi } from '../services/kegiatanApi';
import type { LokasiWithSatker } from '../types';

interface EditLokasiModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  kegiatanId: number;
  currentLokasi: LokasiWithSatker;
  existingLokasiIds: number[];
}

interface LokasiKegiatanOption {
  lokasi_id: number;
  ket: string;
  lat: number;
  lng: number;
  status: boolean;
}

const EditLokasiModal: React.FC<EditLokasiModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  kegiatanId,
  currentLokasi,
  existingLokasiIds
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedNewLokasiId, setSelectedNewLokasiId] = useState<number | null>(null);

  const handleNewLokasiChange = (value: any) => {
    setSelectedNewLokasiId(value?.value || null);
    form.setFieldsValue({ new_lokasi_id: value?.value });
  };

  const handleSubmit = async () => {
    if (!selectedNewLokasiId) {
      message.error('Pilih lokasi baru terlebih dahulu');
      return;
    }

    try {
      setLoading(true);
      await kegiatanApi.editLokasiKegiatan(kegiatanId, currentLokasi.lokasi_id, selectedNewLokasiId);
      message.success('Lokasi berhasil diubah');
      form.resetFields();
      setSelectedNewLokasiId(null);
      onSuccess();
    } catch (error: any) {
      console.error('Error editing location:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Gagal mengubah lokasi');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`Edit Lokasi: ${currentLokasi?.ket}`}
      open={visible}
      onCancel={() => {
        form.resetFields();
        setSelectedNewLokasiId(null);
        onCancel();
      }}
      footer={[
        <Button key="cancel" onClick={() => {
          form.resetFields();
          setSelectedNewLokasiId(null);
          onCancel();
        }}>
          Batal
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          loading={loading}
          onClick={handleSubmit}
          icon={<EditOutlined />}
        >
          Ubah Lokasi
        </Button>
      ]}
      width={600}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Lokasi Saat Ini"
        >
          <div style={{ 
            padding: '12px', 
            backgroundColor: '#f5f5f5', 
            borderRadius: '6px',
            border: '1px solid #d9d9d9'
          }}>
            <div style={{ fontWeight: '500', fontSize: '14px', marginBottom: '4px' }}>
              {currentLokasi?.ket}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {currentLokasi?.lat?.toFixed(6)}, {currentLokasi?.lng?.toFixed(6)} | Radius: {currentLokasi?.range}m
            </div>
          </div>
        </Form.Item>

        <Form.Item
          name="new_lokasi_id"
          label="Pilih Lokasi Baru"
          rules={[{ required: true, message: 'Lokasi baru wajib dipilih' }]}
        >
          <DebounceSelect
            placeholder="Pilih lokasi baru..."
            optionFilterProp="label"
            onChange={handleNewLokasiChange}
            fetchOptions={async (search) => {
              try {
                const result = await lokasiKegiatanApi.getAll({ limit: 100, search });
                const lokasiData = result?.data || [];
                return lokasiData
                  .filter((lokasi: LokasiKegiatanOption) => 
                    !existingLokasiIds.includes(lokasi.lokasi_id) && 
                    lokasi.lokasi_id !== currentLokasi.lokasi_id
                  )
                  .map((lokasi: LokasiKegiatanOption) => ({
                    label: `${lokasi.ket} (${lokasi.lat.toFixed(6)}, ${lokasi.lng.toFixed(6)})`,
                    value: lokasi.lokasi_id,
                    key: String(lokasi.lokasi_id),
                  }));
              } catch (error) {
                console.error('Error fetching lokasi kegiatan:', error);
                return [];
              }
            }}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <div style={{ 
          padding: '12px', 
          backgroundColor: '#fff7e6', 
          border: '1px solid #ffd591', 
          borderRadius: '6px',
          marginTop: '16px'
        }}>
          <div style={{ fontSize: '13px', color: '#ad6800', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>ℹ️</span>
            <div>
              <strong>Catatan:</strong> Mengganti lokasi tidak akan mempengaruhi grup peserta yang sudah dibuat. 
              Grup peserta tetap terkait dengan lokasi yang baru dipilih.
            </div>
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default EditLokasiModal;