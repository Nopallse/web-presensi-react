import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Descriptions, 
  Tag, 
  Space, 
  message, 
  Spin, 
  Table,
  Empty,
  Popconfirm
} from 'antd';
import { 
  ArrowLeftOutlined, 
  EditOutlined, 
  CalendarOutlined,
  EnvironmentOutlined,
  PlusOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { kegiatanApi } from '../services/kegiatanApi';
import type { JadwalKegiatan, LokasiWithSkpd } from '../types';
import { JENIS_KEGIATAN_OPTIONS } from '../types';
import { dateFormatter } from '../../../utils/dateFormatter';
import AddLokasiModal from '../components/AddLokasiModal';
import EditLokasiModal from '../components/EditLokasiModal';

const KegiatanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [kegiatan, setKegiatan] = useState<JadwalKegiatan | null>(null);
  const [loading, setLoading] = useState(true);
  const [addLokasiModalVisible, setAddLokasiModalVisible] = useState(false);
  const [editLokasiModalVisible, setEditLokasiModalVisible] = useState(false);
  const [editingLokasi, setEditingLokasi] = useState<LokasiWithSkpd | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    if (id) {
      fetchKegiatanDetail(parseInt(id));
    }
  }, [id]);

  const fetchKegiatanDetail = async (kegiatanId: number) => {
    try {
      setLoading(true);
      // Get basic kegiatan info
      const kegiatanResponse = await kegiatanApi.getById(kegiatanId);
      
      // Get locations for this kegiatan
      const lokasiResponse = await kegiatanApi.getKegiatanLokasi(kegiatanId);
      
      setKegiatan({
        ...kegiatanResponse.data,
        lokasi_list: lokasiResponse.data?.lokasi_list || []
      });
    } catch (error: any) {
      console.error('Error fetching kegiatan detail:', error);
      message.error('Gagal memuat detail kegiatan');
      navigate('/kegiatan');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLokasi = async (data: { lokasi_id: number; kdskpd_list: string[] }) => {
    if (!kegiatan) return;
    
    try {
      await kegiatanApi.addLokasiToKegiatan(kegiatan.id_kegiatan, data);
      setAddLokasiModalVisible(false);
      // Refresh the data
      await fetchKegiatanDetail(kegiatan.id_kegiatan);
    } catch (error) {
      throw error; // Let the modal handle the error
    }
  };

  const handleRemoveLokasi = async (lokasiId: number) => {
    if (!kegiatan) return;
    
    try {
      setLoadingAction(true);
      await kegiatanApi.removeLokasiFromKegiatan(kegiatan.id_kegiatan, lokasiId);
      message.success('Lokasi berhasil dihapus dari kegiatan');
      // Refresh the data
      await fetchKegiatanDetail(kegiatan.id_kegiatan);
    } catch (error: any) {
      console.error('Error removing lokasi:', error);
      message.error('Gagal menghapus lokasi');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleEditLokasi = (lokasi: LokasiWithSkpd) => {
    setEditingLokasi(lokasi);
    setEditLokasiModalVisible(true);
  };

  const handleEditLokasiSuccess = async () => {
    setEditLokasiModalVisible(false);
    setEditingLokasi(null);
    if (kegiatan) {
      await fetchKegiatanDetail(kegiatan.id_kegiatan);
    }
  };

  const getJenisKegiatanLabel = (value: string): string => {
    const option = JENIS_KEGIATAN_OPTIONS.find(opt => opt.value === value);
    return option?.label || value;
  };

  const getJenisKegiatanColor = (value: string): string => {
    const colorMap: Record<string, string> = {
      'dinas_luar': 'blue',
      'rapat': 'green',
      'pelatihan': 'orange',
      'workshop': 'purple',
      'seminar': 'cyan',
      'upacara': 'red',
      'lainnya': 'default'
    };
    return colorMap[value] || 'default';
  };

  const lokasiColumns: ColumnsType<LokasiWithSkpd> = [
    {
      title: 'Lokasi',
      dataIndex: 'ket',
      key: 'ket',
      render: (text: string) => (
        <Space>
          <EnvironmentOutlined style={{ color: '#1890ff' }} />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Koordinat',
      key: 'koordinat',
      render: (_, record: LokasiWithSkpd) => (
        <span>{record.lat.toFixed(6)}, {record.lng.toFixed(6)}</span>
      ),
    },
    {
      title: 'Radius (m)',
      dataIndex: 'range',
      key: 'range',
      width: 100,
      render: (range: number) => `${range} m`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: boolean) => (
        <Tag color={status ? 'success' : 'error'}>
          {status ? 'Aktif' : 'Tidak Aktif'}
        </Tag>
      ),
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditLokasi(record)}
            title="Edit lokasi"
          />
          <Popconfirm
            title="Hapus Lokasi"
            description="Apakah Anda yakin ingin menghapus lokasi ini dari kegiatan?"
            onConfirm={() => handleRemoveLokasi(record.lokasi_id)}
            okText="Ya"
            cancelText="Tidak"
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              danger
              size="large"
              loading={loadingAction}
              title="Hapus dari kegiatan"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (!kegiatan) {
    return (
      <div className="text-center py-8">
        <Empty description="Kegiatan tidak ditemukan" />
        <Button 
          type="primary" 
          onClick={() => navigate('/kegiatan')}
          style={{ marginTop: 16 }}
        >
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
              Detail Kegiatan
            </h1>
            <p style={{ color: '#666', margin: 0 }}>
              Informasi lengkap kegiatan
            </p>
          </div>
        </div>
        
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/kegiatan')}
          >
            Kembali
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/kegiatan/${kegiatan.id_kegiatan}/edit`)}
          >
            Edit Kegiatan
          </Button>
        </Space>
      </div>

      {/* Detail Information */}
      <Card title="Informasi Kegiatan" style={{ marginBottom: 24 }}>
        <Descriptions bordered column={{ xs: 1, sm: 2 }}>
          <Descriptions.Item label="ID Kegiatan">
            {kegiatan.id_kegiatan}
          </Descriptions.Item>
          <Descriptions.Item label="Tanggal Kegiatan">
            <Space>
              <CalendarOutlined style={{ color: '#1890ff' }} />
              <span>{dateFormatter.toIndonesian(kegiatan.tanggal_kegiatan, 'dd MMMM yyyy')}</span>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Jenis Kegiatan" span={2}>
            <Tag color={getJenisKegiatanColor(kegiatan.jenis_kegiatan)} style={{ fontSize: '14px' }}>
              {getJenisKegiatanLabel(kegiatan.jenis_kegiatan)}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Keterangan" span={2}>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
              {kegiatan.keterangan}
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Dibuat">
            {kegiatan.createdAt ? dateFormatter.toTableFormat(kegiatan.createdAt) : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Terakhir Diupdate">
            {kegiatan.updatedAt ? dateFormatter.toTableFormat(kegiatan.updatedAt) : '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Lokasi Terkait */}
      <Card 
        title="Lokasi Kegiatan" 
        extra={
          <Space>
            <span style={{ fontSize: '14px', color: '#666' }}>
              {kegiatan.lokasi_list?.length || 0} lokasi
            </span>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="middle"
              onClick={() => setAddLokasiModalVisible(true)}
            >
              Tambah Lokasi
            </Button>
          </Space>
        }
      >
        {kegiatan.lokasi_list && kegiatan.lokasi_list.length > 0 ? (
          <Table
            columns={lokasiColumns}
            dataSource={kegiatan.lokasi_list}
            rowKey="lokasi_id"
            pagination={false}
            size="small"
            scroll={{ x: 900 }}
          />
        ) : (
          <Empty 
            description="Belum ada lokasi yang terkait dengan kegiatan ini"
            style={{ padding: '40px 0' }}
          />
        )}
      </Card>

      {/* Add Lokasi Modal */}
      <AddLokasiModal
        visible={addLokasiModalVisible}
        onCancel={() => setAddLokasiModalVisible(false)}
        onSuccess={() => setAddLokasiModalVisible(false)}
        kegiatanId={kegiatan.id_kegiatan}
        existingLokasiIds={kegiatan.lokasi_list?.map(l => l.lokasi_id) || []}
        onAddLokasi={handleAddLokasi}
      />

      {/* Edit Lokasi Modal */}
      {editingLokasi && (
        <EditLokasiModal
          visible={editLokasiModalVisible}
          onCancel={() => {
            setEditLokasiModalVisible(false);
            setEditingLokasi(null);
          }}
          onSuccess={handleEditLokasiSuccess}
          kegiatanId={kegiatan.id_kegiatan}
          currentLokasi={editingLokasi}
          existingLokasiIds={kegiatan.lokasi_list?.map(l => l.lokasi_id) || []}
        />
      )}
    </div>
  );
};

export default KegiatanDetail;