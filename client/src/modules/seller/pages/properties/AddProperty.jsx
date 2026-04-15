import React, { useState, useEffect } from "react";
import PropertyForm from "../../../../components/Property/PropertyForm";
import axios from "axios";
import { message, Button, Spin } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import PhoneUpdateModal from "../../../../components/Common/PhoneUpdateModal";
import BusinessTypeModal from "../../../../components/Common/BusinessTypeModal";

const AddProperty = () => {
  const [loading, setLoading] = useState(false);
  const [verifyingLimit, setVerifyingLimit] = useState(true);
  const warnedRef = React.useRef(false);
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const [initialData, setInitialData] = useState({});

  const { user, refetchUser } = useAuth();

  // Mobile number prompt state
  // Business Type modal state
  const [showBusinessTypeModal, setShowBusinessTypeModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);


  useEffect(() => {
    // Show phone modal if user is logged in but has no phone number (only for new properties)
    if (user && !user.phone && !editId) {
      setShowPhoneModal(true);
    } else if (user && !user.businessType && !editId) {
      // Show business type modal if missing
      setShowBusinessTypeModal(true);
    }
  }, [user, editId]);

  const checkLimit = React.useCallback(async () => {
    try {
      setVerifyingLimit(true);
      // Fetch both subscription and properties
      const [subRes, propRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/subscriptions/my-subscription`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/properties/fetch-all-property?seller_id=${user._id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
      ]);

      const subscription = subRes.data;
      const properties = propRes.data.properties || [];
      
      const propertyLimit = subscription?.plan?.propertyLimit || 3;
      
      if (propertyLimit !== -1 && properties.length >= propertyLimit) {
        if (!warnedRef.current) {
          message.warning(`You have reached your limit of ${propertyLimit} properties. Please upgrade!`);
          warnedRef.current = true;
        }
        navigate("/seller/upgrade-plan");
        return;
      }
    } catch (error) {
      console.error("Error checking limit:", error);
    } finally {
      setVerifyingLimit(false);
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

  if (verifyingLimit && !editId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50/50">
        <Spin size="large" tip="Verifying your plan limits..." />
      </div>
    );
  }

  return (
    <div className="p-4 mt-18 md:p-8 bg-gray-50/50 min-h-screen">
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
          // navigate(-1);
        }}
        onSuccess={() => setShowPhoneModal(false)}
      />

      <BusinessTypeModal
        open={showBusinessTypeModal}
        onCancel={() => {
          setShowBusinessTypeModal(false);
          navigate(-1);
        }}
        onSuccess={() => {
          setShowBusinessTypeModal(false);
          refetchUser(); // Refresh user info to get the new role and businessType
        }}
      />
    </div>
  );
};

export default AddProperty;
