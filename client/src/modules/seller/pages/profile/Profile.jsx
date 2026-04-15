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
import { User, Mail, Phone, Lock, Save, Camera, ShieldCheck, Clock, CheckCircle, XCircle, Hash, Share2, CreditCard, IndianRupee, Edit3, X } from "lucide-react";
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
  const [isEditing, setIsEditing] = useState(false);
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
            setHasInitialImage(true);
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
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Update failed", error);
      message.error(error.response?.data?.error || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    form.setFieldsValue(user);
    if (user?.profile_image) {
      setFileList([
        {
          uid: "-1",
          name: "profile.png",
          status: "done",
          url: getImageUrl(user.profile_image),
        },
      ]);
      setHasInitialImage(true);
    } else {
      setFileList([]);
      setHasInitialImage(false);
    }
    setImageSize(null);
    setIsEditing(false);
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
    <div className="max-w-4xl mx-auto p-4 md:p-8 bg-[#fcfcfd] min-h-screen font-sans">
      {/* Header Section */}
      <div className="mb-10">
        <Title level={1} className="!text-3xl !mb-2 !font-semibold text-slate-800">Seller Profile</Title>
        <Text className="text-slate-500 text-base">
          Manage your account details and security settings
        </Text>
        {activeSub && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-slate-600 font-medium">Current Plan:</span>
            <Tag color="#fef3c7" className="!text-amber-700 !border-amber-200 !rounded-md px-3 py-0.5 font-bold text-xs uppercase tracking-wider">
              {activeSub.plan?.name || "Free"}
            </Tag>
          </div>
        )}
      </div>

      <div className="space-y-8">
        {/* Profile Information Section */}
        <Card 
          title={<span className="text-lg font-semibold text-slate-800 pt-2 block">Profile Information</span>}
          className="shadow-sm border-slate-200 rounded-2xl overflow-hidden"
          styles={{ 
            header: { borderBottom: 'none', padding: '24px 32px 0' },
            body: { padding: '32px' } 
          }}
        >
          <Form form={form} layout="vertical" onFinish={handleUpdateProfile} className="space-y-6">
            {/* Upload Section Centered */}
            <div className="flex flex-col items-center justify-center mb-8">
              <div className="flex flex-col items-center gap-3">
                <div className="relative group">
                  <ImgCrop rotationSlider aspect={1/1} showGrid>
                    <Upload
                      action={null}
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
                        return false;
                      }}
                      maxCount={1}
                      disabled={!isEditing}
                      className="profile-uploader"
                    >
                      {fileList.length < 1 && (
                        <div className="flex flex-col items-center justify-center h-full w-full">
                          <div className="bg-blue-600 p-3 rounded-full mb-3 shadow-md shadow-blue-200">
                            <User size={24} className="text-white" />
                          </div>
                          <div className="text-sm text-slate-600 font-medium">Upload profile photo</div>
                        </div>
                      )}
                    </Upload>
                  </ImgCrop>
                </div>
                
                {isEditing && fileList.length > 0 && (
                  <Button
                    type="text"
                    danger
                    size="small"
                    className="hover:!bg-transparent text-xs font-medium"
                    onClick={() => setFileList([])}
                  >
                    Remove Photo
                  </Button>
                )}
              </div>
            </div>

            {/* Inputs Section */}
            <div className="space-y-5">
              <Form.Item
                name="name"
                label={<span className="text-slate-600 font-medium">Full Name</span>}
                rules={[{ required: true, message: "Please enter your name" }]}
                required={false}
                className="!mb-0"
              >
                <Input
                  disabled={!isEditing}
                  prefix={<User size={18} className="text-slate-400 mr-2" />}
                  className={`h-12 rounded-xl border-slate-200 ${!isEditing ? "bg-slate-50 text-slate-500 cursor-not-allowed" : "hover:border-blue-400 focus:border-blue-500"} shadow-sm`}
                />
              </Form.Item>

              <Row gutter={20}>
                <Col span={12}>
                  <Form.Item name="userId" label={<span className="text-slate-600 font-medium">User ID</span>} className="!mb-0">
                    <Input
                      prefix={<Hash size={18} className="text-slate-400 mr-2" />}
                      disabled
                      className="h-12 rounded-xl border-slate-200 bg-slate-50 text-slate-500 font-medium cursor-not-allowed"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="referralCode" label={<span className="text-slate-600 font-medium">Referral ID</span>} className="!mb-0">
                    <Input
                      prefix={<Share2 size={18} className="text-slate-400 mr-2" />}
                      disabled
                      className="h-12 rounded-xl border-slate-200 bg-slate-50 text-slate-500 font-medium cursor-not-allowed"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="phone"
                label={<span className="text-slate-600 font-medium">Phone Number</span>}
                rules={[
                  { required: true, message: "Please enter phone number" },
                  { pattern: /^\d{10}$/, message: "Must be 10 digits" },
                ]}
                required={false}
                className="!mb-0"
              >
                <Input
                  disabled={!isEditing}
                  prefix={<Phone size={18} className="text-slate-400 mr-2" />}
                  placeholder="8270652229"
                  className={`h-12 rounded-xl border-slate-200 ${!isEditing ? "bg-slate-50 text-slate-500 cursor-not-allowed" : "hover:border-blue-400 focus:border-blue-500"} shadow-sm`}
                  maxLength={10}
                  onKeyPress={(e) => !/[0-9]/.test(e.key) && e.preventDefault()}
                />
              </Form.Item>
            </div>

            {/* Verification & Save Row */}
            <div className="pt-6">
              <div className="flex justify-between items-center gap-4">
                <div className="flex-1">
                  {user?.badgeVerified ? (
                    <div className="inline-flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-xl border border-green-100 font-semibold shadow-sm">
                      <CheckCircle size={18} />
                      <span>Verified Badge Active</span>
                    </div>
                  ) : user?.badgeRequestStatus === "pending" ? (
                    <div className="inline-flex items-center gap-2 text-amber-700 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100 font-semibold shadow-sm">
                      <Clock size={18} />
                      <span>Verification Pending</span>
                    </div>
                  ) : user?.badgeRequestStatus === "rejected" ? (
                    <div className="inline-flex items-center gap-2 text-red-700 bg-red-50 px-4 py-2 rounded-xl border border-red-100 font-semibold shadow-sm">
                      <XCircle size={18} />
                      <span>Verification Rejected</span>
                    </div>
                  ) : (
                    <Button
                      icon={<ShieldCheck size={20} className="mr-2" />}
                      className="h-12 px-6 rounded-xl bg-white text-slate-700 border-slate-200 hover:border-blue-500 hover:text-blue-600 font-semibold shadow-sm flex items-center transition-all"
                      onClick={async () => {
                        try {
                          const res = await api.post("/users/request-badge");
                          message.success(res.data.message);
                          refetchUser();
                        } catch (err) {
                          message.error(err.response?.data?.error || "Failed to send request");
                        }
                      }}
                    >
                      Request Verification Badge
                    </Button>
                  )}
                </div>

                <div className="flex gap-3">
                  {!isEditing ? (
                    <Button
                      type="default"
                      icon={<Edit3 size={20} className="mr-2" />}
                      className="h-12 px-8 rounded-xl border-blue-200 text-blue-600 hover:!border-blue-400 hover:!text-blue-700 font-bold text-base bg-white transition-all shadow-sm"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsEditing(true);
                      }}
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button
                        type="default"
                        icon={<X size={20} className="mr-2" />}
                        className="h-12 px-6 rounded-xl border-slate-200 text-slate-600 hover:!border-slate-300 hover:!text-slate-700 font-semibold text-base transition-all"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="primary"
                        htmlType="submit"
                        icon={<Save size={20} className="mr-2" />}
                        loading={saving}
                        className="h-12 px-8 rounded-xl bg-blue-600 hover:!bg-blue-700 border-none font-bold text-base shadow-lg shadow-blue-200/50 flex items-center transition-all"
                      >
                        Save Profile
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="text-center mt-6">
                <span className="text-slate-400 text-sm font-medium">* indicates required field</span>
              </div>
            </div>
          </Form>
        </Card>

        {/* Subscription Status Section */}
        <Card 
          title={
            <div className="pt-2">
              <span className="text-lg font-semibold text-slate-800">Subscription Status</span>
            </div>
          }
          className="shadow-sm border-slate-200 rounded-2xl overflow-hidden"
          styles={{ 
            header: { borderBottom: 'none', padding: '24px 32px 0' },
            body: { padding: '32px' } 
          }}
        >
          <div className="bg-[#f5f8ff] p-8 rounded-[2rem] border border-blue-50 relative mb-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Title level={3} className="!text-2xl !font-semibold !text-[#1a2b56] !mb-0">
                  {activeSub?.plan?.name || "Premium"}
                </Title>
                <Text className="text-blue-600 text-base font-semibold block">
                  {activeSub?.plan?.propertyLimit === -1 ? "Unlimited" : activeSub?.plan?.propertyLimit || "Unlimited"} Properties Upload Limit
                </Text>
                {activeSub?.endDate && (
                  <Text className="flex items-center gap-3 text-slate-500 text-sm pt-2 font-medium">
                    <Clock size={16} />
                    <span>Expires on {moment(activeSub.endDate).format("DD MMM YYYY")}</span>
                  </Text>
                )}
              </div>
              <div className="bg-green-50 text-green-600 border border-green-100 rounded-lg px-3 py-1 font-bold text-xs tracking-widest uppercase">
                ACTIVE
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <Button 
              type="primary" 
              icon={<CreditCard size={20} className="mr-2" />}
              className="h-12 px-10 rounded-xl bg-blue-600 hover:!bg-blue-700 border-none font-bold text-base shadow-lg shadow-blue-200/50 flex items-center transition-all"
              onClick={() => navigate("/seller/upgrade-plan")}
            >
              Upgrade Plan
            </Button>
          </div>
        </Card>
      </div>

      <style>{`
        /* Target the specific upload box inside the profile-uploader wrapper */
        .profile-uploader.ant-upload-wrapper.ant-upload-picture-card-wrapper .ant-upload.ant-upload-select {
          width: 280px !important;
          height: 160px !important;
          border-radius: 24px !important;
          border: 1px solid #e2e8f0 !important;
          background: #f8fbff !important;
          margin: 0 !important;
          overflow: hidden !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .profile-uploader.ant-upload-wrapper.ant-upload-picture-card-wrapper .ant-upload.ant-upload-select:hover {
          border-color: #3b82f6 !important;
          background: #f0f7ff !important;
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.1), 0 4px 6px -2px rgba(59, 130, 246, 0.05) !important;
        }

        .profile-uploader.ant-upload-wrapper.ant-upload-picture-card-wrapper .ant-upload.ant-upload-select:hover .rounded-full {
          transform: scale(1.05);
          transition: transform 0.3s ease;
        }

        /* Target the uploaded image container to match the new dimensions */
        .profile-uploader.ant-upload-wrapper.ant-upload-picture-card-wrapper .ant-upload-list-item-container,
        .profile-uploader.ant-upload-wrapper.ant-upload-picture-card-wrapper .ant-upload-list-item {
          width: 280px !important;
          height: 160px !important;
          border-radius: 24px !important;
        }

        .profile-uploader.ant-upload-wrapper .ant-upload-list-item-done {
           border: 1px solid #e2e8f0 !important;
        }

        .ant-form-item-label label {
          font-size: 14px !important;
        }
      `}</style>
    </div>
  );
};

export default Profile;

