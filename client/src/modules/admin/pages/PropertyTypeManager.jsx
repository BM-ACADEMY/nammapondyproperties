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
  Upload,
} from "antd";
import ImgCrop from "antd-img-crop";
import { Plus, Edit, Trash2, Image as ImageIcon } from "lucide-react";
import axios from "axios";
import { getImageUrl } from "@/utils/imageUrl";

const API = import.meta.env.VITE_API_URL;

const PropertyTypeManager = () => {
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [fileList, setFileList] = useState([]);
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
    setFileList([]);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingType(record);
    form.setFieldsValue(record);
    if (record.image_url) {
      setFileList([
        {
          uid: "-1",
          name: "image.png",
          status: "done",
          url: getImageUrl(record.image_url),
        },
      ]);
    } else {
      setFileList([]);
    }
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
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("status", values.status);
      formData.append("visible_to_seller", values.visible_to_seller);

      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append("image", fileList[0].originFileObj);
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      if (editingType) {
        await axios.put(
          `${API}/property-types/${editingType._id}`,
          formData,
          config,
        );
        message.success("Property Type updated");
      } else {
        await axios.post(`${API}/property-types`, formData, config);
        message.success("Property Type added");
      }
      setIsModalOpen(false);
      fetchPropertyTypes();
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Operation failed";
      message.error(errorMessage);
    }
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "image_url",
      key: "image",
      render: (url) => (
        <div className="w-12 h-12 rounded overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
          {url ? (
            <img
              src={getImageUrl(url)}
              alt="Type"
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon className="text-gray-300" size={20} />
          )}
        </div>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
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
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Property Types</h1>
        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={handleAdd}
          className="bg-blue-600 w-full sm:w-auto h-10 flex items-center justify-center order-last sm:order-none"
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
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item label="Property Type Image">
            <ImgCrop rotationSlider aspect={1 / 1}>
              <Upload
                listType="picture-card"
                fileList={fileList}
                onChange={({ fileList: newFileList }) =>
                  setFileList(newFileList)
                }
                onPreview={async (file) => {
                  let src = file.url;
                  if (!src) {
                    src = await new Promise((resolve) => {
                      const reader = new FileReader();
                      reader.readAsDataURL(file.originFileObj);
                      reader.onload = () => resolve(reader.result);
                    });
                  }
                  const image = new Image();
                  image.src = src;
                  const imgWindow = window.open(src);
                  imgWindow?.document.write(image.outerHTML);
                }}
                beforeUpload={() => false}
                maxCount={1}
              >
                {fileList.length < 1 && "+ Upload"}
              </Upload>
            </ImgCrop>
          </Form.Item>

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
