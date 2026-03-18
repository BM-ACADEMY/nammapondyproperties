import { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  message,
  Upload,
} from "antd";
import { User, Mail, Phone, Save, Camera, ShieldCheck, Clock, CheckCircle, XCircle, Edit2 } from "lucide-react";
import ImgCrop from "antd-img-crop";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import Loader from "../../../../components/Common/Loader";
import { getImageUrl } from "@/utils/imageUrl";

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();
  const { user, refreshUser } = useAuth();
  const [fileList, setFileList] = useState([]);
  const [hasInitialImage, setHasInitialImage] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await api.get("/users/me");
        if (response.data.success) {
          form.setFieldsValue(response.data.user);
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
        formData.append("remove_image", "true");
      }

      const response = await api.put(
        `/users/update-user-by-id/${user._id}`,
        formData,
        {
          headers: { "Content-Type": undefined },
        },
      );

      if (response.data) {
        message.success("Profile updated successfully!");
        if (fileList.length > 0) {
          setHasInitialImage(true);
        } else if (formData.get("remove_image")) {
          setHasInitialImage(false);
        }
        if (refreshUser) refreshUser(response.data);
        setEditing(false);
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

  const userName = user?.name || "";

  // Determine avatar URL: prefer existing server image URL from fileList,
  // then a blob preview if user just picked a new file
  const avatarUrl =
    fileList.length > 0
      ? fileList[0].url ||
        (fileList[0].originFileObj
          ? URL.createObjectURL(fileList[0].originFileObj)
          : null)
      : null;

  return (
    <div className="p-6 mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Seller Profile</h2>
        <p className="text-gray-500 text-sm">
          Manage your account details and security settings
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left: Profile Information Card */}
        <div className="flex-1 min-w-0 w-full">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Card Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <span className="text-base font-semibold text-gray-800">
                Profile Information
              </span>
              <button
                type="button"
                onClick={() => setEditing((prev) => !prev)}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors"
              >
                <Edit2 size={14} />
                <span>{editing ? "Cancel" : "Edit"}</span>
              </button>
            </div>

            {/* Card Body */}
            <div className="px-6 pt-6 pb-4">
              {/* Photo Upload */}
              <div className="flex justify-center mb-6">
                <ImgCrop rotationSlider>
                  <Upload
                    action={null}
                    listType="picture-card"
                    fileList={fileList}
                    onChange={onChange}
                    onPreview={onPreview}
                    disabled={!editing}
                    beforeUpload={(file) => {
                      const isValid =
                        file.type === "image/jpeg" ||
                        file.type === "image/png" ||
                        file.type === "image/svg+xml";
                      if (!isValid) {
                        message.error("You can only upload JPG/PNG/SVG file!");
                        return Upload.LIST_IGNORE;
                      }
                      return false;
                    }}
                    maxCount={1}
                    style={{ opacity: editing ? 1 : 0.85 }}
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

              {editing && fileList.length > 0 && (
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
                {/* Full Name */}
                <Form.Item
                  name="name"
                  label={
                    <span className="text-sm font-medium text-gray-700">
                      Full Name <span className="text-red-500">*</span>
                    </span>
                  }
                  rules={[{ required: true, message: "Please enter your name" }]}
                >
                  <Input
                    prefix={<User size={16} className="text-gray-400" />}
                    placeholder="Your Name"
                    size="large"
                    disabled={!editing}
                    className="rounded-lg"
                  />
                </Form.Item>

                {/* Email */}
                <Form.Item
                  name="email"
                  label={
                    <span className="text-sm font-medium text-gray-700">
                      Email Address
                    </span>
                  }
                >
                  <Input
                    prefix={<Mail size={16} className="text-gray-400" />}
                    disabled
                    size="large"
                    className="bg-gray-50 text-gray-500 rounded-lg"
                  />
                </Form.Item>

                {/* Phone */}
                <Form.Item
                  name="phone"
                  label={
                    <span className="text-sm font-medium text-gray-700">
                      Phone Number <span className="text-red-500">*</span>
                    </span>
                  }
                  rules={[
                    { required: true, message: "Please enter phone number" },
                    {
                      pattern: /^\d{10}$/,
                      message: "Phone number must be exactly 10 digits",
                    },
                  ]}
                >
                  <Input
                    prefix={<Phone size={16} className="text-gray-400" />}
                    placeholder="1234567890"
                    size="large"
                    disabled={!editing}
                    maxLength={10}
                    className="rounded-lg"
                    onKeyPress={(event) => {
                      if (!/[0-9]/.test(event.key)) {
                        event.preventDefault();
                      }
                    }}
                  />
                </Form.Item>

                {/* Footer: Badge + Save */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-2">
                  <div>
                    {user?.badgeVerified ? (
                      <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200 text-sm font-medium">
                        <CheckCircle size={16} />
                        <span>Verified Badge Active</span>
                      </div>
                    ) : user?.badgeRequestStatus === "pending" ? (
                      <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 text-sm font-medium">
                        <Clock size={16} />
                        <span>Verification Pending</span>
                      </div>
                    ) : user?.badgeRequestStatus === "rejected" ? (
                      <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1.5 rounded-full border border-red-200 text-sm font-medium">
                        <XCircle size={16} />
                        <span>Verification Rejected</span>
                      </div>
                    ) : (
                      <Button
                        icon={<ShieldCheck size={16} />}
                        className="bg-sky-50 text-sky-600 border-sky-200 hover:bg-sky-100 text-sm"
                        onClick={async () => {
                          try {
                            const res = await api.post("/users/request-badge");
                            message.success(res.data.message);
                            refreshUser();
                          } catch (err) {
                            message.error(
                              err.response?.data?.error ||
                                "Failed to send request",
                            );
                          }
                        }}
                      >
                        Request Verification Badge
                      </Button>
                    )}
                  </div>

                  {editing && (
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<Save size={16} />}
                      loading={saving}
                      size="large"
                      style={{
                        backgroundColor: "#1d4ed8",
                        borderColor: "#1d4ed8",
                      }}
                    >
                      Save Profile
                    </Button>
                  )}
                </div>
              </Form>
            </div>
          </div>
        </div>

        {/* Right: Profile Summary Card */}
        <div className="w-full lg:w-56 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col items-center gap-3">
            {/* Avatar */}
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 shadow"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl font-bold shadow">
                  {userName.charAt(0).toUpperCase() || "U"}
                </div>
              )}
            </div>

            {/* Name & Badge */}
            <div className="text-center">
              <p className="text-base font-semibold text-gray-900 leading-tight">
                {userName || "User"}
              </p>
              {user?.badgeVerified && (
                <div className="flex items-center justify-center gap-1 mt-1 text-blue-600 text-xs font-medium">
                  <CheckCircle size={13} />
                  <span>VERIFIED ACCOUNT</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
