import React, { useState, useEffect } from 'react';
import DebounceSelect from '../../../components/DebounceSelect';
import { 
  Modal, 
  Form, 
  Button, 
  message, 
  Input
} from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { organizationApi, type SatkerData } from '../../lokasi/services/organizationApi';
import { lokasiKegiatanApi } from '../../lokasi/services/lokasiKegiatanApi';

interface AddLokasiModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  kegiatanId: number;
  existingLokasiIds: number[];
  onAddLokasi: (data: { lokasi_id: number; kdsatker_list: string[] }) => Promise<void>;
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
  kegiatanId: _kegiatanId, // Used by parent component for API calls
  existingLokasiIds,
  onAddLokasi
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedLokasiId, setSelectedLokasiId] = useState<number | null>(null);
  const [selectedSatkerCodes, setSelectedSatkerCodes] = useState<string[]>([]);
  const [satkerSearch, setSatkerSearch] = useState('');
  const [allSatker, setAllSatker] = useState<SatkerData[]>([]);
  const [isLoadingSatkerData, setIsLoadingSatkerData] = useState(false);

  // Load Satker data when modal is visible
  useEffect(() => {
    if (visible) {
      loadSatkerData();
    }
  }, [visible]);

  // Load Satker data with search
  useEffect(() => {
    if (selectedLokasiId) {
      loadSatkerData();
    }
  }, [satkerSearch, selectedLokasiId]);

  const loadSatkerData = async () => {
    try {
      setIsLoadingSatkerData(true);
      const response = await organizationApi.getAllSatker(satkerSearch, 1, 100);
      console.log('Satker API Response:', response);
      setAllSatker(response?.data || []);
    } catch (error) {
      console.error('Error loading Satker data:', error);
      message.error('Gagal memuat daftar Satker');
      setAllSatker([]);
    } finally {
      setIsLoadingSatkerData(false);
    }
  };

  const handleSatkerSearchChange = (value: string) => {
    setSatkerSearch(value);
  };

  const handleLokasiChange = (value: any) => {
    setSelectedLokasiId(value?.value || null);
    setSelectedSatkerCodes([]);
    form.setFieldsValue({ lokasi_id: value?.value, kdsatker_list: [] });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      await onAddLokasi({
        lokasi_id: values.lokasi_id,
        kdsatker_list: selectedSatkerCodes
      });
      
      message.success('Lokasi berhasil ditambahkan');
      form.resetFields();
      setSelectedLokasiId(null);
      setSelectedSatkerCodes([]);
      setSatkerSearch('');
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

  return (
    <Modal
      title="Tambah Lokasi ke Kegiatan"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
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
        initialValues={{
          kdskpd_list: []
        }}
      >
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
                console.log('Lokasi Kegiatan API Response:', result);
                const lokasiData = result?.data || [];
                console.log('Lokasi Data:', lokasiData);
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

        {selectedLokasiId && (
          <div style={{ marginBottom: '24px' }}>
            {/* Pilih Satker */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <SearchOutlined style={{ fontSize: '16px', color: '#666' }} />
                <label style={{ fontSize: '14px', fontWeight: '500' }}>Pilih Satker</label>
              </div>
              <Input
                placeholder="Cari Satker..."
                value={satkerSearch}
                onChange={(e) => handleSatkerSearchChange(e.target.value)}
                style={{ width: '100%', marginBottom: '12px' }}
              />
              <div style={{ border: '1px solid #d9d9d9', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ maxHeight: '192px', overflowY: 'auto' }}>
                  {isLoadingSatkerData ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666' }}>
                        <div style={{ 
                          height: '16px', 
                          width: '16px', 
                          animation: 'spin 1s linear infinite', 
                          borderRadius: '50%', 
                          border: '2px solid currentColor', 
                          borderTopColor: 'transparent' 
                        }}></div>
                        <span style={{ fontSize: '14px' }}>
                          {satkerSearch ? 'Mencari Satker...' : 'Memuat Satker...'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    (() => {
                      const availableSatker = (allSatker || []).filter(satker => !selectedSatkerCodes.includes(satker.KDSATKER));
                      return availableSatker.length === 0 ? (
                        <div style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          padding: '32px 0', 
                          textAlign: 'center' 
                        }}>
                          <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                            {selectedSatkerCodes.length > 0 ? '✅' : '🏢'}
                          </div>
                          <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                            {selectedSatkerCodes.length > 0 
                              ? 'Semua Satker sudah dipilih' 
                              : satkerSearch 
                                ? 'Tidak ada Satker yang ditemukan' 
                                : 'Tidak ada Satker tersedia'
                            }
                          </p>
                        </div>
                      ) : (
                        availableSatker.map((satker) => (
                          <div
                            key={satker.KDSATKER}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '12px',
                              borderBottom: '1px solid #f0f0f0',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s'
                            }}
                            onClick={() => {
                              setSelectedSatkerCodes(codes => [...codes, satker.KDSATKER]);
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f0f9ff';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              width: '24px', 
                              height: '24px',
                              borderRadius: '4px',
                              backgroundColor: '#1890ff',
                              color: 'white',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}>
                              +
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: '500', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {satker.NMSATKER}
                              </div>
                              <div style={{ fontSize: '12px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {satker.KDSATKER} - {satker.JENIS_JABATAN}
                              </div>
                            </div>
                          </div>
                        ))
                      );
                    })()
                  )}
                </div>
              </div>
            </div>

            {/* Satker Terpilih */}
            <div>
              <label style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>
                Satker Terpilih ({selectedSatkerCodes.length} Satker)
              </label>
              <div style={{ border: '1px solid #d9d9d9', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ maxHeight: '192px', overflowY: 'auto' }}>
                  {selectedSatkerCodes.length === 0 ? (
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      padding: '32px 0', 
                      textAlign: 'center' 
                    }}>
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>📋</div>
                      <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                        Belum ada Satker yang dipilih
                      </p>
                    </div>
                  ) : (
                    selectedSatkerCodes.map((code) => {
                      const satker = (allSatker || []).find(s => s.KDSATKER === code);
                      return satker ? (
                        <div
                          key={code}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px',
                            backgroundColor: '#f6ffed',
                            borderBottom: '1px solid #f0f0f0',
                            borderLeft: '4px solid #52c41a'
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: '500', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {satker.NMSATKER}
                            </div>
                            <div style={{ fontSize: '12px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {satker.KDSATKER} - {satker.JENIS_JABATAN}
                            </div>
                          </div>
                          <div 
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              width: '24px', 
                              height: '24px',
                              borderRadius: '4px',
                              backgroundColor: '#ff4d4f',
                              color: 'white',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onClick={() => {
                              setSelectedSatkerCodes(codes => codes.filter(c => c !== code));
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#ff7875';
                              e.currentTarget.style.transform = 'scale(1.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#ff4d4f';
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                            title="Hapus dari daftar"
                          >
                            ×
                          </div>
                        </div>
                      ) : null;
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <Form.Item
          name="kdsatker_list"
          help={selectedSatkerCodes.length > 0 ? `${selectedSatkerCodes.length} Satker terpilih` : 'Pilih lokasi terlebih dahulu untuk memilih Satker'}
          style={{ display: 'none' }}
        >
          <Input 
            value={selectedSatkerCodes.join(', ')} 
            readOnly 
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddLokasiModal;