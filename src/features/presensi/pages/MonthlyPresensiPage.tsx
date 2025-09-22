import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Select,
  Statistic,
  Table,
  Button,
  DatePicker,
  Typography,
  Space,
  message,
  Tag,
  Progress,
  Divider
} from 'antd';
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  DownloadOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { presensiApi } from '../services/presensiApi';
import type {
  MonthlyAttendanceData,
  MonthlyAttendanceFilters,
  AttendanceStats
} from '../types';

const { Option } = Select;
const { Title, Text } = Typography;

const MonthlyPresensiPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State management
  const [data, setData] = useState<MonthlyAttendanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState<MonthlyAttendanceFilters>({
    year: parseInt(searchParams.get('year') || '') || new Date().getFullYear(),
    month: parseInt(searchParams.get('month') || '') || (new Date().getMonth() + 1),
    lokasi_id: searchParams.get('lokasi_id') || undefined,
    user_id: searchParams.get('user_id') || undefined,
    page: 1,
    limit: 31 // For daily breakdown
  });

  useEffect(() => {
    fetchMonthlyData();
  }, [filters.year, filters.month, filters.lokasi_id, filters.user_id]);

  const fetchMonthlyData = async () => {
    setLoading(true);
    try {
      const response = await presensiApi.getMonthlyAttendanceByFilter(filters);
      
      if (response.success) {
        setData(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching monthly data:', error);
      message.error(error.message || 'Gagal memuat data bulanan');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof MonthlyAttendanceFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update URL search params
    const newParams = new URLSearchParams();
    if (newFilters.year) newParams.set('year', newFilters.year.toString());
    if (newFilters.month) newParams.set('month', newFilters.month.toString());
    if (newFilters.lokasi_id) newParams.set('lokasi_id', newFilters.lokasi_id);
    if (newFilters.user_id) newParams.set('user_id', newFilters.user_id);
    
    setSearchParams(newParams);
  };

  const handleExport = async () => {
    if (!filters.year || !filters.month) {
      message.warning('Pilih bulan dan tahun terlebih dahulu');
      return;
    }

    setExportLoading(true);
    try {
      await presensiApi.exportAndDownloadBulanan({
        month: filters.month,
        year: filters.year
      });
      message.success('Export berhasil diunduh');
    } catch (error: any) {
      message.error(error.message || 'Gagal export data');
    } finally {
      setExportLoading(false);
    }
  };

  const renderStatisticsCards = (stats: AttendanceStats) => {
    const total = stats.total || 1; // Prevent division by zero
    
    const statisticsData = [
      {
        title: 'Total Kehadiran',
        value: stats.total,
        icon: <TeamOutlined style={{ color: '#1890ff' }} />,
        color: '#1890ff'
      },
      {
        title: 'Hadir',
        value: stats.HADIR,
        percentage: Math.round((stats.HADIR / total) * 100),
        icon: <TrophyOutlined style={{ color: '#52c41a' }} />,
        color: '#52c41a'
      },
      {
        title: 'Hadir Apel Pagi',
        value: stats.HAP,
        percentage: Math.round((stats.HAP / total) * 100),
        icon: <ClockCircleOutlined style={{ color: '#52c41a' }} />,
        color: '#52c41a'
      },
      {
        title: 'Telat Apel Pagi',
        value: stats.TAP,
        percentage: Math.round((stats.TAP / total) * 100),
        icon: <ClockCircleOutlined style={{ color: '#faad14' }} />,
        color: '#faad14'
      },
      {
        title: 'Hadir Apel Sore',
        value: stats.HAS,
        percentage: Math.round((stats.HAS / total) * 100),
        icon: <ClockCircleOutlined style={{ color: '#52c41a' }} />,
        color: '#52c41a'
      },
      {
        title: 'Cepat Pulang',
        value: stats.CP,
        percentage: Math.round((stats.CP / total) * 100),
        icon: <ClockCircleOutlined style={{ color: '#ff4d4f' }} />,
        color: '#ff4d4f'
      }
    ];

    return (
      <Row gutter={[16, 16]}>
        {statisticsData.map((stat, index) => (
          <Col xs={12} sm={8} lg={4} key={index}>
            <Card size="small">
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.icon}
                valueStyle={{ color: stat.color, fontSize: '24px' }}
              />
              {stat.percentage !== undefined && (
                <Progress
                  percent={stat.percentage}
                  size="small"
                  strokeColor={stat.color}
                  showInfo={false}
                  style={{ marginTop: 8 }}
                />
              )}
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  const dailyColumns = [
    {
      title: 'Tanggal',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date: string) => (
        <Space>
          <CalendarOutlined />
          <Text>{dayjs(date).format('DD/MM')}</Text>
        </Space>
      )
    },
    {
      title: 'Hari',
      dataIndex: 'date',
      key: 'day',
      width: 100,
      render: (date: string) => (
        <Text>{dayjs(date).format('dddd')}</Text>
      )
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: 80,
      render: (value: number) => (
        <Tag color="blue">{value}</Tag>
      )
    },
    {
      title: 'Hadir',
      dataIndex: 'HADIR',
      key: 'HADIR',
      width: 80,
      render: (value: number) => (
        <Tag color={value > 0 ? 'green' : 'default'}>{value}</Tag>
      )
    },
    {
      title: 'HAP',
      dataIndex: 'HAP',
      key: 'HAP',
      width: 60,
      render: (value: number) => (
        <Tag color={value > 0 ? 'green' : 'default'}>{value}</Tag>
      )
    },
    {
      title: 'TAP',
      dataIndex: 'TAP',
      key: 'TAP',
      width: 60,
      render: (value: number) => (
        <Tag color={value > 0 ? 'orange' : 'default'}>{value}</Tag>
      )
    },
    {
      title: 'HAS',
      dataIndex: 'HAS',
      key: 'HAS',
      width: 60,
      render: (value: number) => (
        <Tag color={value > 0 ? 'green' : 'default'}>{value}</Tag>
      )
    },
    {
      title: 'CP',
      dataIndex: 'CP',
      key: 'CP',
      width: 60,
      render: (value: number) => (
        <Tag color={value > 0 ? 'red' : 'default'}>{value}</Tag>
      )
    }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <Row gutter={[0, 24]}>
        {/* Header */}
        <Col span={24}>
          <Card>
            <Row justify="space-between" align="middle">
              <Col>
                <Space>
                  <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/presensi')}
                  >
                    Kembali
                  </Button>
                  <Divider type="vertical" />
                  <div>
                    <Title level={3} style={{ margin: 0 }}>
                      Laporan Presensi Bulanan
                    </Title>
                    <Text type="secondary">
                      {data ? `${data.period} - Total: ${data.summary.total} kehadiran` : 'Memuat data...'}
                    </Text>
                  </div>
                </Space>
              </Col>
              <Col>
                <Space>
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={handleExport}
                    loading={exportLoading}
                    disabled={!data}
                  >
                    Export Excel
                  </Button>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={fetchMonthlyData}
                    loading={loading}
                  >
                    Refresh
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Filters */}
        <Col span={24}>
          <Card title="Filter" size="small">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={6}>
                <DatePicker
                  picker="year"
                  placeholder="Pilih Tahun"
                  value={filters.year ? dayjs().year(filters.year) : null}
                  onChange={(date) => handleFilterChange('year', date?.year())}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col xs={24} sm={6}>
                <Select
                  placeholder="Pilih Bulan"
                  value={filters.month}
                  onChange={(value) => handleFilterChange('month', value)}
                  style={{ width: '100%' }}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <Option key={i + 1} value={i + 1}>
                      {dayjs().month(i).format('MMMM')}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={6}>
                <Select
                  placeholder="Filter Lokasi"
                  value={filters.lokasi_id}
                  onChange={(value) => handleFilterChange('lokasi_id', value)}
                  style={{ width: '100%' }}
                  allowClear
                >
                  {/* Add location options here */}
                </Select>
              </Col>
              <Col xs={24} sm={6}>
                <Select
                  placeholder="Filter User"
                  value={filters.user_id}
                  onChange={(value) => handleFilterChange('user_id', value)}
                  style={{ width: '100%' }}
                  allowClear
                >
                  {/* Add user options here */}
                </Select>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Statistics */}
        {data && (
          <Col span={24}>
            <Card title="Statistik Kehadiran" loading={loading}>
              {renderStatisticsCards(data.summary)}
            </Card>
          </Col>
        )}

        {/* Daily Breakdown */}
        {data && data.dailyBreakdown.length > 0 && (
          <Col span={24}>
            <Card title="Breakdown Harian" loading={loading}>
              <Table
                columns={dailyColumns}
                dataSource={data.dailyBreakdown}
                rowKey="date"
                pagination={false}
                scroll={{ x: 600 }}
                size="small"
                bordered
              />
            </Card>
          </Col>
        )}

        {/* Empty State */}
        {data && data.dailyBreakdown.length === 0 && (
          <Col span={24}>
            <Card>
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <CalendarOutlined style={{ fontSize: '48px', color: '#bfbfbf' }} />
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary" style={{ fontSize: '16px' }}>
                    Tidak ada data kehadiran untuk periode yang dipilih
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default MonthlyPresensiPage;