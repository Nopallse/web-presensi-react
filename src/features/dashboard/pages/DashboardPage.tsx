import React, { useState, useEffect } from 'react';
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
  ClockCircleOutlined
} from '@ant-design/icons';
import { dashboardApi, type SuperAdminDashboardData } from '../services/dashboardApi';
import MasterDataStatsCards from '../components/MasterDataStatsCards';
import KegiatanHariIniCard from '../components/KegiatanHariIniCard';

const { Title, Text } = Typography;

const DashboardPage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<SuperAdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


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

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardApi.getSuperAdminDashboard();
      setDashboardData(data);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Gagal mengambil data dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Auto refresh setiap 5 menit
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);





  // Render combined check-in time with morning attendance status
  const renderJamMasukApelPagi = (record: any) => {
    const time = record.absen_checkin;
    const apelStatus = record.absen_apel;
    
    // Format time to HH:MM (remove seconds)
    const formattedTime = time ? time.substring(0, 5) : '-';
    
    return (
      <Space direction="horizontal" size="small">
        <Space>
          <Text style={{ fontSize: '13px' }}>{formattedTime}</Text>
        </Space>
        {apelStatus ? renderApelStatus(apelStatus, 'pagi') : <Text type="secondary" style={{ fontSize: '11px' }}>-</Text>}
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
      <Space direction="horizontal" size="small">
        <Space>
          <Text style={{ fontSize: '13px' }}>{formattedTime}</Text>
        </Space>
        {apelStatus ? renderApelStatus(apelStatus, 'sore') : <Text type="secondary" style={{ fontSize: '11px' }}>-</Text>}
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
      text = status === 'HAP' ? 'HAP' : 'TAP';
    } else {
      color = status === 'HAS' ? 'green' : 'red';
      text = status === 'HAS' ? 'HAS' : 'CP';
    }
    
    return <Tag color={color}>{text}</Tag>;
  };



  const kehadiranColumns = [
    {
      title: 'Tanggal',
      dataIndex: 'absen_tgl',
      key: 'absen_tgl',
      width: 110,
      render: (date: string) => {
        const formattedDate = new Date(date).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
        return <Text style={{ fontSize: '13px' }}>{formattedDate}</Text>;
      }
    },
    {
      title: 'Username',
      dataIndex: 'User',
      key: 'username',
      width: 140,
      render: (user: any, record: any) => (
        <Text strong style={{ fontSize: '13px' }}>{user?.username || record.absen_nip}</Text>
      )
    },
    {
      title: 'Jam Masuk',
      key: 'jam_masuk_apel_pagi',
      width: 140,
      render: (_: any, record: any) => renderJamMasukApelPagi(record)
    },
    {
      title: 'Jam Keluar',
      key: 'jam_keluar_apel_sore',
      width: 140,
      render: (_: any, record: any) => renderJamKeluarApelSore(record)
    },
    {
      title: 'Lokasi',
      dataIndex: 'Lokasi',
      key: 'lokasi',
      width: 200,
      ellipsis: true,
      render: (lokasi: any, record: any) => (
        <Text 
          title={lokasi ? `${lokasi.ket} (Lat: ${lokasi.lat}, Lng: ${lokasi.lng})` : undefined}
          style={{ fontSize: '13px' }}
        >
          {lokasi?.ket || record.lokasi_id || '-'}
        </Text>
      )
    }
  ];

  if (loading) {
    return (
      <div style={{ padding: '24px', maxWidth: '100%', overflow: 'hidden' }}>
        <Card>
          <div style={{ marginBottom: '16px' }}>
            <Title level={3} style={{ margin: 0, marginBottom: '4px' }}>
              Dashboard Super Admin
            </Title>
            <Text type="secondary">Memuat data dashboard...</Text>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '300px' 
          }}>
            <Spin size="large" tip="Memuat data dashboard..." />
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px', maxWidth: '100%', overflow: 'hidden' }}>
        <Card>
          <div style={{ marginBottom: '16px' }}>
            <Title level={3} style={{ margin: 0, marginBottom: '4px' }}>
              Dashboard Super Admin
            </Title>
            <Text type="secondary">Terjadi kesalahan saat memuat data</Text>
          </div>
          <Alert
            message="Gagal Memuat Dashboard"
            description={`${error}. Pastikan koneksi internet stabil dan server dapat diakses.`}
            type="error"
            showIcon
            action={
              <Button size="small" type="primary" onClick={fetchDashboardData}>
                Coba Lagi
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '100%', overflow: 'hidden' }}>
      <Card>
        {/* Page Header */}
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <Title level={3} style={{ margin: 0, marginBottom: '4px' }}>
              Dashboard Super Admin
            </Title>
            <Text type="secondary">
              Sistem Presensi Pegawai Kota Pariaman - Ringkasan Data Sistem
            </Text>
          </div>
          
          <Button 
            icon={<ClockCircleOutlined />}
            onClick={fetchDashboardData}
            loading={loading}
            size="small"
          >
            Refresh
          </Button>
        </div>

        {/* Master Data Statistics */}
        <div style={{ marginBottom: '24px' }}>
          <Title level={4} style={{ marginBottom: '16px', fontSize: '16px' }}>
            Statistik Organisasi
          </Title>
          <MasterDataStatsCards
            totalUsers={safeData.systemOverview.totalUsers}
            totalSatker={safeData.organizationalStatistics.totalSatker}
            totalBidang={safeData.organizationalStatistics.totalBidang}
            totalSubBidang={safeData.organizationalStatistics.totalSubBidang}
          />
        </div>

        {/* Kegiatan Hari Ini */}
        <div style={{ marginBottom: '24px' }}>
          <KegiatanHariIniCard 
            kegiatanList={safeData.kegiatanHariIni}
            loading={loading}
          />
        </div>

        {/* Recent Attendance */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Title level={4} style={{ margin: 0, fontSize: '16px' }}>
              Kehadiran Terbaru
            </Title>
            <Text type="secondary" style={{ fontSize: '13px' }}>
              {safeData.kehadiranList.pagination.totalItems} data kehadiran
            </Text>
          </div>
          
          {safeData.kehadiranList.data && safeData.kehadiranList.data.length > 0 ? (
            <Table
              columns={kehadiranColumns}
              dataSource={safeData.kehadiranList.data}
              rowKey="absen_id"
              pagination={false}
              scroll={{ x: 800 }}
              size="small"
              bordered={false}
            />
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '48px 0', 
              color: '#999',
              backgroundColor: '#fafafa',
              borderRadius: '6px'
            }}>
              <Text type="secondary">Belum ada data kehadiran hari ini</Text>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;