import { useState } from 'react';
import { Form, Input, Button, message, Card } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API = import.meta.env.VITE_API_URL; // Consistent with other files

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); // Use AuthContext

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Ensure API URL is correct. context uses VITE_API_URL.
      const res = await axios.post(`${API}/users/login`, {
        email: values.email,
        password: values.password,
      });

      message.success('Login successful!');

      if (res.data.success) {
        login(res.data.user, res.data.token);

        // Role based redirect
        const role = res.data.user?.role?.name?.toUpperCase() || res.data.user?.role_id?.role_name?.toUpperCase();
        if (role === 'ADMIN') navigate('/admin/dashboard');
        else if (role === 'SELLER') navigate('/seller/dashboard');
        else navigate('/');
      } else {
        message.error(res.data.message || 'Login failed');
      }

    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-md shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Invalid email format' },
            ]}
          >
            <Input size="large" placeholder="you@example.com" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: 'Please enter your password' },
              { min: 6, message: 'Password must be at least 6 characters' },
            ]}
          >
            <Input.Password size="large" placeholder="••••••••" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
            >
              Login
            </Button>
          </Form.Item>

          <div className="text-center text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </div>

          {/* Optional: Add forgot password link later */}
          <div className="text-center mt-2">
            <Link to="/forgot-password" className="text-blue-600 hover:underline text-sm">
              Forgot password?
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}
