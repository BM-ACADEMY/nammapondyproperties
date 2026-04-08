import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Select,
} from "antd";
import { User, Mail, Phone, Lock, Save, Camera, ShieldCheck, Clock, CheckCircle, XCircle, Hash, Share2, CreditCard, IndianRupee } from "lucide-react";
import { Table, Tag } from "antd";
import moment from "moment";
import ImgCrop from "antd-img-crop";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import Loader from "../../../../components/Common/Loader";
import { getImageUrl } from "@/utils/imageUrl";

const { Title, Text } = Typography;

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { user, refreshUser, refetchUser } = useAuth();
  const [fileList, setFileList] = useState([]);
  const [activeSub, setActiveSub] = useState(null);

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
    const fetchSubscriptionData = async () => {
      try {
        const subRes = await api.get("/subscriptions/my-subscription");
        setActiveSub(subRes.data);
      } catch (error) {
        console.error("Failed to fetch subscription data", error);
      }
    };

    fetchProfile();
    fetchSubscriptionData();
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
    <div className="p-6  mx-auto">
      <div className="mb-6">
        <Title level={2}>Seller Profile</Title>
        <Text type="secondary">
          Manage your account details and security settings
        </Text>
        {activeSub && (
          <div className="mt-4 flex items-center gap-2">
            <Text className="text-gray-500">Current Plan:</Text>
            <Tag color={activeSub.plan?.name === "Premium" ? "gold" : activeSub.plan?.name === "Standard" ? "blue" : "default"} className="rounded-full px-4 font-bold uppercase tracking-wider">
              {activeSub.plan?.name || "Free"}
            </Tag>
          </div>
        )}
      </div>

      <Row gutter={[24, 24]} justify="start">
        {/* Profile Details Section */}
        <Col xs={24} md={18} lg={12}>
          <Card 
            title="Profile Information" 
            className="shadow-xl shadow-slate-100/50 border-gray-100 rounded-3xl h-full overflow-hidden"
            headStyle={{ 
              borderBottom: '1px solid #f8fafc',
              padding: '24px',
              fontSize: '18px',
              fontWeight: '500' 
            }}
            bodyStyle={{ padding: '32px' }}
          >
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Form.Item name="userId" label="User ID">
                  <Input
                    prefix={<Hash size={18} className="text-gray-400" />}
                    readOnly
                    className="bg-slate-50 border-gray-100 text-gray-500 font-mono cursor-default"
                    size="large"
                  />
                </Form.Item>

                <Form.Item name="referralCode" label="Referral ID">
                  <Input
                    prefix={<Share2 size={18} className="text-gray-400" />}
                    readOnly
                    className="bg-slate-50 border-gray-100 text-gray-500 font-mono cursor-default"
                    size="large"
                  />
                </Form.Item>
              </div>

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
                  maxLength={10} 
                  onKeyPress={(event) => {
                    if (!/[0-9]/.test(event.key)) {
                      event.preventDefault();
                    }
                  }}
                />
              </Form.Item>



              <div className="flex justify-between items-center pt-8 border-t border-gray-200 mt-4">
                <div className="flex flex-col">
                  {user?.badgeVerified ? (
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                      <CheckCircle size={18} />
                      <span className="font-semibold">Verified Badge Active</span>
                    </div>
                  ) : user?.badgeRequestStatus === "pending" ? (
                    <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
                      <Clock size={18} />
                      <span className="font-semibold">Verification Pending</span>
                    </div>
                  ) : user?.badgeRequestStatus === "rejected" ? (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1.5 rounded-full border border-red-100">
                      <XCircle size={18} />
                      <span className="font-semibold">Verification Rejected</span>
                    </div>
                  ) : (
                    <Button
                      icon={<ShieldCheck size={18} />}
                      className="bg-sky-50 text-sky-600 border-sky-200 hover:bg-sky-100"
                      onClick={async () => {
                        try {
                          const res = await api.post("/users/request-badge");
                          message.success(res.data.message);
                          refetchUser(); // Refresh to show pending status
                        } catch (err) {
                          message.error(err.response?.data?.error || "Failed to send request");
                        }
                      }}
                    >
                      Request Verification Badge
                    </Button>
                  )}
                </div>

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

        {/* Subscription Section */}
        <Col xs={24} md={24} lg={12}>
          <div className="space-y-6">
            <Card
              title={
                <div className="flex items-center gap-2">
                  <CreditCard className="text-blue-600" size={20} />
                  <span>Subscription Status</span>
                </div>
              }
              className="shadow-xl shadow-slate-100/50 border-gray-100 rounded-3xl overflow-hidden"
              headStyle={{ padding: '24px', fontSize: '18px', fontWeight: '500' }}
              bodyStyle={{ padding: '24px' }}
            >
              <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-blue-900 mb-1">
                      {activeSub?.plan?.name || "Free Plan"}
                    </h3>
                    <p className="text-blue-600 text-sm font-medium">
                      {activeSub?.plan?.propertyLimit === -1 ? "Unlimited" : activeSub?.plan?.propertyLimit || 3} Properties Upload Limit
                    </p>
                  </div>
                  <Tag color="green" className="rounded-full px-3 py-0.5 border-none font-bold uppercase text-[10px] tracking-widest">
                    ACTIVE
                  </Tag>
                </div>
                {activeSub?.endDate && (
                   <div className="flex items-center gap-2 text-gray-500 text-sm italic">
                    <Clock size={14} />
                    Expires on {moment(activeSub.endDate).format("DD MMM YYYY")}
                   </div>
                )}
              </div>
              
              <Button 
                 type="primary" 
                 ghost 
                 block 
                 className="rounded-xl h-12 border-blue-200 text-blue-600 hover:bg-blue-50 font-semibold"
                 onClick={() => navigate("/seller/upgrade-plan")}
              >
                Upgrade or Renew Plan
              </Button>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;
