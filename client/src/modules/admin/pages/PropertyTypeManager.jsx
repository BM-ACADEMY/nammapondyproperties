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

const PropertyTypeManager = () => {
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [form] = Form.useForm();

  const fetchPropertyTypes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/property-types`);
      setPropertyTypes(res.data);
    } catch {
      message.error("Failed to fetch property types");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPropertyTypes();
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
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/property-types/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      message.success("Property Type deleted");
      fetchPropertyTypes();
    } catch {
      message.error("Failed to delete property type");
    }
  };

  const onFinish = async (values) => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      if (editingType) {
        await axios.put(
          `${API}/property-types/${editingType._id}`,
          values,
          config,
        );
        message.success("Property Type updated");
      } else {
        await axios.post(`${API}/property-types`, values, config);
        message.success("Property Type added");
      }
      setIsModalOpen(false);
      fetchPropertyTypes();
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
      title: "Key Attributes",
      dataIndex: "key_attributes",
      key: "key_attributes",
      render: (attributes) => (
        <>
          {attributes &&
            attributes.map((attr) => (
              <Tag color="purple" key={attr}>
                {attr}
              </Tag>
            ))}
        </>
      ),
    },
    {
      title: "Seller Visible",
      dataIndex: "visible_to_seller",
      key: "visible_to_seller",
      render: (visible) => (
        <Tag color={visible ? "blue" : "default"}>{visible ? "YES" : "NO"}</Tag>
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
        <h1 className="text-2xl font-bold">Property Types</h1>
        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={handleAdd}
          className="bg-blue-600"
        >
          Add Property Type
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={propertyTypes}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: true }}
      />

      <Modal
        title={editingType ? "Edit Property Type" : "Add Property Type"}
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
            <Input
              placeholder="e.g. Apartment, Villa"
              disabled={!!editingType}
            />
          </Form.Item>

          <Form.Item name="status" label="Status" initialValue="active">
            <Select>
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="inactive">Inactive</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="visible_to_seller"
            label="Visible to Seller"
            initialValue={true}
          >
            <Select>
              <Select.Option value={true}>Yes</Select.Option>
              <Select.Option value={false}>No</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="key_attributes"
            label="Key Attributes (Press Enter to add)"
          >
            <Select
              mode="tags"
              style={{ width: "100%" }}
              placeholder="e.g. Bedrooms, Bathrooms"
              tokenSeparators={[","]}
            />
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

export default PropertyTypeManager;
