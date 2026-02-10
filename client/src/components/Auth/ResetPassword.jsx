import { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function ResetPassword() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { email } = location.state || {};

  if (!email) {
    navigate('/forgot-password');
    return null;
  }

  const onFinish = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post('/users/reset-password', {
        email,
        newPassword: values.newPassword,
      });

      message.success('Password reset successfully! Please login.');
      navigate('/login');
    } catch (err) {
      message.error(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-md shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Set New Password</h1>
        <p className="text-center text-gray-600 mb-6">
          For account: <strong>{email}</strong>
        </p>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[
              { required: true, message: 'Please enter new password' },
              { min: 6, message: 'Password must be at least 6 characters' },
            ]}
          >
            <Input.Password size="large" placeholder="New password" />
          </Form.Item>

          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password size="large" placeholder="Confirm password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              Reset Password
            </Button>
          </Form.Item>

          <div className="text-center">
            <Button type="link" onClick={() => navigate('/login')}>
              Back to Login
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
