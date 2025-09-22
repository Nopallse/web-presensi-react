import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Table, 
  Button, 
  Input, 
  Select, 
  Space, 
  message, 
  Popconfirm, 
  Tag, 
  DatePicker,
  Typography
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  CalendarOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { kegiatanApi } from '../services/kegiatanApi';
import type { JadwalKegiatan, JadwalKegiatanFilters } from '../types';
import { JENIS_KEGIATAN_OPTIONS } from '../types';
import { dateFormatter } from '../../../utils/dateFormatter';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title } = Typography;

const KegiatanPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<JadwalKegiatan[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number, range: [number, number]) => 
      `${range[0]}-${range[1]} dari ${total} item`,
  });
  const [filters, setFilters] = useState<JadwalKegiatanFilters>({
    page: 1,
    limit: 10
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await kegiatanApi.getAll(filters);
      
      setData(response.data);
      setPagination(prev => ({
        ...prev,
        current: response.pagination.currentPage,
        total: response.pagination.totalItems,
        pageSize: response.pagination.itemsPerPage
      }));
    } catch (error: any) {
      console.error('Error fetching kegiatan:', error);
      message.error('Gagal memuat data kegiatan');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setFilters(prev => ({
      ...prev,
      search: value || undefined,
      page: 1
    }));
  };

  const handleJenisFilter = (value: string) => {
    setFilters(prev => ({
      ...prev,
      jenis_kegiatan: value || undefined,
      page: 1
    }));
  };

  const handleDateRangeFilter = (dates: any) => {
    if (dates && dates.length === 2 && dates[0] && dates[1]) {
      setFilters(prev => ({
        ...prev,
        tanggal_kegiatan: dates[0].format('YYYY-MM-DD'),
        page: 1
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        tanggal_kegiatan: undefined,
        page: 1
      }));
    }
  };

  const handleTableChange = (pagination: any) => {
    setFilters(prev => ({
      ...prev,
      page: pagination.current,
      limit: pagination.pageSize
    }));
  };

  const handleDelete = async (id: number) => {
    try {
      await kegiatanApi.delete(id);
      message.success('Kegiatan berhasil dihapus');
      fetchData();
    } catch (error: any) {
      console.error('Error deleting kegiatan:', error);
      message.error('Gagal menghapus kegiatan');
    }
  };

  const getJenisKegiatanLabel = (value: string): string => {
    const option = JENIS_KEGIATAN_OPTIONS.find(opt => opt.value === value);
    return option?.label || value;
  };

  const getJenisKegiatanColor = (value: string): string => {
    const colorMap: Record<string, string> = {
      'dinas_luar': 'blue',
      'rapat': 'green',
      'pelatihan': 'orange',
      'workshop': 'purple',
      'seminar': 'cyan',
      'upacara': 'red',
      'lainnya': 'default'
    };
    return colorMap[value] || 'default';
  };

  const columns: ColumnsType<JadwalKegiatan> = [
    {
      title: 'No',
      key: 'no',
      width: 60,
      render: (_, __, index) => {
        const { current, pageSize } = pagination;
        return (current - 1) * pageSize + index + 1;
      },
    },
    {
      title: 'Tanggal Kegiatan',
      dataIndex: 'tanggal_kegiatan',
      key: 'tanggal_kegiatan',
      width: 150,
      render: (date: string) => (
        <span>
          <CalendarOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          {dateFormatter.toIndonesian(date, 'dd MMM yyyy')}
        </span>
      ),
      sorter: true,
    },
    {
      title: 'Jenis Kegiatan',
      dataIndex: 'jenis_kegiatan',
      key: 'jenis_kegiatan',
      width: 150,
      render: (jenis: string) => (
        <Tag color={getJenisKegiatanColor(jenis)}>
          {getJenisKegiatanLabel(jenis)}
        </Tag>
      ),
    },
    {
      title: 'Keterangan',
      dataIndex: 'keterangan',
      key: 'keterangan',
      
      ellipsis: true,
      render: (text: string) => (
        <span title={text}>
          {text.length > 50 ? `${text.substring(0, 50)}...` : text}
        </span>
      ),
    },
    {
      title: 'Dibuat',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 130,
      render: (date: string) => date ? dateFormatter.toTableFormat(date) : '-',
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/kegiatan/${record.id_kegiatan}`)}
            title="Lihat Detail"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate(`/kegiatan/${record.id_kegiatan}/edit`)}
            title="Edit"
          />
          <Popconfirm
            title="Hapus Kegiatan"
            description="Apakah Anda yakin ingin menghapus kegiatan ini?"
            onConfirm={() => handleDelete(record.id_kegiatan)}
            okText="Ya"
            cancelText="Tidak"
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              danger
              title="Hapus"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '100%', overflow: 'hidden' }}>
      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <Title level={3} style={{ margin: 0 }}>
            Kelola Jadwal Kegiatan
          </Title>
          
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/kegiatan/create')}
          >
            Tambah Kegiatan
          </Button>
        </div>

        {/* Filters */}
        <div style={{ 
          marginBottom: '16px', 
          display: 'flex', 
          gap: '12px', 
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <Search
            placeholder="Cari kegiatan..."
            allowClear
            style={{ width: 280, minWidth: 200 }}
            onSearch={handleSearch}
            prefix={<SearchOutlined />}
          />
          
          <Select
            placeholder="Jenis Kegiatan"
            allowClear
            style={{ width: 180, minWidth: 150 }}
            onChange={handleJenisFilter}
          >
            {JENIS_KEGIATAN_OPTIONS.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
          
          <RangePicker
            style={{ width: 240, minWidth: 200 }}
            placeholder={['Tanggal Mulai', 'Tanggal Selesai']}
            format="DD/MM/YYYY"
            onChange={handleDateRangeFilter}
          />
          
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchData}
            loading={loading}
          >
            Refresh
          </Button>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id_kegiatan"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total: number, range: [number, number]) => 
              `${range[0]}-${range[1]} dari ${total} item`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 900 }}
          size="small"
        />
      </Card>
    </div>
  );
};

export default KegiatanPage;