import React from 'react';
import { 
  Card, 
  Typography, 
  Space, 
  Table, 
  Tag, 
  Spin,
  Alert,
  Button
} from 'antd';
import { 
  ReloadOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useSuperAdminDashboard } from '../hooks/useDashboard';
import MasterDataStatsCards from '../components/MasterDataStatsCards';
import KegiatanHariIniCard from '../components/KegiatanHariIniCard';

const { Title, Text } = Typography;

const DashboardPageWithHook: React.FC = () => {
  const { data: dashboardData, loading, error, refetch } = useSuperAdminDashboard();

  // Fallback data untuk mencegah error
  const safeData = {
    systemOverview: dashboardData?.systemOverview ?? { totalUsers: 0 },
    organizationalStatistics: dashboardData?.organizationalStatistics ?? { 
      totalSatker: 0, 
      totalBidang: 0,
      totalSubBidang: 0
    },
    kegiatanHariIni: dashboardData?.kegiatanHariIni ?? [],
    kehadiranList: dashboardData?.kehadiranList ?? { 
      data: [], 
      pagination: { 
        currentPage: 1, 
        totalPages: 0, 
        totalItems: 0, 
        itemsPerPage: 10 
      } 
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HADIR':
        return 'success';
      case 'TERLAMBAT':
        return 'warning';
      case 'TIDAK_HADIR':
        return 'error';
      default:
        return 'default';
    }
  };

  // Render combined check-in time with morning attendance status
  const renderJamMasukApelPagi = (record: any) => {
    const time = record.absen_checkin;
    const apelStatus = record.absen_apel;
    
    // Format time to HH:MM (remove seconds)
    const formattedTime = time ? time.substring(0, 5) : '-';
    
    return (
      <Space direction="vertical" size="small">
        <Space>
          <ClockCircleOutlined style={{ color: time ? '#52c41a' : '#ff4d4f' }} />
          <Text>{formattedTime}</Text>
        </Space>
        {apelStatus ? renderApelStatus(apelStatus, 'pagi') : <Text type="secondary">-</Text>}
      </Space>
    );
  };

  // Render combined check-out time with afternoon attendance status
  const renderJamKeluarApelSore = (record: any) => {
    const time = record.absen_checkout;
    const apelStatus = record.absen_sore;
    
    // Format time to HH:MM (remove seconds)
    const formattedTime = time ? time.substring(0, 5) : '-';
    
    return (
      <Space direction="vertical" size="small">
        <Space>
          <ClockCircleOutlined style={{ color: time ? '#52c41a' : '#ff4d4f' }} />
          <Text>{formattedTime}</Text>
        </Space>
        {apelStatus ? renderApelStatus(apelStatus, 'sore') : <Text type="secondary">-</Text>}
      </Space>
    );
  };

  // Render apel status
  const renderApelStatus = (status: string | null | undefined, type: 'pagi' | 'sore') => {
    if (!status) return <Text type="secondary">-</Text>;
    
    let color = 'default';
    let text = status;
    
    if (type === 'pagi') {
      color = status === 'HAP' ? 'green' : 'orange';
      text = status === 'HAP' ? 'Hadir' : 'Telat';
    } else {
      color = status === 'HAS' ? 'green' : 'red';
      text = status === 'HAS' ? 'Hadir' : 'Cepat Pulang';
    }
    
    return <Tag color={color}>{text}</Tag>;
  };

  // Render status tags for kehadiran
  const renderStatusTag = (record: any) => {
    if (record.absen_kat) {
      return (
        <Tag color={getStatusColor(record.absen_kat)}>
          {record.absen_kat}
        </Tag>
      );
    }
    return <Text type="secondary">-</Text>;
  };

  const kehadiranColumns = [
    {
      title: 'Tanggal',
      dataIndex: 'absen_tgl',
      key: 'absen_tgl',
      width: 120,
      render: (date: string) => {
        const formattedDate = new Date(date).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
        return <Text>{formattedDate}</Text>;
      }
    },
    {
      title: 'Username',
      dataIndex: 'User',
      key: 'username',
      width: 150,
      render: (user: any, record: any) => (
        <Text strong>{user?.username || record.absen_nip}</Text>
      )
    },
    {
      title: 'Jam Masuk',
      key: 'jam_masuk_apel_pagi',
      width: 150,
      render: (_: any, record: any) => renderJamMasukApelPagi(record)
    },
    {
      title: 'Jam Keluar',
      key: 'jam_keluar_apel_sore',
      width: 150,
      render: (_: any, record: any) => renderJamKeluarApelSore(record)
    },
    {
      title: 'Lokasi',
      dataIndex: 'Lokasi',
      key: 'lokasi',
      width: 150,
      ellipsis: true,
      render: (lokasi: any, record: any) => (
        <Text title={lokasi ? `${lokasi.ket} (Lat: ${lokasi.lat}, Lng: ${lokasi.lng})` : undefined}>
          {lokasi?.ket || record.lokasi_id || '-'}
        </Text>
      )
    },
    {
      title: 'Status',
      key: 'status',
      width: 100,
      render: (_: any, record: any) => renderStatusTag(record)
    }
  ];

  if (loading) {
    return (
      <div style={{ padding: '24px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              Dashboard Super Admin
            </Title>
            <p style={{ color: '#666', margin: '8px 0 0' }}>
              Memuat data dashboard...
            </p>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '300px' 
          }}>
            <Spin size="large" tip="Memuat data dashboard..." />
          </div>
        </Space>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              Dashboard Super Admin
            </Title>
            <p style={{ color: '#666', margin: '8px 0 0' }}>
              Terjadi kesalahan saat memuat data
            </p>
          </div>
          <Alert
            message="Gagal Memuat Dashboard"
            description={`${error}. Pastikan koneksi internet stabil dan server dapat diakses.`}
            type="error"
            showIcon
            action={
              <Button size="small" type="primary" onClick={refetch}>
                Coba Lagi
              </Button>
            }
          />
        </Space>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              Dashboard Super Admin
            </Title>
            <p style={{ color: '#666', margin: '8px 0 4px 0' }}>
              Sistem Presensi Pegawai Kota Pariaman - Ringkasan Data Sistem
            </p>
          </div>
          <Space>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Auto refresh setiap 5 menit
            </Text>
            <Button 
              type="default" 
              icon={<ReloadOutlined />}
              onClick={refetch}
              loading={loading}
              size="small"
            >
              Refresh
            </Button>
          </Space>
        </div>

        {/* Master Data Statistics */}
        <Card title="Statistik Organisasi" size="default">
          <MasterDataStatsCards
            totalUsers={safeData.systemOverview.totalUsers}
            totalSatker={safeData.organizationalStatistics.totalSatker}
            totalBidang={safeData.organizationalStatistics.totalBidang}
            totalSubBidang={safeData.organizationalStatistics.totalSubBidang}
          />
        </Card>

        {/* Kegiatan Hari Ini */}
        <KegiatanHariIniCard 
          kegiatanList={safeData.kegiatanHariIni}
          loading={loading}
        />

        {/* Recent Attendance */}
        <Card 
          title="Kehadiran Terbaru" 
          size="default"
          extra={
            <Text type="secondary">
              {safeData.kehadiranList.pagination.totalItems} dari {safeData.kehadiranList.pagination.totalItems} data
            </Text>
          }
        >
          {safeData.kehadiranList.data && safeData.kehadiranList.data.length > 0 ? (
            <Table
              columns={kehadiranColumns}
              dataSource={safeData.kehadiranList.data}
              rowKey="absen_id"
              pagination={false}
              scroll={{ x: 800 }}
              size="middle"
            />
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '48px 0', 
              color: '#999' 
            }}>
              Belum ada data kehadiran hari ini
            </div>
          )}
        </Card>
      </Space>
    </div>
  );
};

export default DashboardPageWithHook;