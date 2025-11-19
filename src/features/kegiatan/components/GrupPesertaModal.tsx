import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  message,
  Tag
} from 'antd';
import { kegiatanApi } from '../services/kegiatanApi';
import type {
  GrupPesertaKegiatan,
  CreateGrupPesertaRequest,
  UpdateGrupPesertaRequest,
  LokasiWithSatker
} from '../types';
import { JENIS_GRUP_OPTIONS } from '../types';
import DebounceSelect from '../../../components/DebounceSelect';
import { apiClient } from '../../../services/apiService';

const { TextArea } = Input;
const { Option } = Select;

interface GrupPesertaModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  kegiatanId: number;
  lokasiId?: number; // Optional untuk backward compatibility
  lokasiList?: LokasiWithSatker[]; // List lokasi yang tersedia untuk dipilih
  editingGrup?: GrupPesertaKegiatan | null;
}

const GrupPesertaModal: React.FC<GrupPesertaModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  kegiatanId,
  lokasiId,
  lokasiList = [],
  editingGrup
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [jenisGrup, setJenisGrup] = useState<'opd' | 'khusus'>('khusus');
  const [selectedSatkerName, setSelectedSatkerName] = useState<string>('');
  
  // Field lokasi selalu muncul saat membuat grup baru (bukan saat edit)
  const showLokasiField = !editingGrup;

  useEffect(() => {
    if (visible) {
      if (editingGrup) {
        form.setFieldsValue({
          nama_grup: editingGrup.nama_grup,
          jenis_grup: editingGrup.jenis_grup,
          keterangan: editingGrup.keterangan
        });
        setJenisGrup(editingGrup.jenis_grup);
        
        // Jika editing grup OPD, set nama satker dan format id_satker untuk DebounceSelect
        if (editingGrup.jenis_grup === 'opd' && editingGrup.id_satker) {
          // Fetch nama satker untuk placeholder dan format id_satker
          fetchSatkerOptions(editingGrup.id_satker).then(options => {
            const satkerOption = options.find(opt => opt.value === editingGrup.id_satker);
            if (satkerOption) {
              const satkerName = satkerOption.label.split(' - ')[1] || editingGrup.id_satker || '';
              setSelectedSatkerName(satkerName);
              // Set id_satker dalam format object untuk DebounceSelect
              form.setFieldsValue({
                id_satker: {
                  label: satkerOption.label,
                  value: satkerOption.value
                }
              });
            }
          }).catch(() => {
            // Ignore error
          });
        }
      } else {
        form.resetFields();
        setJenisGrup('khusus');
        setSelectedSatkerName('');
        // Set default lokasi jika single lokasi mode (backward compatibility)
        if (lokasiId && lokasiList.length === 0) {
          form.setFieldsValue({ lokasi_ids: [lokasiId] });
        }
      }
    }
  }, [visible, editingGrup, form, lokasiId, lokasiList]);

  const handleJenisGrupChange = (value: 'opd' | 'khusus') => {
    setJenisGrup(value);
    if (value === 'khusus') {
      form.setFieldsValue({ id_satker: undefined, nama_grup: undefined });
      setSelectedSatkerName('');
    }
  };

  const handleSatkerChange = async (value: any) => {
    const satkerCode = value?.value || value;
    if (satkerCode) {
      try {
        // Ambil nama satker dari options yang sudah di-fetch
        // Atau fetch detail satker untuk mendapatkan nama lengkap
        const response = await apiClient.get<{ data: Array<{ KDSATKER: string; NMSATKER: string }> }>(`/unit-kerja/options?search=${satkerCode}&limit=100`);
        const satkerList = response.data.data || [];
        const satker = satkerList.find(s => s.KDSATKER === satkerCode);
        
        if (satker) {
          const satkerName = satker.NMSATKER || '';
          setSelectedSatkerName(satkerName);
          // Set nama grup dengan nama satker sebagai default value
          const currentNamaGrup = form.getFieldValue('nama_grup');
          // Jika nama grup kosong atau sama dengan nama satker sebelumnya, update dengan nama satker baru
          if (!currentNamaGrup || currentNamaGrup === selectedSatkerName) {
            form.setFieldsValue({ nama_grup: satkerName });
          }
        }
      } catch (error) {
        console.error('Error fetching satker name:', error);
      }
    } else {
      // Jika satker dihapus, hapus juga nama grup jika masih sesuai dengan satker sebelumnya
      const currentNamaGrup = form.getFieldValue('nama_grup');
      if (currentNamaGrup === selectedSatkerName) {
        form.setFieldsValue({ nama_grup: undefined });
      }
      setSelectedSatkerName('');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (editingGrup) {
        // Update grup
        const updateData: UpdateGrupPesertaRequest = {
          nama_grup: values.nama_grup,
          keterangan: values.keterangan
        };
        await kegiatanApi.updateGrupPeserta(editingGrup.id_grup_peserta, updateData);
        message.success('Grup peserta berhasil diupdate');
      } else {
        // Create grup
        // Extract value dari id_satker jika berupa object (dari DebounceSelect dengan labelInValue)
        const idSatkerValue = values.id_satker?.value || values.id_satker;
        
        // Ambil lokasi_ids dari form (multiple lokasi) atau gunakan lokasiId (single lokasi)
        const lokasiIds = values.lokasi_ids || (lokasiId ? [lokasiId] : []);
        
        if (!lokasiIds || lokasiIds.length === 0) {
          message.error('Minimal 1 lokasi harus dipilih');
          setLoading(false);
          return;
        }
        
        const createData: CreateGrupPesertaRequest & { lokasi_ids?: number[] } = {
          nama_grup: values.nama_grup,
          jenis_grup: values.jenis_grup,
          id_satker: values.jenis_grup === 'opd' ? idSatkerValue : undefined,
          keterangan: values.keterangan,
          lokasi_ids: lokasiIds
        };
        await kegiatanApi.createGrupPeserta(kegiatanId, createData);
        message.success(`Grup peserta berhasil dibuat untuk ${lokasiIds.length} lokasi`);
      }

      form.resetFields();
      setJenisGrup('khusus');
      setSelectedSatkerName('');
      onSuccess();
    } catch (error: any) {
      console.error('Error saving grup:', error);
      message.error(error?.response?.data?.error || error?.message || 'Gagal menyimpan grup peserta');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setJenisGrup('khusus');
    setSelectedSatkerName('');
    onCancel();
  };

  // Fetch satker options for DebounceSelect
  const fetchSatkerOptions = async (search: string) => {
    try {
      // Gunakan endpoint /unit-kerja/options yang mengembalikan satker
      const params = new URLSearchParams();
      params.append('page', '1');
      params.append('limit', '100');
      if (search && search.trim()) {
        params.append('search', search.trim());
      }
      
      const queryString = params.toString();
      const url = `/unit-kerja/options${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiClient.get<{ data: Array<{ KDSATKER: string; NMSATKER: string }> }>(url);
      const satkerList = response.data.data || [];
      
      return satkerList.map((satker) => ({
        label: `${satker.KDSATKER} - ${satker.NMSATKER}`,
        value: satker.KDSATKER,
        key: satker.KDSATKER
      }));
    } catch (error) {
      console.error('Error fetching satker:', error);
      return [];
    }
  };

  return (
    <Modal
      title={editingGrup ? 'Edit Grup Peserta' : 'Tambah Grup Peserta'}
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Batal
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          {editingGrup ? 'Update' : 'Simpan'}
        </Button>
      ]}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          jenis_grup: 'khusus'
        }}
      >
        <Form.Item
          name="nama_grup"
          label="Nama Grup"
          rules={[{ required: true, message: 'Nama grup wajib diisi' }]}
        >
          <Input 
            placeholder={
              jenisGrup === 'opd' && selectedSatkerName
                ? selectedSatkerName
                : 'Contoh: OPD Dinas Pendidikan, Pejabat Eselon 2'
            }
          />
        </Form.Item>

        <Form.Item
          name="jenis_grup"
          label="Jenis Grup"
          rules={[{ required: true, message: 'Jenis grup wajib dipilih' }]}
        >
          <Select
            onChange={handleJenisGrupChange}
            disabled={!!editingGrup} // Disable edit jenis grup setelah dibuat
          >
            {JENIS_GRUP_OPTIONS.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {showLokasiField && (
          <Form.Item
            name="lokasi_ids"
            label="Lokasi"
            rules={[{ required: true, message: 'Minimal 1 lokasi harus dipilih' }]}
          >
            <Select
              mode="multiple"
              placeholder={lokasiList.length > 0 ? "Pilih lokasi (bisa lebih dari 1)" : "Memuat lokasi..."}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={lokasiList.map(lokasi => ({
                label: lokasi.ket,
                value: lokasi.lokasi_id
              }))}
              disabled={lokasiList.length === 0}
              notFoundContent={lokasiList.length === 0 ? "Memuat lokasi..." : "Tidak ada lokasi"}
            />
          </Form.Item>
        )}

        {jenisGrup === 'opd' && !editingGrup && (
          <Form.Item
            name="id_satker"
            label="Pilih OPD/Satker"
            rules={[{ required: true, message: 'OPD/Satker wajib dipilih untuk grup OPD' }]}
          >
            <DebounceSelect
              placeholder="Cari OPD/Satker..."
              fetchOptions={fetchSatkerOptions}
              onChange={handleSatkerChange}
              style={{ width: '100%' }}
              allowClear
              showSearch
            />
          </Form.Item>
        )}

        {editingGrup && editingGrup.jenis_grup === 'opd' && editingGrup.id_satker && (
          <Form.Item label="OPD/Satker">
            <Tag color="blue">{editingGrup.id_satker}</Tag>
          </Form.Item>
        )}

        <Form.Item
          name="keterangan"
          label="Keterangan"
        >
          <TextArea
            rows={3}
            placeholder="Keterangan tambahan (opsional)"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default GrupPesertaModal;

