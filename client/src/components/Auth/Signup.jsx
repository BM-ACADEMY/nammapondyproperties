import { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  LockOutlined, 
  UserAddOutlined 
} from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export default function Signup() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
      };

      const res = await axios.post(`${API}/users/create-user`, payload);
      message.success(res.data.message || "Account created! Check your email for OTP.");

      navigate("/otp-verify", {
        state: { email: values.email, from: "signup" },
      });
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to create account";
      message.error(errorMsg);
    } finally {
      setLoading(false);
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
          
          /* FIX: Prevents layout jumping. Errors appear in a reserved space */
          .ant-form-item-explain {
            position: absolute;
            font-size: 11px;
            line-height: 1;
            padding-top: 2px;
          }
          .ant-form-item {
            margin-bottom: 22px !important;
          }
        `}
      </style>

      {/* Main Responsive Card */}
      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden min-h-[500px] md:min-h-[600px] animate-pop-in">
        
        {/* LEFT SIDE: Hidden on mobile (max-sm), visible on medium+ */}
        <div className="hidden md:block md:w-5/12 relative overflow-hidden bg-gray-900">
          <div 
            className="absolute inset-0 bg-cover bg-center animate-bg-zoom opacity-80"
            style={{ 
              backgroundImage: "url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000&auto=format&fit=crop')" 
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8">
            <h3 className="text-white text-2xl lg:text-3xl font-bold">Start Your Journey</h3>
            <p className="text-gray-300 mt-2 text-sm lg:text-base font-medium">
              Join Namma Pondy Properties today.
            </p>
            <div className="h-1 w-16 bg-blue-500 mt-4 rounded-full"></div>
          </div>
        </div>

        {/* RIGHT SIDE: The Form */}
        <div className="w-full md:w-7/12 p-6 sm:p-8 lg:p-12 flex flex-col justify-center overflow-y-auto max-h-[90vh] md:max-h-none">
          
          <div className="mb-6 text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 flex items-center justify-center md:justify-start gap-2">
              Create Account
            </h2>
            <p className="text-gray-500 mt-1 text-xs sm:text-sm">Join our community of buyers and sellers.</p>
          </div>

          <Form
            layout="vertical"
            onFinish={onFinish}
            requiredMark={false}
            size="large"
            className="w-full"
          >
            {/* Grid for Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <Form.Item
                label={<span className="font-semibold text-gray-700 text-sm">Full Name</span>}
                name="name"
                rules={[{ required: true, message: "Required" }]}
              >
                <Input 
                  prefix={<UserOutlined className="text-gray-400 mr-2" />} 
                  placeholder="Enter your name" 
                  className="rounded-lg bg-gray-50 border-gray-200"
                />
              </Form.Item>

              <Form.Item
                label={<span className="font-semibold text-gray-700 text-sm">Phone Number</span>}
                name="phone"
                rules={[
                  { required: true, message: "Required" },
                  { pattern: /^[0-9]{10}$/, message: "Invalid number" }
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
            </div>

            <Form.Item
              label={<span className="font-semibold text-gray-700 text-sm">Email Address</span>}
              name="email"
              rules={[
                { required: true, message: "Required" },
                { type: "email", message: "Invalid email" },
              ]}
            >
              <Input 
                prefix={<MailOutlined className="text-gray-400 mr-2" />} 
                placeholder="Enter your email" 
                className="rounded-lg bg-gray-50 border-gray-200"
              />
            </Form.Item>

            {/* Grid for Password & Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <Form.Item
                label={<span className="font-semibold text-gray-700 text-sm">Password</span>}
                name="password"
                rules={[
                  { required: true, message: "Required" },
                  { min: 8, message: "Min 8 chars" },
                  {
                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                    message: "Too weak",
                  },
                ]}
              >
                <Input.Password 
                  prefix={<LockOutlined className="text-gray-400 mr-2" />} 
                  placeholder="Password" 
                  className="rounded-lg bg-gray-50 border-gray-200"
                />
              </Form.Item>

              <Form.Item
                label={<span className="font-semibold text-gray-700 text-sm">Confirm Password</span>}
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: "Required" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) return Promise.resolve();
                      return Promise.reject(new Error("Mismatch!"));
                    },
                  }),
                ]}
              >
                <Input.Password 
                  prefix={<LockOutlined className="text-gray-400 mr-2" />} 
                  placeholder="Confirm" 
                  className="rounded-lg bg-gray-50 border-gray-200"
                />
              </Form.Item>
            </div>

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
          </Form>

          <div className="text-center text-xs sm:text-sm">
            <span className="text-gray-500">Already have an account? </span>
            <Link to="/login" className="text-blue-700 hover:text-blue-900 font-bold ml-1 hover:underline">
              Login here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}