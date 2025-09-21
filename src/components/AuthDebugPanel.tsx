import React, { useState } from 'react';
import { Button, Card, Descriptions, Modal, Space, Typography } from 'antd';
import { useAuthDebugger } from '../hooks/useAuthDebugger';
import { useAuthStore } from '../store/authStore';

const { Text, Title } = Typography;

export const AuthDebugPanel: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { debugInfo, logAuthState, forceUserRecovery } = useAuthDebugger();
  const { fetchUserProfile } = useAuthStore();

  if (process.env.NODE_ENV !== 'development') {
    return null; // Hide in production
  }

  const handleForceRecovery = async () => {
    const result = await forceUserRecovery();
    Modal.info({
      title: 'Force Recovery Result',
      content: `Recovery ${result ? 'succeeded' : 'failed'}`,
    });
  };

  const handleFetchProfile = async () => {
    try {
      await fetchUserProfile();
      Modal.success({
        title: 'Profile Fetch',
        content: 'Profile fetch completed successfully',
      });
    } catch (error) {
      Modal.error({
        title: 'Profile Fetch Failed',
        content: `Error: ${error}`,
      });
    }
  };

  return (
    <>
      <Button 
        style={{ 
          position: 'fixed', 
          bottom: 20, 
          right: 20, 
          zIndex: 9999,
          background: '#ff6b6b',
          borderColor: '#ff6b6b',
          color: 'white'
        }}
        onClick={() => setIsVisible(true)}
      >
        🔍 Auth Debug
      </Button>

      <Modal
        title="Auth Debug Panel"
        open={isVisible}
        onCancel={() => setIsVisible(false)}
        footer={
          <Space>
            <Button onClick={logAuthState}>
              Log to Console
            </Button>
            <Button onClick={handleForceRecovery} type="primary">
              Force Recovery
            </Button>
            <Button onClick={handleFetchProfile}>
              Fetch Profile
            </Button>
            <Button onClick={() => setIsVisible(false)}>
              Close
            </Button>
          </Space>
        }
        width={800}
      >
        <Card>
          <Title level={5}>User Data</Title>
          {debugInfo.user ? (
            <Descriptions size="small" column={2}>
              <Descriptions.Item label="ID">{debugInfo.user.id}</Descriptions.Item>
              <Descriptions.Item label="Username">{debugInfo.user.username}</Descriptions.Item>
              <Descriptions.Item label="Name">{debugInfo.user.name}</Descriptions.Item>
              <Descriptions.Item label="Email">{debugInfo.user.email}</Descriptions.Item>
              <Descriptions.Item label="Role">{debugInfo.user.role}</Descriptions.Item>
              <Descriptions.Item label="SKPD">{debugInfo.user.skpd}</Descriptions.Item>
            </Descriptions>
          ) : (
            <Text type="danger">No user data</Text>
          )}
        </Card>

        <Card style={{ marginTop: 16 }}>
          <Title level={5}>Tokens</Title>
          <Descriptions size="small" column={1}>
            <Descriptions.Item label="Access Token">
              {debugInfo.tokens?.access?.hasToken ? (
                <Space direction="vertical" size="small">
                  <Text code>{debugInfo.tokens.access.tokenPreview}</Text>
                  <Text type="secondary">Length: {debugInfo.tokens.access.tokenLength}</Text>
                </Space>
              ) : (
                <Text type="danger">No access token</Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Refresh Token">
              {debugInfo.tokens?.refresh?.hasRefreshToken ? (
                <Text type="success">✅ Present (Length: {debugInfo.tokens.refresh.refreshTokenLength})</Text>
              ) : (
                <Text type="danger">❌ Missing</Text>
              )}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card style={{ marginTop: 16 }}>
          <Title level={5}>State</Title>
          <Descriptions size="small" column={2}>
            <Descriptions.Item label="Is Authenticated">
              {debugInfo.state?.isAuthenticated ? (
                <Text type="success">✅ True</Text>
              ) : (
                <Text type="danger">❌ False</Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Is Loading">
              {debugInfo.state?.isLoading ? (
                <Text type="warning">⏳ True</Text>
              ) : (
                <Text type="success">✅ False</Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Last Update" span={2}>
              <Text type="secondary">{debugInfo.timestamp}</Text>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Modal>
    </>
  );
};