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
import { Plus, Edit, Trash2, Megaphone } from "lucide-react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const MarketingPlanManager = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [form] = Form.useForm();

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/marketing/plans/admin`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setPlans(res.data.data);
    } catch {
      message.error("Failed to fetch plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleAdd = () => {
    setEditingPlan(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingPlan(record);

    form.setFieldsValue({
      ...record,
      features: record.features?.join("\n"),
    });

    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/marketing/plans/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      message.success("Plan deleted");
      fetchPlans();
    } catch {
      message.error("Failed to delete plan");
    }
  };

  const onFinish = async (values) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      };

      const payload = {
        ...values,
        features: values.features
          ? values.features.split("\n").filter((f) => f.trim())
          : [],
      };

      if (editingPlan) {
        await axios.put(
          `${API}/marketing/plans/${editingPlan._id}`,
          payload,
          config
        );
        message.success("Plan updated");
      } else {
        await axios.post(`${API}/marketing/plans`, payload, config);
        message.success("Plan created");
      }

      setIsModalOpen(false);
      fetchPlans();
    } catch (error) {
      message.error(error.response?.data?.error || "Operation failed");
    }
  };

  const columns = [
    {
      title: "Plan",
      dataIndex: "name",
      render: (text) => (
        <span className="font-semibold text-gray-800">{text}</span>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      render: (price) => (
        <span className="text-indigo-600 font-semibold">{price}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Actions",
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            size="small"
            icon={<Edit size={16} />}
            onClick={() => handleEdit(record)}
          />

          <Popconfirm
            title="Delete this plan?"
            onConfirm={() => handleDelete(record._id)}
          >
            <Button size="small" danger icon={<Trash2 size={16} />} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

        <div>
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Megaphone size={22} className="text-indigo-600" />
            Marketing Plans
          </h1>

          <p className="text-gray-500 text-sm">
            Manage promotional packages for sellers
          </p>
        </div>

        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={handleAdd}
          className="bg-indigo-600 w-full md:w-auto"
        >
          Add Plan
        </Button>

      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm">

        <Table
          columns={columns}
          dataSource={plans}
          rowKey="_id"
          loading={loading}
          scroll={{ x: 500 }}
          pagination={{ pageSize: 6 }}
        />

      </div>

      {/* Modal */}
      <Modal
        title={editingPlan ? "Edit Marketing Plan" : "Create Marketing Plan"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={500}
      >

        <Form layout="vertical" form={form} onFinish={onFinish}>

          <Form.Item
            name="name"
            label="Plan Name"
            rules={[{ required: true }]}
          >
            <Input placeholder="Basic Package" />
          </Form.Item>

          <Form.Item
            name="price"
            label="Price Label"
            rules={[{ required: true }]}
          >
            <Input placeholder="₹4,999 / Custom" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={3} placeholder="Short summary of the plan" />
          </Form.Item>

          <Form.Item
            name="features"
            label="Features (one per line)"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item name="status" label="Status" initialValue="active">
            <Select>
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="inactive">Inactive</Select.Option>
            </Select>
          </Form.Item>

          <div className="flex justify-end gap-3 pt-2">

            <Button onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>

            <Button
              type="primary"
              htmlType="submit"
              className="bg-indigo-600"
            >
              {editingPlan ? "Update Plan" : "Create Plan"}
            </Button>

          </div>

        </Form>
      </Modal>

    </div>
  );
};

export default MarketingPlanManager;