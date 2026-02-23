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
    Space,
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
            features: record.features?.join("\n")
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
                features: values.features ? values.features.split("\n").filter(f => f.trim()) : []
            };

            if (editingPlan) {
                await axios.put(`${API}/marketing/plans/${editingPlan._id}`, payload, config);
                message.success("Plan updated");
            } else {
                await axios.post(`${API}/marketing/plans`, payload, config);
                message.success("Plan added");
            }
            setIsModalOpen(false);
            fetchPlans();
        } catch (error) {
            message.error(error.response?.data?.error || "Operation failed");
        }
    };

    const columns = [
        {
            title: "Plan Name",
            dataIndex: "name",
            key: "name",
            render: (text) => <span className="font-bold text-gray-800">{text}</span>
        },
        {
            title: "Price",
            dataIndex: "price",
            key: "price",
            render: (price) => <span className="text-indigo-600 font-bold">{price}</span>
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
                        title="Delete this plan?"
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
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Megaphone size={24} className="text-indigo-600" />
                        Marketing Plans
                    </h1>
                    <p className="text-gray-500">Manage promotional packages for sellers</p>
                </div>
                <Button
                    type="primary"
                    icon={<Plus size={16} />}
                    onClick={handleAdd}
                    className="bg-indigo-600"
                >
                    Add New Plan
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={plans}
                rowKey="_id"
                loading={loading}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
            />

            <Modal
                title={editingPlan ? "Edit Plan" : "Add Marketing Plan"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                destroyOnClose
            >
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item
                        name="name"
                        label="Plan Name"
                        rules={[{ required: true, message: "Please enter plan name" }]}
                    >
                        <Input placeholder="e.g. Basic Package" />
                    </Form.Item>

                    <Form.Item
                        name="price"
                        label="Price Label"
                        rules={[{ required: true, message: "Please enter price display text" }]}
                    >
                        <Input placeholder="e.g. ₹4,999 or Custom" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[{ required: true, message: "Please enter description" }]}
                    >
                        <Input.TextArea placeholder="Short summary of the plan" />
                    </Form.Item>

                    <Form.Item
                        name="features"
                        label="Features (One per line)"
                        rules={[{ required: true, message: "Please enter at least one feature" }]}
                    >
                        <Input.TextArea rows={4} placeholder="Feature 1&#10;Feature 2&#10;Feature 3" />
                    </Form.Item>

                    <Form.Item name="status" label="Status" initialValue="active">
                        <Select>
                            <Select.Option value="active">Active</Select.Option>
                            <Select.Option value="inactive">Inactive</Select.Option>
                        </Select>
                    </Form.Item>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="primary" htmlType="submit" className="bg-indigo-600">
                            {editingPlan ? "Update Plan" : "Create Plan"}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default MarketingPlanManager;
