import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Descriptions,
  Tag,
  Button,
  Table,
  DatePicker,
  Space,
  Typography,
  Spin,
  message,
  Divider,
  Tooltip,
} from 'antd';
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { pegawaiApi } from '../services/pegawaiApi';
import type { Pegawai, Kehadiran, KehadiranFilters } from '../types';
import { formatDate, formatTime, formatDateTime } from '../../../utils/dateFormatter';

// Import GoogleMap component dynamically to avoid SSR issues
const GoogleMap = React.lazy(() => import('../../../components/GoogleMap'));

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const PegawaiDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [pegawai, setPegawai] = useState<Pegawai | null>(null);
  const [kehadiranList, setKehadiranList] = useState<Kehadiran[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [loadingKehadiran, setLoadingKehadiran] = useState(false);
  
  const [kehadiranFilters, setKehadiranFilters] = useState<KehadiranFilters>({
    page: 1,
    limit: 10,
    sort: 'desc', // Default sort descending (terbaru dulu)
  });
  
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Fetch pegawai detail
  useEffect(() => {
    if (id) {
      fetchPegawaiDetail(id);
    }
  }, [id]);

  // Fetch kehadiran when filters change
  useEffect(() => {
    if (id) {
      fetchKehadiran(id, kehadiranFilters);
    }
  }, [id, kehadiranFilters]);

  const fetchPegawaiDetail = async (pegawaiId: string) => {
    try {
      setLoadingDetail(true);
      const data = await pegawaiApi.getById(pegawaiId);
      setPegawai(data);
    } catch (error: any) {
      console.error('Error fetching pegawai detail:', error);
      message.error('Gagal memuat detail pegawai');
      navigate('/pegawai');
    } finally {
      setLoadingDetail(false);
    }
  };

  const fetchKehadiran = async (pegawaiId: string, filters: KehadiranFilters) => {
    try {
      setLoadingKehadiran(true);
      const response = await pegawaiApi.getKehadiranByUserId(pegawaiId, filters);
      setKehadiranList(response.data);
      setPagination(prev => ({
        ...prev,
        current: response.pagination.currentPage,
        total: response.pagination.totalItems,
        pageSize: response.pagination.itemsPerPage,
      }));
    } catch (error: any) {
      console.error('Error fetching kehadiran:', error);
      message.error('Gagal memuat data kehadiran');
    } finally {
      setLoadingKehadiran(false);
    }
  };

  const handleTableChange = (paginationInfo: any) => {
    setKehadiranFilters(prev => ({
      ...prev,
      page: paginationInfo.current,
      limit: paginationInfo.pageSize,
    }));
  };

  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setKehadiranFilters(prev => ({
        ...prev,
        startDate: dates[0].format('YYYY-MM-DD'),
        endDate: dates[1].format('YYYY-MM-DD'),
        page: 1, // Reset to first page
      }));
    } else {
      setKehadiranFilters(prev => ({
        ...prev,
        startDate: undefined,
        endDate: undefined,
        page: 1,
      }));
    }
  };

  const handleSortChange = (sortValue: 'asc' | 'desc') => {
    setKehadiranFilters(prev => ({
      ...prev,
      sort: sortValue,
      page: 1, // Reset to first page
    }));
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HADIR': return 'green';
      case 'SAKIT': return 'orange';
      case 'IZIN': return 'blue';
      case 'ALPHA': return 'red';
      default: return 'default';
    }
  };

  const getApelColor = (apel: string) => {
    switch (apel) {
      case 'HAP': return 'green';
      case 'TAP': return 'red';
      default: return 'default';
    }
  };

  const kehadiranColumns: ColumnsType<Kehadiran> = [
    {
      title: (
        <Space>
          Tanggal
          <Tooltip title="Klik untuk mengurutkan">
            <Button
              type="text"
              size="small"
              icon={kehadiranFilters.sort === 'desc' ? <SortDescendingOutlined /> : <SortAscendingOutlined />}
              onClick={() => handleSortChange(kehadiranFilters.sort === 'desc' ? 'asc' : 'desc')}
            />
          </Tooltip>
        </Space>
      ),
      dataIndex: 'absen_tgl',
      key: 'absen_tgl',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Check In',
      dataIndex: 'absen_checkin',
      key: 'absen_checkin',
      render: (time: string) => formatTime(time),
    },
    {
      title: 'Check Out',
      dataIndex: 'absen_checkout',
      key: 'absen_checkout',
      render: (time: string) => formatTime(time),
    },
    {
      title: 'Status',
      dataIndex: 'absen_kat',
      key: 'absen_kat',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: 'Apel Pagi',
      dataIndex: 'absen_apel',
      key: 'absen_apel',
      render: (apel: string) => (
        <Tag color={getApelColor(apel)}>
          {apel === 'HAP' ? 'Hadir' : 'Tidak Hadir'}
        </Tag>
      ),
    },
    {
      title: 'Apel Sore',
      dataIndex: 'absen_sore',
      key: 'absen_sore',
      render: (sore: string) => (
        <Tag color={getApelColor(sore)}>
          {sore === 'HAS' ? 'Hadir' : 'Tidak Hadir'}
        </Tag>
      ),
    },
    {
      title: 'Lokasi',
      dataIndex: 'Lokasi',
      key: 'lokasi',
      render: (lokasi: any) => (
        <div>
          <div>{lokasi.ket}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {lokasi.lat}, {lokasi.lng}
          </Text>
        </div>
      ),
    },
  ];

  if (loadingDetail) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (!pegawai) {
    return (
      <div className="text-center py-8">
        <p>Pegawai tidak ditemukan</p>
        <Button onClick={() => navigate('/pegawai')}>
          Kembali ke Daftar Pegawai
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'space-between' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Detail Pegawai
          </Title>
          <Text type="secondary">
            Informasi lengkap dan riwayat kehadiran pegawai
          </Text>
        </div>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/pegawai')}
        >
          Kembali
        </Button>
      </div>
      

      <Row gutter={[24, 24]}>
        {/* Profile Card */}
        <Col xs={24} lg={8}>
          <Card title="Profil Pegawai" style={{ marginBottom: '24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <Title level={4} style={{ margin: '8px 0' }}>
                {pegawai.nama || 'Nama tidak tersedia'}
              </Title>
              <Text type="secondary" style={{ fontSize: '14px' }}>
                {pegawai.nip}
              </Text>
              <br />
              <Tag
                color={pegawai.status_aktif === 'AKTIF' ? 'green' : 'red'}
                style={{ marginTop: '8px' }}
              >
                {pegawai.status_aktif || 'Status tidak tersedia'}
              </Tag>
            </div>

            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label={<> Email</>}>
                {pegawai.email || '-'}
              </Descriptions.Item>
              <Descriptions.Item label={<> No. Hp</>}>
                {pegawai.notelp?.trim() || '-'}
              </Descriptions.Item>
              <Descriptions.Item label={<> Alamat</>}>
                {pegawai.alamat?.trim() || '-'}
              </Descriptions.Item>
              <Descriptions.Item label={<> Jenis Pegawai / Pangkat / Jenis Jabatan</>}>{[pegawai.jenis_pegawai, pegawai.kdpangkat, pegawai.jenis_jabatan].filter(Boolean).join(' / ') || '-'}</Descriptions.Item>
              <Descriptions.Item label={<> Jenis Kelamin</>}>
                {pegawai.kdjenkel === 1 ? 'Laki-laki' : pegawai.kdjenkel === 2 ? 'Perempuan' : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Unit Kerja" span={2}>
                {pegawai.nm_unit_kerja || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Satker" span={2}>
                {pegawai.satker ? (
                  <div>
                    <div><strong>{pegawai.satker.kdsatker}</strong> - {pegawai.satker.nmsatker}</div>
                  </div>
                ) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Bidang" span={2}>
                {pegawai.bidang ? (
                  <div>
                    <div><strong>{pegawai.bidang.bidangf}</strong> - {pegawai.bidang.nmbidang}</div>
                  </div>
                ) : '-'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Detail Information */}
        <Col xs={24} lg={16}>
         

          {/* Lokasi Presensi */}
          {pegawai.lokasi && (
            <Card title={<><EnvironmentOutlined /> Lokasi Presensi</>}>
              {/* Map */}
              <div style={{ marginBottom: '16px' }}>
                <React.Suspense 
                  fallback={
                    <div style={{ 
                      height: '400px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: '#f5f5f5',
                      borderRadius: '6px'
                    }}>
                      <Spin size="large" tip="Memuat peta..." />
                    </div>
                  }
                >
                  <GoogleMap
                    center={[pegawai.lokasi.lat, pegawai.lokasi.lng]}
                    zoom={16}
                    height="400px"
                    selectedLocation={{
                      lat: pegawai.lokasi.lat,
                      lng: pegawai.lokasi.lng,
                      range: pegawai.lokasi.range
                    }}
                  />
                </React.Suspense>
              </div>
              
              {/* Informasi Lokasi */}
              <Descriptions column={2} size="small" bordered>
                <Descriptions.Item label="Nama Lokasi">
                  <Text strong>{pegawai.lokasi.ket}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={pegawai.lokasi.status ? 'green' : 'red'}>
                    {pegawai.lokasi.status ? 'Aktif' : 'Tidak Aktif'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Level Lokasi">
                  <Tag color="blue">
                    {pegawai.lokasi_level === 'skpd' ? 'SKPD' : 
                     pegawai.lokasi_level === 'satker' ? 'Satker' : 
                     pegawai.lokasi_level === 'bidang' ? 'Bidang' : 
                     pegawai.lokasi_level || 'Tidak Diketahui'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Radius">
                  {pegawai.lokasi.range} meter
                </Descriptions.Item>
                <Descriptions.Item label="Terakhir Update" span={2}>
                  {pegawai.lokasi.updatedAt ? formatDateTime(pegawai.lokasi.updatedAt) : '-'}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}
        </Col>
      </Row>

      <Divider />

      {/* Kehadiran Section */}
      <Card
        title={<><CalendarOutlined /> Riwayat Kehadiran</>}
        extra={
          <Space>
            <RangePicker
              placeholder={['Tanggal Mulai', 'Tanggal Selesai']}
              onChange={handleDateRangeChange}
              format="YYYY-MM-DD"
            />
          </Space>
        }
      >
        <Table
          columns={kehadiranColumns}
          dataSource={kehadiranList}
          rowKey="absen_id"
          loading={loadingKehadiran}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} dari ${total} data kehadiran`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

export default PegawaiDetail;
