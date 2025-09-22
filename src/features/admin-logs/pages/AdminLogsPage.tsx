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
  Descriptions,
  DatePicker,
  Popconfirm,
  Form,
  InputNumber
} from 'antd';
import {
  EyeOutlined,
  ReloadOutlined,
  DeleteOutlined,
  BarChartOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { adminLogsApi } from '../services/adminLogsApi';
import type {
  AdminLog,
  AdminLogFilters
} from '../types';

const { Option } = Select;
const { Title, Text } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;

interface AdminLogsPageProps {
  className?: string;
}

const AdminLogsPage: React.FC<AdminLogsPageProps> = ({ className }) => {
  const navigate = useNavigate();
  const [data, setData] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AdminLog | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCleanupModal, setShowCleanupModal] = useState(false);
  const [cleanupForm] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [filters, setFilters] = useState<AdminLogFilters>({
    page: 1,
    limit: 20,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await adminLogsApi.getAll(filters);
      setData(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total,
        current: response.pagination.page,
        pageSize: response.pagination.limit,
      }));
    } catch (error) {
      console.error('Error fetching admin logs:', error);
      message.error('Gagal memuat data admin logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

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

  const handleActionFilter = (value: string) => {
    setFilters(prev => ({
      ...prev,
      action: value === 'all' ? undefined : value,
      page: 1,
    }));
  };

  const handleResourceFilter = (value: string) => {
    setFilters(prev => ({
      ...prev,
      resource: value === 'all' ? undefined : value,
      page: 1,
    }));
  };

  const handleLevelFilter = (value: string) => {
    setFilters(prev => ({
      ...prev,
      admin_level: value === 'all' ? undefined : value,
      page: 1,
    }));
  };

  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setFilters(prev => ({
        ...prev,
        start_date: dates[0].format('YYYY-MM-DD'),
        end_date: dates[1].format('YYYY-MM-DD'),
        page: 1,
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        start_date: undefined,
        end_date: undefined,
        page: 1,
      }));
    }
  };

  const handleDetail = (record: AdminLog) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  };

  const handleCleanup = async (values: { days: number }) => {
    try {
      const response = await adminLogsApi.cleanup({ days: values.days });
      message.success(response.message);
      setShowCleanupModal(false);
      cleanupForm.resetFields();
      fetchData();
    } catch (error: any) {
      console.error('Error cleaning up admin logs:', error);
      message.error(error.response?.data?.message || 'Gagal membersihkan admin logs');
    }
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      CREATE: 'green',
      UPDATE: 'blue',
      DELETE: 'red',
      LOGIN: 'cyan',
      LOGOUT: 'purple',
      APPROVE: 'lime',
      REJECT: 'orange',
      EXPORT: 'geekblue'
    };
    return colors[action] || 'default';
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      super_admin: 'purple',
      admin: 'blue',
      'admin-opd': 'green',
      'admin-upt': 'orange'
    };
    return colors[level] || 'default';
  };

  const formatDateTime = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm:ss');
  };

  const columns: ColumnsType<AdminLog> = [
    {
      title: 'Waktu',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 140,
      render: (text) => (
        <Text style={{ fontSize: '12px' }}>
          {formatDateTime(text)}
        </Text>
      ),
      sorter: true,
    },
    {
      title: 'Admin',
      key: 'admin',
      width: 180,
      render: (_, record) => (
        <div>
          <Text strong>{record.admin_username}</Text>
          <br />
          <Tag color={getLevelColor(record.admin_level)}>
            {record.admin_level.replace('-', ' ').toUpperCase()}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Aksi',
      dataIndex: 'action',
      key: 'action',
      width: 100,
      render: (action) => (
        <Tag color={getActionColor(action)}>
          {action}
        </Tag>
      ),
    },
    {
      title: 'Resource',
      dataIndex: 'resource',
      key: 'resource',
      width: 120,
      render: (resource) => (
        <Text style={{ fontSize: '12px', fontFamily: 'monospace' }}>
          {resource}
        </Text>
      ),
    },
    {
      title: 'Deskripsi',
      dataIndex: 'description',
      key: 'description',
      ellipsis: { showTitle: false },
      render: (text) => (
        <Tooltip title={text} placement="topLeft">
          <Text style={{ fontSize: '12px' }}>{text}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'IP Address',
      dataIndex: 'ip_address',
      key: 'ip_address',
      width: 120,
      render: (ip) => (
        <Text style={{ fontSize: '11px', fontFamily: 'monospace' }}>
          {ip}
        </Text>
      ),
    },
    {
      title: 'Aksi',
      key: 'action_buttons',
      width: 80,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Lihat Detail">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleDetail(record)}
              size="small"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const actionOptions = Object.values({
    CREATE: 'CREATE',
    UPDATE: 'UPDATE', 
    DELETE: 'DELETE',
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
    APPROVE: 'APPROVE',
    REJECT: 'REJECT',
    EXPORT: 'EXPORT'
  });

  const resourceOptions = Object.values({
    users: 'users',
    pegawai: 'pegawai',
    skpd: 'skpd',
    unit_kerja: 'unit_kerja',
    lokasi: 'lokasi',
    kegiatan: 'kegiatan',
    jam_dinas: 'jam_dinas',
    presensi: 'presensi',
    device_reset: 'device_reset',
    admin_logs: 'admin_logs',
    pengaturan: 'pengaturan'
  });

  const levelOptions = Object.values({
    super_admin: 'super_admin',
    admin: 'admin',
    'admin-opd': 'admin-opd',
    'admin-upt': 'admin-upt'
  });

  return (
    <div className={className} style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>
      <Row gutter={[0, 16]}>
        <Col span={24}>
          <Card>
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
              <Col>
                <Title level={3} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <UserOutlined />
                  Admin Activity Logs
                </Title>
                <Text type="secondary">
                  Monitor dan kelola log aktivitas admin
                </Text>
              </Col>
              <Col>
                <Space>
                  <Button
                    icon={<BarChartOutlined />}
                    onClick={() => navigate('/admin-logs/stats')}
                  >
                    Statistik
                  </Button>
                  <Popconfirm
                    title="Bersihkan Log Lama"
                    description="Apakah Anda yakin ingin membersihkan log lama?"
                    onConfirm={() => setShowCleanupModal(true)}
                    okText="Ya"
                    cancelText="Tidak"
                  >
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                    >
                      Cleanup
                    </Button>
                  </Popconfirm>
                </Space>
              </Col>
            </Row>

            {/* Filters */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col xs={24} sm={12} md={6}>
                <Search
                  placeholder="Cari deskripsi..."
                  allowClear
                  onSearch={handleSearch}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col xs={24} sm={12} md={4}>
                <Select
                  placeholder="Aksi"
                  allowClear
                  style={{ width: '100%' }}
                  onChange={handleActionFilter}
                >
                  <Option value="all">Semua Aksi</Option>
                  {actionOptions.map(action => (
                    <Option key={action} value={action}>
                      {action}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={4}>
                <Select
                  placeholder="Resource"
                  allowClear
                  style={{ width: '100%' }}
                  onChange={handleResourceFilter}
                >
                  <Option value="all">Semua Resource</Option>
                  {resourceOptions.map(resource => (
                    <Option key={resource} value={resource}>
                      {resource}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={4}>
                <Select
                  placeholder="Level Admin"
                  allowClear
                  style={{ width: '100%' }}
                  onChange={handleLevelFilter}
                >
                  <Option value="all">Semua Level</Option>
                  {levelOptions.map(level => (
                    <Option key={level} value={level}>
                      {level.replace('-', ' ').toUpperCase()}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={4}>
                <RangePicker
                  style={{ width: '100%' }}
                  onChange={handleDateRangeChange}
                  placeholder={['Tanggal Mulai', 'Tanggal Akhir']}
                  format="DD/MM/YYYY"
                />
              </Col>
              <Col xs={24} sm={12} md={2}>
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
              rowKey="id"
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} dari ${total} log`,
                pageSizeOptions: ['10', '20', '50', '100'],
              }}
              onChange={handleTableChange}
              scroll={{ x: true }}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* Detail Modal */}
      <Modal
        title="Detail Admin Log"
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
          <Descriptions bordered column={2}>
            <Descriptions.Item label="ID Log" span={2}>
              {selectedRecord.id}
            </Descriptions.Item>
            <Descriptions.Item label="Admin">
              {selectedRecord.admin_username}
            </Descriptions.Item>
            <Descriptions.Item label="Level Admin">
              <Tag color={getLevelColor(selectedRecord.admin_level)}>
                {selectedRecord.admin_level.replace('-', ' ').toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Aksi">
              <Tag color={getActionColor(selectedRecord.action)}>
                {selectedRecord.action}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Resource">
              {selectedRecord.resource}
            </Descriptions.Item>
            <Descriptions.Item label="Resource ID">
              {selectedRecord.resource_id || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="IP Address">
              {selectedRecord.ip_address}
            </Descriptions.Item>
            <Descriptions.Item label="Waktu" span={2}>
              {formatDateTime(selectedRecord.created_at)}
            </Descriptions.Item>
            <Descriptions.Item label="Deskripsi" span={2}>
              {selectedRecord.description}
            </Descriptions.Item>
            <Descriptions.Item label="User Agent" span={2}>
              <Text style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                {selectedRecord.user_agent}
              </Text>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Cleanup Modal */}
      <Modal
        title="Bersihkan Log Lama"
        open={showCleanupModal}
        onCancel={() => {
          setShowCleanupModal(false);
          cleanupForm.resetFields();
        }}
        footer={null}
        width={400}
      >
        <Form
          form={cleanupForm}
          layout="vertical"
          onFinish={handleCleanup}
          initialValues={{ days: 90 }}
        >
          <Form.Item
            name="days"
            label="Hapus log yang lebih lama dari (hari)"
            rules={[
              { required: true, message: 'Jumlah hari wajib diisi' },
              { type: 'number', min: 1, message: 'Minimal 1 hari' }
            ]}
          >
            <InputNumber
              min={1}
              max={365}
              style={{ width: '100%' }}
              placeholder="Masukkan jumlah hari"
            />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Space>
              <Button onClick={() => {
                setShowCleanupModal(false);
                cleanupForm.resetFields();
              }}>
                Batal
              </Button>
              <Button type="primary" danger htmlType="submit">
                Bersihkan
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminLogsPage;