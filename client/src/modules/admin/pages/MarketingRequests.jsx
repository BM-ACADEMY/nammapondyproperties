import { useState, useEffect } from "react";
import {
    Table,
    Button,
    Tag,
    Space,
    message,
    Typography,
    Card,
    Modal,
    Form,
    Select,
    Input,
} from "antd";
import { Clock, Phone, Mail, User, CheckCircle, ExternalLink } from "lucide-react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const { Title } = Typography;

const MarketingRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [form] = Form.useForm();

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/marketing/requests/admin`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setRequests(res.data.data);
        } catch {
            message.error("Failed to fetch marketing requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleUpdateStatus = (record) => {
        setSelectedRequest(record);
        form.setFieldsValue({
            status: record.status,
            notes: record.notes,
        });
        setIsModalOpen(true);
    };

    const onFinish = async (values) => {
        try {
            await axios.put(
                `${API}/marketing/requests/${selectedRequest._id}`,
                values,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                }
            );
            message.success("Request status updated");
            setIsModalOpen(false);
            fetchRequests();
        } catch {
            message.error("Failed to update status");
        }
    };

    const columns = [
        {
            title: "Seller Details",
            key: "seller",
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <div className="font-bold flex items-center gap-2">
                        <User size={14} className="text-gray-400" />
                        {record.seller_id?.name}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                        <Phone size={12} /> {record.seller_id?.phone}
                    </div>
                    <div className="text-[10px] text-gray-400">
                        CID: {record.seller_id?.customId}
                    </div>
                </Space>
            ),
        },
        {
            title: "Property & Plan",
            key: "property",
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <div className="font-medium text-indigo-600">
                        {record.property_id?.title}
                    </div>
                    <Tag color="cyan" className="m-0 mt-1 uppercase text-[10px]">
                        Plan: {record.plan_id?.name} ({record.plan_id?.price})
                    </Tag>
                </Space>
            ),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => {
                const colors = {
                    pending: "orange",
                    contacted: "blue",
                    completed: "green",
                    cancelled: "red",
                };
                return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
            },
        },
        {
            title: "Requested Date",
            dataIndex: "createdAt",
            key: "date",
            render: (date) => new Date(date).toLocaleDateString(),
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Button size="small" onClick={() => handleUpdateStatus(record)}>
                    Manage
                </Button>
            ),
        },
    ];

    return (
        <div className="p-6">
            <div className="mb-8">
                <Title level={2}>Marketing Leads</Title>
                <p className="text-gray-500">Track and follow up with sellers who requested property promotion.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="shadow-sm border-orange-100 hover:border-orange-300 transition-colors">
                    <div className="flex flex-col items-center">
                        <div className="bg-orange-50 p-4 rounded-full text-orange-600 mb-3"><Clock /></div>
                        <div className="text-2xl font-black">{requests.filter(r => r.status === 'pending').length}</div>
                        <div className="text-gray-400 font-medium uppercase text-[10px] tracking-wider">New Leads</div>
                    </div>
                </Card>
                <Card className="shadow-sm border-blue-100 hover:border-blue-300 transition-colors">
                    <div className="flex flex-col items-center">
                        <div className="bg-blue-50 p-4 rounded-full text-blue-600 mb-3"><Phone /></div>
                        <div className="text-2xl font-black">{requests.filter(r => r.status === 'contacted').length}</div>
                        <div className="text-gray-400 font-medium uppercase text-[10px] tracking-wider">Contacted</div>
                    </div>
                </Card>
                <Card className="shadow-sm border-green-100 hover:border-green-300 transition-colors">
                    <div className="flex flex-col items-center">
                        <div className="bg-green-50 p-4 rounded-full text-green-600 mb-3"><CheckCircle /></div>
                        <div className="text-2xl font-black">{requests.filter(r => r.status === 'completed').length}</div>
                        <div className="text-gray-400 font-medium uppercase text-[10px] tracking-wider">Successful</div>
                    </div>
                </Card>
            </div>

            <Table
                columns={columns}
                dataSource={requests}
                loading={loading}
                rowKey="_id"
                className="bg-white rounded-xl shadow-sm overflow-hidden"
            />

            <Modal
                title="Manage Marketing Request"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                destroyOnClose
            >
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="font-bold text-gray-800">{selectedRequest?.seller_id?.name}</div>
                    <div className="text-gray-500 mb-2">{selectedRequest?.property_id?.title}</div>
                    <div className="flex items-center gap-4 mt-4">
                        <a href={`tel:${selectedRequest?.seller_id?.phone}`} className="flex items-center gap-2 text-indigo-600 hover:underline">
                            <Phone size={16} /> Call
                        </a>
                        <a href={`mailto:${selectedRequest?.seller_id?.email}`} className="flex items-center gap-2 text-indigo-600 hover:underline">
                            <Mail size={16} /> Email
                        </a>
                    </div>
                </div>

                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item name="status" label="Update Status" rules={[{ required: true }]}>
                        <Select>
                            <Select.Option value="pending">Pending</Select.Option>
                            <Select.Option value="contacted">Contacted</Select.Option>
                            <Select.Option value="completed">Completed / Active Promotion</Select.Option>
                            <Select.Option value="cancelled">Cancelled</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="notes" label="Internal Notes">
                        <Input.TextArea rows={4} placeholder="Track conversation or progress here..." />
                    </Form.Item>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="primary" htmlType="submit">
                            Update Request
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default MarketingRequests;
