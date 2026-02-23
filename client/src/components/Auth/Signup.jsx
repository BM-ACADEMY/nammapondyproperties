import { useState } from "react";
import { Form, Input, Button, message, Tabs } from "antd";
import { MailOutlined, PhoneOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";

const API = import.meta.env.VITE_API_URL;

export default function Signup() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("email");
  const navigate = useNavigate();
  const { login } = useAuth();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        email: activeTab === "email" ? values.email : undefined,
        phone: activeTab === "phone" ? values.phone : undefined,
        password: values.password,
      };

      const res = await axios.post(`${API}/users/create-user`, payload);

      if (res.data.success) {
        message.success(res.data.message || "Account created successfully!");

        // Auto-login
        localStorage.setItem("token", res.data.token);
        login(res.data.user, res.data.token);

        navigate("/");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to create account";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    try {
      const res = await axios.post(`${API}/users/google-login`, {
        credential: response.credential,
      });

      if (res.data.success) {
        message.success("Login successful!");
        localStorage.setItem("token", res.data.token);
        login(res.data.user, res.data.token);
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      message.error(
        err.response?.data?.error || "Google authentication failed",
      );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-gray-100 p-2 sm:p-4 relative overflow-hidden">
      <style>
        {`
          @keyframes popIn {
            0% { opacity: 0; transform: scale(0.95) translateY(10px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
          .animate-pop-in {
            animation: popIn 0.5s ease-out forwards;
          }

          @keyframes slowZoom {
            0% { transform: scale(1); }
            100% { transform: scale(1.1); }
          }
          .animate-bg-zoom {
            animation: slowZoom 20s infinite alternate ease-in-out;
          }

          .ant-tabs-nav {
            margin-bottom: 24px !important;
          }
          .ant-tabs-tab-active .ant-tabs-tab-btn {
            color: #2563eb !important;
            font-weight: 700 !important;
          }
          .ant-tabs-ink-bar {
            background: #2563eb !important;
          }
        `}
      </style>

      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden min-h-[500px] md:min-h-[600px] animate-pop-in">
        <div className="hidden md:block md:w-5/12 relative overflow-hidden bg-gray-900">
          <div
            className="absolute inset-0 bg-cover bg-center animate-bg-zoom opacity-80"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000&auto=format&fit=crop')",
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8">
            <h3 className="text-white text-2xl lg:text-3xl font-bold">
              Start Your Journey
            </h3>
            <p className="text-gray-300 mt-2 text-sm lg:text-base font-medium">
              Join Namma Pondy Properties today.
            </p>
            <div className="h-1 w-16 bg-blue-500 mt-4 rounded-full"></div>
          </div>
        </div>

        <div className="w-full md:w-7/12 p-6 sm:p-8 lg:p-12 flex flex-col justify-center overflow-y-auto max-h-[90vh] md:max-h-none">
          <div className="mb-6 text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 flex items-center justify-center md:justify-start gap-2">
              Create Account
            </h2>
            <p className="text-gray-500 mt-1 text-xs sm:text-sm">
              Join our community of buyers and sellers.
            </p>
          </div>

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            centered
            className="mb-4"
            items={[
              {
                key: "email",
                label: (
                  <span className="flex items-center gap-2">
                    <MailOutlined /> Email
                  </span>
                ),
              },
              {
                key: "phone",
                label: (
                  <span className="flex items-center gap-2">
                    <PhoneOutlined /> Phone
                  </span>
                ),
              },
            ]}
          />

          <Form
            layout="vertical"
            onFinish={onFinish}
            requiredMark={false}
            size="large"
            className="w-full"
          >
            {activeTab === "email" ? (
              <Form.Item
                label={
                  <span className="font-semibold text-gray-700 text-sm">
                    Email Address
                  </span>
                }
                name="email"
                rules={[
                  { required: true, message: "Email is required" },
                  { type: "email", message: "Invalid email" },
                ]}
              >
                <Input
                  prefix={<MailOutlined className="text-gray-400 mr-2" />}
                  placeholder="Enter your email"
                  className="rounded-lg bg-gray-50 border-gray-200"
                />
              </Form.Item>
            ) : (
              <Form.Item
                label={
                  <span className="font-semibold text-gray-700 text-sm">
                    Phone Number
                  </span>
                }
                name="phone"
                rules={[
                  { required: true, message: "Phone is required" },
                  { pattern: /^[0-9]{10}$/, message: "Invalid number" },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined className="text-gray-400 mr-2" />}
                  placeholder="Enter Whatsapp number"
                  maxLength={10}
                  inputMode="numeric"
                  className="rounded-lg bg-gray-50 border-gray-200"
                  onKeyPress={(e) => !/[0-9]/.test(e.key) && e.preventDefault()}
                />
              </Form.Item>
            )}

            <Form.Item
              label={
                <span className="font-semibold text-gray-700 text-sm">
                  Password
                </span>
              }
              name="password"
              rules={[
                { required: true, message: "Required" },
                { min: 8, message: "Min 8 chars" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400 mr-2" />}
                placeholder="Password"
                className="rounded-lg bg-gray-50 border-gray-200"
              />
            </Form.Item>

            <Form.Item className="mt-4 mb-2">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="bg-blue-600 hover:bg-blue-700 h-12 text-base sm:text-lg font-bold rounded-lg shadow-lg"
              >
                Sign Up
              </Button>
            </Form.Item>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="flex justify-center w-full mb-6">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => message.error("Google Login Failed")}
                useOneTap
                theme="outline"
                shape="rectangular"
                width="100%"
              />
            </div>
          </Form>

          <div className="text-center text-xs sm:text-sm">
            <span className="text-gray-500">Already have an account? </span>
            <Link
              to="/login"
              className="text-blue-700 hover:text-blue-900 font-bold ml-1 hover:underline"
            >
              Login here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
