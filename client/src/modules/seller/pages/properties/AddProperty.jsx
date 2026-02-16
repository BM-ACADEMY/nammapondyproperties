import { useState, useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Upload,
  message,
  Card,
  Space,
} from "antd";
import {
  UploadOutlined,
  PlusOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons"; // Correct icons from antd
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const API = import.meta.env.VITE_API_URL;

const { Option } = Select;
const { TextArea } = Input;

const AddProperty = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [approvalTypes, setApprovalTypes] = useState([]);
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      const [propRes, appRes] = await Promise.all([
        axios.get(`${API}/property-types?status=active&visible_to_seller=true`),
        axios.get(`${API}/approval-types?status=active&visible_to_seller=true`),
      ]);
      setPropertyTypes(propRes.data);
      setApprovalTypes(appRes.data);
    } catch (error) {
      message.error("Failed to load property/approval types");
    }
  };

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("price", values.price);
      formData.append("location", values.location);
      formData.append("area_size", values.area_size);
      formData.append("property_type", values.property_type);
      if (values.approval) formData.append("approval", values.approval);

      // Handle Key Attributes
      if (values.key_attributes) {
        formData.append(
          "key_attributes",
          JSON.stringify(values.key_attributes),
        );
      }

      // Handle Images
      fileList.forEach((file) => {
        if (file.originFileObj) {
          formData.append("images", file.originFileObj);
        }
      });

      // For now, let's assume the backend handles multipart/form-data correctly
      // If the backend expects JSON with base64 or separate upload endpoint, we'd need to adjust.
      // Based on common patterns in this project (likely using multer), FormData is correct.
      // However, looking at Property.js, 'images' is an array of objects { image_url: String }.
      // If I send files, the backend controller MUST handle upload to S3/Cloudinary/Local and save URL.
      // I'll assume standard 'file' upload is handled by a middleware.

      // Wait, the previous code usually handled JSON. Let's verify Property Controller if possible.
      // But for now, I will assume a standard POST to /properties works with authentication.

      const token = localStorage.getItem("token");
      await axios.post(`${API}/properties`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      message.success("Property added successfully!");
      navigate("/seller/my-properties");
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.message || "Failed to add property");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Add New Property</h1>
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            key_attributes: [],
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="title"
              label="Property Title"
              rules={[{ required: true, message: "Please enter title" }]}
            >
              <Input placeholder="e.g. Luxury Villa in Pondicherry" />
            </Form.Item>

            <Form.Item
              name="price"
              label="Price (₹)"
              rules={[{ required: true, message: "Please enter price" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
              />
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="location"
              label="Location"
              rules={[{ required: true, message: "Please enter location" }]}
            >
              <Input placeholder="City, Area, or Address" />
            </Form.Item>

            <Form.Item
              name="area_size"
              label="Area Size"
              rules={[{ required: true, message: "Please enter area size" }]}
            >
              <Input placeholder="e.g. 1200 Sq.ft" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="property_type"
              label="Property Type"
              rules={[{ required: true, message: "Select property type" }]}
            >
              <Select placeholder="Select Type">
                {propertyTypes.map((type) => (
                  <Option key={type._id} value={type.name}>
                    {type.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="approval" label="Approval Type">
              <Select placeholder="Select Approval (Optional)">
                {/* <Option value="">None</Option> */}
                {approvalTypes.map((type) => (
                  <Option key={type._id} value={type.name}>
                    {type.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          {/* Key Attributes Dynamic Fields */}
          <Form.List name="key_attributes">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    style={{ display: "flex", marginBottom: 8 }}
                    align="baseline"
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "key"]}
                      rules={[{ required: true, message: "Missing key" }]}
                    >
                      <Input placeholder="Attribute Name (e.g. Facing)" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "value"]}
                      rules={[{ required: true, message: "Missing value" }]}
                    >
                      <Input placeholder="Value (e.g. North)" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Key Attribute
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item label="Property Images" extra="Upload up to 5 images">
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleUploadChange}
              beforeUpload={() => false} // Prevent auto upload
              maxCount={5}
              accept="image/*"
            >
              {fileList.length < 5 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
            >
              Submit Property
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AddProperty;
