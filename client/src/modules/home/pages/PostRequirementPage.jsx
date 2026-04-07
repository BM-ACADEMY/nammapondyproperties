import React, { useState, useEffect } from "react";
import { Form, Input, Select, InputNumber, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import { postRequirement } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useNav } from "@/context/NavContext";
import {
  Timer,
  UserCheck,
  ListChecks,
  MapPin,
  Phone,
  Mail,
  User,
  MessageCircle,
  FileText,
  ChevronRight,
} from "lucide-react";

const { Option } = Select;
const { TextArea } = Input;

const PostRequirementPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [showOtherType, setShowOtherType] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { propertyTypes } = useNav();

  const usageType = Form.useWatch("usageType", form);

  // Filter property types based on usage type
  const filteredPropertyTypes = propertyTypes.filter(
    (type) => type.usageType === usageType
  );

  // Reset property type when usage type changes
  useEffect(() => {
    if (usageType) {
      form.setFieldsValue({ propertyType: undefined });
      setShowOtherType(false);
    }
  }, [usageType, form]);

  useEffect(() => {
    if (isAuthenticated && user) {
      form.setFieldsValue({
        fullName: user.name || "",
        email: user.email || "",
        phoneNumber: user.phone || "",
      });
    }
  }, [user, isAuthenticated, form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const finalPropertyType =
        values.propertyType === "Others"
          ? values.otherPropertyType
          : values.propertyType;

      const submissionData = {
        ...values,
        propertyType: finalPropertyType,
      };

      await postRequirement(submissionData);
      message.success(
        "Requirement posted successfully! Our team will contact you soon."
      );
      form.resetFields();
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      console.error("Error posting requirement:", error);
      message.error(
        error.response?.data?.message ||
          "Failed to post requirement. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyTypeChange = (value) => {
    setShowOtherType(value === "Others");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Section with Gradient */}
      <div className="bg-linear-to-r from-[#1e3a8a] to-[#06b6d4] pt-28 md:pt-36 lg:pt-48 pb-20 md:pb-28 lg:pb-32 px-4 text-center text-white">
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4">
          Let Us Know What You Need
        </h1>
        <p className="text-base md:text-lg lg:text-xl text-blue-50 opacity-90 max-w-2xl mx-auto">
          Just complete these simple steps. Get Instant quotes from Verified Suppliers
        </p>
      </div>

      {/* Main Form Container */}
      <div className="max-w-6xl mx-auto px-4 -mt-16">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col lg:flex-row">
          {/* Left Section: Form */}
          <div className="lg:w-2/3 p-6 md:p-10 border-r border-gray-100">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                Requirement Details
              </h2>
              <div className="h-1 w-20 bg-[#f15b22] mt-2 rounded-full" />
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              size="large"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8">
                <Form.Item
                  name="fullName"
                  label={<span className="font-semibold">Full Name</span>}
                  rules={[{ required: true, message: "Please enter name" }]}
                >
                  <Input placeholder="Enter your full name" />
                </Form.Item>

                <Form.Item
                  name="phoneNumber"
                  label={<span className="font-semibold">Mobile Number</span>}
                  rules={[{ required: true, message: "Required" }]}
                >
                  <Input placeholder="Phone number" />
                </Form.Item>

                <Form.Item
                  name="email"
                  label={<span className="font-semibold">Email Address</span>}
                  rules={[
                    { required: true, message: "Please enter your email" },
                    { type: "email", message: "Please enter a valid email address" },
                  ]}
                >
                  <Input placeholder="Enter your email address" />
                </Form.Item>

                <Form.Item
                  name="category"
                  label={<span className="font-semibold">Category</span>}
                  rules={[{ required: true, message: "Field required" }]}
                >
                  <Select placeholder="Looking to Rent or Sell/Buy?">
                    <Option value="Rent">Rent</Option>
                    <Option value="Sell/Buy">Sell/Buy</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="usageType"
                  label={<span className="font-semibold">Usage Type</span>}
                  rules={[{ required: true, message: "Field required" }]}
                >
                  <Select placeholder="Residential or Commercial?">
                    <Option value="Residential">Residential</Option>
                    <Option value="Commercial">Commercial</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="propertyType"
                  label={<span className="font-semibold">Property Type</span>}
                  rules={[{ required: true, message: "Field required" }]}
                >
                  <Select
                    placeholder="Select type"
                    onChange={handlePropertyTypeChange}
                    disabled={!usageType}
                  >
                    {filteredPropertyTypes.map((type) => (
                      <Option key={type._id} value={type.name}>
                        {type.name}
                      </Option>
                    ))}
                    <Option value="Others">Others</Option>
                  </Select>
                </Form.Item>

                {showOtherType && (
                  <Form.Item
                    name="otherPropertyType"
                    label={<span className="font-semibold">Specify Type</span>}
                    rules={[{ required: true }]}
                  >
                    <Input placeholder="Enter property type" />
                  </Form.Item>
                )}

                <Form.Item
                  name="preferredLocation"
                  label={<span className="font-semibold">Preferred Location</span>}
                  className="lg:col-span-2"
                  rules={[{ required: true, message: "Please enter your preferred location" }]}
                >
                  <Input placeholder="e.g. Heritage Town, Pondicherry" />
                </Form.Item>

                <Form.Item
                  label={<span className="font-semibold">Approx. Budget Range</span>}
                  className="lg:col-span-2"
                >
                  <div className="flex gap-4">
                    <Form.Item 
                      name="minBudget" 
                      style={{ flex: 1, margin: 0 }}
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        placeholder="Min Budget"
                      />
                    </Form.Item>
                    <Form.Item 
                      name="maxBudget" 
                      style={{ flex: 1, margin: 0 }}
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        placeholder="Max Budget"
                      />
                    </Form.Item>
                  </div>
                </Form.Item>
              </div>

              <div className="mt-8 pt-6 flex flex-col items-center justify-center border-t border-gray-100">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="w-full md:w-auto px-16 h-14 bg-[#f15b22]! hover:bg-[#d84315]! border-none text-lg font-bold rounded-xl shadow-lg shadow-orange-500/20"
                >
                  Submit Requirement
                </Button>
                <p className="text-xs text-slate-400 mt-4">
                  By clicking Submit Requirement, I accept the <span className="underline cursor-pointer">T&C</span> and <span className="underline cursor-pointer">Privacy Policy</span>
                </p>
              </div>
            </Form>
          </div>

          {/* Right Section: Advantages */}
          <div className="lg:w-1/3 p-6 md:p-10 bg-gray-50/50 flex flex-col gap-10">
            <div>
              <h2 className="text-xl font-bold text-slate-800 border-b-2 border-[#f15b22] w-fit pb-2 mb-8">
                Buyers Advantages?
              </h2>

              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-white shadow-md shrink-0 flex items-center justify-center text-[#1e3a8a]">
                    <Timer size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Immediate Matches</h3>
                    <p className="text-sm text-slate-500 mt-1">Get contacted by property owners and verified agents instantly.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-white shadow-md shrink-0 flex items-center justify-center text-[#1e3a8a]">
                    <UserCheck size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Verified Listings</h3>
                    <p className="text-sm text-slate-500 mt-1">High-quality, verified properties tailored to your specific needs.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-white shadow-md shrink-0 flex items-center justify-center text-[#1e3a8a]">
                    <ListChecks size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Curated Choices</h3>
                    <p className="text-sm text-slate-500 mt-1">Get the power to choose from the best handpicked properties.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h4 className="font-bold text-[#166aa8] mb-2 uppercase text-xs tracking-wider">Need Quick Help?</h4>
              <p className="text-sm text-slate-600 mb-4 font-medium">Talk to our support team for any custom requirements.</p>
              <Button 
                onClick={() => navigate('/contact')}
                className="w-full h-11 border-[#166aa8] text-[#166aa8] hover:bg-blue-50 font-bold rounded-lg flex items-center justify-center gap-2"
              >
                Contact Us <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostRequirementPage;
