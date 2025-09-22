import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Statistic,
  DatePicker,
  Space,
  Button,
  Table,
  Tag
} from 'antd';
import {
  BarChartOutlined,
  UserOutlined,
  SettingOutlined,
  ReloadOutlined,
  LineChartOutlined,
  PieChartOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { adminLogsApi } from '../services/adminLogsApi';
import type { AdminLogStats } from '../types';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface AdminLogsStatsPageProps {
  className?: string;
}

const AdminLogsStatsPage: React.FC<AdminLogsStatsPageProps> = ({ className }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminLogStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<{
    start_date?: string;
    end_date?: string;
    admin_id?: number;
  }>({});

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await adminLogsApi.getStats(filters);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching admin logs stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [filters]);

  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setFilters(prev => ({
        ...prev,
        start_date: dates[0].format('YYYY-MM-DD'),
        end_date: dates[1].format('YYYY-MM-DD'),
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        start_date: undefined,
        end_date: undefined,
      }));
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

  const actionColumns: ColumnsType<{ action: string; count: number }> = [
    {
      title: 'Aksi',
      dataIndex: 'action',
      key: 'action',
      render: (action) => (
        <Tag color={getActionColor(action)}>
          {action}
        </Tag>
      ),
    },
    {
      title: 'Jumlah',
      dataIndex: 'count',
      key: 'count',
      align: 'right',
      render: (count) => <Text strong>{count.toLocaleString()}</Text>,
    },
  ];

  const resourceColumns: ColumnsType<{ resource: string; count: number }> = [
    {
      title: 'Resource',
      dataIndex: 'resource',
      key: 'resource',
      render: (resource) => (
        <Text style={{ fontFamily: 'monospace' }}>{resource}</Text>
      ),
    },
    {
      title: 'Jumlah',
      dataIndex: 'count',
      key: 'count',
      align: 'right',
      render: (count) => <Text strong>{count.toLocaleString()}</Text>,
    },
  ];

  const levelColumns: ColumnsType<{ admin_level: string; count: number }> = [
    {
      title: 'Level Admin',
      dataIndex: 'admin_level',
      key: 'admin_level',
      render: (level) => (
        <Tag color={getLevelColor(level)}>
          {level.replace('-', ' ').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Jumlah',
      dataIndex: 'count',
      key: 'count',
      align: 'right',
      render: (count) => <Text strong>{count.toLocaleString()}</Text>,
    },
  ];

  const adminColumns: ColumnsType<{
    admin_id: number;
    admin_username: string;
    admin_level: string;
    count: number;
  }> = [
    {
      title: 'Admin',
      key: 'admin',
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
      title: 'Total Aktivitas',
      dataIndex: 'count',
      key: 'count',
      align: 'right',
      render: (count) => <Text strong>{count.toLocaleString()}</Text>,
    },
  ];

  const activityColumns: ColumnsType<{ date: string; count: number }> = [
    {
      title: 'Tanggal',
      dataIndex: 'date',
      key: 'date',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Jumlah Aktivitas',
      dataIndex: 'count',
      key: 'count',
      align: 'right',
      render: (count) => <Text strong>{count.toLocaleString()}</Text>,
    },
  ];

  return (
    <div className={className} style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>
      <Row gutter={[0, 16]}>
        <Col span={24}>
          <Card>
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
              <Col>
                <Space>
                  <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/admin-logs')}
                  >
                    Kembali
                  </Button>
                  <Title level={3} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <BarChartOutlined />
                    Statistik Admin Logs
                  </Title>
                </Space>
                <Text type="secondary">
                  Analisis dan statistik aktivitas admin
                </Text>
              </Col>
              <Col>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchStats}
                  loading={loading}
                >
                  Refresh
                </Button>
              </Col>
            </Row>

            {/* Filters */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={12} md={8}>
                <RangePicker
                  style={{ width: '100%' }}
                  onChange={handleDateRangeChange}
                  placeholder={['Tanggal Mulai', 'Tanggal Akhir']}
                  format="DD/MM/YYYY"
                />
              </Col>
            </Row>

            {/* Summary Statistics */}
            {stats && (
              <>
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic
                        title="Total Log Aktivitas"
                        value={stats.totalLogs}
                        prefix={<UserOutlined />}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic
                        title="Total Jenis Aksi"
                        value={stats.logsByAction.length}
                        prefix={<SettingOutlined />}
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic
                        title="Total Resource"
                        value={stats.logsByResource.length}
                        prefix={<PieChartOutlined />}
                        valueStyle={{ color: '#722ed1' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic
                        title="Admin Aktif"
                        value={stats.mostActiveAdmins.length}
                        prefix={<LineChartOutlined />}
                        valueStyle={{ color: '#fa8c16' }}
                      />
                    </Card>
                  </Col>
                </Row>

                {/* Charts and Tables */}
                <Row gutter={[16, 16]}>
                  {/* Actions Statistics */}
                  <Col xs={24} lg={12}>
                    <Card
                      title={
                        <Space>
                          <BarChartOutlined />
                          Log berdasarkan Aksi
                        </Space>
                      }
                      size="small"
                    >
                      <Table
                        dataSource={stats.logsByAction}
                        columns={actionColumns}
                        rowKey="action"
                        pagination={false}
                        size="small"
                      />
                    </Card>
                  </Col>

                  {/* Resources Statistics */}
                  <Col xs={24} lg={12}>
                    <Card
                      title={
                        <Space>
                          <PieChartOutlined />
                          Log berdasarkan Resource
                        </Space>
                      }
                      size="small"
                    >
                      <Table
                        dataSource={stats.logsByResource}
                        columns={resourceColumns}
                        rowKey="resource"
                        pagination={false}
                        size="small"
                      />
                    </Card>
                  </Col>

                  {/* Admin Levels Statistics */}
                  <Col xs={24} lg={12}>
                    <Card
                      title={
                        <Space>
                          <UserOutlined />
                          Log berdasarkan Level Admin
                        </Space>
                      }
                      size="small"
                    >
                      <Table
                        dataSource={stats.logsByLevel}
                        columns={levelColumns}
                        rowKey="admin_level"
                        pagination={false}
                        size="small"
                      />
                    </Card>
                  </Col>

                  {/* Most Active Admins */}
                  <Col xs={24} lg={12}>
                    <Card
                      title={
                        <Space>
                          <LineChartOutlined />
                          Admin Paling Aktif
                        </Space>
                      }
                      size="small"
                    >
                      <Table
                        dataSource={stats.mostActiveAdmins}
                        columns={adminColumns}
                        rowKey="admin_id"
                        pagination={false}
                        size="small"
                      />
                    </Card>
                  </Col>

                  {/* Recent Activity */}
                  <Col xs={24}>
                    <Card
                      title={
                        <Space>
                          <LineChartOutlined />
                          Aktivitas 7 Hari Terakhir
                        </Space>
                      }
                      size="small"
                    >
                      <Table
                        dataSource={stats.recentActivity}
                        columns={activityColumns}
                        rowKey="date"
                        pagination={false}
                        size="small"
                      />
                    </Card>
                  </Col>
                </Row>
              </>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminLogsStatsPage;