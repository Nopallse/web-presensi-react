import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Radio, 
  Button, 
  message, 
  Space, 
  Alert,
  Divider,
  Spin
} from 'antd';
import { 
  SettingOutlined,
  SaveOutlined,
  ReloadOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { pengaturanApi } from '../services/pengaturanApi';
import SettingCard from '../components/SettingCard';
import { getTipeJadwalLabel, getTipeJadwalDescription } from '../utils/tipeJadwalUtils';
import type { TipeJadwalOption } from '../types';
import { useAuth } from '../../../store/authStore';

const { Title, Text } = Typography;

const PengaturanPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentTipeJadwal, setCurrentTipeJadwal] = useState<TipeJadwalOption>('normal');
  const [selectedTipeJadwal, setSelectedTipeJadwal] = useState<TipeJadwalOption>('normal');

  // Check if user is super admin
  const isSuperAdmin = user?.role === 'super_admin';

  useEffect(() => {
    if (isSuperAdmin) {
      fetchCurrentTipeJadwal();
    }
  }, [isSuperAdmin]);

  const fetchCurrentTipeJadwal = async () => {
    try {
      setLoading(true);
      const response = await pengaturanApi.getCurrentTipeJadwal();
      const tipe = response.data.tipe as TipeJadwalOption;
      setCurrentTipeJadwal(tipe);
      setSelectedTipeJadwal(tipe);
    } catch (error: any) {
      console.error('Error fetching tipe jadwal:', error);
      message.error('Gagal memuat pengaturan tipe jadwal');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTipeJadwal = async () => {
    if (selectedTipeJadwal === currentTipeJadwal) {
      message.info('Tidak ada perubahan untuk disimpan');
      return;
    }

    try {
      setSaving(true);
      const response = await pengaturanApi.updateTipeJadwal({
        tipe: selectedTipeJadwal
      });
      
      setCurrentTipeJadwal(selectedTipeJadwal);
      message.success(response.message);
    } catch (error: any) {
      console.error('Error updating tipe jadwal:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Gagal menyimpan pengaturan');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = () => {
    fetchCurrentTipeJadwal();
  };

  const handleReset = () => {
    setSelectedTipeJadwal(currentTipeJadwal);
  };

  // Show access denied for non-super admin
  if (!isSuperAdmin) {
    return (
      <div style={{ padding: '24px', maxWidth: '100%', overflow: 'hidden' }}>
        <Card>
          <Alert
            message="Akses Ditolak"
            description="Hanya super admin yang dapat mengakses halaman pengaturan sistem."
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        </Card>
      </div>
    );
  }

  const hasChanges = selectedTipeJadwal !== currentTipeJadwal;

  return (
    <div style={{ padding: '24px', maxWidth: '100%', overflow: 'hidden' }}>
      <Card>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <SettingOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            <div>
              <Title level={3} style={{ margin: 0 }}>
                Pengaturan Sistem
              </Title>
              <Text type="secondary">
                Kelola pengaturan global sistem presensi
              </Text>
            </div>
          </div>
          
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
          >
            Refresh
          </Button>
        </div>

        <Divider />

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text type="secondary">Memuat pengaturan...</Text>
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: '600px' }}>
            {/* Tipe Jadwal Setting */}
            <SettingCard
              title="Tipe Jadwal Global"
              description="Pengaturan tipe jadwal yang berlaku untuk seluruh sistem"
              icon={<ClockCircleOutlined style={{ color: '#1890ff' }} />}
              showWarning={hasChanges}
              warningText="Ada perubahan yang belum disimpan"
            >
              <div style={{ marginBottom: 16 }}>
                <Text>
                  Pilih tipe jadwal yang akan digunakan secara global di sistem:
                </Text>
              </div>
              
              <Radio.Group
                value={selectedTipeJadwal}
                onChange={(e) => setSelectedTipeJadwal(e.target.value)}
                style={{ width: '100%' }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Radio value="normal">
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{getTipeJadwalLabel('normal')}</div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {getTipeJadwalDescription('normal')}
                      </Text>
                    </div>
                  </Radio>
                  <Radio value="ramadhan">
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{getTipeJadwalLabel('ramadhan')}</div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {getTipeJadwalDescription('ramadhan')}
                      </Text>
                    </div>
                  </Radio>
                </Space>
              </Radio.Group>

              <Alert
                message="Informasi Penting"
                description={`Perubahan tipe jadwal akan mempengaruhi seluruh sistem presensi. Jadwal ${getTipeJadwalLabel('normal')} menggunakan jam kerja standar, sedangkan jadwal ${getTipeJadwalLabel('ramadhan')} menggunakan jam kerja yang disesuaikan untuk bulan suci Ramadhan.`}
                type="info"
                showIcon
                style={{ marginTop: 16 }}
              />

              <div style={{ 
                marginTop: 24, 
                display: 'flex', 
                gap: 12, 
                justifyContent: 'flex-end',
                borderTop: '1px solid #f0f0f0',
                paddingTop: 16
              }}>
                {hasChanges && (
                  <Button onClick={handleReset}>
                    Reset
                  </Button>
                )}
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={saving}
                  onClick={handleSaveTipeJadwal}
                  disabled={!hasChanges}
                >
                  Simpan Perubahan
                </Button>
              </div>
            </SettingCard>

            {/* Current Status */}
            <Card title="Status Saat Ini" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>Tipe Jadwal Aktif:</Text>
                  <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                    {getTipeJadwalLabel(currentTipeJadwal)}
                  </Text>
                </div>
              </Space>
            </Card>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PengaturanPage;