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
  Dropdown,
  Switch,
  Checkbox,
  Card
} from "antd";
import { Plus, Edit, Trash2, CreditCard, CheckCircle, MoreVertical, IndianRupee, ShieldCheck, XCircle, Star, Check, X } from "lucide-react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const SubscriptionPlanManager = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [businessTypes, setBusinessTypes] = useState([]);
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

  const fetchBusinessTypes = async () => {
    try {
      const res = await axios.get(`${API}/business-types?status=active`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setBusinessTypes(res.data);
    } catch {
      console.error("Failed to fetch business types");
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchBusinessTypes();
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
      propertyLimit: record.propertyLimit,
      leadsLimit: record.leadsLimit,
      features: record.features?.join("\n"),
      notIncluded: record.notIncluded?.join("\n"),
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
        notIncluded: values.notIncluded
          ? values.notIncluded.split("\n").filter((f) => f.trim())
          : [],
        isPopular: !!values.isPopular,
      };

      await axios.post(`${API}/subscriptions/admin/plans`, payload, config);
      message.success(editingPlan ? "Plan updated" : "Plan created");

      setIsModalOpen(false);
      fetchPlans();
    } catch (error) {
      message.error(error.response?.data?.error || "Operation failed");
    }
  };

  const PlanCard = ({ plan }) => {
    const isPopular = plan.isPopular;

    return (
      <Card
        className={`relative w-full h-full rounded-2xl border-none shadow-xl transition-all duration-300 flex flex-col overflow-hidden bg-white`}
        styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column', height: '100%' } }}
      >
        {/* Ribbon for Popular */}
        {isPopular && (
          <div className="absolute top-0 left-0 w-32 h-32 overflow-hidden z-20">
            <div className="absolute top-5 -left-10 w-40 bg-[#e00d0d] text-white text-[10px] font-black uppercase py-1 text-center -rotate-45 shadow-lg">
              Popular
            </div>
          </div>
        )}

        {/* Dropdown for Edit/Delete (Admin Action) */}
        <div className="absolute top-4 right-4 z-30">
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
            <Button
              type="text"
              icon={<MoreVertical size={18} className="text-gray-400" />}
              className="hover:bg-gray-100 rounded-full flex items-center justify-center p-0 w-8 h-8 bg-white/50 backdrop-blur-sm shadow-sm"
            />
          </Dropdown>
        </div>

        {/* Status Tag */}
        <div className={`absolute top-4 ${isPopular ? 'left-16' : 'left-4'} z-30`}>
          <Tag color={plan.status === "active" ? "green" : "red"} className="rounded-lg px-2 py-0.5 border-none shadow-sm capitalize text-[10px] font-bold">
            {plan.status}
          </Tag>
        </div>

        {/* Header */}
        <div className={`py-4 text-center border-b border-gray-50 bg-white pt-10 px-4`}>
          <h2 className="text-2xl font-black text-[#002B49] tracking-widest uppercase">{plan.name}</h2>
          <div className="mt-1">
            <Tag color="blue" className="rounded-md border-none bg-blue-50 text-blue-600 font-bold text-[10px] uppercase">
              {plan.businessType?.name || "Global"}
            </Tag>
          </div>
        </div>

        {/* Price Banner */}
        <div className={`py-3 text-center ${
          isPopular ? "bg-[#f97316]" : "bg-[#002B49]"
        }`}>
          <div className="flex items-center justify-center text-white gap-1">
            {plan.price === 0 ? (
              <span className="text-xl font-bold uppercase tracking-wider">Free</span>
            ) : (
              <>
                <IndianRupee size={18} strokeWidth={3} />
                <span className="text-2xl font-black">{plan.price}</span>
                <span className="text-xs font-bold opacity-70">/ {plan.duration ? `${plan.duration} Days` : "Lifetime"}</span>
              </>
            )}
          </div>
        </div>

        {/* Feature List */}
        <div className="p-6 flex-1">
          <div className="mb-4 text-xs font-bold text-gray-500 flex items-center gap-2">
            <ShieldCheck size={14} className="text-blue-500" />
            <span>Limit: {plan.propertyLimit === -1 ? "Unlimited" : `${plan.propertyLimit} Properties`}</span>
          </div>

          <div className="mb-4 text-xs font-bold text-gray-500 flex items-center gap-2">
            <CheckCircle size={14} className="text-emerald-500" />
            <span>Leads: {plan.leadsLimit === -1 ? "Unlimited" : `${plan.leadsLimit} Credits`}</span>
          </div>

          <div className="space-y-3">
            {/* Checkmarks */}
            {plan.features?.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-4 group">
                <Check size={18} className="text-green-500 shrink-0" strokeWidth={3} />
                <span className="text-gray-700 font-semibold text-sm leading-tight">{feature}</span>
              </div>
            ))}
            
            {/* Dynamic notIncluded crossmarks */}
            {plan.notIncluded?.map((feature, idx) => (
              <div key={`not-${idx}`} className="flex items-center gap-4 opacity-30">
                <X size={18} className="text-red-500 shrink-0" strokeWidth={3} />
                <span className="text-gray-500 font-medium text-sm line-through">{feature}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-auto">
          <ShieldCheck size={14} className="text-green-500" />
          SECURE PLAN
        </div>
      </Card>
    );
  };

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
          Add Plan
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
        width={700}
        centered
      >
        <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '8px' }}>
          <Form layout="vertical" form={form} onFinish={onFinish}>
            <Form.Item
              name="name"
              label="Plan Name"
              rules={[{ required: true }]}
            >
              <Select placeholder="Select plan name">
                <Select.Option value="Standard">Standard</Select.Option>
                <Select.Option value="Premium">Premium</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="businessType"
              label="Business Type"
              rules={[{ required: true, message: "Please select a business type" }]}
            >
              <Select placeholder="Select business type">
                {businessTypes.map((type) => (
                  <Select.Option key={type._id} value={type._id}>
                    {type.name}
                  </Select.Option>
                ))}
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
              name="leadsLimit"
              label="Lead Share Count"
              rules={[{ required: true, message: "Please enter lead share count" }]}
            >
              <InputNumber className="w-full" placeholder="2" />
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
              <Input.TextArea rows={3} placeholder="3 Property Uploads&#10;Basic Support" />
            </Form.Item>

            <Form.Item
              name="notIncluded"
              label="Not Included Features (one per line)"
            >
              <Input.TextArea rows={3} placeholder="Advanced Analytics&#10;Dedicated Support" />
            </Form.Item>

            <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-xl">
              <span className="font-semibold text-gray-700 flex items-center gap-2">
                <Star size={18} className="text-amber-500" /> Mark as Popular
              </span>
              <Form.Item name="isPopular" valuePropName="checked" className="mb-0">
                <Switch />
              </Form.Item>
            </div>

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
        </div>
      </Modal>

      <style>{`
        .ant-card {
            border-radius: 12px !important;
        }
      `}</style>
    </div>
  );
};

export default SubscriptionPlanManager;
