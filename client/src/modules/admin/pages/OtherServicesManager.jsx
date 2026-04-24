import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Card,
  Typography,
  Tag,
  Space,
  message,
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
} from "antd";
import {
  Plus,
  Edit,
  Trash2,
  Layers,
  Search,
  ExternalLink,
  Eye,
  EyeOff
} from "lucide-react";
import api from "@/services/api";

const { Title, Text } = Typography;
const { Option } = Select;

const OtherServicesManager = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await api.get("/other-services");
      if (response.data.success) {
        setServices(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch services:", error);
      message.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenModal = (service = null) => {
    setEditingService(service);
    if (service) {
      form.setFieldsValue(service);
    } else {
      form.resetFields();
      form.setFieldsValue({ status: "active", icon: "Layers" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingService) {
        await api.put(`/other-services/${editingService._id}`, values);
        message.success("Service updated successfully");
      } else {
        await api.post("/other-services", values);
        message.success("Service created successfully");
      }
      setIsModalOpen(false);
      fetchServices();
    } catch (error) {
      message.error(error.response?.data?.error || "Operation failed");
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this service?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await api.delete(`/other-services/${id}`);
          message.success("Service deleted successfully");
          fetchServices();
        } catch (error) {
          message.error("Failed to delete service");
        }
      },
    });
  };

  const filteredServices = services.filter((s) =>
    s.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "Service Details",
      key: "details",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <Layers size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">{record.title}</span>
            <span className="text-xs text-gray-500 max-w-xs truncate">
              {record.description}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={status === "active" ? "green" : "red"}
          className="rounded-full px-3"
          icon={status === "active" ? <Eye size={12} className="inline mr-1" /> : <EyeOff size={12} className="inline mr-1" />}
        >
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Link",
      dataIndex: "link",
      key: "link",
      render: (link) => (
        link ? (
          <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">
            View Link <ExternalLink size={14} />
          </a>
        ) : (
          <span className="text-gray-400">N/A</span>
        )
      ),
    },
    {
      title: "Action",
      key: "action",
      align: "right",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<Edit size={18} className="text-blue-600" />}
            onClick={() => handleOpenModal(record)}
          />
          <Button
            type="text"
            icon={<Trash2 size={18} className="text-red-600" />}
            onClick={() => handleDelete(record._id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <Title level={3} className="mb-0!">
            Other Services Manager
          </Title>
          <p className="text-gray-500 mt-1">
            Manage additional internal services for admin reference
          </p>
        </div>
        <Button
          type="primary"
          icon={<Plus size={18} />}
          size="large"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 border-none shadow-md h-11"
          onClick={() => handleOpenModal()}
        >
          Add New Service
        </Button>
      </div>

      <Card className="shadow-sm border-none mb-6">
        <Input
          placeholder="Search by service title..."
          prefix={<Search size={18} className="text-gray-400" />}
          className="max-w-md"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </Card>

      <Card className="shadow-sm border-none overflow-hidden">
        <Table
          columns={columns}
          dataSource={filteredServices}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: true }}
        />
      </Card>

      <Modal
        title={editingService ? "Edit Service" : "Add New Service"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="title"
                label="Service Title"
                rules={[{ required: true, message: "Please enter service title" }]}
              >
                <Input placeholder="e.g. Legal Assistance, Home Loan" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="description"
                label="Description"
                rules={[{ required: true, message: "Please enter description" }]}
              >
                <Input.TextArea rows={3} placeholder="Briefly describe the service" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                <Select>
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="icon" label="Icon Identifier (Lucide)">
                <Input placeholder="e.g. Layers, Wrench, Shield" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="link" label="External Link (Optional)">
                <Input placeholder="https://example.com" prefix={<ExternalLink size={16} className="text-gray-400" />} />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" className="bg-indigo-600">
              {editingService ? "Update Service" : "Save Service"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default OtherServicesManager;
