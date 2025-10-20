import React from 'react';
import { Button, Space, App } from 'antd';

const MessageTest: React.FC = () => {
  const { message } = App.useApp();

  const showSuccess = () => {
    message.success('Test success message!');
  };

  const showError = () => {
    message.error('Test error message!');
  };

  const showWarning = () => {
    message.warning('Test warning message!');
  };

  const showInfo = () => {
    message.info('Test info message!');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3>Message Test Component</h3>
      <Space>
        <Button type="primary" onClick={showSuccess}>
          Success Message
        </Button>
        <Button danger onClick={showError}>
          Error Message
        </Button>
        <Button onClick={showWarning}>
          Warning Message
        </Button>
        <Button type="dashed" onClick={showInfo}>
          Info Message
        </Button>
      </Space>
    </div>
  );
};

export default MessageTest;
