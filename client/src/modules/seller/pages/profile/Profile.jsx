import { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  message,
  Spin,
  Row,
  Col,
  Upload,
} from "antd";
import { User, Mail, Phone, Lock, Save, Camera } from "lucide-react";
import ImgCrop from "antd-img-crop";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";

const { Title, Text } = Typography;

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const { user, refreshUser } = useAuth();
  const [fileList, setFileList] = useState([]);

  const [hasInitialImage, setHasInitialImage] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get("/users/me");
      if (response.data.success) {
        form.setFieldsValue(response.data.user);
        // Set initial image if exists
        if (response.data.user.profile_image) {
          setHasInitialImage(true);
          const baseUrl = import.meta.env.VITE_API_URL.replace("/api", "");
          setFileList([
            {
              uid: "-1",
              name: "profile.png",
              status: "done",
              url: `${baseUrl}${response.data.user.profile_image}`,
            },
          ]);
        } else {
          setHasInitialImage(false);
        }
      }
    } catch (error) {
      console.error("Failed to load profile", error);
      message.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (values) => {
    setSaving(true);
    try {
      if (!user || !user._id) return message.error("User ID missing");

      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("phone", values.phone);

      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append("profile_image", fileList[0].originFileObj);
      } else if (fileList.length === 0 && hasInitialImage) {
        formData.append("remove_image", "true");
      }

      const response = await api.put(
        `/users/update-user-by-id/${user._id}`,
        formData,
        {
          headers: {
            "Content-Type": undefined,
          },
        },
      );

      if (response.data) {
        message.success("Profile updated successfully!");
        // Update local state to reflect change
        if (fileList.length > 0) {
          setHasInitialImage(true);
        } else if (formData.get("remove_image")) {
          setHasInitialImage(false);
        }
        if (refreshUser) refreshUser(response.data);
      }
    } catch (error) {
      console.error("Update failed", error);
      message.error(error.response?.data?.error || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (values) => {
    setPasswordSaving(true);
    try {
      if (!user || !user._id) return message.error("User ID missing");

      if (values.password !== values.confirmPassword) {
        return message.error("Passwords do not match");
      }

      const response = await api.put(`/users/update-user-by-id/${user._id}`, {
        password: values.password,
      });

      if (response.data) {
        message.success("Password changed successfully!");
        passwordForm.resetFields();
      }
    } catch (error) {
      console.error("Password update failed", error);
      message.error(error.response?.data?.error || "Failed to change password");
    } finally {
      setPasswordSaving(false);
    }
  };

  const onChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const onPreview = async (file) => {
    let src = file.url;
    if (!src) {
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
      });
    }
    const image = new Image();
    image.src = src;
    const imgWindow = window.open(src);
    imgWindow?.document.write(image.outerHTML);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6  mx-auto">
      <div className="mb-6">
        <Title level={2}>Seller Profile</Title>
        <Text type="secondary">
          Manage your account details and security settings
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* Profile Details Section */}
        <Col xs={24} lg={14}>
          <Card title="Profile Information" className="shadow-sm h-full">
            <div className="flex justify-center mb-6">
              <ImgCrop rotationSlider>
                <Upload
                  action={null} // Manual upload
                  listType="picture-card"
                  fileList={fileList}
                  onChange={onChange}
                  onPreview={onPreview}
                  beforeUpload={() => false} // Prevent auto upload
                  maxCount={1}
                >
                  {fileList.length < 1 && (
                    <div className="flex flex-col items-center">
                      <Camera size={20} className="text-gray-400 mb-2" />
                      <div className="text-xs text-gray-500">Upload</div>
                    </div>
                  )}
                </Upload>
              </ImgCrop>
            </div>
            {fileList.length > 0 && (
              <div className="flex justify-center -mt-4 mb-6">
                <Button
                  type="text"
                  danger
                  size="small"
                  onClick={() => setFileList([])}
                >
                  Remove Photo
                </Button>
              </div>
            )}

            <Form form={form} layout="vertical" onFinish={handleUpdateProfile}>
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true, message: "Please enter your name" }]}
              >
                <Input
                  prefix={<User size={18} className="text-gray-400" />}
                  placeholder="Your Name"
                  size="large"
                />
              </Form.Item>

              <Form.Item name="email" label="Email Address">
                <Input
                  prefix={<Mail size={18} className="text-gray-400" />}
                  disabled
                  className="bg-gray-50 text-gray-500"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Phone Number"
                rules={[
                  { required: true, message: "Please enter phone number" },
                  {
                    pattern: /^\d{10}$/,
                    message: "Phone number must be exactly 10 digits",
                  },
                ]}
              >
                <Input
                  prefix={<Phone size={18} className="text-gray-400" />}
                  placeholder="1234567890"
                  size="large"
                  maxLength={10} // Prevents typing more than 10 chars
                  onKeyPress={(event) => {
                    // Blocks any key that isn't a number
                    if (!/[0-9]/.test(event.key)) {
                      event.preventDefault();
                    }
                  }}
                />
              </Form.Item>

              <div className="flex justify-end pt-4">
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<Save size={18} />}
                  loading={saving}
                  size="large"
                >
                  Save Profile
                </Button>
              </div>
            </Form>
          </Card>
        </Col>

        {/* Password Change Section */}
        <Col xs={24} lg={10}>
          <Card title="Security" className="shadow-sm h-full">
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handleUpdatePassword}
            >
              <div className="bg-blue-50 p-4 rounded-md mb-6 border border-blue-100">
                <Text className="text-blue-800 text-sm">
                  Keep your account secure with a strong password.
                </Text>
              </div>

              <Form.Item
                name="password"
                label="New Password"
                rules={[
                  { required: true, message: "Please enter new password" },
                  { min: 6, message: "Password must be at least 6 characters" },
                ]}
              >
                <Input.Password
                  prefix={<Lock size={18} className="text-gray-400" />}
                  placeholder="New Password"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Confirm New Password"
                deps={["password"]}
                rules={[
                  { required: true, message: "Please confirm your password" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("The two passwords do not match!"),
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<Lock size={18} className="text-gray-400" />}
                  placeholder="Confirm Password"
                  size="large"
                />
              </Form.Item>

              <div className="flex justify-end pt-4">
                <Button
                  danger
                  htmlType="submit"
                  icon={<Lock size={18} />}
                  loading={passwordSaving}
                  size="large"
                  type="primary"
                  className="bg-red-500 hover:bg-red-600 border-red-500 text-white"
                >
                  Change Password
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;
