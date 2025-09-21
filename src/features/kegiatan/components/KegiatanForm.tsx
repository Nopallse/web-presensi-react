import React from 'react';
import { Form, Input, DatePicker, Select, Row, Col } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import type { JadwalKegiatanFormData } from '../types';
import { JENIS_KEGIATAN_OPTIONS } from '../types';

const { TextArea } = Input;
const { Option } = Select;

interface KegiatanFormProps {
  form: any;
  initialValues?: Partial<JadwalKegiatanFormData>;
}

const KegiatanForm: React.FC<KegiatanFormProps> = ({ 
  form, 
  initialValues
}) => {
  React.useEffect(() => {
    if (initialValues) {
      const formValues = {
        ...initialValues,
        tanggal_kegiatan: initialValues.tanggal_kegiatan 
          ? dayjs(initialValues.tanggal_kegiatan) 
          : undefined
      };
      form.setFieldsValue(formValues);
    }
  }, [form, initialValues]);

  const handleDateChange = (date: Dayjs | null) => {
    if (date) {
      form.setFieldsValue({ 
        tanggal_kegiatan: date.format('YYYY-MM-DD') 
      });
    }
  };

  return (
    <>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="tanggal_kegiatan"
            label="Tanggal Kegiatan"
            rules={[
              { required: true, message: 'Tanggal kegiatan wajib diisi' }
            ]}
          >
            <DatePicker
              style={{ width: '100%' }}
              size="large"
              format="DD/MM/YYYY"
              placeholder="Pilih tanggal kegiatan"
              onChange={handleDateChange}
              disabledDate={(current) => {
                // Disable past dates
                return current && current < dayjs().startOf('day');
              }}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="jenis_kegiatan"
            label="Jenis Kegiatan"
            rules={[
              { required: true, message: 'Jenis kegiatan wajib dipilih' }
            ]}
          >
            <Select
              placeholder="Pilih jenis kegiatan"
              size="large"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children as unknown as string)
                  ?.toLowerCase()
                  ?.indexOf(input.toLowerCase()) >= 0
              }
            >
              {JENIS_KEGIATAN_OPTIONS.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="keterangan"
        label="Keterangan"
        rules={[
          { required: true, message: 'Keterangan wajib diisi' },
          { min: 10, message: 'Keterangan minimal 10 karakter' },
          { max: 500, message: 'Keterangan maksimal 500 karakter' }
        ]}
      >
        <TextArea
          placeholder="Masukkan keterangan kegiatan..."
          rows={4}
          showCount
          maxLength={500}
          size="large"
        />
      </Form.Item>
    </>
  );
};

export default KegiatanForm;