import React, { useState, useEffect } from "react";
import PropertyForm from "../../../../components/Property/PropertyForm";
import axios from "axios";
import { message } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";

const AddProperty = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const [initialData, setInitialData] = useState({});

  useEffect(() => {
    if (editId) {
      fetchProperty();
    }
  }, [editId]);

  const fetchProperty = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/properties/fetch-property-by-id/${editId}`);
      setInitialData(res.data);
    } catch (error) {
      console.error("Error fetching property:", error);
      // If 403 or 404, might be permissions or not found
      message.error("Failed to load property details");
    }
  };

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      if (editId) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/properties/update-property-by-id/${editId}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        message.success("Property updated successfully!");
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/properties/create-property`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        message.success("Property added successfully!");
      }
      navigate(editId ? -1 : "/seller/my-properties");
    } catch (error) {
      console.error("Error saving property:", error);
      const errorMessage = error.response?.data?.error;
      message.error(
        typeof errorMessage === "string"
          ? errorMessage
          : "Failed to save property",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        {editId ? "Edit Property" : "Add New Property"}
      </h1>
      <PropertyForm
        onSubmit={onSubmit}
        loading={loading}
        isSeller={true}
        initialData={initialData}
        isEdit={!!editId}
      />
    </div>
  );
};

export default AddProperty;
