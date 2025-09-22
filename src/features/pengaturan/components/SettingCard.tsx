import React from 'react';
import { Card, Typography, Space } from 'antd';

const { Text } = Typography;

interface SettingCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  extra?: React.ReactNode;
  showWarning?: boolean;
  warningText?: string;
}

const SettingCard: React.FC<SettingCardProps> = ({
  title,
  description,
  icon,
  children,
  extra,
  showWarning = false,
  warningText
}) => {
  return (
    <Card 
      title={
        <Space>
          {icon}
          <div>
            <div>{title}</div>
            {description && (
              <Text type="secondary" style={{ fontSize: '12px', fontWeight: 'normal' }}>
                {description}
              </Text>
            )}
          </div>
        </Space>
      }
      size="small"
      extra={extra}
      style={{ marginBottom: 16 }}
    >
      {showWarning && warningText && (
        <div style={{ 
          marginBottom: 16, 
          padding: '8px 12px', 
          backgroundColor: '#fff7e6',
          border: '1px solid #ffd591',
          borderRadius: '6px'
        }}>
          <Text type="warning" style={{ fontSize: '12px' }}>
            ⚠️ {warningText}
          </Text>
        </div>
      )}
      {children}
    </Card>
  );
};

export default SettingCard;