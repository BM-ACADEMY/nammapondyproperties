import { useState } from 'react';
import { Form, Input, Button, message, Card } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API}/users/login`, {
        email: values.email,
        password: values.password,
      });

      message.success('Login successful!');

      // TODO: Save token/user to localStorage or context
      // Example:
      // localStorage.setItem('token', res.data.token);
      // localStorage.setItem('user', JSON.stringify(res.data.user));

      navigate('/dashboard'); // ← change to your protected route
    } catch (err) {
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
