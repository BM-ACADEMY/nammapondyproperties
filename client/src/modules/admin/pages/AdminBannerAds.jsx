import { useState, useEffect } from "react";
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    DatePicker,
    Switch,
    Upload,
    message,
    Popconfirm,
    Tag,
    Space,
} from "antd";
import { Plus, Edit, Trash2, Upload as UploadIcon, ExternalLink } from "lucide-react";
import api from "@/services/api";
import { getImageUrl } from "@/utils/imageUrl";
import dayjs from "dayjs";

const AdminBannerAds = () => {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingAd, setEditingAd] = useState(null);
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);

    const fetchAds = async () => {
        setLoading(true);
        try {
            const response = await api.get("/banner-ads");
            if (response.data.success) {
                setAds(response.data.data);
            }
        } catch (error) {
            message.error("Failed to fetch advertisements");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAds();
    }, []);

    const handleAdd = () => {
        setEditingAd(null);
        form.resetFields();
        setFileList([]);
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingAd(record);
        form.setFieldsValue({
            title: record.title,
            linkUrl: record.linkUrl,
            expiryDate: dayjs(record.expiryDate),
            isActive: record.isActive,
        });
        setFileList([
            {
                uid: "-1",
                name: "Current Image",
                status: "done",
                url: getImageUrl(record.imageUrl),
            },
        ]);
        setIsModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            const response = await api.delete(`/banner-ads/${id}`);
            if (response.data.success) {
                message.success("Advertisement deleted successfully");
                fetchAds();
            }
        } catch (error) {
            message.error("Failed to delete advertisement");
        }
    };

    const handleToggleActive = async (checked, record) => {
        try {
            const response = await api.put(`/banner-ads/${record._id}`, {
                isActive: checked,
            });
            if (response.data.success) {
                message.success(`Advertisement ${checked ? "activated" : "deactivated"}`);
                fetchAds();
            }
        } catch (error) {
            message.error("Failed to update status");
        }
    };

    const handleModalSubmit = async () => {
        try {
            const values = await form.validateFields();
            const formData = new FormData();
            formData.append("title", values.title);
            formData.append("linkUrl", values.linkUrl || "");
            formData.append("expiryDate", values.expiryDate.toISOString());
            formData.append("isActive", values.isActive);

            if (fileList[0]?.originFileObj) {
                formData.append("bannerImage", fileList[0].originFileObj);
            } else if (!editingAd && fileList.length === 0) {
                message.error("Please upload an image");
                return;
            }

            setLoading(true);
            let response;
            if (editingAd) {
                response = await api.put(`/banner-ads/${editingAd._id}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            } else {
                response = await api.post("/banner-ads", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }

            if (response.data.success) {
                message.success(`Advertisement ${editingAd ? "updated" : "created"} successfully`);
                setIsModalVisible(false);
                fetchAds();
            }
        } catch (error) {
            console.error("Submit error:", error);
            message.error(error.response?.data?.message || "Failed to save advertisement");
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: "Banner",
            dataIndex: "imageUrl",
            key: "imageUrl",
            render: (url) => (
                <img
                    src={getImageUrl(url)}
                    alt="Ad"
                    style={{ width: 100, height: 40, objectFit: "cover", borderRadius: 4 }}
                />
            ),
        },
        {
            title: "Title",
            dataIndex: "title",
            key: "title",
        },
        {
            title: "Expiry Date",
            dataIndex: "expiryDate",
            key: "expiryDate",
            render: (date) => {
                const isExpired = dayjs().isAfter(dayjs(date));
                return (
                    <Tag color={isExpired ? "red" : "green"}>
                        {dayjs(date).format("DD MMM YYYY")}
                    </Tag>
                );
            },
        },
        {
            title: "Status",
            dataIndex: "isActive",
            key: "isActive",
            render: (isActive, record) => (
                <Switch
                    checked={isActive}
                    onChange={(checked) => handleToggleActive(checked, record)}
                />
            ),
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="text"
                        icon={<Edit size={16} />}
                        onClick={() => handleEdit(record)}
                    />
                    <Popconfirm
                        title="Delete advertisement?"
                        description="Are you sure you want to delete this ad?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="text" danger icon={<Trash2 size={16} />} />
                    </Popconfirm>
                    {record.linkUrl && (
                        <a href={record.linkUrl} target="_blank" rel="noopener noreferrer">
                            <Button type="text" icon={<ExternalLink size={16} />} />
                        </a>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Banner Advertisements</h2>
                    <p className="text-gray-500">Manage the rectangular ads displayed on the homepage.</p>
                </div>
                <Button
                    type="primary"
                    icon={<Plus size={18} />}
                    onClick={handleAdd}
                    className="bg-blue-600 flex items-center"
                >
                    Add Advertisement
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={ads}
                rowKey="_id"
                loading={loading}
                pagination={{ pageSize: 10 }}
                className="bg-white rounded-lg shadow-sm"
            />

            <Modal
                title={editingAd ? "Edit Advertisement" : "New Advertisement"}
                open={isModalVisible}
                onOk={handleModalSubmit}
                onCancel={() => setIsModalVisible(false)}
                confirmLoading={loading}
                width={600}
            >
                <Form form={form} layout="vertical" initialValues={{ isActive: true }}>
                    <Form.Item
                        name="title"
                        label="Title"
                        rules={[{ required: true, message: "Please input the title!" }]}
                    >
                        <Input placeholder="E.g., Special Summer Offer" />
                    </Form.Item>

                    <Form.Item name="linkUrl" label="Link URL (Optional)">
                        <Input placeholder="https://example.com/promo" />
                    </Form.Item>

                    <div className="flex gap-4">
                        <Form.Item
                            name="expiryDate"
                            label="Expiry Date"
                            className="flex-1"
                            rules={[{ required: true, message: "Please select expiry date!" }]}
                        >
                            <DatePicker className="w-full" />
                        </Form.Item>

                        <Form.Item name="isActive" label="Status" valuePropName="checked">
                            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                        </Form.Item>
                    </div>

                    <Form.Item label="Banner Image (Rectangular recommended)">
                        <Upload
                            listType="picture-card"
                            fileList={fileList}
                            onChange={({ fileList }) => setFileList(fileList)}
                            beforeUpload={() => false}
                            maxCount={1}
                        >
                            {fileList.length < 1 && (
                                <div className="flex flex-col items-center">
                                    <UploadIcon size={20} />
                                    <div className="mt-2">Upload</div>
                                </div>
                            )}
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminBannerAds;
