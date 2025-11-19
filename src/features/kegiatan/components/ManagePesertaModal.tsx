import React, { useState, useEffect } from 'react';
import {
  Modal,
  Button,
  Table,
  Space,
  message,
  Popconfirm,
  Tag,
  Input,
  Tabs,
  Typography,
  Select,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  EditOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { kegiatanApi } from '../services/kegiatanApi';
import { lokasiKegiatanApi } from '../../lokasi/services/lokasiKegiatanApi';
import type { GrupPesertaKegiatan, PesertaGrupKegiatan } from '../types';
import { pegawaiApi } from '../../pegawai/services/pegawaiApi';
import type { Pegawai } from '../../pegawai/types';
import DebounceSelect from '../../../components/DebounceSelect';

const { Search } = Input;
const { TabPane } = Tabs;
const { Text } = Typography;
const { Option } = Select;

interface ManagePesertaModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  grup: GrupPesertaKegiatan | null;
  onImportClick: () => void;
  kegiatanId?: number;
}

type PesertaGrupKegiatanWithHistory = PesertaGrupKegiatan & {
  NM_UNIT_KERJA?: string | null;
  KDSATKER?: string | null;
  BIDANGF?: string | null;
  SUBF?: string | null;
  nama_jabatan?: string | null;
};

const ManagePesertaModal: React.FC<ManagePesertaModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  grup,
  onImportClick,
  kegiatanId
}) => {
  const [pesertaList, setPesertaList] = useState<PesertaGrupKegiatanWithHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'lokasi'>('list');
  const [searchText, setSearchText] = useState('');
  
  // State untuk lokasi
  const [grupLokasiList, setGrupLokasiList] = useState<any[]>([]);
  const [allLokasiList, setAllLokasiList] = useState<any[]>([]);
  const [loadingLokasi, setLoadingLokasi] = useState(false);
  const [editingLokasiId, setEditingLokasiId] = useState<number | null>(null);
  const [newLokasiId, setNewLokasiId] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (visible && grup) {
      fetchPesertaList();
      fetchGrupLokasi();
      fetchAllLokasi();
    }
  }, [visible, grup]);

  const fetchPesertaList = async () => {
    if (!grup) return;

    try {
      setLoading(true);
      const response = await kegiatanApi.getPesertaGrup(grup.id_grup_peserta);
      if (response.success && response.data) {
        setPesertaList(response.data.peserta || []);
      }
    } catch (error: any) {
      console.error('Error fetching peserta:', error);
      message.error('Gagal memuat daftar peserta');
    } finally {
      setLoading(false);
    }
  };

  const fetchGrupLokasi = async () => {
    if (!grup || !kegiatanId) return;

    try {
      setLoadingLokasi(true);
      // Ambil semua grup dengan nama yang sama untuk kegiatan ini
      const response = await kegiatanApi.getAllGrupPeserta(kegiatanId);
      if (response.success && response.data) {
        // Filter grup dengan nama yang sama
        const sameNameGroups = response.data.filter((g: any) => 
          g.nama_grup === grup.nama_grup && g.jenis_grup === grup.jenis_grup
        );
        setGrupLokasiList(sameNameGroups);
      }
    } catch (error: any) {
      console.error('Error fetching grup lokasi:', error);
      message.error('Gagal memuat daftar lokasi grup');
    } finally {
      setLoadingLokasi(false);
    }
  };

  const fetchAllLokasi = async () => {
    try {
      const response = await lokasiKegiatanApi.getAll({ page: 1, limit: 1000 });
      if (response.data) {
        setAllLokasiList(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching all lokasi:', error);
    }
  };

  const handleAddLokasi = async () => {
    if (!grup || !kegiatanId || !newLokasiId) {
      message.warning('Pilih lokasi terlebih dahulu');
      return;
    }

    // Cek apakah lokasi sudah ada
    const existingLokasi = grupLokasiList.find((g: any) => g.lokasi_id === newLokasiId);
    if (existingLokasi) {
      message.warning('Lokasi ini sudah ada untuk grup ini');
      return;
    }

    try {
      setActionLoading(true);
      // Buat grup baru dengan nama yang sama di lokasi baru
      await kegiatanApi.createGrupPeserta(kegiatanId, {
        nama_grup: grup.nama_grup,
        jenis_grup: grup.jenis_grup,
        id_satker: grup.id_satker || undefined,
        keterangan: grup.keterangan || undefined,
        lokasi_ids: [newLokasiId]
      });
      message.success('Lokasi berhasil ditambahkan');
      setNewLokasiId(undefined);
      await fetchGrupLokasi();
      onSuccess();
    } catch (error: any) {
      console.error('Error adding lokasi:', error);
      message.error(error?.response?.data?.error || 'Gagal menambahkan lokasi');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditLokasi = async (grupId: number) => {
    if (!kegiatanId || !newLokasiId || !grup) {
      message.warning('Pilih lokasi baru terlebih dahulu');
      return;
    }

    // Cek apakah lokasi baru sudah ada
    const existingLokasi = grupLokasiList.find((g: any) => 
      g.lokasi_id === newLokasiId && g.id_grup_peserta !== grupId
    );
    if (existingLokasi) {
      message.warning('Lokasi ini sudah ada untuk grup ini');
      return;
    }

    try {
      setActionLoading(true);
      // Karena updateGrupPeserta tidak support lokasi_id, gunakan cara: hapus grup lama dan buat grup baru di lokasi baru
      // Tapi perlu copy semua peserta dari grup lama ke grup baru
      
      // 1. Ambil semua peserta dari grup lama
      const pesertaResponse = await kegiatanApi.getPesertaGrup(grupId);
      const pesertaList = pesertaResponse.success && pesertaResponse.data?.peserta 
        ? pesertaResponse.data.peserta.map((p: any) => p.nip)
        : [];
      
      // 2. Hapus grup lama
      await kegiatanApi.deleteGrupPeserta(grupId);
      
      // 3. Buat grup baru dengan nama yang sama di lokasi baru
      const createResponse = await kegiatanApi.createGrupPeserta(kegiatanId, {
        nama_grup: grup.nama_grup,
        jenis_grup: grup.jenis_grup,
        id_satker: grup.id_satker || undefined,
        keterangan: grup.keterangan || undefined,
        lokasi_ids: [newLokasiId]
      });
      
      // 4. Tambahkan semua peserta ke grup baru (jika ada)
      if (pesertaList.length > 0 && createResponse.success && createResponse.data?.created_grups?.[0]?.id_grup_peserta) {
        const newGrupId = createResponse.data.created_grups[0].id_grup_peserta;
        await kegiatanApi.addPesertaToGrup(newGrupId, {
          nip_list: pesertaList
        });
      }
      
      message.success('Lokasi berhasil diubah');
      setEditingLokasiId(null);
      setNewLokasiId(undefined);
      await fetchGrupLokasi();
      onSuccess();
    } catch (error: any) {
      console.error('Error editing lokasi:', error);
      message.error(error?.response?.data?.error || 'Gagal mengubah lokasi');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteLokasi = async (grupId: number) => {
    if (!grup) return;

    // Jika hanya ada 1 lokasi, tidak bisa dihapus
    if (grupLokasiList.length <= 1) {
      message.warning('Grup harus memiliki minimal 1 lokasi');
      return;
    }

    try {
      setActionLoading(true);
      await kegiatanApi.deleteGrupPeserta(grupId);
      message.success('Lokasi berhasil dihapus');
      await fetchGrupLokasi();
      onSuccess();
    } catch (error: any) {
      console.error('Error deleting lokasi:', error);
      message.error(error?.response?.data?.error || 'Gagal menghapus lokasi');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkAddFromSatker = async () => {
    if (!grup || grup.jenis_grup !== 'opd' || !grup.id_satker) {
      message.warning('Fitur ini hanya tersedia untuk grup OPD');
      return;
    }

    try {
      setActionLoading(true);
      await kegiatanApi.addPesertaToGrup(grup.id_grup_peserta, {
        bulk_from_satker: true
      });
      message.success('Peserta berhasil ditambahkan dari OPD');
      fetchPesertaList();
      onSuccess();
    } catch (error: any) {
      console.error('Error bulk adding:', error);
      message.error(error?.response?.data?.error || 'Gagal menambahkan peserta');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemovePeserta = async (nipList: string[]) => {
    if (!grup) return;

    try {
      setActionLoading(true);
      await kegiatanApi.removePesertaFromGrup(grup.id_grup_peserta, {
        nip_list: nipList
      });
      message.success(`${nipList.length} peserta berhasil dihapus`);
      setSelectedRowKeys([]);
      fetchPesertaList();
      onSuccess();
    } catch (error: any) {
      console.error('Error removing peserta:', error);
      message.error(error?.response?.data?.error || 'Gagal menghapus peserta');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddPeserta = async (nipList: string[]) => {
    if (!grup) return;

    try {
      setActionLoading(true);
      await kegiatanApi.addPesertaToGrup(grup.id_grup_peserta, {
        nip_list: nipList
      });
      message.success(`${nipList.length} peserta berhasil ditambahkan`);
      fetchPesertaList();
      onSuccess();
    } catch (error: any) {
      console.error('Error adding peserta:', error);
      message.error(error?.response?.data?.error || 'Gagal menambahkan peserta');
    } finally {
      setActionLoading(false);
    }
  };

  // Fetch pegawai options for DebounceSelect
  const fetchPegawaiOptions = async (search: string) => {
    try {
      const response = await pegawaiApi.getAll({
        search: search,
        limit: 100,
        page: 1
      });
      const pegawaiList = response.data || [];
      return pegawaiList.map((pegawai: Pegawai) => ({
        label: `${pegawai.nip} - ${pegawai.nama || pegawai.username}`,
        value: pegawai.nip,
        key: pegawai.nip
      }));
    } catch (error) {
      console.error('Error fetching pegawai:', error);
      return [];
    }
  };

  const columns: ColumnsType<PesertaGrupKegiatanWithHistory> = [
    {
      title: 'NIP',
      dataIndex: 'nip',
      key: 'nip',
      width: 150,
      render: (nip: string) => <Text code>{nip}</Text>
    },
    {
      title: 'Nama Lengkap',
      key: 'nama',
      render: (_, record) => record.pegawai?.nama_lengkap || '-'
    },
    {
      title: 'Unit Kerja & Jabatan',
      key: 'unit',
      width: 320,
      render: (_, record) => {
        const satker = record.KDSATKER || record.pegawai?.kdsatker || '-';
        const bidang = record.BIDANGF || '-';
        const sub = record.SUBF || '-';
        const unitKerja = record.NM_UNIT_KERJA || '-';
        const namaJabatan = record.nama_jabatan || '';
        const hasHistoricalData = Boolean(record.KDSATKER || record.BIDANGF || record.SUBF || record.NM_UNIT_KERJA || record.nama_jabatan);
        
        return (
          <Space direction="vertical" size={2} style={{ width: '100%' }}>
            <div>
              <Tag color="blue">{satker}</Tag>
              {hasHistoricalData && (
                <Tooltip title="Data historis tersimpan saat peserta ditambahkan">
                  <Text type="secondary" style={{ marginLeft: 4, fontSize: 10 }}>📅</Text>
                </Tooltip>
              )}
            </div>
            <Text>{unitKerja}</Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {`${bidang}/${sub}`}
            </Text>
            {namaJabatan && (
              <Text type="secondary" style={{ fontSize: 11 }}>
                Jabatan: {namaJabatan}
              </Text>
            )}
          </Space>
        );
      }
    }
  ];

  const filteredPeserta = pesertaList.filter(p => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    const namaLengkap = p.pegawai?.nama_lengkap?.toLowerCase() || '';
    const satkerNow = p.pegawai?.kdsatker?.toLowerCase() || '';
    const satkerHistoris = p.KDSATKER?.toLowerCase() || '';
    const unitHistoris = p.NM_UNIT_KERJA?.toLowerCase() || '';
    const jabatanHistoris = p.nama_jabatan?.toLowerCase() || '';
    const bidangHistoris = p.BIDANGF?.toLowerCase() || '';
    const subHistoris = p.SUBF?.toLowerCase() || '';

    return (
      p.nip.toLowerCase().includes(searchLower) ||
      namaLengkap.includes(searchLower) ||
      satkerNow.includes(searchLower) ||
      satkerHistoris.includes(searchLower) ||
      unitHistoris.includes(searchLower) ||
      jabatanHistoris.includes(searchLower) ||
      bidangHistoris.includes(searchLower) ||
      subHistoris.includes(searchLower)
    );
  });

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => {
      setSelectedRowKeys(keys);
    }
  };

  return (
    <Modal
      title={`Manajemen Peserta - ${grup?.nama_grup || ''}`}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={900}
    >
      <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key as 'list' | 'add' | 'lokasi')}>
        <TabPane tab="Daftar Peserta" key="list">
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Space>
              <Search
                placeholder="Cari NIP, nama, atau satker..."
                allowClear
                style={{ width: 300 }}
                onChange={(e) => setSearchText(e.target.value)}
              />
              {grup?.jenis_grup === 'opd' && grup.id_satker && (
                <Button
                  icon={<TeamOutlined />}
                  onClick={handleBulkAddFromSatker}
                  loading={actionLoading}
                >
                  Tambah Semua dari OPD
                </Button>
              )}
              <Button
                icon={<UploadOutlined />}
                onClick={onImportClick}
              >
                Import Excel
              </Button>
              <Popconfirm
                title="Hapus peserta yang dipilih?"
                description={`Apakah Anda yakin ingin menghapus ${selectedRowKeys.length} peserta?`}
                onConfirm={() => {
                  const nipList = selectedRowKeys.map(key => String(key));
                  handleRemovePeserta(nipList);
                }}
                okText="Ya"
                cancelText="Tidak"
                disabled={selectedRowKeys.length === 0}
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  disabled={selectedRowKeys.length === 0}
                  loading={actionLoading}
                >
                  Hapus Terpilih ({selectedRowKeys.length})
                </Button>
              </Popconfirm>
            </Space>

            <Table
              columns={columns}
              dataSource={filteredPeserta}
              rowKey="nip"
              loading={loading}
              rowSelection={rowSelection}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} peserta`
              }}
            />
          </Space>
        </TabPane>

        <TabPane tab="Tambah Peserta" key="add">
          <AddPesertaTab
            grup={grup}
            onAdd={handleAddPeserta}
            loading={actionLoading}
            fetchPegawaiOptions={fetchPegawaiOptions}
          />
        </TabPane>

        <TabPane tab="Lokasi" key="lokasi">
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text strong>Daftar Lokasi Grup:</Text>
              <Space>
                <Select
                  placeholder="Pilih lokasi baru"
                  style={{ width: 300 }}
                  value={newLokasiId}
                  onChange={(value) => setNewLokasiId(value)}
                  showSearch
                  filterOption={(input, option) => {
                    const label = typeof option?.label === 'string' 
                      ? option.label 
                      : typeof option?.children === 'string'
                      ? option.children
                      : String(option?.label || option?.children || '');
                    return label.toLowerCase().includes(input.toLowerCase());
                  }}
                >
                  {allLokasiList
                    .filter((lokasi: any) => 
                      !grupLokasiList.some((g: any) => g.lokasi_id === lokasi.lokasi_id)
                    )
                    .map((lokasi: any) => (
                      <Option key={lokasi.lokasi_id} value={lokasi.lokasi_id}>
                        {lokasi.ket}
                      </Option>
                    ))}
                </Select>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddLokasi}
                  loading={actionLoading}
                  disabled={!newLokasiId}
                >
                  Tambah Lokasi
                </Button>
              </Space>
            </div>

            <Table
              dataSource={grupLokasiList}
              rowKey="id_grup_peserta"
              loading={loadingLokasi}
              pagination={false}
              columns={[
                {
                  title: 'Lokasi',
                  key: 'lokasi',
                  render: (_, record: any) => {
                    if (record.Lokasi) {
                      return (
                        <Space>
                          <EnvironmentOutlined />
                          <Text>{record.Lokasi.ket}</Text>
                        </Space>
                      );
                    }
                    return <Text type="secondary">-</Text>;
                  }
                },
                {
                  title: 'Aksi',
                  key: 'action',
                  width: 200,
                  render: (_, record: any) => {
                    const isEditing = editingLokasiId === record.id_grup_peserta;
                    
                    if (isEditing) {
                      return (
                        <Space>
                          <Select
                            placeholder="Pilih lokasi baru"
                            style={{ width: 200 }}
                            value={newLokasiId}
                            onChange={(value) => setNewLokasiId(value)}
                            showSearch
                            filterOption={(input, option) => {
                              const label = typeof option?.label === 'string' 
                                ? option.label 
                                : typeof option?.children === 'string'
                                ? option.children
                                : String(option?.label || option?.children || '');
                              return label.toLowerCase().includes(input.toLowerCase());
                            }}
                          >
                            {allLokasiList
                              .filter((lokasi: any) => 
                                lokasi.lokasi_id !== record.lokasi_id &&
                                !grupLokasiList.some((g: any) => 
                                  g.lokasi_id === lokasi.lokasi_id && g.id_grup_peserta !== record.id_grup_peserta
                                )
                              )
                              .map((lokasi: any) => (
                                <Option key={lokasi.lokasi_id} value={lokasi.lokasi_id}>
                                  {lokasi.ket}
                                </Option>
                              ))}
                          </Select>
                          <Button
                            size="small"
                            type="primary"
                            onClick={() => handleEditLokasi(record.id_grup_peserta)}
                            loading={actionLoading}
                            disabled={!newLokasiId}
                          >
                            Simpan
                          </Button>
                          <Button
                            size="small"
                            onClick={() => {
                              setEditingLokasiId(null);
                              setNewLokasiId(undefined);
                            }}
                          >
                            Batal
                          </Button>
                        </Space>
                      );
                    }

                    return (
                      <Space>
                        <Tooltip title="Edit Lokasi">
                          <Button
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => {
                              setEditingLokasiId(record.id_grup_peserta);
                              setNewLokasiId(undefined);
                            }}
                          />
                        </Tooltip>
                        <Popconfirm
                          title="Hapus lokasi ini?"
                          description="Apakah Anda yakin ingin menghapus lokasi ini dari grup?"
                          onConfirm={() => handleDeleteLokasi(record.id_grup_peserta)}
                          okText="Ya"
                          cancelText="Tidak"
                          disabled={grupLokasiList.length <= 1}
                        >
                          <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            disabled={grupLokasiList.length <= 1}
                            loading={actionLoading}
                          />
                        </Popconfirm>
                      </Space>
                    );
                  }
                }
              ]}
            />
          </Space>
        </TabPane>
      </Tabs>
    </Modal>
  );
};

interface AddPesertaTabProps {
  grup: GrupPesertaKegiatan | null;
  onAdd: (nipList: string[]) => Promise<void>;
  loading: boolean;
  fetchPegawaiOptions: (search: string) => Promise<Array<{ label: string; value: string; key: string }>>;
}

const AddPesertaTab: React.FC<AddPesertaTabProps> = ({
  onAdd,
  loading,
  fetchPegawaiOptions
}) => {
  const [selectedNips, setSelectedNips] = useState<string[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<Record<string, string>>({});

  const handleAdd = async () => {
    if (selectedNips.length === 0) {
      message.warning('Pilih minimal 1 pegawai');
      return;
    }

    await onAdd(selectedNips);
    setSelectedNips([]);
    setSelectedLabels({});
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      <div>
        <Text strong>Pilih Pegawai:</Text>
        <DebounceSelect
          mode="multiple"
          placeholder="Cari dan pilih pegawai..."
          fetchOptions={fetchPegawaiOptions}
          value={selectedNips.map(nip => ({
            value: nip,
            label: selectedLabels[nip] || nip
          }))}
          onChange={(values, options) => {
            // Handle both single value and array of values
            let nips: string[] = [];
            if (Array.isArray(values)) {
              nips = values.map((v: any) => {
                if (typeof v === 'string') return v;
                if (v && typeof v === 'object' && v.value) return String(v.value);
                return String(v);
              });
            } else if (values) {
              if (typeof values === 'string') {
                nips = [values];
              } else if (values && typeof values === 'object' && values.value) {
                nips = [String(values.value)];
              } else {
                nips = [String(values)];
              }
            }
            
            const labels: Record<string, string> = {};
            const optionsArray = Array.isArray(options) ? options : (options ? [options] : []);
            optionsArray.forEach((opt: any) => {
              if (opt && opt.value) {
                labels[String(opt.value)] = opt.label || String(opt.value);
              }
            });
            
            setSelectedNips(nips);
            setSelectedLabels(labels);
          }}
          style={{ width: '100%', marginTop: 8 }}
        />
      </div>

      {selectedNips.length > 0 && (
        <div>
          <Text strong>Pegawai Terpilih ({selectedNips.length}):</Text>
          <div style={{ marginTop: 8, maxHeight: 200, overflowY: 'auto' }}>
            {selectedNips.map(nip => (
              <Tag key={nip} style={{ marginBottom: 4 }}>
                {selectedLabels[nip] || nip}
              </Tag>
            ))}
          </div>
        </div>
      )}

      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={handleAdd}
        loading={loading}
        disabled={selectedNips.length === 0}
        block
      >
        Tambahkan {selectedNips.length > 0 ? `${selectedNips.length} ` : ''}Peserta
      </Button>
    </Space>
  );
};

export default ManagePesertaModal;

