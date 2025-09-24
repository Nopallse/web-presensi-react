import React from 'react';
import { Navigate } from 'react-router-dom';
import { Card, Typography } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { useAuth } from '../../../store/authStore';
import LoginForm from '../components/LoginForm';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div 
      style={{
        minHeight: '100vh',
        background: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
    >
      <div style={{ maxWidth: '400px', width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          {/* Logo Kota */}
          <div style={{ marginBottom: '24px' }}>
            <img 
              src="/logo-kota.png" 
              alt="Logo Kota" 
              style={{
                width: '80px',
                height: '80px',
                objectFit: 'contain',
                margin: '0 auto',
                display: 'block'
              }}
              onError={(e) => {
                // Fallback jika logo tidak ditemukan
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            {/* Fallback logo jika gambar tidak ada */}
            <div 
              style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#0ea5e9',
                borderRadius: '50%',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)'
              }}
            >
              <FileTextOutlined style={{ fontSize: '32px', color: 'white' }} />
            </div>
          </div>
          
          {/* Title */}
          <Title level={2} style={{ marginBottom: '8px', color: '#262626' }}>
            Aplikasi E-Presensi
          </Title>
          <Text type="secondary" style={{ fontSize: '16px', display: 'block', marginBottom: '8px' }}>
            Khusus untuk Akses Login sebagai Admin
          </Text>
          <Text type="secondary" style={{ fontSize: '14px' }}>
            Masukkan username dan password untuk login
          </Text>
        </div>

        {/* Login Form Card */}
        <Card
          style={{
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}
          bodyStyle={{ padding: '32px' }}
        >
          <LoginForm />
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;