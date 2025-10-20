import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Tag,
  Tooltip,
  message,
  Typography,
  Row,
  Col,
  Divider,
  Radio,
  Spin,
  Popconfirm,
  Modal
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { jamDinasApi } from '../services/jamDinasApi';
import { pengaturanApi } from '../../pengaturan/services/pengaturanApi';

import { getTipeJadwalLabel, getTipeJadwalDescription } from '../../pengaturan/utils/tipeJadwalUtils';
import type { TipeJadwalOption } from '../../pengaturan/types';
import type { JamDinas, JamDinasFilters, StatusJamDinas } from '../types';
import { useAuth } from '../../../store/authStore';
import { useNavigate } from 'react-router-dom';
const { Title, Text } = Typography;
const { Search } = Input;

const JamDinasPage: React.FC = () => {
  const [jamDinasList, setJamDinasList] = useState<JamDinas[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState<JamDinasFilters>({
    page: 1,
    limit: 10
  });

  // Tipe Jadwal State
  const [tipeJadwalLoading, setTipeJadwalLoading] = useState(false);
  const [tipeJadwalSaving, setTipeJadwalSaving] = useState(false);
  const [currentTipeJadwal, setCurrentTipeJadwal] = useState<TipeJadwalOption>('normal');
  const [selectedTipeJadwal, setSelectedTipeJadwal] = useState<TipeJadwalOption>('normal');
  const [tipeJadwalModalOpen, setTipeJadwalModalOpen] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();
  const isSuperAdmin = user?.role === 'super_admin';

  useEffect(() => {
    if (isSuperAdmin) {
      fetchJamDinas();
      fetchCurrentTipeJadwal();
    }
  }, [filters, isSuperAdmin]);

  const fetchJamDinas = async () => {
    try {
      setLoading(true);
      const response = await jamDinasApi.getAll(filters);
      setJamDinasList(response.data);
      setPagination({
        current: response.pagination.currentPage,
        pageSize: response.pagination.itemsPerPage,
        total: response.pagination.totalItems,
      }); // Corrected trailing comma
    } catch (error: any) {
      console.error('Error fetching jam dinas:', error);
      message.error('Gagal memuat data jam dinas');
    } finally {
      setLoading(false);
    }
  };

  // Tipe Jadwal logic
  const fetchCurrentTipeJadwal = async () => {
    try {
      setTipeJadwalLoading(true);
      const response = await pengaturanApi.getCurrentTipeJadwal();
      const tipe = response.data.tipe as TipeJadwalOption;
      setCurrentTipeJadwal(tipe);
      setSelectedTipeJadwal(tipe);
    } catch (error: any) {
      console.error('Error fetching tipe jadwal:', error);
      message.error('Gagal memuat tipe jadwal');
    } finally {
      setTipeJadwalLoading(false);
    }
  };


  const handleSaveTipeJadwal = async () => {
    if (selectedTipeJadwal === currentTipeJadwal) {
      setTipeJadwalModalOpen(false);
      return;
    }
    try {
      setTipeJadwalSaving(true);
      const response = await pengaturanApi.updateTipeJadwal({ tipe: selectedTipeJadwal });
      setCurrentTipeJadwal(selectedTipeJadwal);
      message.success(response.message);
      setTipeJadwalModalOpen(false);
    } catch (error: any) {
      console.error('Error updating tipe jadwal:', error);
      message.error(error.response?.data?.message || 'Gagal menyimpan tipe jadwal');
    } finally {
      setTipeJadwalSaving(false);
    }
  };

  const handleOpenTipeJadwalModal = () => {
    setSelectedTipeJadwal(currentTipeJadwal);
    setTipeJadwalModalOpen(true);
  };

  const handleCancelTipeJadwalModal = () => {
    setTipeJadwalModalOpen(false);
  };



  const handleSearch = (value: string) => {
    setFilters(prev => ({
      ...prev,
      search: value || undefined,
      page: 1,
    }));
  };



  const handleTableChange = (pagination: any) => {
    setFilters(prev => ({
      ...prev,
      page: pagination.current,
      limit: pagination.pageSize,
    }));
  };

  const handleDelete = async (id: number) => {
    try {
      await jamDinasApi.delete(id);
      message.success('Jam dinas berhasil dihapus');
      fetchJamDinas();
    } catch (error: any) {
      console.error('Error deleting jam dinas:', error);
      message.error(error.response?.data?.message || 'Gagal menghapus jam dinas');
    }
  };



  const showDetail = (id: number) => {
    navigate(`/jam-dinas/${id}`);
  };

  const getStatusColor = (status: StatusJamDinas) => {
    return status === 1 ? 'success' : 'default';
  };

  const getStatusText = (status: StatusJamDinas) => {
    return status === 1 ? 'Aktif' : 'Tidak Aktif';
  };

  const columns = [
    {
      title: 'Nama',
      dataIndex: 'nama',
      key: 'nama',
      render: (nama: string) => (
        <Text strong style={{ fontSize: '14px' }}>{nama}</Text>
      ),
    },
    {
      title: 'Hari Kerja',
      dataIndex: 'hari_kerja',
      key: 'hari_kerja',
      width: 140,
      render: (hari_kerja: number) => (
        <Text style={{ fontSize: '13px' }}>
          {hari_kerja} hari/minggu
        </Text>
      ),
    },
    {
      title: 'Durasi',
      dataIndex: 'menit',
      key: 'menit',
      width: 140,
      render: (menit: number) => (
        <Text style={{ fontSize: '13px' }}>
          {Math.floor(menit / 60)}:{(menit % 60).toString().padStart(2, '0')} jam/hari
        </Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: StatusJamDinas) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Aksi',
      key: 'actions',
      width: 200,
      render: (record: JamDinas) => (
        <Space>
          <Tooltip title="Lihat Detail">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => showDetail(record.id)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => navigate(`/jam-dinas/${record.id}/edit`)}
            />
          </Tooltip>
          
          <Tooltip title="Hapus">
            <Popconfirm
              title="Yakin ingin menghapus jam dinas ini?"
              description="Data yang dihapus tidak dapat dikembalikan"
              onConfirm={() => handleDelete(record.id)}
              okText="Ya, Hapus"
              cancelText="Batal"
              okType="danger"
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];


  // Show access denied for non-super admin
  if (!isSuperAdmin) {
    return (
      <div style={{ padding: '24px', maxWidth: '100%', overflow: 'hidden' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <ClockCircleOutlined style={{ fontSize: '64px', color: '#ff4d4f', marginBottom: '16px' }} />
            <Title level={3}>Akses Ditolak</Title>
            <Text type="secondary">
              Hanya super admin yang dapat mengakses halaman jam dinas.
            </Text>
          </div>
        </Card>
      </div>
    );
  }


  // Tipe Jadwal Card (Simple)
  return (
    <div style={{ padding: '24px', maxWidth: '100%', overflow: 'hidden' }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          {/* Tipe Jadwal Global Setting (Simple) */}
          <Card style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <ClockCircleOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                <div>
                  <Title level={4} style={{ margin: 0 }}>
                    Tipe Jadwal Global
                  </Title>
                  <Text type="secondary">
                    Tipe jadwal yang berlaku untuk seluruh sistem
                  </Text>
                </div>
              </div>
              <Button
                type="default"
                onClick={handleOpenTipeJadwalModal}
                loading={tipeJadwalLoading}
              >
                Ganti Tipe Jadwal
              </Button>
            </div>
            <Divider />
            {tipeJadwalLoading ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">Memuat tipe jadwal...</Text>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Text>Tipe Jadwal Aktif:</Text>
                <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                  {getTipeJadwalLabel(currentTipeJadwal)}
                </Text>
              </div>
            )}
          </Card>
          {/* Modal Dialog for Tipe Jadwal */}
          <Modal
            title="Ganti Tipe Jadwal Global"
            open={tipeJadwalModalOpen}
            onCancel={handleCancelTipeJadwalModal}
            onOk={handleSaveTipeJadwal}
            okText="Simpan"
            cancelText="Batal"
            confirmLoading={tipeJadwalSaving}
          >
            <Radio.Group
              value={selectedTipeJadwal}
              onChange={(e) => setSelectedTipeJadwal(e.target.value)}
              style={{ width: '100%' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Radio value="normal">
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{getTipeJadwalLabel('normal')}</div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {getTipeJadwalDescription('normal')}
                    </Text>
                  </div>
                </Radio>
                <Radio value="ramadhan">
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{getTipeJadwalLabel('ramadhan')}</div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {getTipeJadwalDescription('ramadhan')}
                    </Text>
                  </div>
                </Radio>
              </Space>
            </Radio.Group>
            <div style={{ marginTop: 16 }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Perubahan tipe jadwal akan mempengaruhi seluruh sistem presensi.
              </Text>
            </div>
          </Modal>

          <Card>
            {/* Header */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                    <ClockCircleOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                    Manajemen Jam Dinas
                  </Title>
                  <Text type="secondary">
                    Kelola jam kerja dan jadwal operasional untuk berbagai unit kerja
                  </Text>
                </div>
                <Space>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => fetchJamDinas()}
                    loading={loading}
                  >
                    Refresh
                  </Button>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/jam-dinas/create')}
                  >
                    Tambah Jam Dinas
                  </Button>
                </Space>
              </div>
            </div>

            <Divider />

            {/* Filters */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col xs={24} sm={12} md={8}>
                <Search
                  placeholder="Cari nama jam dinas..."
                  allowClear
                  onSearch={handleSearch}
                  style={{ width: '100%' }}
                />
              </Col>
              
            </Row>

            {/* Table */}
            <Table
              columns={columns}
              dataSource={jamDinasList}
              rowKey="id"
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} dari ${total} item`,
              }}
              onChange={handleTableChange}
              scroll={{ x: 900 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default JamDinasPage;