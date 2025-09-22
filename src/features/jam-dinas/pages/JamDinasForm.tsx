import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Space,
  Row,
  Col,
  Typography,
  Table,
  TimePicker,
  message,
  Modal,
  Popconfirm,
  Tag
} from 'antd';
import {
  SaveOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { jamDinasApi } from '../services/jamDinasApi';
import type {
  CreateJamDinasRequest,
  JamDinasFormData,
  JamDinasDetailFormData,
  HariKerja,
  TipeJadwal
} from '../types';
import {
  HARI_KERJA_OPTIONS,
  TIPE_JADWAL_OPTIONS,
  STATUS_OPTIONS
} from '../types';

const { Title, Text } = Typography;

interface JamDinasFormProps {
  mode?: 'create' | 'edit';
}

const JamDinasForm: React.FC<JamDinasFormProps> = ({ mode = 'create' }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<JamDinasDetailFormData[]>([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingDetail, setEditingDetail] = useState<JamDinasDetailFormData | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = mode === 'edit' && id;

  useEffect(() => {
    if (isEdit) {
      fetchJamDinas();
    }
  }, [isEdit, id]);

  const fetchJamDinas = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await jamDinasApi.getById(parseInt(id));
      const data = response.data;
      
      // Set form values
      form.setFieldsValue({
        nama: data.nama,
        hari_kerja: data.hari_kerja,
        menit: data.menit,
        status: data.status,
      });

      // Set details
      const formattedDetails = data.details.map(detail => ({
        hari: detail.hari,
        tipe: detail.tipe,
        jam_masuk_mulai: detail.jam_masuk_mulai,
        jam_masuk_selesai: detail.jam_masuk_selesai,
        jam_pulang_mulai: detail.jam_pulang_mulai,
        jam_pulang_selesai: detail.jam_pulang_selesai,
      }));
      
      setDetails(formattedDetails);
    } catch (error: any) {
      console.error('Error fetching jam dinas:', error);
      message.error('Gagal memuat data jam dinas');
      navigate('/jam-dinas');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: JamDinasFormData) => {
    if (details.length === 0) {
      message.error('Minimal harus ada 1 detail jadwal');
      return;
    }

    try {
      setLoading(true);
      
      const requestData: CreateJamDinasRequest = {
        nama: values.nama,
        hari_kerja: values.hari_kerja,
        menit: values.menit,
        status: values.status,
        details: details.map(detail => ({
          hari: detail.hari,
          tipe: detail.tipe,
          jam_masuk_mulai: detail.jam_masuk_mulai,
          jam_masuk_selesai: detail.jam_masuk_selesai,
          jam_pulang_mulai: detail.jam_pulang_mulai,
          jam_pulang_selesai: detail.jam_pulang_selesai,
        })),
      };

      if (isEdit && id) {
        await jamDinasApi.update(parseInt(id), requestData);
        message.success('Jam dinas berhasil diperbarui');
      } else {
        await jamDinasApi.create(requestData);
        message.success('Jam dinas berhasil dibuat');
      }
      
      navigate('/jam-dinas');
    } catch (error: any) {
      console.error('Error saving jam dinas:', error);
      message.error(error.response?.data?.message || 'Gagal menyimpan jam dinas');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDetail = () => {
    setEditingDetail(null);
    setEditingIndex(null);
    setDetailModalVisible(true);
  };

  const handleEditDetail = (detail: JamDinasDetailFormData, index: number) => {
    setEditingDetail(detail);
    setEditingIndex(index);
    setDetailModalVisible(true);
  };

  const handleDeleteDetail = (index: number) => {
    const newDetails = details.filter((_, i) => i !== index);
    setDetails(newDetails);
    message.success('Detail jadwal berhasil dihapus');
  };

  const handleDetailSubmit = (detailData: JamDinasDetailFormData) => {
    if (editingIndex !== null) {
      // Edit existing detail
      const newDetails = [...details];
      newDetails[editingIndex] = detailData;
      setDetails(newDetails);
      message.success('Detail jadwal berhasil diperbarui');
    } else {
      // Add new detail
      setDetails([...details, detailData]);
      message.success('Detail jadwal berhasil ditambahkan');
    }
    setDetailModalVisible(false);
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const getTipeColor = (tipe: TipeJadwal) => {
    return tipe === 'normal' ? 'blue' : 'orange';
  };

  const getHariLabel = (hari: HariKerja) => {
    const option = HARI_KERJA_OPTIONS.find(opt => opt.value === hari);
    return option?.label || hari;
  };

  const detailColumns = [
    {
      title: 'Hari',
      dataIndex: 'hari',
      key: 'hari',
      render: (hari: HariKerja) => getHariLabel(hari),
    },
    {
      title: 'Tipe',
      dataIndex: 'tipe',
      key: 'tipe',
      render: (tipe: TipeJadwal) => (
        <Tag color={getTipeColor(tipe)}>
          {tipe.charAt(0).toUpperCase() + tipe.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Jam Masuk',
      key: 'masuk',
      render: (record: JamDinasDetailFormData) => 
        `${formatTime(record.jam_masuk_mulai)} - ${formatTime(record.jam_masuk_selesai)}`,
    },
    {
      title: 'Jam Pulang',
      key: 'pulang',
      render: (record: JamDinasDetailFormData) => 
        `${formatTime(record.jam_pulang_mulai)} - ${formatTime(record.jam_pulang_selesai)}`,
    },
    {
      title: 'Aksi',
      key: 'actions',
      width: 120,
      render: (record: JamDinasDetailFormData, _: any, index: number) => (
        <Space>
          <Button
            type="text"
            size="small"
            onClick={() => handleEditDetail(record, index)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Hapus detail ini?"
            onConfirm={() => handleDeleteDetail(index)}
            okText="Ya"
            cancelText="Batal"
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '100%', overflow: 'hidden' }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate('/jam-dinas')}
                  style={{ marginRight: 16 }}
                >
                  Kembali
                </Button>
                <div>
                  <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                    <ClockCircleOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                    {isEdit ? 'Edit Jam Dinas' : 'Tambah Jam Dinas'}
                  </Title>
                  <Text type="secondary">
                    {isEdit ? 'Perbarui informasi jam dinas' : 'Buat jam dinas baru dengan detail jadwal'}
                  </Text>
                </div>
              </div>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                status: 1,
                hari_kerja: 5,
                menit: 480,
              }}
            >
              <Row gutter={[16, 16]}>
                {/* Basic Information */}
                <Col span={24}>
                  <Card size="small" title="Informasi Dasar">
                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          label="Nama Jam Dinas"
                          name="nama"
                          rules={[
                            { required: true, message: 'Nama jam dinas wajib diisi!' },
                            { min: 3, message: 'Nama minimal 3 karakter!' },
                          ]}
                        >
                          <Input placeholder="Contoh: Jam Dinas 5 Hari" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={6}>
                        <Form.Item
                          label="Hari Kerja per Minggu"
                          name="hari_kerja"
                          rules={[
                            { required: true, message: 'Hari kerja wajib diisi!' },
                            { type: 'number', min: 1, max: 7, message: 'Hari kerja 1-7!' },
                          ]}
                        >
                          <InputNumber
                            min={1}
                            max={7}
                            style={{ width: '100%' }}
                            placeholder="5"
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={6}>
                        <Form.Item
                          label="Total Menit per Hari"
                          name="menit"
                          rules={[
                            { required: true, message: 'Total menit wajib diisi!' },
                            { type: 'number', min: 60, message: 'Minimal 60 menit!' },
                          ]}
                        >
                          <InputNumber
                            min={60}
                            max={1440}
                            style={{ width: '100%' }}
                            placeholder="480"
                            addonAfter="menit"
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          label="Status"
                          name="status"
                          rules={[{ required: true, message: 'Status wajib dipilih!' }]}
                        >
                          <Select options={STATUS_OPTIONS} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                </Col>

                {/* Detail Jadwal */}
                <Col span={24}>
                  <Card
                    size="small"
                    title={
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarOutlined style={{ marginRight: 8 }} />
                        Detail Jadwal ({details.length} item)
                      </div>
                    }
                    extra={
                      <Button
                        type="primary"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={handleAddDetail}
                      >
                        Tambah Detail
                      </Button>
                    }
                  >
                    <Table
                      size="small"
                      columns={detailColumns}
                      dataSource={details}
                      rowKey={(record, index) => `${record.hari}-${record.tipe}-${index}`}
                      pagination={false}
                      locale={{
                        emptyText: 'Belum ada detail jadwal. Klik "Tambah Detail" untuk menambah.'
                      }}
                    />
                  </Card>
                </Col>

                {/* Submit Button */}
                <Col span={24}>
                  <div style={{ textAlign: 'right', paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                    <Space>
                      <Button onClick={() => navigate('/jam-dinas')}>
                        Batal
                      </Button>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        icon={<SaveOutlined />}
                      >
                        {isEdit ? 'Perbarui' : 'Simpan'}
                      </Button>
                    </Space>
                  </div>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>
      </Row>

      {/* Detail Modal */}
      <DetailModal
        visible={detailModalVisible}
        initialData={editingDetail}
        onSubmit={handleDetailSubmit}
        onCancel={() => setDetailModalVisible(false)}
      />
    </div>
  );
};

// Detail Modal Component
interface DetailModalProps {
  visible: boolean;
  initialData?: JamDinasDetailFormData | null;
  onSubmit: (data: JamDinasDetailFormData) => void;
  onCancel: () => void;
}

const DetailModal: React.FC<DetailModalProps> = ({
  visible,
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      if (initialData) {
        form.setFieldsValue({
          hari: initialData.hari,
          tipe: initialData.tipe,
          jam_masuk_mulai: dayjs(initialData.jam_masuk_mulai, 'HH:mm:ss'),
          jam_masuk_selesai: dayjs(initialData.jam_masuk_selesai, 'HH:mm:ss'),
          jam_pulang_mulai: dayjs(initialData.jam_pulang_mulai, 'HH:mm:ss'),
          jam_pulang_selesai: dayjs(initialData.jam_pulang_selesai, 'HH:mm:ss'),
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, initialData, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const detailData: JamDinasDetailFormData = {
        hari: values.hari,
        tipe: values.tipe,
        jam_masuk_mulai: values.jam_masuk_mulai.format('HH:mm:ss'),
        jam_masuk_selesai: values.jam_masuk_selesai.format('HH:mm:ss'),
        jam_pulang_mulai: values.jam_pulang_mulai.format('HH:mm:ss'),
        jam_pulang_selesai: values.jam_pulang_selesai.format('HH:mm:ss'),
      };

      onSubmit(detailData);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Modal
      title={initialData ? 'Edit Detail Jadwal' : 'Tambah Detail Jadwal'}
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      okText={initialData ? 'Perbarui' : 'Tambah'}
      cancelText="Batal"
      width={600}
    >
      <Form form={form} layout="vertical">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Hari"
              name="hari"
              rules={[{ required: true, message: 'Hari wajib dipilih!' }]}
            >
              <Select
                placeholder="Pilih hari"
                options={HARI_KERJA_OPTIONS}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Tipe Jadwal"
              name="tipe"
              rules={[{ required: true, message: 'Tipe jadwal wajib dipilih!' }]}
            >
              <Select
                placeholder="Pilih tipe"
                options={TIPE_JADWAL_OPTIONS}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Jam Masuk Mulai"
              name="jam_masuk_mulai"
              rules={[{ required: true, message: 'Jam masuk mulai wajib diisi!' }]}
            >
              <TimePicker
                format="HH:mm"
                style={{ width: '100%' }}
                placeholder="Pilih jam"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Jam Masuk Selesai"
              name="jam_masuk_selesai"
              rules={[{ required: true, message: 'Jam masuk selesai wajib diisi!' }]}
            >
              <TimePicker
                format="HH:mm"
                style={{ width: '100%' }}
                placeholder="Pilih jam"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Jam Pulang Mulai"
              name="jam_pulang_mulai"
              rules={[{ required: true, message: 'Jam pulang mulai wajib diisi!' }]}
            >
              <TimePicker
                format="HH:mm"
                style={{ width: '100%' }}
                placeholder="Pilih jam"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Jam Pulang Selesai"
              name="jam_pulang_selesai"
              rules={[{ required: true, message: 'Jam pulang selesai wajib diisi!' }]}
            >
              <TimePicker
                format="HH:mm"
                style={{ width: '100%' }}
                placeholder="Pilih jam"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default JamDinasForm;