// You can either use the resend button inside OtpVerify or create this page
// Most apps keep it inside OTP screen, but here's standalone version

import { useState } from 'react';
import { Form, Input, Button, message, Card } from 'antd';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

export default function ResendOtp() {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API}/users/send-otp`, { email: values.email });
      message.success(res.data.message);
    } catch (err) {
      message.error(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold text-center mb-6">Resend OTP</h2>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]}>
            <Input size="large" placeholder="you@example.com" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block size="large">
            Resend OTP
          </Button>
        </Form>
      </Card>
    </div>
  );
}
