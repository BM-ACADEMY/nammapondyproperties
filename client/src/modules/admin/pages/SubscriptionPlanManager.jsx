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
  InputNumber,
  Dropdown
} from "antd";
import { Plus, Edit, Trash2, CreditCard, CheckCircle, MoreVertical, IndianRupee, ShieldCheck } from "lucide-react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const SubscriptionPlanManager = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [form] = Form.useForm();

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/subscriptions/admin/plans`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const allPlans = res.data;
      setPlans(allPlans.filter(p => p.name !== "Free"));
    } catch {
      message.error("Failed to fetch subscription plans");
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
      await axios.delete(`${API}/subscriptions/admin/plans/${id}`, {
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
        id: editingPlan ? editingPlan._id : undefined,
        features: values.features
          ? values.features.split("\n").filter((f) => f.trim())
          : [],
      };

      await axios.post(`${API}/subscriptions/admin/plans`, payload, config);
      message.success(editingPlan ? "Plan updated" : "Plan created");

      setIsModalOpen(false);
      fetchPlans();
    } catch (error) {
      message.error(error.response?.data?.error || "Operation failed");
    }
  };

  const PlanCard = ({ plan }) => (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-col overflow-hidden h-full group">
      <div className="p-6 pb-4 border-b border-gray-50 relative">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
            {plan.name}
          </h3>
          <Tag color={plan.status === "active" ? "green" : "red"} className="rounded-lg px-3 py-1 border-none shadow-sm capitalize">
            {plan.status}
          </Tag>
        </div>
        <div className="flex flex-col gap-1 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-blue-500" />
            <span>Limit: {plan.propertyLimit === -1 ? "Unlimited" : `${plan.propertyLimit} Properties`}</span>
          </div>
          {plan.duration && (
            <div className="flex items-center gap-2">
              <CheckCircle size={14} className="text-green-500" />
              <span>Duration: {plan.duration} Days</span>
            </div>
          )}
        </div>

        <div className="absolute top-4 right-4">
          <Dropdown
            menu={{
              items: [
                {
                  key: "edit",
                  label: "Edit Plan",
                  icon: <Edit size={14} />,
                  onClick: () => handleEdit(plan),
                },
                {
                  key: "delete",
                  label: (
                    <Popconfirm
                      title="Delete this plan?"
                      onConfirm={() => handleDelete(plan._id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <span className="text-red-500">Delete Plan</span>
                    </Popconfirm>
                  ),
                  icon: <Trash2 size={14} className="text-red-500" />,
                },
              ],
            }}
            trigger={["click"]}
          >
            <Button type="text" icon={<MoreVertical size={18} />} className="hover:bg-gray-100 rounded-full flex items-center justify-center p-0 w-8 h-8" />
          </Dropdown>
        </div>
      </div>

      <div className="px-6 py-4 bg-gray-50/50">
        <div className="flex items-baseline gap-1">
          <IndianRupee size={20} className="text-gray-900" />
          <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
          {plan.duration && <span className="text-gray-400 text-sm ml-1">/ {plan.duration} days</span>}
          {!plan.duration && <span className="text-gray-400 text-sm ml-1">/ Lifetime</span>}
        </div>
      </div>

      <div className="p-6 grow">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
          Features
        </h4>
        <ul className="space-y-3">
          {plan.features?.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" />
              <span className="text-gray-600 text-sm leading-relaxed">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl shadow-inner">
              <CreditCard size={24} />
            </div>
            Subscription Plans
          </h1>
          <p className="text-gray-500 text-sm">
            Manage properties upload limits and subscription pricing for sellers
          </p>
        </div>

        <Button
          type="primary"
          icon={<Plus size={18} />}
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 h-auto py-2.5 px-6 rounded-xl font-semibold shadow-md flex items-center gap-2 transition-all hover:scale-[1.02]"
        >
          Add New Subscription Plan
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 bg-gray-100 rounded-2xl" />
          ))}
        </div>
      ) : plans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <PlanCard key={plan._id} plan={plan} />
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-dashed border-gray-200 text-center">
          <p className="text-gray-400 font-medium">No subscription plans found. Create the Free, Standard, and Premium plans!</p>
        </div>
      )}

      <Modal
        title={editingPlan ? "Edit Subscription Plan" : "Create Subscription Plan"}
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
            <Select placeholder="Select plan type">
              <Select.Option value="Standard">Standard</Select.Option>
              <Select.Option value="Premium">Premium</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="price"
            label="Price (₹)"
            rules={[{ required: true }]}
          >
            <InputNumber className="w-full" placeholder="0" />
          </Form.Item>

          <Form.Item
            name="propertyLimit"
            label="Property Limit (-1 for unlimited)"
            rules={[{ required: true }]}
          >
            <InputNumber className="w-full" placeholder="3" />
          </Form.Item>

          <Form.Item
            name="duration"
            label="Duration (Days) - Leave empty for lifetime"
            rules={[{ required: false }]}
          >
            <InputNumber className="w-full" placeholder="30" />
          </Form.Item>

          <Form.Item
            name="features"
            label="Features (one per line)"
          >
            <Input.TextArea rows={4} placeholder="3 Property Uploads&#10;Basic Support" />
          </Form.Item>

          <Form.Item name="status" label="Status" initialValue="active">
            <Select>
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="inactive">Inactive</Select.Option>
            </Select>
          </Form.Item>

          <div className="flex justify-end gap-3 pt-6">
            <Button onClick={() => setIsModalOpen(false)} className="rounded-xl px-6">
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-blue-600 rounded-xl px-8 font-semibold shadow-md"
            >
              {editingPlan ? "Update Plan" : "Create Plan"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default SubscriptionPlanManager;
