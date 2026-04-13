import React, { useState, useEffect } from "react";
import { Form, Input, Select, InputNumber, Button, message, Checkbox } from "antd";
import { postRequirement } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useNav } from "@/context/NavContext";
import { MapPin, Phone, User, MessageCircle, FileText } from "lucide-react";

const { Option } = Select;
const { TextArea } = Input;

const PostRequirementForm = ({ onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [showOtherType, setShowOtherType] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { propertyTypes } = useNav();

  const usageType = Form.useWatch("usageType", form);

  // Filter property types based on usage type
  const filteredPropertyTypes = propertyTypes.filter(type => type.usageType === usageType);

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
        phoneNumber: user.phone || ""
      });
    }
  }, [user, isAuthenticated, form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Handle "Others" property type
      const finalPropertyType = values.propertyType === "Others" ? values.otherPropertyType : values.propertyType;
      
      const submissionData = {
        ...values,
        propertyType: finalPropertyType
      };

      await postRequirement(submissionData);
      message.success("Requirement posted successfully! Our team will contact you soon.");
      form.resetFields();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error posting requirement:", error);
      message.error(error.response?.data?.message || "Failed to post requirement. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyTypeChange = (value) => {
    setShowOtherType(value === "Others");
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      className="requirement-form py-2"
      requiredMark="optional"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        {/* Full Name */}
        <Form.Item
          name="fullName"
          label="Full Name"
          rules={[{ required: true, message: "Please enter your full name" }]}
        >
          <Input prefix={<User size={16} className="text-gray-400" />} placeholder="John Doe" />
        </Form.Item>

        {/* Phone Number */}
        <Form.Item
          name="phoneNumber"
          label="Phone Number"
          rules={[
            { required: true, message: "Please enter your phone number" },
            { pattern: /^[0-9]{10}$/, message: "Please enter a valid 10-digit phone number" }
          ]}
        >
          <Input prefix={<Phone size={16} className="text-gray-400" />} placeholder="9876543210" />
        </Form.Item>



        {/* Category */}
        <Form.Item
          name="category"
          label="Category"
          rules={[{ required: true, message: "Please select a category" }]}
        >
          <Select placeholder="Looking to Rent or Sell/Buy?">
            <Option value="Rent">Rent</Option>
            <Option value="Sell/Buy">Sell/Buy</Option>
          </Select>
        </Form.Item>

        {/* Usage Type */}
        <Form.Item
          name="usageType"
          label="Usage Type"
          rules={[{ required: true, message: "Please select usage type" }]}
        >
          <Select 
            placeholder="Residential or Commercial?"
          >
            <Option value="Residential">Residential</Option>
            <Option value="Commercial">Commercial</Option>
          </Select>
        </Form.Item>

        {/* Property Type */}
        <Form.Item
          name="propertyType"
          label="Property Type"
          rules={[{ required: true, message: "Please select property type" }]}
        >
          <Select 
            placeholder="Select type" 
            onChange={handlePropertyTypeChange}
            disabled={!usageType}
          >
            {filteredPropertyTypes.map((type) => (
              <Option key={type._id} value={type.name}>{type.name}</Option>
            ))}
            <Option value="Others">Others</Option>
          </Select>
        </Form.Item>

        {/* Other Property Type Input */}
        {showOtherType && (
          <Form.Item
            name="otherPropertyType"
            label="Specify Other Property Type"
            rules={[{ required: true, message: "Please specify the property type" }]}
            className="md:col-span-2"
          >
            <Input prefix={<FileText size={16} className="text-gray-400" />} placeholder="Enter property type" />
          </Form.Item>
        )}

        {/* Preferred Location */}
        <Form.Item
          name="preferredLocation"
          label="Preferred Location"
          className="md:col-span-2"
        >
          <Input prefix={<MapPin size={16} className="text-gray-400" />} placeholder="e.g. Whitefield, Bangalore" />
        </Form.Item>

        {/* Budget Range */}
        <Form.Item label="Budget Range (Approx.)" className="mb-0 md:col-span-2">
          <div className="flex gap-4">
            <Form.Item name="minBudget" className="flex-1">
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Min Budget"
                formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(value) => value.replace(/\₹\s?|(,*)/g, "")}
              />
            </Form.Item>
            <Form.Item name="maxBudget" className="flex-1">
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Max Budget"
                formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(value) => value.replace(/\₹\s?|(,*)/g, "")}
              />
            </Form.Item>
          </div>
        </Form.Item>

        {/* Property Preferences */}
        <Form.Item
          name="propertyPreferences"
          label="Property Preferences"
          className="md:col-span-2"
        >
          <TextArea rows={2} placeholder="e.g. 3 BHK, Semi-furnished, Gated Community, Near Metro station..." />
        </Form.Item>

        {/* Message Box */}
        <Form.Item
          name="message"
          label="Message Box"
          className="md:col-span-2"
        >
          <TextArea rows={3} placeholder="Any additional details or specific requirements..." />
        </Form.Item>
      </div>

      <div className="flex justify-end gap-3 mt-4 border-t pt-6">
        {onCancel && (
          <Button onClick={onCancel} className="h-11 px-6 px-[20px] rounded-lg">
            Cancel
          </Button>
        )}
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          className="h-11 px-8 px-[30px] rounded-lg bg-[#166aa8] hover:bg-[#0078d7] border-none shadow-md font-semibold"
        >
          Submit Requirement
        </Button>
      </div>
    </Form>
  );
};

export default PostRequirementForm;
