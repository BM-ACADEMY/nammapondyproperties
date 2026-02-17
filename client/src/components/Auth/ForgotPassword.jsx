import { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { MailOutlined, ArrowLeftOutlined, KeyOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api"; // Consistent with your OTP page

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // API call to send OTP for password reset
      await api.post("/users/send-otp", { email: values.email });
      
      message.success("OTP sent to your email!");
      
      // Navigate to OTP page, specifying 'reset' purpose
      navigate("/otp-verify", { 
        state: { email: values.email, purpose: "reset", from: "forgot-password" } 
      });
    } catch (err) {
      message.error(err.response?.data?.error || "Failed to send reset code");
    } finally {
      setLoading(false);
    }
  };

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
        
        {/* LEFT SIDE: Visual */}
        <div className="hidden md:block md:w-1/2 relative overflow-hidden bg-gray-900">
          <div 
            className="absolute inset-0 bg-cover bg-center animate-bg-zoom opacity-90"
            style={{ 
              backgroundImage: "url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1000&auto=format&fit=crop')" 
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-10">
            <div className="animate-fade-up">
              <h3 className="text-white text-3xl font-bold tracking-wide">Recover Access</h3>
              <p className="text-gray-300 mt-2 text-base">We'll help you get back to finding your next home.</p>
              <div className="h-1 w-16 bg-blue-500 mt-6 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Forgot Password Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
          <Link 
            to="/login" 
            className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-6 text-sm font-medium w-fit"
          >
            <ArrowLeftOutlined /> Back to Login
          </Link>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-gray-800 flex items-center gap-3">
              Forgot Password
            </h2>
            <p className="text-gray-500 mt-3 text-sm leading-relaxed">
              Enter your email address and we'll send you a 6-digit code to reset your password.
            </p>
          </div>

          <Form layout="vertical" onFinish={onFinish} size="large">
            <Form.Item
              label={<span className="font-semibold text-gray-700">Email Address</span>}
              name="email"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Invalid email format" },
              ]}
              className="mb-8"
            >
              <Input 
                prefix={<MailOutlined className="text-gray-400 mr-2" />} 
                placeholder="mdarsath@example.com" 
                className="rounded-lg py-2.5 bg-gray-50 border-gray-200 focus:bg-white transition-all"
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
                Send Reset Code
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center mt-6 text-sm">
            <span className="text-gray-500">Remembered your password? </span>
            <Link to="/login" className="text-blue-700 hover:text-blue-900 font-bold ml-1 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}