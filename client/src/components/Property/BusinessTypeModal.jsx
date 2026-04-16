import React, { useState, useEffect } from "react";
import { Modal, Radio, Button, message } from "antd";
import axios from "axios";

const BusinessTypeModal = ({ isOpen, user, onSelected }) => {
  const [businessTypes, setBusinessTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    const fetchBusinessTypes = async () => {
      try {
        setFetching(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/business-types?status=active`);
        setBusinessTypes(response.data);
      } catch (error) {
        console.error("Error fetching business types:", error);
        message.error("Failed to load business types");
      } finally {
        setFetching(false);
      }
    };

    if (isOpen) {
      fetchBusinessTypes();
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!selectedType) {
      message.warning("Please select a business type");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/users/update-user-by-id/${user._id}`,
        { businessType: selectedType },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data) {
        message.success("Business type saved successfully!");
        onSelected(response.data);
      }
    } catch (error) {
      console.error("Error saving business type:", error);
      message.error(error.response?.data?.error || "Failed to save business type");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Select Your Business Type"
      open={isOpen}
      onOk={handleSave}
      closable={false}
      maskClosable={false}
      confirmLoading={loading}
      footer={[
        <Button key="submit" type="primary" loading={loading} onClick={handleSave} className="w-full h-12 rounded-xl bg-blue-600 font-bold">
          Continue
        </Button>,
      ]}
      className="rounded-3xl overflow-hidden"
    >
      <div className="py-4">
        <p className="text-gray-500 mb-6">
          To provide the best experience, please select how you will be listing properties on Namma Pondy Properties.
          <span className="font-semibold text-gray-700 block mt-2">This selection is permanent once verified.</span>
        </p>

        <Radio.Group
          onChange={(e) => setSelectedType(e.target.value)}
          value={selectedType}
          className="w-full flex flex-col gap-3"
        >
          {businessTypes.map((type) => (
            <Radio.Button
              key={type._id}
              value={type._id}
              className={`h-16 flex items-center px-6 rounded-2xl border-2 transition-all ${
                selectedType === type._id ? "border-blue-600 bg-blue-50" : "border-gray-100 hover:border-blue-200"
              }`}
            >
              <div className="flex flex-col">
                <span className={`font-bold ${selectedType === type._id ? "text-blue-600" : "text-gray-800"}`}>
                  {type.name}
                </span>
              </div>
            </Radio.Button>
          ))}
        </Radio.Group>

        {fetching && <div className="text-center py-4">Loading options...</div>}
      </div>
    </Modal>
  );
};

export default BusinessTypeModal;
