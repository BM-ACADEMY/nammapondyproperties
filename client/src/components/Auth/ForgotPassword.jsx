// ForgotPassword.jsx (mostly fine — small cleanup)
import { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';   // assuming this is your axios instance

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await api.post('/users/send-otp', { email: values.email });
      message.success('OTP sent to your email!');
      navigate('/otp-verify', { state: { email: values.email, purpose: 'reset' } });
    } catch (err) {
      message.error(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-md shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Reset Password</h1>
        <p className="text-center text-gray-600 mb-6">
          Enter your email to receive an OTP
        </p>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input size="large" placeholder="you@example.com" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              Send OTP
            </Button>
          </Form.Item>

          <div className="text-center">
            <Link to="/login" className="text-blue-600 hover:underline">
              Back to Login
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}
