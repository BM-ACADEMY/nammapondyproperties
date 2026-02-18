import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  message,
  Popconfirm,
  Space,
  Tag,
  Typography,
} from "antd";
import {
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Github,
  Globe,
} from "lucide-react";

const { Title } = Typography;
const { Option } = Select;

// Mapping for icon preview
const iconMap = {
  Facebook: <Facebook size={18} />,
  Twitter: <Twitter size={18} />,
  Instagram: <Instagram size={18} />,
  Linkedin: <Linkedin size={18} />,
  Youtube: <Youtube size={18} />,
  Github: <Github size={18} />,
  Globe: <Globe size={18} />,
};

const SocialMediaManager = () => {
  const [socialMedias, setSocialMedias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchSocialMedias();
  }, []);

  const fetchSocialMedias = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/social-media/fetch-all-social-media`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setSocialMedias(res.data);
    } catch (error) {
      console.error("Error fetching social media:", error);
      message.error("Failed to fetch social media links");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingItem(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/social-media/delete-social-media-by-id/${id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      message.success("Social media link deleted");
      fetchSocialMedias();
    } catch (error) {
      console.error("Error deleting social media:", error);
      message.error("Failed to delete social media link");
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingItem) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/social-media/update-social-media-by-id/${editingItem._id}`,
          values,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        message.success("Social media link updated");
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/social-media/create-social-media`,
          values,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        message.success("Social media link created");
      }
      setIsModalVisible(false);
      fetchSocialMedias();
    } catch (error) {
      console.error("Error saving social media:", error);
      message.error("Failed to save social media link");
    }
  };

  const updateStatus = async (id, currentStatus) => {
    try {
      // Optimistic update or wait for server
      await axios.put(
        `${import.meta.env.VITE_API_URL}/social-media/update-social-media-by-id/${id}`,
        { status: !currentStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      message.success("Status updated");
      fetchSocialMedias();
    } catch (error) {
      console.error("Error updating status:", error);
      message.error("Failed to update status");
    }
  };

  const columns = [
    {
      title: "Platform",
      dataIndex: "platform",
      key: "platform",
      render: (text, record) => (
        <Space>
          {iconMap[record.icon] || <Globe size={18} />}
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: "URL",
      dataIndex: "url",
      key: "url",
      render: (text) => (
        <a href={text} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status ? "green" : "red"}>
          {status ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<Edit size={18} className="text-blue-600" />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this link?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<Trash2 size={18} />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2} className="!mb-0">
            Social Media Links
          </Title>
          <p className="text-gray-500 mt-1">
            Manage social media links displayed in the footer.
          </p>
        </div>

        <Button
          type="primary"
          icon={<Plus size={18} />}
          onClick={handleAdd}
          className="bg-blue-600"
        >
          Add New Link
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <Table
          columns={columns}
          dataSource={socialMedias}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: true }}
        />
      </div>

      <Modal
        title={
          editingItem ? "Edit Social Media Link" : "Add New Social Media Link"
        }
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="platform"
            label="Platform Name"
            rules={[{ required: true, message: "Please enter platform name" }]}
          >
            <Input placeholder="e.g. Facebook, Twitter" />
          </Form.Item>
          <Form.Item
            name="url"
            label="URL"
            rules={[
              { required: true, message: "Please enter URL" },
              { type: "url", message: "Please enter a valid URL" },
            ]}
          >
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="icon" label="Icon" initialValue="Globe">
            <Select>
              {Object.keys(iconMap).map((key) => (
                <Option key={key} value={key}>
                  <Space>
                    {iconMap[key]}
                    {key}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="status"
            label="Status"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            {/* Using Switch but mapping to boolean needs checking if Switch passes checked value correctly */}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// I need to Import Switch from antd
// Wait, I used Switch in the JSX but didn't import it in the top imports.
// Also in the first iteration I used Select for Status.
// Let's stick to Select for Status for consistency with my thought process or fix the Switch import.
// Actually, I'll just use Select for now to be safe and consistent with my previous snippet unless I change the imports.
// The previous snippet had:
// <Form.Item name="status" ...><Select> ... </Select></Form.Item>
// I will revert to Select or add Switch to imports. Adding Switch to imports is better UI.

export default SocialMediaManager;
