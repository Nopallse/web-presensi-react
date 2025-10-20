import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
  message, 
  Spin, 
  Table,
  Typography,
  Row,
  Col,
  Statistic,
  Tag,
  Tooltip,
  Progress,
  Input,
  Space
} from 'antd';
import { 
  ArrowLeftOutlined, 
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  SearchOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { kegiatanApi } from '../services/kegiatanApi';
import { formatDateTime, formatTime } from '../../../utils/dateFormatter';

const { Title, Text } = Typography;

interface PegawaiData {
  nip: string;
  nama: string;
  nama_lengkap: string;
  hadir: boolean;
  kehadiran_data: {
    absen_tgljam: string;
  } | null;
}

interface SatkerDetailData {
  satker: {
    id_satker: string;
    nama_satker: string;
  };
  statistik: {
    total_pegawai: number;
    total_hadir: number;
    total_tidak_hadir: number;
    persentase_kehadiran: number;
  };
  pegawai: PegawaiData[];
}

const SatkerDetail: React.FC = () => {
  const { id, satkerId } = useParams<{ id: string; satkerId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<SatkerDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [downloadLoading, setDownloadLoading] = useState(false);

  useEffect(() => {
    if (id && satkerId) {
      fetchSatkerDetail(parseInt(id), satkerId);
    }
  }, [id, satkerId]);

  const fetchSatkerDetail = async (kegiatanId: number, satkerId: string) => {
    try {
      setLoading(true);
      const response = await kegiatanApi.getDetailSatkerKegiatan(kegiatanId, satkerId);
      setData(response.data);
    } catch (error: any) {
      console.error('Error fetching satker detail:', error);
      message.error('Gagal memuat detail satker');
      navigate(`/kegiatan/${id}`);
    } finally {
      setLoading(false);
    }
  };

  // Filter data pegawai berdasarkan search
  const filteredPegawai = data?.pegawai.filter(pegawai => {
    const matchesSearch = searchText === '' || 
      pegawai.nama_lengkap.toLowerCase().includes(searchText.toLowerCase()) ||
      pegawai.nip.toLowerCase().includes(searchText.toLowerCase());
    
    return matchesSearch;
  }) || [];

  // Download Excel untuk detail satker
  const handleDownloadSatkerExcel = async () => {
    try {
      setDownloadLoading(true);
      const blob = await kegiatanApi.downloadSatkerExcel(parseInt(id!), satkerId!);
      
      // Buat URL untuk download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Set filename berdasarkan data satker
      const satkerName = data?.satker.nama_satker || 'satker';
      link.download = `Laporan_Kehadiran_${satkerName.replace(/\s+/g, '_')}.xlsx`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup URL
      window.URL.revokeObjectURL(url);
      
      message.success('File Excel berhasil didownload');
    } catch (error: any) {
      console.error('Error downloading Excel:', error);
      message.error('Gagal mendownload file Excel');
    } finally {
      setDownloadLoading(false);
    }
  };

  const columns: ColumnsType<PegawaiData> = [
    {
      title: 'NIP',
      dataIndex: 'nip',
      key: 'nip',
      width: '20%',
      render: (text: string) => (
        <Text code style={{ fontSize: '12px' }}>
          {text}
        </Text>
      )
    },
    {
      title: 'Nama Pegawai',
      dataIndex: 'nama_lengkap',
      key: 'nama_lengkap',
      width: '40%',
      render: (text: string) => (
        <Text strong style={{ fontSize: '14px' }}>
          {text}
        </Text>
      )
    },
    {
      title: 'Status Kehadiran',
      dataIndex: 'hadir',
      key: 'hadir',
      width: '20%',
      align: 'center',
      filters: [
        { text: 'Hadir', value: 'hadir' },
        { text: 'Tidak Hadir', value: 'tidak_hadir' }
      ],
      onFilter: (value: any, record: PegawaiData) => {
        if (value === 'hadir') return record.hadir === true;
        if (value === 'tidak_hadir') return record.hadir === false;
        return true;
      },
      render: (hadir: boolean) => (
        <Tag 
          color={hadir ? 'success' : 'default'}
          icon={hadir ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
        >
          {hadir ? 'Hadir' : 'Tidak Hadir'}
        </Tag>
      )
    },
    {
      title: 'Waktu Kehadiran',
      dataIndex: 'kehadiran_data',
      key: 'kehadiran_data',
      width: '20%',
      align: 'center',
      sorter: (a: PegawaiData, b: PegawaiData) => {
        // Jika kedua tidak hadir, urutkan berdasarkan nama
        if (!a.kehadiran_data && !b.kehadiran_data) {
          return a.nama_lengkap.localeCompare(b.nama_lengkap);
        }
        // Jika salah satu tidak hadir, yang hadir di atas
        if (!a.kehadiran_data) return 1;
        if (!b.kehadiran_data) return -1;
        // Jika kedua hadir, urutkan berdasarkan waktu
        return new Date(a.kehadiran_data.absen_tgljam).getTime() - new Date(b.kehadiran_data.absen_tgljam).getTime();
      },
      render: (kehadiranData: any) => {
        if (!kehadiranData) {
          return <Text type="secondary">-</Text>;
        }
        return (
          <Tooltip title={formatDateTime(kehadiranData.absen_tgljam)}>
            <Text style={{ fontSize: '12px' }}>
              {formatTime(kehadiranData.absen_tgljam)}
            </Text>
          </Tooltip>
        );
      }
    }
  ];

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px' 
      }}>
        <Text type="secondary">Data tidak ditemukan</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        {/* Header */}
        <div style={{ marginBottom: '24px', position: 'relative' }}>
          <Title level={2} style={{ margin: 0 }}>
            {data.satker.nama_satker}
          </Title>
          <Text type="secondary" style={{ fontSize: '16px' }}>
            ID Satker: {data.satker.id_satker}
          </Text>
          <div style={{ position: 'absolute', top: 0, right: 0 }}>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate(`/kegiatan/${id}`)}
            >
              Kembali
            </Button>
          </div>
        </div>

        {/* Statistik */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Pegawai"
                value={data.statistik.total_pegawai}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Hadir"
                value={data.statistik.total_hadir}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tidak Hadir"
                value={data.statistik.total_tidak_hadir}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Persentase Kehadiran"
                value={data.statistik.persentase_kehadiran}
                suffix="%"
                prefix={<CalendarOutlined />}
                valueStyle={{ 
                  color: data.statistik.persentase_kehadiran >= 80 
                    ? '#52c41a' 
                    : data.statistik.persentase_kehadiran >= 50 
                    ? '#faad14' 
                    : '#ff4d4f' 
                }}
              />
            </Card>
          </Col>
        </Row>

        {/* Progress Bar */}
        <Card style={{ marginBottom: '24px' }}>
          <Title level={4} style={{ marginBottom: '16px' }}>
            Tingkat Kehadiran
          </Title>
          <Progress
            percent={data.statistik.persentase_kehadiran}
            strokeColor={
              data.statistik.persentase_kehadiran >= 80 
                ? '#52c41a' 
                : data.statistik.persentase_kehadiran >= 50 
                ? '#faad14' 
                : '#ff4d4f'
            }
            format={(percent) => `${percent}% (${data.statistik.total_hadir}/${data.statistik.total_pegawai})`}
          />
        </Card>

        {/* Tabel Pegawai */}
        <Card
            title={
                <Space>
                  <UserOutlined />
                  <span>Daftar pegawai</span>
                </Space>
            }
            style={{ marginTop: '16px' }}
              extra={
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={handleDownloadSatkerExcel}
                  loading={downloadLoading}
                >
                  Download Excel
                </Button>
              }
            >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                <Input
                  placeholder="Cari nama atau NIP..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 300 }}
                  allowClear
                />
            </div>
          <Table
            dataSource={filteredPegawai}
            columns={columns}
            rowKey="nip"
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} pegawai`
            }}
            scroll={{ x: 800 }}
          />
        </Card>
      </Card>
    </div>
  );
};

export default SatkerDetail;
