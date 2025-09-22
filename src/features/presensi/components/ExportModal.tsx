import React, { useState } from 'react';
import {
  Modal,
  Form,
  DatePicker,
  Select,
  Button,
  Space,
  message,
  Row,
  Col,
  Typography,
  Card
} from 'antd';
import {
  DownloadOutlined,
  CalendarOutlined,
  FileExcelOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { presensiApi } from '../services/presensiApi';
import type { ExportFilters } from '../types';

const { Option } = Select;
const { Text } = Typography;

interface ExportModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({
  visible,
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [exportType, setExportType] = useState<'harian' | 'bulanan'>('harian');

  const handleExport = async (values: any) => {
    setLoading(true);
    try {
      if (exportType === 'harian') {
        const filters: ExportFilters = {
          tanggal: values.tanggal?.format('YYYY-MM-DD')
        };
        
        await presensiApi.exportAndDownloadHarian(filters);
        message.success('Export presensi harian berhasil diunduh');
      } else {
        const filters: ExportFilters = {
          month: values.month,
          year: values.year
        };
        
        await presensiApi.exportAndDownloadBulanan(filters);
        message.success('Export presensi bulanan berhasil diunduh');
      }
      
      onSuccess?.();
      onCancel();
      form.resetFields();
    } catch (error: any) {
      message.error(error.message || 'Gagal export data presensi');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        <Space>
          <FileExcelOutlined />
          Export Data Presensi
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleExport}
        initialValues={{
          type: 'harian',
          tanggal: dayjs(),
          month: dayjs().month() + 1,
          year: dayjs().year()
        }}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Tipe Export"
              name="type"
              rules={[{ required: true, message: 'Pilih tipe export' }]}
            >
              <Select
                value={exportType}
                onChange={setExportType}
                size="large"
              >
                <Option value="harian">
                  <Space>
                    <CalendarOutlined />
                    Export Harian
                  </Space>
                </Option>
                <Option value="bulanan">
                  <Space>
                    <CalendarOutlined />
                    Export Bulanan
                  </Space>
                </Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {exportType === 'harian' && (
          <Row gutter={16}>
            <Col span={24}>
              <Card size="small" style={{ backgroundColor: '#f6f6f6' }}>
                <Text type="secondary">
                  Export data presensi untuk tanggal tertentu
                </Text>
              </Card>
            </Col>
            <Col span={24}>
              <Form.Item
                label="Tanggal"
                name="tanggal"
                rules={[{ required: true, message: 'Pilih tanggal' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  size="large"
                  placeholder="Pilih tanggal"
                  disabledDate={(current) => current && current > dayjs().endOf('day')}
                />
              </Form.Item>
            </Col>
          </Row>
        )}

        {exportType === 'bulanan' && (
          <Row gutter={16}>
            <Col span={24}>
              <Card size="small" style={{ backgroundColor: '#f6f6f6' }}>
                <Text type="secondary">
                  Export data presensi untuk periode bulanan
                </Text>
              </Card>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Bulan"
                name="month"
                rules={[{ required: true, message: 'Pilih bulan' }]}
              >
                <Select size="large" placeholder="Pilih bulan">
                  {Array.from({ length: 12 }, (_, i) => (
                    <Option key={i + 1} value={i + 1}>
                      {dayjs().month(i).format('MMMM')}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Tahun"
                name="year"
                rules={[{ required: true, message: 'Pilih tahun' }]}
              >
                <Select size="large" placeholder="Pilih tahun">
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = dayjs().year() - i;
                    return (
                      <Option key={year} value={year}>
                        {year}
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        )}

        <Row gutter={16} style={{ marginTop: 24 }}>
          <Col span={24}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={handleCancel}>
                Batal
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<DownloadOutlined />}
                loading={loading}
                size="large"
              >
                Download Export
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

// Quick export buttons component
interface QuickExportProps {
  onExportSuccess?: () => void;
}

const QuickExport: React.FC<QuickExportProps> = ({ onExportSuccess }) => {
  const [loading, setLoading] = useState<{ harian: boolean; bulanan: boolean }>({
    harian: false,
    bulanan: false
  });

  const handleQuickExportHarian = async () => {
    setLoading(prev => ({ ...prev, harian: true }));
    try {
      const today = dayjs().format('YYYY-MM-DD');
      await presensiApi.exportAndDownloadHarian({ tanggal: today });
      message.success('Export presensi hari ini berhasil diunduh');
      onExportSuccess?.();
    } catch (error: any) {
      message.error(error.message || 'Gagal export data hari ini');
    } finally {
      setLoading(prev => ({ ...prev, harian: false }));
    }
  };

  const handleQuickExportBulanan = async () => {
    setLoading(prev => ({ ...prev, bulanan: true }));
    try {
      const now = dayjs();
      await presensiApi.exportAndDownloadBulanan({
        month: now.month() + 1,
        year: now.year()
      });
      message.success('Export presensi bulan ini berhasil diunduh');
      onExportSuccess?.();
    } catch (error: any) {
      message.error(error.message || 'Gagal export data bulan ini');
    } finally {
      setLoading(prev => ({ ...prev, bulanan: false }));
    }
  };

  return (
    <Space>
      <Button
        icon={<DownloadOutlined />}
        onClick={handleQuickExportHarian}
        loading={loading.harian}
        size="small"
      >
        Export Hari Ini
      </Button>
      <Button
        icon={<DownloadOutlined />}
        onClick={handleQuickExportBulanan}
        loading={loading.bulanan}
        size="small"
      >
        Export Bulan Ini
      </Button>
    </Space>
  );
};

// Date range export component
interface DateRangeExportProps {
  dateRange?: [string, string] | null;
  onExportSuccess?: () => void;
}

const DateRangeExport: React.FC<DateRangeExportProps> = ({
  dateRange,
  onExportSuccess
}) => {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (!dateRange || !dateRange[0]) {
      message.warning('Pilih rentang tanggal terlebih dahulu');
      return;
    }

    setLoading(true);
    try {
      // Export the first date as harian export
      await presensiApi.exportAndDownloadHarian({ tanggal: dateRange[0] });
      message.success('Export berhasil diunduh');
      onExportSuccess?.();
    } catch (error: any) {
      message.error(error.message || 'Gagal export data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      icon={<DownloadOutlined />}
      onClick={handleExport}
      loading={loading}
      disabled={!dateRange?.[0]}
      type="primary"
      ghost
    >
      Export Periode
    </Button>
  );
};

export {
  ExportModal,
  QuickExport,
  DateRangeExport
};

export default ExportModal;