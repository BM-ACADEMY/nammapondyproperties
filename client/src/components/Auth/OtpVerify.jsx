import { useState, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { SafetyCertificateOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function OtpVerify() {
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const navigate = useNavigate();
  const location = useLocation();
  const { email, purpose } = location.state || {};

  // Security redirect if no email is present
  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (!canResend && countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (countdown === 0) setCanResend(true);
  }, [countdown, canResend]);

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
      setCanResend(false);
      setCountdown(60);
    } catch (err) {
      message.error(err.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) return null;

  return (
    <div className="flex items-center justify-center h-[calc(100vh-80px)] bg-gray-100 p-4 relative overflow-hidden">
      
      {/* SHARED ANIMATION STYLES */}
      <style>
        {`
          @keyframes popIn {
            0% { opacity: 0; transform: scale(0.9) translateY(20px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
          .animate-pop-in {
            animation: popIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          @keyframes slowZoom {
            0% { transform: scale(1); }
            100% { transform: scale(1.15); }
          }
          .animate-bg-zoom {
            animation: slowZoom 25s infinite alternate ease-in-out;
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-up {
            animation: fadeInUp 1.2s ease-out 0.3s forwards;
            opacity: 0;
          }
        `}
      </style>

      {/* Main Card */}
      <div className="flex w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden min-h-[500px] animate-pop-in">
        
        {/* LEFT SIDE: Visual (Updated with new image) */}
        <div className="hidden md:block md:w-1/2 relative overflow-hidden bg-gray-900">
          <div 
            className="absolute inset-0 bg-cover bg-center animate-bg-zoom opacity-90"
            style={{ 
              // Replace the URL below with your desired real estate image URL
              backgroundImage: "url('https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1000&auto=format&fit=crop')" 
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-10">
            <div className="animate-fade-up">
              <h3 className="text-white text-3xl font-bold tracking-wide">Secure Access</h3>
              <p className="text-gray-300 mt-2 text-base">Verify your identity to keep your account safe.</p>
              <div className="h-1 w-16 bg-blue-500 mt-6 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: OTP Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-6 text-sm font-medium w-fit"
          >
            <ArrowLeftOutlined /> Back
          </button>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-gray-800 flex items-center gap-3">
              Verify OTP
            </h2>
            <p className="text-gray-500 mt-3 text-sm leading-relaxed">
              We've sent a 6-digit code to <br/>
              <span className="font-semibold text-gray-800">{email}</span>
            </p>
          </div>

          <Form layout="vertical" onFinish={onFinish} size="large">
            <Form.Item
              name="otp"
              className="flex justify-center mb-8"
              rules={[
                { required: true, message: 'Please enter the code' },
                { len: 6, message: 'Code must be 6 digits' },
              ]}
            >
              {/* Modern Individual Digit Input */}
              <Input.OTP 
                length={6} 
                formatter={(str) => str.toUpperCase()} 
                disabled={loading}
                className="otp-input-custom"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="bg-blue-600 hover:bg-blue-700 h-12 text-lg font-bold rounded-lg shadow-lg"
              >
                Verify & Continue
              </Button>
            </Form.Item>

            <div className="text-center mt-6">
              {canResend ? (
                <Button
                  type="link"
                  onClick={handleResendOtp}
                  loading={resendLoading}
                  className="text-blue-600 font-semibold hover:text-blue-800 underline p-0"
                >
                  Resend OTP
                </Button>
              ) : (
                <p className="text-gray-500 text-sm font-medium">
                  Resend code in <span className="text-blue-600 tabular-nums">{countdown}s</span>
                </p>
              )}
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}