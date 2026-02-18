import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Space,
  Button,
  message,
  Popconfirm,
  Input,
  Typography,
  Modal,
  Form,
  Checkbox,
  Descriptions,
  Image,
  Carousel,
} from "antd";
import { Search, Plus, Edit, Trash2, Eye } from "lucide-react";
import api from "@/services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const { Title } = Typography;

const MyProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleViewDetail = (property) => {
    setSelectedProperty(property);
    setViewModalVisible(true);
  };

  const handleCloseModal = () => {
    setViewModalVisible(false);
    setSelectedProperty(null);
  };

  const getImageUrl = (path) => {
    return `${import.meta.env.VITE_API_URL.replace("/api", "")}${path}`;
  };

  const fetchProperties = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/properties/fetch-all-property?limit=100&seller_id=${user._id}`,
      );

      if (response.data && response.data.properties) {
        setProperties(response.data.properties);
      }
    } catch (error) {
      console.error("Failed to fetch properties:", error);
      message.error("Failed to load properties");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProperties();
    }
  }, [user, fetchProperties]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/properties/delete-property-by-id/${id}`);
      message.success("Property deleted successfully");
      fetchProperties();
    } catch {
      message.error("Failed to delete property");
    }
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "images",
      key: "images",
      render: (images) =>
        images && images.length > 0 ? (
          <img
            src={`${import.meta.env.VITE_API_URL.replace("/api", "")}${images[0].image_url
              }`}
            alt="Property"
            className="w-16 h-12 object-cover rounded"
          />
        ) : (
          <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center text-xs">
            No Img
          </div>
        ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text) => (
        <span className="font-medium text-gray-800">{text}</span>
      ),
      filteredValue: [searchText],
      onFilter: (value, record) => {
        return (
          String(record.title).toLowerCase().includes(value.toLowerCase()) ||
          String(record.location).toLowerCase().includes(value.toLowerCase())
        );
      },
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => `₹${price.toLocaleString()}`,
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      render: (loc) => loc?.city || "N/A",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "available" ? "green" : "red"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Verification",
      dataIndex: "is_verified",
      key: "is_verified",
      render: (verified) => (
        <Tag color={verified ? "green" : "orange"}>
          {verified ? "Verified" : "Pending"}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            size="small"
            icon={<Eye size={14} />}
            onClick={() => handleViewDetail(record)}
            type="default"
          >
            View Detail
          </Button>
          <Button
            size="small"
            icon={<Edit size={14} />}
            onClick={() => navigate(`/seller/add-property?edit=${record._id}`)} // Re-using add property for edit
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete the property"
            description="Are you sure to delete this property?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button size="small" danger icon={<Trash2 size={14} />}></Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2} className="!mb-0">
            My Properties
          </Title>
          <p className="text-gray-500">Manage your listings</p>
        </div>
        <Button
          type="primary"
          icon={<Plus size={18} />}
          onClick={() => {
            if (properties.length >= 2) {
              navigate("/seller/request-limit");
              return;
            }
            navigate("/seller/add-property");
          }}
          className={
            properties.length >= 2
              ? "bg-orange-500 hover:bg-orange-600"
              : "bg-blue-600"
          }
        >
          {properties.length >= 2 ? "Request More Limit" : "Add New Property"}
        </Button>
      </div>

      <div className="mb-4">
        <Input
          prefix={<Search size={18} className="text-gray-400" />}
          placeholder="Search properties..."
          onChange={(e) => setSearchText(e.target.value)}
          className="max-w-md"
          size="large"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <Table
          columns={columns}
          dataSource={properties}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </div>

      {/* Property Detail Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Eye size={20} />
            <span className="text-lg font-semibold">Property Details</span>
          </div>
        }
        open={viewModalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
            Close
          </Button>,
          <Button
            key="edit"
            type="primary"
            onClick={() => {
              navigate(`/seller/add-property?edit=${selectedProperty?._id}`);
              handleCloseModal();
            }}
          >
            Edit Property
          </Button>,
        ]}
        width="95%"
        style={{
          maxWidth: '1000px',
          top: 20
        }}
        bodyStyle={{
          maxHeight: 'calc(100vh - 200px)',
          overflowY: 'auto',
          padding: '24px'
        }}
        className="property-detail-modal"
      >
        {selectedProperty && (
          <div className="space-y-6">
            {/* Image Gallery */}
            {selectedProperty.images && selectedProperty.images.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Images</h3>
                <Carousel autoplay>
                  {selectedProperty.images.map((img, index) => (
                    <div key={index}>
                      <img
                        src={getImageUrl(img.image_url)}
                        alt={`Property ${index + 1}`}
                        className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </Carousel>
              </div>
            )}

            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
              <Descriptions bordered column={{ xs: 1, sm: 1, md: 2 }}>
                <Descriptions.Item label="Title" span={2}>
                  {selectedProperty.title}
                </Descriptions.Item>
                <Descriptions.Item label="Description" span={2}>
                  {selectedProperty.description}
                </Descriptions.Item>
                <Descriptions.Item label="Property Type">
                  {selectedProperty.property_type}
                </Descriptions.Item>
                <Descriptions.Item label="Price">
                  ₹{selectedProperty.price?.toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={selectedProperty.status === "available" ? "green" : "red"}>
                    {selectedProperty.status?.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Verification">
                  <Tag color={selectedProperty.is_verified ? "green" : "orange"}>
                    {selectedProperty.is_verified ? "Verified" : "Pending"}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </div>

            {/* Location Information */}
            {selectedProperty.location && (
              selectedProperty.location.street ||
              selectedProperty.location.city ||
              selectedProperty.location.state ||
              selectedProperty.location.postal_code ||
              selectedProperty.location.country
            ) && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Location</h3>
                  <Descriptions bordered column={{ xs: 1, sm: 1, md: 2 }}>

                    {selectedProperty.location?.country && (
                      <Descriptions.Item label="Country" span={2}>
                        {selectedProperty.location.country}
                      </Descriptions.Item>
                    )}

                    {selectedProperty.location?.city && (
                      <Descriptions.Item label="City">
                        {selectedProperty.location.city}
                      </Descriptions.Item>
                    )}
                    {selectedProperty.location?.state && (
                      <Descriptions.Item label="State">
                        {selectedProperty.location.state}
                      </Descriptions.Item>
                    )}
                    {selectedProperty.location?.pincode && (
                      <Descriptions.Item label="Pincode">
                        {selectedProperty.location.pincode}
                      </Descriptions.Item>
                    )}

                  </Descriptions>
                </div>
              )}

            {/* Property Attributes */}
            {selectedProperty.key_attributes && selectedProperty.key_attributes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Property Attributes</h3>
                <Descriptions bordered column={{ xs: 1, sm: 1, md: 2 }}>
                  {selectedProperty.key_attributes.map((attr, index) => (
                    attr.key && attr.value && (
                      <Descriptions.Item key={index} label={attr.key}>
                        {attr.value}
                      </Descriptions.Item>
                    )
                  ))}
                </Descriptions>
              </div>
            )}

            {/* Amenities */}
            {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProperty.amenities.map((amenity, index) => (
                    <Tag key={index} color="blue">
                      {amenity}
                    </Tag>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            {selectedProperty.features && selectedProperty.features.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Features</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProperty.features.map((feature, index) => (
                    <Tag key={index} color="green">
                      {feature}
                    </Tag>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Information */}
            {(selectedProperty.createdAt ||
              selectedProperty.updatedAt ||
              selectedProperty.views !== undefined) && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Additional Information</h3>
                  <Descriptions bordered column={{ xs: 1, sm: 1, md: 2 }}>
                    {selectedProperty.createdAt && (
                      <Descriptions.Item label="Posted Date">
                        {new Date(selectedProperty.createdAt).toLocaleDateString()}
                      </Descriptions.Item>
                    )}
                    {selectedProperty.updatedAt && (
                      <Descriptions.Item label="Last Updated">
                        {new Date(selectedProperty.updatedAt).toLocaleDateString()}
                      </Descriptions.Item>
                    )}
                    {selectedProperty.views !== undefined && (
                      <Descriptions.Item label="Total Views" span={2}>
                        {selectedProperty.views}
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </div>
              )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyProperties;
