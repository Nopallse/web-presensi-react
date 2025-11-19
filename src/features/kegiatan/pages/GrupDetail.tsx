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
  DownloadOutlined,
  TeamOutlined,
  EnvironmentOutlined
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
  KDSATKER?: string;
  BIDANGF?: string;
  SUBF?: string | null;
  NM_UNIT_KERJA?: string;
  nama_jabatan?: string;
}

interface GrupDetailData {
  grup: {
    id_grup_peserta: number;
    nama_grup: string;
    jenis_grup: string;
    lokasi?: {
      lokasi_id: number;
      ket: string;
    };
    nama_satker?: string;
  };
  statistik: {
    total_pegawai: number;
    total_hadir: number;
    total_tidak_hadir: number;
    persentase_kehadiran: number;
  };
  pegawai: PegawaiData[];
}

const GrupDetail: React.FC = () => {
  const { id, grupId } = useParams<{ id: string; grupId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<GrupDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [downloadLoading, setDownloadLoading] = useState(false);

  useEffect(() => {
    if (id && grupId) {
      fetchGrupDetail(parseInt(id), parseInt(grupId));
    }
  }, [id, grupId]);

  const fetchGrupDetail = async (kegiatanId: number, grupId: number) => {
    try {
      setLoading(true);
      const response = await kegiatanApi.getDetailGrupPesertaKegiatan(kegiatanId, grupId);
      console.log('Grup detail response:', response);
      if (response && response.success !== false) {
        // Response structure: { success: true, data: { grup, statistik, pegawai } }
        setData(response.data || response);
      } else {
        message.error(response?.error || 'Gagal memuat detail grup peserta');
        setData(null);
      }
    } catch (error: any) {
      console.error('Error fetching grup detail:', error);
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || 'Gagal memuat detail grup peserta';
      message.error(errorMessage);
      setData(null);
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

  // Download Excel untuk detail grup
  const handleDownloadGrupExcel = async () => {
    if (!id || !grupId || !data) return;
    
    try {
      setDownloadLoading(true);
      const blob = await kegiatanApi.downloadGrupPesertaExcel(parseInt(id), parseInt(grupId));
      
      // Buat URL untuk download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Set filename berdasarkan data grup
      // Filename akan di-set oleh backend, tapi kita bisa override jika perlu
      const grupName = data.grup.nama_grup || 'grup';
      link.download = `Laporan_Kehadiran_${grupName.replace(/\s+/g, '_')}.xlsx`;
      
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
      title: 'NIP & Nama',
      key: 'nip_nama',
      width: '25%',
      render: (_: any, record: PegawaiData) => (
        <div>
          <div><Text code style={{ fontSize: '12px' }}>{record.nip}</Text></div>
          <div><Text strong style={{ fontSize: '14px' }}>{record.nama_lengkap}</Text></div>
        </div>
      )
    },
    {
      title: 'Unit Kerja & Jabatan',
      key: 'unit_kerja_jabatan',
      width: '35%',
      render: (_: any, record: PegawaiData) => {
        const kdsatker = record.KDSATKER || '-';
        const bidangf = record.BIDANGF || '-';
        const subf = record.SUBF || null;
        const nmUnitKerja = record.NM_UNIT_KERJA || '-';
        const namaJabatan = record.nama_jabatan || '-';
        
        const unitKerjaId = subf 
          ? `${kdsatker}/${bidangf}/${subf}` 
          : `${kdsatker}/${bidangf}`;
        
        return (
          <div>
            <div>
              <Tooltip title={nmUnitKerja !== '-' ? nmUnitKerja : 'Nama unit kerja tidak tersedia'}>
                <Text code style={{ fontSize: '11px' }}>
                  {unitKerjaId}
                </Text>
              </Tooltip>
            </div>
            {namaJabatan && namaJabatan !== '-' && (
              <div><Text style={{ fontSize: '12px' }}>{namaJabatan}</Text></div>
            )}
          </div>
        );
      }
    },
    {
      title: 'Status Kehadiran',
      dataIndex: 'hadir',
      key: 'hadir',
      width: '15%',
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
      width: '15%',
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
          <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TeamOutlined style={{ color: '#1890ff' }} />
            {data.grup.nama_grup}
          </Title>
          <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            <Tag color={data.grup.jenis_grup === 'opd' ? 'blue' : 'green'}>
              {data.grup.jenis_grup === 'opd' ? 'OPD' : 'Khusus'}
            </Tag>
            {data.grup.lokasi && (
              <Tag icon={<EnvironmentOutlined />} color="geekblue">
                {data.grup.lokasi.ket}
              </Tag>
            )}
            {data.grup.nama_satker && (
              <Text type="secondary" style={{ fontSize: '14px' }}>
                {data.grup.nama_satker}
              </Text>
            )}
          </div>
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
              <span>Daftar Peserta</span>
            </Space>
          }
          style={{ marginTop: '16px' }}
          extra={
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleDownloadGrupExcel}
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
            loading={loading}
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} dari ${total} peserta`,
            }}
            scroll={{ x: 900 }}
            size="middle"
          />
        </Card>
      </Card>
    </div>
  );
};

export default GrupDetail;

