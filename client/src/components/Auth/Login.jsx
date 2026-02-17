import { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { UserOutlined, LockOutlined, HomeOutlined } from "@ant-design/icons";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const API = import.meta.env.VITE_API_URL;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API}/users/login`, {
        email: values.email,
        password: values.password,
      });

      if (res.data.success) {
        message.success("Login successful!");
        localStorage.setItem("token", res.data.token);
        login(res.data.user, res.data.token);

        const role =
          res.data.user?.role?.name?.toUpperCase() ||
          res.data.user?.role_id?.role_name?.toUpperCase();

        if (location.state?.from) {
          navigate(location.state.from);
        } else if (role === "ADMIN") navigate("/admin/dashboard");
        else if (role === "SELLER") navigate("/seller/dashboard");
        else navigate("/");
      } else {
        message.error(res.data.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-[calc(100vh-80px)] bg-gray-100 p-4 relative overflow-hidden">
      
      {/* INLINE STYLES FOR ANIMATIONS */}
      <style>
        {`
          /* 1. Page Load Pop-In Transition */
          @keyframes popIn {
            0% { opacity: 0; transform: scale(0.9) translateY(20px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
          .animate-pop-in {
            animation: popIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }

          /* 2. Image Zoom Effect */
          @keyframes slowZoom {
            0% { transform: scale(1); }
            100% { transform: scale(1.15); }
          }
          .animate-bg-zoom {
            animation: slowZoom 25s infinite alternate ease-in-out;
          }
          
          /* 3. Text Fade Up */
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-up {
            animation: fadeInUp 1.2s ease-out 0.3s forwards; /* Added delay so it runs AFTER card pops in */
            opacity: 0;
          }
        `}
      </style>

      {/* The Main Card - Added 'animate-pop-in' class here */}
      <div className="flex w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden min-h-[550px] animate-pop-in">
        
        {/* LEFT SIDE: Animated Real Estate Image */}
        <div className="hidden md:block md:w-1/2 relative overflow-hidden bg-gray-900">
          
          <div 
            className="absolute inset-0 bg-cover bg-center animate-bg-zoom opacity-90"
            style={{ 
              backgroundImage: "url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000&auto=format&fit=crop')" 
            }}
          ></div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-10">
            <div className="animate-fade-up">
                <h3 className="text-white text-3xl font-bold tracking-wide leading-tight">
                  Discover Premium <br/> Apartment Living
                </h3>
                <p className="text-gray-300 mt-4 text-base font-medium">
                  Log in to explore exclusive properties in Pondicherry.
                </p>
                <div className="h-1 w-20 bg-blue-500 mt-6 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: The Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-gray-800 flex items-center gap-3">
              Welcome Back
            </h2>
            <p className="text-gray-500 mt-2 text-sm">Please sign-in to access your account.</p>
          </div>

          <Form
            layout="vertical"
            onFinish={onFinish}
            requiredMark={false}
            size="large"
            className="w-full"
          >
            <Form.Item
              label={<span className="font-semibold text-gray-700">Email Address</span>}
              name="email"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Invalid email format" },
              ]}
            >
              <Input 
                prefix={<UserOutlined className="text-gray-400 mr-2" />} 
                placeholder="john@example.com" 
                className="rounded-lg py-2.5 bg-gray-50 border-gray-200 focus:bg-white transition-all"
              />
            </Form.Item>

            <Form.Item
              label={<span className="font-semibold text-gray-700">Password</span>}
              name="password"
              rules={[
                { required: true, message: "Please enter your password" },
                { min: 6, message: "Password must be at least 6 characters" },
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined className="text-gray-400 mr-2" />} 
                placeholder="••••••••" 
                className="rounded-lg py-2.5 bg-gray-50 border-gray-200 focus:bg-white transition-all"
              />
            </Form.Item>

            <div className="flex justify-end mb-6">
              <Link
                to="/forgot-password"
                className="text-blue-600 hover:text-blue-800 text-sm font-semibold hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="bg-blue-600 hover:bg-blue-700 h-12 text-lg font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center mt-6 text-sm">
            <span className="text-gray-500">New to Namma Pondy? </span>
            <Link to="/signup" className="text-blue-700 hover:text-blue-900 font-bold ml-1 hover:underline">
              create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}