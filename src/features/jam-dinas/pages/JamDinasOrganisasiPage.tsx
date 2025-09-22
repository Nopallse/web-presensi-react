import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  message,
  Row,
  Col,
  Typography,
  Tooltip,
  Modal,
  Form,
  Divider,
  Descriptions
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  EyeOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { organizationAssignmentApi, jamDinasApi } from '../services/jamDinasApi';
import type {
  OrganizationAssignment,
  OrganizationAssignmentFilters,
  CreateOrganizationAssignmentRequest,
  JamDinas
} from '../types';

const { Option } = Select;
const { Title, Text } = Typography;
const { Search } = Input;

interface JamDinasOrganisasiPageProps {
  className?: string;
}

const JamDinasOrganisasiPage: React.FC<JamDinasOrganisasiPageProps> = ({ className }) => {
  const [data, setData] = useState<OrganizationAssignment[]>([]);
  const [jamDinasList, setJamDinasList] = useState<JamDinas[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<OrganizationAssignment | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState<OrganizationAssignmentFilters>({
    page: 1,
    limit: 10,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await organizationAssignmentApi.getAll(filters);
      setData(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.totalItems,
        current: response.pagination.currentPage,
        pageSize: response.pagination.itemsPerPage,
      }));
    } catch (error) {
      console.error('Error fetching organization assignments:', error);
      message.error('Gagal memuat data assignment organisasi');
    } finally {
      setLoading(false);
    }
  };

  const fetchJamDinasList = async () => {
    try {
      const response = await jamDinasApi.getAll({ status: 1 }); // Only active jam dinas
      setJamDinasList(response.data);
    } catch (error) {
      console.error('Error fetching jam dinas list:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  useEffect(() => {
    fetchJamDinasList();
  }, []);

  const handleTableChange = (paginationConfig: any) => {
    setFilters(prev => ({
      ...prev,
      page: paginationConfig.current,
      limit: paginationConfig.pageSize,
    }));
  };

  const handleSearch = (value: string) => {
    setFilters(prev => ({
      ...prev,
      search: value || undefined,
      page: 1,
    }));
  };

  const handleStatusFilter = (value: string) => {
    setFilters(prev => ({
      ...prev,
      status: value === 'all' ? undefined : Number(value) as 0 | 1,
      page: 1,
    }));
  };

  const handleCreate = async (values: CreateOrganizationAssignmentRequest) => {
    try {
      await organizationAssignmentApi.create(values);
      message.success('Assignment organisasi berhasil dibuat');
      setShowCreateModal(false);
      form.resetFields();
      fetchData();
    } catch (error: any) {
      console.error('Error creating organization assignment:', error);
      message.error(error.response?.data?.message || 'Gagal membuat assignment organisasi');
    }
  };

  const handleUpdate = async (values: any) => {
    if (!selectedRecord) return;
    
    try {
      await organizationAssignmentApi.update(selectedRecord.dinset_id, values);
      message.success('Assignment organisasi berhasil diperbarui');
      setShowEditModal(false);
      setSelectedRecord(null);
      form.resetFields();
      fetchData();
    } catch (error: any) {
      console.error('Error updating organization assignment:', error);
      message.error(error.response?.data?.message || 'Gagal memperbarui assignment organisasi');
    }
  };

  const handleDelete = (record: OrganizationAssignment) => {
    Modal.confirm({
      title: 'Hapus Assignment',
      content: `Apakah Anda yakin ingin menghapus assignment "${record.dinset_nama}"?`,
      okText: 'Hapus',
      cancelText: 'Batal',
      okType: 'danger',
      onOk: async () => {
        try {
          await organizationAssignmentApi.delete(record.dinset_id);
          message.success('Assignment organisasi berhasil dihapus');
          fetchData();
        } catch (error: any) {
          console.error('Error deleting organization assignment:', error);
          message.error(error.response?.data?.message || 'Gagal menghapus assignment organisasi');
        }
      },
    });
  };

  const handleEdit = (record: OrganizationAssignment) => {
    setSelectedRecord(record);
    form.setFieldsValue({
      dinset_nama: record.dinset_nama,
      id_skpd: record.id_skpd,
      id_satker: record.id_satker,
      id_bidang: record.id_bidang,
      id_jamdinas: record.id_jamdinas,
      status: record.status,
    });
    setShowEditModal(true);
  };

  const handleDetail = (record: OrganizationAssignment) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  };

  const getStatusColor = (status: number) => {
    return status === 1 ? 'green' : 'red';
  };

  const getStatusText = (status: number) => {
    return status === 1 ? 'Aktif' : 'Tidak Aktif';
  };

  const getOrganizationInfo = (record: OrganizationAssignment) => {
    const parts = [];
    if (record.id_skpd) parts.push(`SKPD: ${record.id_skpd}`);
    if (record.id_satker) parts.push(`Satker: ${record.id_satker}`);
    if (record.id_bidang) parts.push(`Bidang: ${record.id_bidang}`);
    return parts.join(' | ') || '-';
  };

  const columns: ColumnsType<OrganizationAssignment> = [
    {
      title: 'Nama Assignment',
      dataIndex: 'dinset_nama',
      key: 'dinset_nama',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Organisasi',
      key: 'organization',
      render: (_, record) => (
        <div>
          <Text style={{ fontSize: '12px', color: '#666' }}>
            {getOrganizationInfo(record)}
          </Text>
        </div>
      ),
    },
    {
      title: 'Jam Dinas',
      key: 'jamDinas',
      render: (_, record) => (
        <div>
          <Text strong>{record.jamDinas?.nama}</Text>
          <br />
          <Text style={{ fontSize: '12px', color: '#666' }}>
            {record.jamDinas?.hari_kerja} hari | {record.jamDinas?.menit} menit
          </Text>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Lihat Detail">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Hapus">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className={className} style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <Row gutter={[0, 16]}>
        <Col span={24}>
          <Card>
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
              <Col>
                <Title level={3} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ClockCircleOutlined />
                  Jam Dinas per Organisasi
                </Title>
                <Text type="secondary">
                  Kelola assignment jam dinas untuk organisasi/unit kerja
                </Text>
              </Col>
              <Col>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setShowCreateModal(true)}
                >
                  Tambah Assignment
                </Button>
              </Col>
            </Row>

            {/* Filters */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col xs={24} sm={12} md={8}>
                <Search
                  placeholder="Cari nama assignment..."
                  allowClear
                  onSearch={handleSearch}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Select
                  placeholder="Filter Status"
                  allowClear
                  style={{ width: '100%' }}
                  onChange={handleStatusFilter}
                >
                  <Option value="all">Semua Status</Option>
                  <Option value="1">Aktif</Option>
                  <Option value="0">Tidak Aktif</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={4}>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchData}
                  loading={loading}
                  style={{ width: '100%' }}
                >
                  Refresh
                </Button>
              </Col>
            </Row>

            <Table
              columns={columns}
              dataSource={data}
              rowKey="dinset_id"
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} dari ${total} data`,
              }}
              onChange={handleTableChange}
              scroll={{ x: true }}
            />
          </Card>
        </Col>
      </Row>

      {/* Create Modal */}
      <Modal
        title="Tambah Assignment Organisasi"
        open={showCreateModal}
        onCancel={() => {
          setShowCreateModal(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
        >
          <Form.Item
            name="dinset_nama"
            label="Nama Assignment"
            rules={[{ required: true, message: 'Nama assignment wajib diisi' }]}
          >
            <Input placeholder="Masukkan nama assignment" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="id_skpd"
                label="ID SKPD"
              >
                <Input placeholder="ID SKPD" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="id_satker"
                label="ID Satker"
              >
                <Input placeholder="ID Satker" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="id_bidang"
                label="ID Bidang"
              >
                <Input placeholder="ID Bidang" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="id_jamdinas"
            label="Jam Dinas"
            rules={[{ required: true, message: 'Jam dinas wajib dipilih' }]}
          >
            <Select placeholder="Pilih jam dinas">
              {jamDinasList.map(jamDinas => (
                <Option key={jamDinas.id} value={jamDinas.id}>
                  {jamDinas.nama} ({jamDinas.hari_kerja} hari - {jamDinas.menit} menit)
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            initialValue={1}
          >
            <Select>
              <Option value={1}>Aktif</Option>
              <Option value={0}>Tidak Aktif</Option>
            </Select>
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Space>
              <Button onClick={() => {
                setShowCreateModal(false);
                form.resetFields();
              }}>
                Batal
              </Button>
              <Button type="primary" htmlType="submit">
                Simpan
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Assignment Organisasi"
        open={showEditModal}
        onCancel={() => {
          setShowEditModal(false);
          setSelectedRecord(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
        >
          <Form.Item
            name="dinset_nama"
            label="Nama Assignment"
            rules={[{ required: true, message: 'Nama assignment wajib diisi' }]}
          >
            <Input placeholder="Masukkan nama assignment" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="id_skpd"
                label="ID SKPD"
              >
                <Input placeholder="ID SKPD" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="id_satker"
                label="ID Satker"
              >
                <Input placeholder="ID Satker" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="id_bidang"
                label="ID Bidang"
              >
                <Input placeholder="ID Bidang" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="id_jamdinas"
            label="Jam Dinas"
            rules={[{ required: true, message: 'Jam dinas wajib dipilih' }]}
          >
            <Select placeholder="Pilih jam dinas">
              {jamDinasList.map(jamDinas => (
                <Option key={jamDinas.id} value={jamDinas.id}>
                  {jamDinas.nama} ({jamDinas.hari_kerja} hari - {jamDinas.menit} menit)
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
          >
            <Select>
              <Option value={1}>Aktif</Option>
              <Option value={0}>Tidak Aktif</Option>
            </Select>
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Space>
              <Button onClick={() => {
                setShowEditModal(false);
                setSelectedRecord(null);
                form.resetFields();
              }}>
                Batal
              </Button>
              <Button type="primary" htmlType="submit">
                Simpan
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Detail Assignment Organisasi"
        open={showDetailModal}
        onCancel={() => {
          setShowDetailModal(false);
          setSelectedRecord(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setShowDetailModal(false);
            setSelectedRecord(null);
          }}>
            Tutup
          </Button>
        ]}
        width={800}
      >
        {selectedRecord && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Nama Assignment" span={2}>
                {selectedRecord.dinset_nama}
              </Descriptions.Item>
              <Descriptions.Item label="ID SKPD">
                {selectedRecord.id_skpd || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="ID Satker">
                {selectedRecord.id_satker || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="ID Bidang" span={2}>
                {selectedRecord.id_bidang || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Status" span={2}>
                <Tag color={getStatusColor(selectedRecord.status)}>
                  {getStatusText(selectedRecord.status)}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            {selectedRecord.jamDinas && (
              <>
                <Divider />
                <Title level={5}>Detail Jam Dinas</Title>
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="Nama Jam Dinas" span={2}>
                    {selectedRecord.jamDinas.nama}
                  </Descriptions.Item>
                  <Descriptions.Item label="Hari Kerja">
                    {selectedRecord.jamDinas.hari_kerja} hari
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Menit">
                    {selectedRecord.jamDinas.menit} menit
                  </Descriptions.Item>
                  <Descriptions.Item label="Status Jam Dinas" span={2}>
                    <Tag color={getStatusColor(selectedRecord.jamDinas.status)}>
                      {getStatusText(selectedRecord.jamDinas.status)}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>

                {selectedRecord.jamDinas.details && selectedRecord.jamDinas.details.length > 0 && (
                  <>
                    <Divider />
                    <Title level={5}>Detail Jadwal</Title>
                    <Table
                      size="small"
                      dataSource={selectedRecord.jamDinas.details}
                      rowKey="id"
                      pagination={false}
                      columns={[
                        {
                          title: 'Hari',
                          dataIndex: 'hari',
                          key: 'hari',
                          render: (hari) => hari.charAt(0).toUpperCase() + hari.slice(1)
                        },
                        {
                          title: 'Tipe',
                          dataIndex: 'tipe',
                          key: 'tipe',
                          render: (tipe) => tipe.charAt(0).toUpperCase() + tipe.slice(1)
                        },
                        {
                          title: 'Jam Masuk',
                          key: 'jam_masuk',
                          render: (_, record) => `${record.jam_masuk_mulai} - ${record.jam_masuk_selesai}`
                        },
                        {
                          title: 'Jam Pulang',
                          key: 'jam_pulang',
                          render: (_, record) => `${record.jam_pulang_mulai} - ${record.jam_pulang_selesai}`
                        }
                      ]}
                    />
                  </>
                )}
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default JamDinasOrganisasiPage;