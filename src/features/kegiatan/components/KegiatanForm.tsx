import React from 'react';
import { Form, Input, DatePicker, Select, Row, Col, TimePicker } from 'antd';
import dayjs from 'dayjs';
import type { JadwalKegiatanFormData } from '../types';
import { JENIS_KEGIATAN_OPTIONS, INCLUDE_ABSEN_OPTIONS } from '../types';

const { Option } = Select;

interface KegiatanFormProps {
  form: any;
  initialValues?: Partial<JadwalKegiatanFormData>;
}

const KegiatanForm: React.FC<KegiatanFormProps> = ({ 
  form
}) => {
  // Removed useEffect that was overriding form values

  return (
    <>
      <Form.Item
        name="keterangan"
        label="Nama Kegiatan"
        rules={[
          { required: true, message: 'Nama kegiatan wajib diisi' },
          { max: 200, message: 'Nama kegiatan maksimal 200 karakter' }
        ]}
      >
        <Input
          placeholder="Masukkan nama kegiatan..."
          size="large"
          maxLength={200}
        />
      </Form.Item>

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
              { required: true, message: 'Jenis kegiatan wajib diisi' }
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
                  .includes(input.toLowerCase())
              }
            >
              {JENIS_KEGIATAN_OPTIONS.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="jam_mulai"
            label="Jam Mulai"
            rules={[
               { 
                 validator: (_, value) => {
                   if (!value) return Promise.resolve();
                   const jamMulai = dayjs(value, 'HH:mm');
                   const jamSelesai = form.getFieldValue('jam_selesai');
                   if (jamSelesai) {
                     const jamSelesaiDayjs = dayjs(jamSelesai, 'HH:mm');
                     if (jamMulai.isAfter(jamSelesaiDayjs) || jamMulai.isSame(jamSelesaiDayjs)) {
                       return Promise.reject(new Error('Jam mulai harus lebih kecil dari jam selesai'));
                     }
                   }
                   return Promise.resolve();
                 }
               }
            ]}
          >
             <TimePicker
               style={{ width: '100%' }}
               size="large"
               format="HH:mm"
               placeholder="Pilih jam mulai"
               showNow={false}
             />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="jam_selesai"
            label="Jam Selesai"
            rules={[
               { 
                 validator: (_, value) => {
                   if (!value) return Promise.resolve();
                   const jamSelesai = dayjs(value, 'HH:mm');
                   const jamMulai = form.getFieldValue('jam_mulai');
                   if (jamMulai) {
                     const jamMulaiDayjs = dayjs(jamMulai, 'HH:mm');
                     if (jamSelesai.isBefore(jamMulaiDayjs) || jamSelesai.isSame(jamMulaiDayjs)) {
                       return Promise.reject(new Error('Jam selesai harus lebih besar dari jam mulai'));
                     }
                   }
                   return Promise.resolve();
                 }
               }
            ]}
          >
             <TimePicker
               style={{ width: '100%' }}
               size="large"
               format="HH:mm"
               placeholder="Pilih jam selesai"
               showNow={false}
             />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="include_absen"
            label="Ketentuan Absen"
            rules={[
              { required: true, message: 'Pilihan include absen wajib diisi' }
            ]}
          >
            <Select
              placeholder="Pilih jenis include absen"
              size="large"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children as unknown as string)
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {INCLUDE_ABSEN_OPTIONS.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          {/* Empty column for layout balance */}
        </Col>
      </Row>

    </>
  );
};

export default KegiatanForm;