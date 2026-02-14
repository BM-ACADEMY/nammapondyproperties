import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function OtpVerify() {
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60); // seconds

  const navigate = useNavigate();
  const location = useLocation();

  const { email, purpose } = location.state || {};

  if (!email) {
    navigate('/forgot-password');
    return null;
  }

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (!canResend && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
    if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  // Start cooldown after first render (initial OTP has been sent)
  useEffect(() => {
    setCanResend(false);
    setCountdown(60);
  }, []); // runs once on mount

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await api.post('/users/verify-otp', {
        email,
        otp: values.otp,
      });

      message.success('OTP verified successfully!');

      if (purpose === 'reset') {
        navigate('/reset-password', { state: { email } });
      } else {
        message.success('Account verified! Please login.');
        navigate('/login');
      }
    } catch (err) {
      message.error(err.response?.data?.error || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    setResendLoading(true);
    try {
      await api.post('/users/send-otp', { email });
      message.success('New OTP sent to your email!');

      // Restart cooldown
      setCanResend(false);
      setCountdown(60);
    } catch (err) {
      message.error(err.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-md shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Verify OTP</h1>
        <p className="text-center text-gray-600 mb-6">
          Enter the 6-digit OTP sent to <strong>{email}</strong>
        </p>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="OTP"
            name="otp"
            rules={[
              { required: true, message: 'Please enter the OTP' },
              { len: 6, message: 'OTP must be 6 characters' },
            ]}
          >
            <Input
              size="large"
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              disabled={loading}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
            >
              Verify OTP
            </Button>
          </Form.Item>

          <div className="text-center mt-4">
            {canResend ? (
              <Button
                type="link"
                onClick={handleResendOtp}
                loading={resendLoading}
                disabled={resendLoading}
              >
                Resend OTP
              </Button>
            ) : (
              <p className="text-gray-500 text-sm">
                Resend OTP in {countdown}s
              </p>
            )}
          </div>

          <div className="text-center mt-2">
            <Button type="link" onClick={() => navigate(-1)}>
              Back
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
