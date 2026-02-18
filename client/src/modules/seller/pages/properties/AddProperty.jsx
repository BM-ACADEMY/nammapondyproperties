import React, { useState, useEffect } from "react";
import PropertyForm from "../../../../components/Property/PropertyForm";
import axios from "axios";
import { message } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const AddProperty = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const [initialData, setInitialData] = useState({});

  const { user } = useAuth();

  const checkLimit = React.useCallback(async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/properties/fetch-all-property?seller_id=${user._id}`,
      );
      if (res.data.properties && res.data.properties.length >= 2) {
        navigate("/seller/request-limit");
      }
    } catch (error) {
      console.error("Error checking limit:", error);
    }
  }, [user, navigate]);

  const fetchProperty = React.useCallback(async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/properties/fetch-property-by-id/${editId}`,
      );
      setInitialData(res.data);
    } catch (error) {
      console.error("Error fetching property:", error);
      message.error("Failed to load property details");
    }
  }, [editId]);

  useEffect(() => {
    if (editId) {
      fetchProperty();
    } else {
      if (user) {
        checkLimit();
      }
    }
  }, [editId, checkLimit, fetchProperty, user]);

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
          },
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
    <div className="p-4 md:p-8 bg-gray-50/50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {editId ? "Edit Property" : "Add New Property"}
          </h1>
          <p className="text-gray-500">
            {editId
              ? "Update your property details and information."
              : "Fill in the details below to list a new property."}
          </p>
        </div>

        <PropertyForm
          onSubmit={onSubmit}
          loading={loading}
          isSeller={true}
          initialData={initialData}
          isEdit={!!editId}
        />
      </div>
    </div>
  );
};

export default AddProperty;
