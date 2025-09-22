import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Descriptions, Tag, Spin, message, Row, Col } from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import { lokasiApi } from '../services/lokasiApi';
import type { Lokasi } from '../types';

// Import GoogleMap component dynamically to avoid SSR issues
const GoogleMap = React.lazy(() => import('../../../components/GoogleMap'));

const LokasiDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lokasi, setLokasi] = useState<Lokasi | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchLokasiDetail(parseInt(id));
    }
  }, [id]);

  const fetchLokasiDetail = async (lokasiId: number) => {
    try {
      setLoading(true);
      const response = await lokasiApi.getById(lokasiId);
      setLokasi(response.data);
    } catch (error: any) {
      console.error('Error fetching lokasi detail:', error);
      message.error('Gagal memuat detail lokasi');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (!lokasi) {
    return (
      <div className="text-center py-8">
        <p>Lokasi tidak ditemukan</p>
        <Button onClick={() => navigate('/lokasi')}>
          Kembali ke Daftar Lokasi
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Detail Lokasi</h1>
            <p style={{ color: '#666', margin: 0 }}>Informasi lengkap lokasi presensi</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
            <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/lokasi')}
          >
            Kembali
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/lokasi/${lokasi.lokasi_id}/edit`)}
          >
            Edit
          </Button>
    
        </div>
      </div>

      <Row gutter={[24, 24]}>
        
        {/* Peta Lokasi */}
        <Col xs={24} lg={12}>
          <Card title="Lokasi di Peta">
            <React.Suspense fallback={<div className="h-[400px] w-full bg-gray-100 animate-pulse flex items-center justify-center">Loading Map...</div>}>
              <GoogleMap
                center={[lokasi.lat, lokasi.lng]}
                zoom={16}
                height="400px"
                selectedLocation={{
                  lat: lokasi.lat,
                  lng: lokasi.lng,
                  range: lokasi.range
                }}
              />
            </React.Suspense>
          </Card>
        </Col>
        
        {/* Informasi Dasar */}
        <Col xs={24} lg={12}>
          <Card title="Informasi Lokasi" className="h-full">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="ID Lokasi">
                {lokasi.lokasi_id}
              </Descriptions.Item>
              <Descriptions.Item label="Keterangan">
                {lokasi.ket}
              </Descriptions.Item>
              <Descriptions.Item label="Latitude">
                {lokasi.lat}
              </Descriptions.Item>
              <Descriptions.Item label="Longitude">
                {lokasi.lng}
              </Descriptions.Item>
              <Descriptions.Item label="Radius">
                {lokasi.range} meter
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={lokasi.status ? 'green' : 'red'}>
                  {lokasi.status ? 'Aktif' : 'Tidak Aktif'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Dibuat">
                {formatDate(lokasi.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Diperbarui">
                {formatDate(lokasi.updatedAt)}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
         

        {/* Informasi SKPD */}
        <Col  lg={12}>
          <Card title="Informasi SKPD" className="h-full">
            {lokasi.skpd_data ? (
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Kode SKPD">
                  {lokasi.skpd_data.KDSKPD}
                </Descriptions.Item>
                <Descriptions.Item label="Nama SKPD">
                  {lokasi.skpd_data.NMSKPD?.trim()}
                </Descriptions.Item>
                <Descriptions.Item label="Status SKPD">
                  <Tag color={lokasi.skpd_data.StatusSKPD === 'Aktif' ? 'green' : 'red'}>
                    {lokasi.skpd_data.StatusSKPD}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <p className="text-gray-500">Data SKPD tidak tersedia</p>
            )}
          </Card>
        </Col>

        {/* Informasi Bidang */}
        {lokasi.bidang_data && (
          <Col xs={24} lg={12}>
            <Card title="Informasi Bidang">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Kode Bidang">
                      {lokasi.bidang_data.BIDANGF}
                    </Descriptions.Item>
                    <Descriptions.Item label="Nama Bidang">
                      {lokasi.bidang_data.NMBIDANG}
                    </Descriptions.Item>
                    <Descriptions.Item label="Nama Jabatan">
                      {lokasi.bidang_data.NAMA_JABATAN}
                    </Descriptions.Item>
                    <Descriptions.Item label="Jenis Jabatan">
                      {lokasi.bidang_data.JENIS_JABATAN}
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
                <Col xs={24} md={12}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Kode Satker">
                      {lokasi.bidang_data.KDSATKER}
                    </Descriptions.Item>
                    <Descriptions.Item label="Eselon">
                      {lokasi.bidang_data.KDESELON}
                    </Descriptions.Item>
                    <Descriptions.Item label="Status">
                      <Tag color={lokasi.bidang_data.STATUS_BIDANG === '1' ? 'green' : 'red'}>
                        {lokasi.bidang_data.STATUS_BIDANG === '1' ? 'Aktif' : 'Tidak Aktif'}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Tanggal Dibuat">
                      {formatDate(lokasi.bidang_data.TANGGAL_DIBUAT)}
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>
              {lokasi.bidang_data.KETERANGAN && (
                <div className="mt-4">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Keterangan">
                      {lokasi.bidang_data.KETERANGAN}
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              )}
            </Card>
          </Col>
        )}

        {/* Informasi Satker */}
        {lokasi.satker_data && (
          <Col xs={24} lg={12}>
            <Card title="Informasi Satuan Kerja">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Kode Satker">
                      {lokasi.satker_data.KDSATKER?.trim()}
                    </Descriptions.Item>
                    <Descriptions.Item label="Nama Satker">
                      {lokasi.satker_data.NMSATKER}
                    </Descriptions.Item>
                    <Descriptions.Item label="Nama Jabatan">
                      {lokasi.satker_data.NAMA_JABATAN || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Jenis Jabatan">
                      {lokasi.satker_data.JENIS_JABATAN}
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
                <Col xs={24} md={12}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Eselon">
                      {lokasi.satker_data.KDESELON}
                    </Descriptions.Item>
                    <Descriptions.Item label="BUP">
                      {lokasi.satker_data.BUP} tahun
                    </Descriptions.Item>
                    <Descriptions.Item label="Status">
                      <Tag color={lokasi.satker_data.STATUS_SATKER === '1' ? 'green' : 'red'}>
                        {lokasi.satker_data.STATUS_SATKER === '1' ? 'Aktif' : 'Tidak Aktif'}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Tanggal Dibuat">
                      {formatDate(lokasi.satker_data.TANGGAL_DIBUAT)}
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>
              {lokasi.satker_data.KETERANGAN_SATKER && (
                <div className="mt-4">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Keterangan">
                      {lokasi.satker_data.KETERANGAN_SATKER}
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              )}
            </Card>
          </Col>
        )}

       

       
      </Row>
    </div>
  );
};

export default LokasiDetail;