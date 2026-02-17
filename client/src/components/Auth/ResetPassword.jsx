import { useState } from 'react';
import { Form, Input, Button, message } from 'antd'; // Changed Card to manual div for the split-design
import { LockOutlined, CheckCircleOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useLocation, useNavigate, Link } from 'react-router-dom';
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
    // Preserving your existing manual check logic
    if (values.newPassword !== values.confirmPassword) {
      message.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post('/users/reset-password', {
        email,
        newPassword: values.newPassword, // Preserving your exact key name
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
    <div className="flex items-center justify-center h-[calc(100vh-80px)] bg-gray-100 p-4 relative overflow-hidden">
      
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
            100% { transform: scale(1.1); }
          }
          .animate-bg-zoom {
            animation: slowZoom 25s infinite alternate ease-in-out;
          }
          
          /* FIXED ALIGNMENT: Absolute positioning with reserved spacing */
          .ant-form-item-explain {
            position: absolute;
            font-size: 12px;
            line-height: 1.2;
            margin-top: 2px;
          }

          /* Reserves 45px to prevent "Min 8 chars" from hitting the next label */
          .ant-form-item {
            margin-bottom: 45px !important;
          }

          .submit-item {
            margin-bottom: 0px !important;
            margin-top: -10px;
          }
        `}
      </style>

      {/* Main Card with Split Design */}
      <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden min-h-[500px] animate-pop-in">
        
        {/* LEFT SIDE: Visual */}
        <div className="hidden md:block md:w-1/2 relative overflow-hidden bg-gray-900">
          <div 
            className="absolute inset-0 bg-cover bg-center animate-bg-zoom opacity-90"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1000&auto=format&fit=crop')" }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-10 text-left">
            <h3 className="text-white text-3xl font-bold tracking-wide">Secure Access</h3>
            <p className="text-gray-300 mt-2 text-base">Updating your credentials for a safer experience.</p>
            <div className="h-1 w-16 bg-blue-500 mt-6 rounded-full"></div>
          </div>
        </div>

        {/* RIGHT SIDE: Reset Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
          <Link to="/login" className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-6 text-sm font-medium w-fit">
            <ArrowLeftOutlined /> Back to Login
          </Link>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-gray-800 flex items-center gap-3">
              New Password <CheckCircleOutlined className="text-blue-600" />
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              Setting new password for: <br/>
              <span className="font-semibold text-gray-800">{email}</span>
            </p>
          </div>

          <Form layout="vertical" onFinish={onFinish} size="large" requiredMark={false}>
            <Form.Item
              label={<span className="font-semibold text-gray-700">New Password</span>}
              name="newPassword"
              rules={[
                { required: true, message: 'Required' },
                { min: 6, message: 'Min 6 characters' },
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined className="text-gray-400 mr-2" />} 
                placeholder="New password" 
                className="rounded-lg py-2.5 bg-gray-50 border-gray-200"
              />
            </Form.Item>

            <Form.Item
              label={<span className="font-semibold text-gray-700">Confirm Password</span>}
              name="confirmPassword"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Please confirm' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mismatch!'));
                  },
                }),
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined className="text-gray-400 mr-2" />} 
                placeholder="Confirm password" 
                className="rounded-lg py-2.5 bg-gray-50 border-gray-200"
              />
            </Form.Item>

            <Form.Item className="submit-item">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="bg-blue-600 hover:bg-blue-700 h-12 text-lg font-bold rounded-lg shadow-lg"
              >
                Reset Password
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
}