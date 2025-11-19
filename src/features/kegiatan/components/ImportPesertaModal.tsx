import React, { useState } from 'react';
import {
  Modal,
  Upload,
  Button,
  message,
  Alert,
  Typography,
  Space
} from 'antd';
import { UploadOutlined, FileExcelOutlined, DownloadOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { kegiatanApi } from '../services/kegiatanApi';
import type { GrupPesertaKegiatan } from '../types';

const { Text, Paragraph } = Typography;

interface ImportPesertaModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  grup: GrupPesertaKegiatan | null;
}

const ImportPesertaModal: React.FC<ImportPesertaModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  grup
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!grup) return;

    if (fileList.length === 0) {
      message.warning('Pilih file Excel terlebih dahulu');
      return;
    }

    const file = fileList[0].originFileObj;
    if (!file) {
      message.warning('File tidak valid');
      return;
    }

    try {
      setLoading(true);
      const response = await kegiatanApi.importPesertaFromExcel(grup.id_grup_peserta, file);
      
      if (response.success) {
        const data = response.data;
        message.success(
          `Import berhasil! ${data.peserta_added} peserta ditambahkan.` +
          (data.failed_nip?.length > 0 ? ` ${data.failed_nip.length} gagal.` : '')
        );
        
        if (data.failed_nip?.length > 0) {
          console.log('Failed NIPs:', data.failed_nip);
        }
        
        setFileList([]);
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error importing:', error);
      message.error(error?.response?.data?.error || 'Gagal mengimport peserta');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFileList([]);
    onCancel();
  };

  const uploadProps: UploadProps = {
    beforeUpload: (file) => {
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                     file.type === 'application/vnd.ms-excel' ||
                     file.name.endsWith('.xlsx') ||
                     file.name.endsWith('.xls');
      
      if (!isExcel) {
        message.error('Hanya file Excel (.xlsx, .xls) yang diizinkan!');
        return Upload.LIST_IGNORE;
      }

      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('File harus lebih kecil dari 5MB!');
        return Upload.LIST_IGNORE;
      }

      setFileList([{
        uid: file.uid,
        name: file.name,
        status: 'done',
        originFileObj: file
      }]);
      
      return false; // Prevent auto upload
    },
    fileList,
    onRemove: () => {
      setFileList([]);
    },
    maxCount: 1
  };

  const downloadTemplate = () => {
    // Create a simple Excel template with just NIP column
    const template = `NIP
197001011990011001
197001011990011002
197001011990011003`;

    const blob = new Blob([template], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'template_import_peserta.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    message.info('Template berhasil didownload. Simpan sebagai file Excel (.xlsx) dan isi kolom NIP.');
  };

  return (
    <Modal
      title="Import Peserta dari Excel"
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Batal
        </Button>,
        <Button
          key="upload"
          type="primary"
          icon={<UploadOutlined />}
          loading={loading}
          onClick={handleUpload}
          disabled={fileList.length === 0}
        >
          Import
        </Button>
      ]}
      width={600}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Alert
          message="Format File Excel"
          description={
            <div>
              <Paragraph style={{ marginBottom: 8 }}>
                File Excel harus memiliki format berikut:
              </Paragraph>
              <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                <li>Kolom pertama (A) berisi header: <Text code>NIP</Text></li>
                <li>Baris berikutnya berisi NIP pegawai (satu NIP per baris)</li>
                <li>Hanya kolom NIP yang diperlukan</li>
              </ul>
            </div>
          }
          type="info"
          showIcon
        />

        <div>
          <Button
            icon={<DownloadOutlined />}
            onClick={downloadTemplate}
            style={{ marginBottom: 16 }}
          >
            Download Template
          </Button>
          <Upload {...uploadProps}>
            <Button icon={<FileExcelOutlined />}>Pilih File Excel</Button>
          </Upload>
        </div>

        {fileList.length > 0 && (
          <Alert
            message={`File terpilih: ${fileList[0].name}`}
            type="success"
            showIcon
          />
        )}

        <Alert
          message="Catatan"
          description={
            <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
              <li>NIP yang tidak ditemukan atau tidak aktif akan dilewati</li>
              <li>NIP yang sudah ada dalam grup akan dilewati</li>
              <li>Maksimal ukuran file: 5MB</li>
            </ul>
          }
          type="warning"
          showIcon
        />
      </Space>
    </Modal>
  );
};

export default ImportPesertaModal;

