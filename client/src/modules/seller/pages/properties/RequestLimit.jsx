import React, { useState, useEffect } from "react";
import { Form, Input, Button, Checkbox, message, Typography } from "antd";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph } = Typography;

const RequestLimit = () => {
  const { user, refetchUser } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    refetchUser();
  }, [refetchUser]);

  const handleRequestSubmit = async (values) => {
    if (!values.agreed) {
      message.error("Please agree to be contacted.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/seller-requests/create-request", {
        name: user.name,
        email: user.email,
        phone: user.phone,
        business_type: user.businessType?.name || "N/A",
        message: "Request to increase property upload limit.",
      });
      message.success("Request submitted! Admin will contact you.");
      navigate("/seller/my-properties");
    } catch (error) {
      console.error("Request failed:", error);
      message.error("Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white p-8 rounded-xl shadow-sm">
        <Title level={2} className="mb-4">
          Request Limit Increase
        </Title>
        <Paragraph className="mb-6 text-gray-500">
          You have reached the limit of 2 properties. To upload more properties,
          simply submit this request and our admin team will reach out to you
          shortly.
        </Paragraph>

        <Form form={form} onFinish={handleRequestSubmit} layout="vertical">
          <div className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 uppercase font-bold">
                  Name
                </label>
                <div className="text-gray-900 font-medium">{user?.name}</div>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase font-bold">
                  Email
                </label>
                <div className="text-gray-900 font-medium">{user?.email}</div>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase font-bold">
                  Phone
                </label>
                <div className="text-gray-900 font-medium">
                  {user?.phone || "N/A"}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase font-bold">
                  Business Type
                </label>
                <div className="text-gray-900 font-medium">
                  {user?.businessType?.name || "N/A"}
                </div>
              </div>
            </div>
          </div>

          <Form.Item
            name="agreed"
            valuePropName="checked"
            rules={[
              { required: true, message: "Please check this box to proceed." },
            ]}
          >
            <Checkbox className="text-gray-700">
              I want to request an increase in my property upload limit. Please
              contact me.
            </Checkbox>
          </Form.Item>

          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={() => navigate("/seller/my-properties")}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              className="bg-blue-600"
            >
              Submit Request
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default RequestLimit;
