import React from 'react';
import {
  Modal,
  Table,
  Button,
  Space,
  Typography,
  Tag,
  Statistic,
  Progress,
  Popconfirm,
  Empty,
  Tooltip
} from 'antd';
import {
  EnvironmentOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { LokasiWithSatker } from '../types';
import type { GrupPesertaKegiatan } from '../types';

const { Title, Text } = Typography;

interface KelolaLokasiModalProps {
  visible: boolean;
  onCancel: () => void;
  lokasi: LokasiWithSatker | null;
  grupPesertaList: GrupPesertaKegiatan[];
  grupPesertaData: any[];
  onAddGrup: (lokasiId: number) => void;
  onEditGrup: (grup: GrupPesertaKegiatan) => void;
  onDeleteGrup: (idGrupPeserta: number) => void;
  onManagePeserta: (grup: GrupPesertaKegiatan) => void;
  loadingAction?: boolean;
}

const KelolaLokasiModal: React.FC<KelolaLokasiModalProps> = ({
  visible,
  onCancel,
  lokasi,
  grupPesertaList,
  grupPesertaData,
  onAddGrup,
  onEditGrup,
  onDeleteGrup,
  onManagePeserta,
  loadingAction = false
}) => {
  if (!lokasi) return null;

  // Filter grup peserta untuk lokasi ini
  const grupPesertaLokasi = grupPesertaList.filter(g => g.lokasi_id === lokasi.lokasi_id);

  // Columns untuk tabel grup peserta
  const grupColumns: ColumnsType<any> = [
    {
      title: 'Nama Grup',
      key: 'nama_grup',
      width: '30%',
      render: (_, grup: any) => {
        const grupData = grupPesertaData.find(g => g.id_grup_peserta === grup.id_grup_peserta);
        return (
          <div>
            <Text strong style={{ fontSize: '14px' }}>{grup.nama_grup}</Text>
            {grupData?.nama_satker && (
              <div>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {grupData.nama_satker}
                </Text>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Jenis',
      dataIndex: 'jenis_grup',
      key: 'jenis_grup',
      width: '10%',
      render: (jenis: string) => (
        <Tag color={jenis === 'opd' ? 'blue' : 'green'}>
          {jenis === 'opd' ? 'OPD' : 'Khusus'}
        </Tag>
      ),
    },
    {
      title: 'Total Peserta',
      key: 'total_pegawai',
      width: '15%',
      align: 'center',
      render: (_, grup: any) => {
        const grupData = grupPesertaData.find(g => g.id_grup_peserta === grup.id_grup_peserta);
        return (
          <Statistic
            value={grupData?.total_pegawai || 0}
            valueStyle={{ fontSize: '16px', color: '#1890ff' }}
            prefix={<UserOutlined style={{ fontSize: '12px' }} />}
          />
        );
      },
    },
    {
      title: 'Kehadiran',
      key: 'total_kehadiran',
      width: '15%',
      align: 'center',
      render: (_, grup: any) => {
        const grupData = grupPesertaData.find(g => g.id_grup_peserta === grup.id_grup_peserta);
        return (
          <Statistic
            value={grupData?.total_kehadiran || 0}
            valueStyle={{ fontSize: '16px', color: (grupData?.total_kehadiran || 0) > 0 ? '#52c41a' : '#d9d9d9' }}
            prefix={<CheckCircleOutlined style={{ fontSize: '12px' }} />}
          />
        );
      },
    },
    {
      title: 'Persentase',
      key: 'persentase',
      width: '15%',
      align: 'center',
      render: (_, grup: any) => {
        const grupData = grupPesertaData.find(g => g.id_grup_peserta === grup.id_grup_peserta);
        const persentase = grupData && grupData.total_pegawai > 0
          ? Math.round((grupData.total_kehadiran / grupData.total_pegawai) * 100)
          : 0;
        return (
          <Tooltip title={`${grupData?.total_kehadiran || 0} dari ${grupData?.total_pegawai || 0} peserta`}>
            <Progress
              percent={persentase}
              size="small"
              strokeColor={persentase >= 80 ? '#52c41a' : persentase >= 50 ? '#faad14' : '#ff4d4f'}
              format={() => `${persentase}%`}
            />
          </Tooltip>
        );
      },
    },
    {
      title: 'Aksi',
      key: 'action',
      width: '15%',
      render: (_, grup: any) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<UserOutlined />}
            onClick={() => onManagePeserta(grup)}
          >
            Kelola
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEditGrup(grup)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Hapus Grup"
            description="Apakah Anda yakin ingin menghapus grup ini?"
            onConfirm={() => onDeleteGrup(grup.id_grup_peserta)}
            okText="Ya"
            cancelText="Tidak"
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              loading={loadingAction}
            >
              Hapus
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <EnvironmentOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
          <span>Kelola Lokasi: {lokasi.ket}</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={1000}
      styles={{
        body: {
          maxHeight: '70vh',
          overflowY: 'auto'
        }
      }}
    >


      {/* Daftar Grup Peserta */}
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={5} style={{ margin: 0 }}>
          
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            onCancel();
            onAddGrup(lokasi.lokasi_id);
          }}
        >
          Tambah Grup Peserta
        </Button>
      </div>

      {grupPesertaLokasi.length > 0 ? (
        <Table
          columns={grupColumns}
          dataSource={grupPesertaLokasi}
          rowKey="id_grup_peserta"
          pagination={false}
          size="middle"
        />
      ) : (
        <Empty
          description={
            <div>
              <Text type="secondary" style={{ fontSize: '13px', display: 'block', marginBottom: '12px' }}>
                Belum ada grup peserta untuk lokasi ini
              </Text>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="small"
                onClick={() => {
                  onCancel();
                  onAddGrup(lokasi.lokasi_id);
                }}
              >
                Tambah Grup Peserta
              </Button>
            </div>
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ padding: '40px 0' }}
        />
      )}
    </Modal>
  );
};

export default KelolaLokasiModal;

