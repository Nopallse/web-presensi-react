import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, Button, Alert, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuthActions, useAuthStore } from '../../../store/authStore';

interface LoginFormData {
  username: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthActions();
  const [form] = Form.useForm();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: LoginFormData) => {
    setError(null);
    setIsSubmitting(true);

    try {
      await login(values.username, values.password);
      
      message.success('Selamat datang! Anda berhasil masuk ke sistem.');

      // Get user data from store to determine role
      const userRole = useAuthStore.getState().user?.role;
      
      // Navigate based on user role
      let defaultPath = '/dashboard';
      if (userRole === 'admin-opd' || userRole === 'admin-upt') {
        defaultPath = '/presensi';
      }

      const from = location.state?.from?.pathname || defaultPath;
      navigate(from, { replace: true });
    } catch (error: any) {
      let errorMessage = 'Login gagal. Silakan coba lagi.';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form
      form={form}
      name="login"
      onFinish={handleSubmit}
      layout="vertical"
      size="large"
      initialValues={{
        username: '',
        password: ''
      }}
    >
      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Form.Item
        label="Username"
        name="username"
        rules={[
          { required: true, message: 'Username harus diisi!' }
        ]}
      >
        <Input
          prefix={<UserOutlined />}
          placeholder="Masukkan username"
          disabled={isSubmitting}
        />
      </Form.Item>

      <Form.Item
        label="Password"
        name="password"
        rules={[
          { required: true, message: 'Password harus diisi!' }
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Masukkan password"
          disabled={isSubmitting}
        />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={isSubmitting}
          disabled={isSubmitting}
          block
        >
          {isSubmitting ? 'Masuk...' : 'Login'}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default LoginForm;