import React, { useState, useEffect } from "react";
import PropertyForm from "../../../../components/Property/PropertyForm";
import axios from "axios";
import { message, Button } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import PhoneUpdateModal from "../../../../components/Common/PhoneUpdateModal";

const AddProperty = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const [initialData, setInitialData] = useState({});

  const { user, refetchUser } = useAuth();

  // Mobile number prompt state
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  useEffect(() => {
    // Show modal if user is logged in but has no phone number (only for new properties)
    if (user && !user.phone && !editId) {
      setShowPhoneModal(true);
    }
  }, [user, editId]);

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
    let response = null;

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
        response = await axios.post(
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

        // 🔄 Refetch user to get the new 'SELLER' role
        await refetchUser();
      }

      // Redirect to My Properties in the dashboard
      navigate(
        `/seller/my-properties?success=true${!editId ? `&property_id=${response.data._id}` : ""}`,
      );
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
      <div className="max-w-8xl mx-auto">
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
          user={user}
        />
      </div>

      <PhoneUpdateModal
        isOpen={showPhoneModal}
        onClose={() => {
          setShowPhoneModal(false);
          navigate(-1);
        }}
        onSuccess={() => setShowPhoneModal(false)}
      />
    </div>
  );
};

export default AddProperty;
