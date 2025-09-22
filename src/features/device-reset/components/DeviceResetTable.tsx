import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Tag, 
  Tooltip, 
  Select, 
  Typography, 
  Modal, 
  Input,
  message,
  Divider,
  Badge
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  CheckOutlined, 
  CloseOutlined, 
  ReloadOutlined
} from '@ant-design/icons';
import { deviceResetApi } from '../services/deviceResetApi';
import type { DeviceResetRequest, DeviceResetFilters } from '../types';

const { Text } = Typography;
const { Option } = Select;

interface DeviceResetTableProps {
  className?: string;
}

const DeviceResetTable: React.FC<DeviceResetTableProps> = ({ className }) => {
  const [data, setData] = useState<DeviceResetRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState<DeviceResetFilters>({
    status: undefined,
    page: 1,
    limit: 10,
  });
  const [selectedRecord, setSelectedRecord] = useState<DeviceResetRequest | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [adminResponse, setAdminResponse] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Custom button styles with hover effects
  const buttonStyles = {
    approve: {
      backgroundColor: '#52c41a',
      borderColor: '#52c41a',
      color: 'white',
      transition: 'all 0.3s ease',
    } as React.CSSProperties,
    reject: {
      backgroundColor: '#ff4d4f',
      borderColor: '#ff4d4f',
      color: 'white',
      transition: 'all 0.3s ease',
    } as React.CSSProperties,
    refresh: {
      transition: 'all 0.3s ease',
    } as React.CSSProperties
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await deviceResetApi.getAllResetRequests(filters);
      setData(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total,
        current: response.pagination.page,
        pageSize: response.pagination.limit,
      }));
    } catch (error) {
      console.error('Error fetching device reset requests:', error);
      message.error('Gagal memuat data reset device');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleTableChange = (paginationConfig: any) => {
    setFilters(prev => ({
      ...prev,
      page: paginationConfig.current,
      limit: paginationConfig.pageSize,
    }));
  };

  const handleStatusFilter = (value: string) => {
    setFilters(prev => ({
      ...prev,
      status: value === 'all' ? undefined : value as any,
      page: 1,
    }));
  };

  const handleApprove = (record: DeviceResetRequest) => {
    setSelectedRecord(record);
    setAdminResponse('');
    setShowApproveModal(true);
  };

  const handleReject = (record: DeviceResetRequest) => {
    setSelectedRecord(record);
    setAdminResponse('');
    setShowRejectModal(true);
  };

  const handleApproveConfirm = async () => {
    if (!selectedRecord) return;
    
    setActionLoading(true);
    try {
      await deviceResetApi.approveResetRequest(selectedRecord.id, adminResponse || undefined);
      message.success('Request reset device berhasil disetujui');
      setShowApproveModal(false);
      setSelectedRecord(null);
      setAdminResponse('');
      fetchData();
    } catch (error) {
      console.error('Error approving reset request:', error);
      message.error('Gagal menyetujui request reset device');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!selectedRecord || !adminResponse.trim()) {
      message.error('Alasan penolakan harus diisi');
      return;
    }
    
    setActionLoading(true);
    try {
      await deviceResetApi.rejectResetRequest(selectedRecord.id, adminResponse);
      message.success('Request reset device berhasil ditolak');
      setShowRejectModal(false);
      setSelectedRecord(null);
      setAdminResponse('');
      fetchData();
    } catch (error) {
      console.error('Error rejecting reset request:', error);
      message.error('Gagal menolak request reset device');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'approved': return 'green';
      case 'rejected': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Menunggu';
      case 'approved': return 'Disetujui';
      case 'rejected': return 'Ditolak';
      default: return status;
    }
  };

  const columns: ColumnsType<DeviceResetRequest> = [
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      render: (user) => (
        <div>
          <div style={{ fontWeight: 500 }}>{user.nama_lengkap || user.username}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{user.email}</div>
          {user.opd && (
            <div style={{ fontSize: '11px', color: '#999' }}>{user.opd.nama}</div>
          )}
          {user.upt && (
            <div style={{ fontSize: '11px', color: '#999' }}>{user.upt.nama}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Alasan Reset',
      dataIndex: 'reason',
      key: 'reason',
      render: (reason) => (
        <Tooltip title={reason}>
          <div style={{ 
            maxWidth: '200px', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {reason}
          </div>
        </Tooltip>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Tanggal Request',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleString('id-ID'),
    },
    {
      title: 'Admin Response',
      dataIndex: 'admin_response',
      key: 'admin_response',
      render: (response) => {
        if (!response) return '-';
        return (
          <Tooltip title={response}>
            <div style={{ 
              maxWidth: '150px', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {response}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record) => {
        if (record.status !== 'pending') {
          return (
            <Tag color={getStatusColor(record.status)}>
              {getStatusText(record.status)}
            </Tag>
          );
        }

        return (
          <Space size="small">
            <Tooltip title="Setujui Reset">
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record)}
                style={buttonStyles.approve}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#73d13d';
                  e.currentTarget.style.borderColor = '#73d13d';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(82, 196, 26, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#52c41a';
                  e.currentTarget.style.borderColor = '#52c41a';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Setujui
              </Button>
            </Tooltip>
            <Tooltip title="Tolak Reset">
              <Button
                danger
                size="small"
                icon={<CloseOutlined />}
                onClick={() => handleReject(record)}
                style={buttonStyles.reject}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#ff7875';
                  e.currentTarget.style.borderColor = '#ff7875';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(255, 77, 79, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ff4d4f';
                  e.currentTarget.style.borderColor = '#ff4d4f';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Tolak
              </Button>
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  return (
    <div className={className}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Select
            placeholder="Filter Status"
            style={{ width: 150 }}
            onChange={handleStatusFilter}
            value={filters.status || 'all'}
          >
            <Option value="all">Semua Status</Option>
            <Option value="pending">
              <Badge color="orange" text="Menunggu" />
            </Option>
            <Option value="approved">
              <Badge color="green" text="Disetujui" />
            </Option>
            <Option value="rejected">
              <Badge color="red" text="Ditolak" />
            </Option>
          </Select>
          
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchData}
            loading={loading}
            style={buttonStyles.refresh}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f0f0';
              e.currentTarget.style.borderColor = '#40a9ff';
              e.currentTarget.style.color = '#1890ff';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(24, 144, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '';
              e.currentTarget.style.borderColor = '';
              e.currentTarget.style.color = '';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Refresh
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} dari ${total} data`,
        }}
        onChange={handleTableChange}
        scroll={{ x: true }}
      />

      {/* Approve Modal */}
      <Modal
        title="Setujui Reset Device"
        open={showApproveModal}
        onOk={handleApproveConfirm}
        onCancel={() => {
          setShowApproveModal(false);
          setSelectedRecord(null);
          setAdminResponse('');
        }}
        confirmLoading={actionLoading}
        okText="Setujui"
        cancelText="Batal"
      >
        {selectedRecord && (
          <div>
            <p><strong>User:</strong> {selectedRecord.user.nama_lengkap || selectedRecord.user.username}</p>
            <p><strong>Email:</strong> {selectedRecord.user.email}</p>
            <p><strong>Alasan:</strong> {selectedRecord.reason}</p>
            
            <Divider />
            
            <div style={{ marginBottom: 8 }}>
              <Text>Catatan Admin (Opsional):</Text>
            </div>
            <Input.TextArea
              value={adminResponse}
              onChange={(e) => setAdminResponse(e.target.value)}
              placeholder="Tambahkan catatan atau alasan persetujuan..."
              rows={3}
            />
            
            <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6 }}>
              <Text type="success">
                <CheckOutlined /> Dengan menyetujui request ini, device_id user akan direset dan user harus login ulang di device baru.
              </Text>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Tolak Reset Device"
        open={showRejectModal}
        onOk={handleRejectConfirm}
        onCancel={() => {
          setShowRejectModal(false);
          setSelectedRecord(null);
          setAdminResponse('');
        }}
        confirmLoading={actionLoading}
        okText="Tolak"
        cancelText="Batal"
        okButtonProps={{ danger: true }}
      >
        {selectedRecord && (
          <div>
            <p><strong>User:</strong> {selectedRecord.user.nama_lengkap || selectedRecord.user.username}</p>
            <p><strong>Email:</strong> {selectedRecord.user.email}</p>
            <p><strong>Alasan:</strong> {selectedRecord.reason}</p>
            
            <Divider />
            
            <div style={{ marginBottom: 8 }}>
              <Text>Alasan Penolakan <Text type="danger">*</Text>:</Text>
            </div>
            <Input.TextArea
              value={adminResponse}
              onChange={(e) => setAdminResponse(e.target.value)}
              placeholder="Masukkan alasan penolakan yang jelas..."
              rows={3}
              required
            />
            
            <div style={{ marginTop: 16, padding: 12, backgroundColor: '#fff2f0', border: '1px solid #ffccc7', borderRadius: 6 }}>
              <Text type="danger">
                <CloseOutlined /> Request reset device ini akan ditolak dan tidak dapat diproses ulang.
              </Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DeviceResetTable;
