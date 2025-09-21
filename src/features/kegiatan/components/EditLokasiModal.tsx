import React, { useState, useEffect } from 'react';
import DebounceSelect from '../../../components/DebounceSelect';
import { 
  Modal, 
  Form, 
  Button, 
  message, 
  Input,
  Tabs
} from 'antd';
import { EditOutlined, SearchOutlined } from '@ant-design/icons';
import { organizationApi, type SkpdData } from '../../lokasi/services/organizationApi';
import { kegiatanApi } from '../services/kegiatanApi';
import type { LokasiWithSkpd } from '../types';

interface EditLokasiModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  kegiatanId: number;
  currentLokasi: LokasiWithSkpd;
  existingLokasiIds: number[];
}

interface LokasiOption {
  lokasi_id: number;
  ket: string;
  lat: number;
  lng: number;
  status: boolean;
}

const { TabPane } = Tabs;

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
  const [activeTab, setActiveTab] = useState('location');
  
  // Location edit states
  const [selectedNewLokasiId, setSelectedNewLokasiId] = useState<number | null>(null);
  
  // SKPD edit states
  const [selectedSkpdCodes, setSelectedSkpdCodes] = useState<string[]>([]);
  const [skpdSearch, setSkpdSearch] = useState('');
  const [allSkpd, setAllSkpd] = useState<SkpdData[]>([]);
  const [isLoadingSkpdData, setIsLoadingSkpdData] = useState(false);

  useEffect(() => {
    if (visible && currentLokasi) {
      // Initialize SKPD selection with current SKPD
      setSelectedSkpdCodes(currentLokasi.skpd_list || []);
      loadSkpdData();
    }
  }, [visible, currentLokasi]);

  useEffect(() => {
    if (activeTab === 'skpd') {
      loadSkpdData();
    }
  }, [skpdSearch, activeTab]);

  const loadSkpdData = async () => {
    try {
      setIsLoadingSkpdData(true);
      const response = await organizationApi.searchSkpd(skpdSearch, 1, 100);
      setAllSkpd(response.data);
    } catch (error) {
      console.error('Error loading SKPD data:', error);
      message.error('Gagal memuat daftar SKPD');
    } finally {
      setIsLoadingSkpdData(false);
    }
  };

  const handleSkpdSearchChange = (value: string) => {
    setSkpdSearch(value);
  };

  const handleNewLokasiChange = (value: any) => {
    setSelectedNewLokasiId(value?.value || null);
    form.setFieldsValue({ new_lokasi_id: value?.value });
  };

  const handleSubmitLocationEdit = async () => {
    if (!selectedNewLokasiId) {
      message.error('Pilih lokasi baru terlebih dahulu');
      return;
    }

    try {
      setLoading(true);
      await kegiatanApi.editLokasiKegiatan(kegiatanId, currentLokasi.lokasi_id, selectedNewLokasiId);
      message.success('Lokasi berhasil diubah');
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

  const handleSubmitSkpdEdit = async () => {
    try {
      setLoading(true);
      await kegiatanApi.editSkpdKegiatanLokasi(kegiatanId, currentLokasi.lokasi_id, selectedSkpdCodes);
      message.success('Daftar SKPD berhasil diubah');
      onSuccess();
    } catch (error: any) {
      console.error('Error editing SKPD:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Gagal mengubah daftar SKPD');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (activeTab === 'location') {
      handleSubmitLocationEdit();
    } else {
      handleSubmitSkpdEdit();
    }
  };

  return (
    <Modal
      title={`Edit Lokasi: ${currentLokasi?.ket}`}
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
          icon={<EditOutlined />}
        >
          {activeTab === 'location' ? 'Ubah Lokasi' : 'Update SKPD'}
        </Button>
      ]}
      width={600}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Ganti Lokasi" key="location">
          <Form form={form} layout="vertical">
            <Form.Item
              label="Lokasi Saat Ini"
            >
              <Input 
                value={`${currentLokasi?.ket} (${currentLokasi?.lat?.toFixed(6)}, ${currentLokasi?.lng?.toFixed(6)})`}
                readOnly 
                style={{ backgroundColor: '#f5f5f5' }}
              />
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
                  const result = await import('../../lokasi/services/lokasiApi').then(mod => mod.lokasiApi.getAll({ limit: 100, search }));
                  return result.data
                    .filter((lokasi: LokasiOption) => 
                      !existingLokasiIds.includes(lokasi.lokasi_id) && 
                      lokasi.lokasi_id !== currentLokasi.lokasi_id
                    )
                    .map((lokasi: LokasiOption) => ({
                      label: `${lokasi.ket} (${lokasi.lat.toFixed(6)}, ${lokasi.lng.toFixed(6)})`,
                      value: lokasi.lokasi_id,
                      key: String(lokasi.lokasi_id),
                    }));
                }}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Form>
        </TabPane>

        <TabPane tab="Edit SKPD" key="skpd">
          <div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>
                Lokasi: {currentLokasi?.ket}
              </label>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <SearchOutlined style={{ fontSize: '16px', color: '#666' }} />
                <label style={{ fontSize: '14px', fontWeight: '500' }}>Pilih SKPD</label>
              </div>
              <Input
                placeholder="Cari SKPD..."
                value={skpdSearch}
                onChange={(e) => handleSkpdSearchChange(e.target.value)}
                style={{ width: '100%', marginBottom: '12px' }}
              />
              <div style={{ border: '1px solid #d9d9d9', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ maxHeight: '192px', overflowY: 'auto' }}>
                  {isLoadingSkpdData ? (
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
                          {skpdSearch ? 'Mencari SKPD...' : 'Memuat SKPD...'}
                        </span>
                      </div>
                    </div>
                  ) : allSkpd.length === 0 ? (
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      padding: '32px 0', 
                      textAlign: 'center' 
                    }}>
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏢</div>
                      <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                        {skpdSearch ? 'Tidak ada SKPD yang ditemukan' : 'Tidak ada SKPD tersedia'}
                      </p>
                    </div>
                  ) : (
                    allSkpd.map((skpd) => (
                      <div
                        key={skpd.KDSKPD}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px',
                          backgroundColor: selectedSkpdCodes.includes(skpd.KDSKPD) ? '#f5f5f5' : 'transparent',
                          borderBottom: '1px solid #f0f0f0',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onClick={() => {
                          if (selectedSkpdCodes.includes(skpd.KDSKPD)) {
                            setSelectedSkpdCodes(codes => codes.filter(code => code !== skpd.KDSKPD));
                          } else {
                            setSelectedSkpdCodes(codes => [...codes, skpd.KDSKPD]);
                          }
                        }}
                        onMouseEnter={(e) => {
                          if (!selectedSkpdCodes.includes(skpd.KDSKPD)) {
                            e.currentTarget.style.backgroundColor = '#fafafa';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!selectedSkpdCodes.includes(skpd.KDSKPD)) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px' }}>
                          <input
                            type="checkbox"
                            checked={selectedSkpdCodes.includes(skpd.KDSKPD)}
                            onChange={(e) => {
                              e.stopPropagation();
                              if (e.target.checked) {
                                setSelectedSkpdCodes(codes => [...codes, skpd.KDSKPD]);
                              } else {
                                setSelectedSkpdCodes(codes => codes.filter(code => code !== skpd.KDSKPD));
                              }
                            }}
                            style={{ borderRadius: '4px' }}
                          />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: '500', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {skpd.NMSKPD}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {skpd.KDSKPD} - {skpd.StatusSKPD}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>
                SKPD Terpilih ({selectedSkpdCodes.length} SKPD)
              </label>
              <Input 
                value={selectedSkpdCodes.join(', ')} 
                readOnly 
                placeholder="SKPD yang dipilih akan muncul di sini" 
                style={{ backgroundColor: '#f5f5f5' }}
              />
            </div>
          </div>
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default EditLokasiModal;