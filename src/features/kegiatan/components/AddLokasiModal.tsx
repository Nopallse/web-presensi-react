import React, { useState } from 'react';
import DebounceSelect from '../../../components/DebounceSelect';
import { 
  Modal, 
  Form, 
  Button, 
  message, 
  Alert
} from 'antd';
import { PlusOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { lokasiKegiatanApi } from '../../lokasi/services/lokasiKegiatanApi';

interface AddLokasiModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  kegiatanId: number;
  existingLokasiIds: number[];
  onAddLokasi: (data: { lokasi_id: number; kdsatker_list?: string[]; nip_list?: string[] }) => Promise<any>;
}

interface LokasiKegiatanOption {
  lokasi_id: number;
  ket: string;
  lat: number;
  lng: number;
  status: boolean;
}

const AddLokasiModal: React.FC<AddLokasiModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  kegiatanId: _kegiatanId,
  existingLokasiIds,
  onAddLokasi
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleLokasiChange = (value: any) => {
    form.setFieldsValue({ lokasi_id: value?.value });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // Hanya tambahkan lokasi, tanpa peserta
      // Peserta akan ditambahkan melalui grup peserta setelah lokasi dibuat
      await onAddLokasi({
        lokasi_id: values.lokasi_id,
        kdsatker_list: [], // Kosongkan untuk flow baru
        nip_list: [] // Kosongkan untuk flow baru
      });
      
      form.resetFields();
      onSuccess();
    } catch (error: any) {
      console.error('Error adding lokasi:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Gagal menambahkan lokasi');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Tambah Lokasi ke Kegiatan"
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Batal
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          loading={loading}
          onClick={handleSubmit}
          icon={<PlusOutlined />}
        >
          Tambah Lokasi
        </Button>
      ]}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Alert
          message="Flow Baru: Grup Peserta"
          description={
            <div>
              <p style={{ marginBottom: 8 }}>
                Dengan flow baru, setelah lokasi ditambahkan, Anda perlu membuat <strong>Grup Peserta</strong> terlebih dahulu untuk lokasi tersebut.
              </p>
              <p style={{ margin: 0 }}>
                Setelah grup peserta dibuat, Anda dapat menambahkan peserta ke dalam grup tersebut (melalui OPD, manual, atau import Excel).
              </p>
            </div>
          }
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          style={{ marginBottom: 24 }}
        />

        <Form.Item
          name="lokasi_id"
          label="Pilih Lokasi"
          rules={[{ required: true, message: 'Lokasi wajib dipilih' }]}
        >
          <DebounceSelect
            placeholder="Pilih lokasi..."
            optionFilterProp="label"
            onChange={handleLokasiChange}
            fetchOptions={async (search) => {
              try {
                const result = await lokasiKegiatanApi.getAll({ limit: 100, search });
                const lokasiData = result?.data || [];
                return lokasiData
                  .filter((lokasi: LokasiKegiatanOption) => !existingLokasiIds.includes(lokasi.lokasi_id))
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
      </Form>
    </Modal>
  );
};

export default AddLokasiModal;