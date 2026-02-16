import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Tag,
} from "antd";
import { Plus, Edit, Trash2 } from "lucide-react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const BusinessTypeManager = () => {
  const [businessTypes, setBusinessTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [form] = Form.useForm();

  const fetchBusinessTypes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/business-types`);
      setBusinessTypes(res.data);
    } catch {
      message.error("Failed to fetch business types");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinessTypes();
  }, []);

  const handleAdd = () => {
    setEditingType(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingType(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/business-types/${id}`);
      message.success("Business Type deleted");
      fetchBusinessTypes();
    } catch {
      message.error("Failed to delete business type");
    }
  };

  const onFinish = async (values) => {
    try {
      if (editingType) {
        await axios.put(`${API}/business-types/${editingType._id}`, values);
        message.success("Business Type updated");
      } else {
        await axios.post(`${API}/business-types`, values);
        message.success("Business Type added");
      }
      setIsModalOpen(false);
      fetchBusinessTypes();
    } catch {
      message.error("Operation failed");
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="flex space-x-2">
          <Button
            icon={<Edit size={16} />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Delete this type?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<Trash2 size={16} />} danger />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Business Types</h1>
        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={handleAdd}
          className="bg-blue-600"
        >
          Add Business Type
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={businessTypes}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingType ? "Edit Business Type" : "Add Business Type"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter name" }]}
          >
            <Input placeholder="e.g. Builder, Agent" />
          </Form.Item>

          <Form.Item name="status" label="Status" initialValue="active">
            <Select>
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="inactive">Inactive</Select.Option>
            </Select>
          </Form.Item>

          <div className="flex justify-end space-x-2">
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              {editingType ? "Update" : "Add"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default BusinessTypeManager;
