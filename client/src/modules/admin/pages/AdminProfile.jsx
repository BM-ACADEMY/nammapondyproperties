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
import Loader from "../../../components/Common/Loader";
import { getImageUrl } from "@/utils/imageUrl";

const { Title, Text } = Typography;
import { Hash, UserPlus } from "lucide-react"; // Import hash for UserID and UserPlus for Referral

const AdminProfile = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const { user, refreshUser } = useAuth();
  const [fileList, setFileList] = useState([]);

  const [hasInitialImage, setHasInitialImage] = useState(false);
  const [imageSize, setImageSize] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await api.get("/users/me");
        if (response.data.success) {
          form.setFieldsValue(response.data.user);
          // Set initial image if exists
          if (response.data.user.profile_image) {
            setHasInitialImage(true);
            setFileList([
              {
                uid: "-1",
                name: "profile.png",
                status: "done",
                url: getImageUrl(response.data.user.profile_image),
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
    fetchProfile();
  }, [form]);

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
        // User had an image but now fileList is empty implies removal
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

  const onChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    if (newFileList.length > 0 && newFileList[0].originFileObj) {
      const file = newFileList[0].originFileObj;
      const size = file.size / 1024 / 1024; // in MB
      if (size < 1) {
        setImageSize(`${(file.size / 1024).toFixed(2)} KB`);
      } else {
        setImageSize(`${size.toFixed(2)} MB`);
      }
    } else {
      setImageSize(null);
    }
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
    return <Loader />;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={2}>Account Settings</Title>
        <Text type="secondary">
          Manage your profile details and security settings
        </Text>
      </div>

      <Row gutter={[24, 24]} justify="start">
        {/* Profile Details Section */}
        <Col xs={24} md={18} lg={12}>
          <Card title="Profile Information" className="shadow-sm h-full">
            <div className="flex justify-center mb-6">
              <ImgCrop rotationSlider>
                <Upload
                  action={null} // Manual upload
                  listType="picture-card"
                  fileList={fileList}
                  onChange={onChange}
                  onPreview={onPreview}
                  beforeUpload={(file) => {
                    const isJpgOrPngOrSvg =
                      file.type === "image/jpeg" ||
                      file.type === "image/png" ||
                      file.type === "image/svg+xml";
                    if (!isJpgOrPngOrSvg) {
                      message.error("You can only upload JPG/PNG/SVG file!");
                      return Upload.LIST_IGNORE;
                    }
                    return false; // Prevent auto upload
                  }}
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
              {imageSize && (
                <div className="text-xs text-gray-500 mt-2">{imageSize}</div>
              )}
            </div>
            {fileList.length > 0 && (
              <div className="flex justify-center -mt-4 mb-6">
                <Button
                  type="text"
                  danger
                  size="small"
                  onClick={() => {
                    setFileList([]);
                    // If saving immediately is desired:
                    // handleUpdateProfile({ ...form.getFieldsValue(), remove_image: true });
                    // But typically user clicks Save.
                    // We need to store "isRemoved" state or check fileList on save.
                  }}
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
                  placeholder="Phone Number"
                  size="large"
                  maxLength={10}
                  onKeyPress={(event) => {
                    if (!/[0-9]/.test(event.key)) {
                      event.preventDefault();
                    }
                  }}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="userId" label="User ID">
                    <Input
                      prefix={<Hash size={18} className="text-gray-400" />}
                      disabled
                      className="bg-gray-50 text-gray-500 font-mono"
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="referralCode" label="Referral ID">
                    <Input
                      prefix={<UserPlus size={18} className="text-gray-400" />}
                      disabled
                      className="bg-gray-50 text-gray-500 font-mono"
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>

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
      </Row>
    </div>
  );
};

export default AdminProfile;
