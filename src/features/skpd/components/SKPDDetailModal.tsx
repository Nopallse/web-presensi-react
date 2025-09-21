import React from 'react';
import { Modal, Descriptions, Table, Tag, Space, Badge } from 'antd';
import { UserOutlined, TeamOutlined, CheckCircleOutlined, StopOutlined } from '@ant-design/icons';
import type { SKPD, SKPDAdmin } from '../types';
import type { ColumnsType } from 'antd/es/table';

interface SKPDDetailModalProps {
  open: boolean;
  onClose: () => void;
  skpd: SKPD | null;
}

const SKPDDetailModal: React.FC<SKPDDetailModalProps> = ({ open, onClose, skpd }) => {
  if (!skpd) return null;

  const adminColumns: ColumnsType<SKPDAdmin> = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      width: 120,
      render: (username: string) => <code>{username}</code>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 180,
      ellipsis: true,
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      width: 80,
      align: 'center',
      render: (level: string) => {
        const levelText = level === '1' ? 'Super Admin' : level === '2' ? 'Admin' : level === '3' ? 'Admin' : level;
        const color = level === '1' ? 'purple' : 'blue';
        return <Tag color={color}>{levelText}</Tag>;
      },
    },
    {
      title: 'Kategori',
      dataIndex: 'kategori',
      key: 'kategori',
      width: 120,
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status: string) => {
        const isActive = status === '0';
        return (
          <Tag 
            color={isActive ? 'green' : 'red'}
            icon={isActive ? <CheckCircleOutlined /> : <StopOutlined />}
          >
            {isActive ? 'Aktif' : 'Nonaktif'}
          </Tag>
        );
      },
    },
  ];

  const activeAdmins = skpd.admins?.filter(admin => admin.status === '0') || [];
  const inactiveAdmins = skpd.admins?.filter(admin => admin.status !== '0') || [];

  return (
    <Modal
      title={
        <Space>
          <TeamOutlined />
          Detail SKPD: {skpd.KDSKPD}
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      style={{ top: 20 }}
    >
      <div style={{ marginBottom: '24px' }}>
        <Descriptions bordered size="small">
          <Descriptions.Item label="Kode SKPD" span={1}>
            <code style={{ fontSize: '14px', fontWeight: 'bold' }}>{skpd.KDSKPD}</code>
          </Descriptions.Item>
          <Descriptions.Item label="Nama SKPD" span={2}>
            <strong>{skpd.NMSKPD}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Jumlah Pegawai" span={1}>
            <Badge 
              count={skpd.employee_count} 
              showZero 
              style={{ backgroundColor: '#52c41a' }} 
            />
          </Descriptions.Item>
          <Descriptions.Item label="Total Admin" span={1}>
            <Badge 
              count={skpd.admin_count} 
              showZero 
              style={{ backgroundColor: '#1890ff' }} 
            />
          </Descriptions.Item>
          <Descriptions.Item label="Admin Aktif" span={1}>
            <Badge 
              count={activeAdmins.length} 
              showZero 
              style={{ backgroundColor: activeAdmins.length > 0 ? '#52c41a' : '#d9d9d9' }} 
            />
          </Descriptions.Item>
        </Descriptions>
      </div>

      {skpd.admins && skpd.admins.length > 0 ? (
        <div>
          <h4 style={{ margin: '16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserOutlined />
            Daftar Admin ({skpd.admin_count})
          </h4>
          <Table
            columns={adminColumns}
            dataSource={skpd.admins}
            rowKey="id"
            size="small"
            pagination={false}
            scroll={{ y: 300 }}
            rowClassName={(record) => record.status === '0' ? '' : 'opacity-50'}
          />
          
          {inactiveAdmins.length > 0 && (
            <div style={{ marginTop: '12px', fontSize: '12px', color: '#8c8c8c' }}>
              <StopOutlined style={{ marginRight: '4px' }} />
              {inactiveAdmins.length} admin tidak aktif
            </div>
          )}
        </div>
      ) : (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          color: '#8c8c8c',
          backgroundColor: '#fafafa',
          borderRadius: '6px'
        }}>
          <UserOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
          <div>Belum ada admin yang terdaftar untuk SKPD ini</div>
        </div>
      )}
    </Modal>
  );
};

export default SKPDDetailModal;