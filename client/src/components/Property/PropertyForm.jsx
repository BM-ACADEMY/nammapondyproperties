import React, { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Country, State, City } from "country-state-city";
import { toast } from "react-hot-toast";
import axios from "axios";
import { X, Upload, Plus, Trash2, MapPin } from "lucide-react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function LocationMarker({ position, setPosition, setValue }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      setValue("location.latitude", e.latlng.lat);
      setValue("location.longitude", e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : <Marker position={position}></Marker>;
}

// Component to recenter map programmatically
function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], map.getZoom());
    }
  }, [lat, lng, map]);
  return null;
}

const PropertyForm = ({
  initialData = {},
  onSubmit,
  loading = false,
  isEdit = false,
  isSeller = false,
}) => {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      price: initialData?.price || "",
      area_size: initialData?.area_size || "",
      property_type: initialData?.property_type || "",
      approval: initialData?.approval || "",
      location: {
        address_line_1: initialData?.location?.address_line_1 || "",
        address_line_2: initialData?.location?.address_line_2 || "",
        country: initialData?.location?.country || "IN", // Default to India
        state: initialData?.location?.state || "",
        city: initialData?.location?.city || "",
        pincode: initialData?.location?.pincode || "",
      },
      key_attributes: initialData?.key_attributes || [{ key: "", value: "" }],
      advertiseOnSocialMedia: initialData?.advertiseOnSocialMedia || false,
    },
  });

  // Reset form when initialData changes (for edit mode)
  useEffect(() => {
    if (isEdit && initialData && Object.keys(initialData).length > 0) {
      // Construct the reset object to match defaultValues structure
      const resetValues = {
        title: initialData.title || "",
        description: initialData.description || "",
        price: initialData.price || "",
        area_size: initialData.area_size || "",
        property_type: initialData.property_type || "",
        approval: initialData.approval || "",
        location: {
          address_line_1: initialData.location?.address_line_1 || "",
          address_line_2: initialData.location?.address_line_2 || "",
          country: initialData.location?.country || "IN",
          state: initialData.location?.state || "",
          city: initialData.location?.city || "",

          pincode: initialData.location?.pincode || "",
          latitude: initialData.location?.latitude || "",
          longitude: initialData.location?.longitude || "",
        },
        key_attributes: initialData.key_attributes || [{ key: "", value: "" }],
        advertiseOnSocialMedia: initialData.advertiseOnSocialMedia || false,
        isSold: initialData.isSold || false,
        soldPrice: initialData.soldPrice || "",
      };
      // We also need to update existing images state
      setExistingImages(initialData.images || []);

      // Use the reset function from react-hook-form (need to destructure it)
      reset(resetValues);
    }
  }, [initialData, isEdit, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "key_attributes",
  });

  const [propertyTypes, setPropertyTypes] = useState([]);
  const [approvalTypes, setApprovalTypes] = useState([]);

  // Image State
  const [images, setImages] = useState([]); // New files
  const [existingImages, setExistingImages] = useState(
    initialData?.images || [],
  ); // URLs
  const [imagePreviews, setImagePreviews] = useState([]); // Previews for new files

  const [imagesToDelete, setImagesToDelete] = useState([]);

  // Location State
  const selectedCountry = watch("location.country");
  const selectedState = watch("location.state");
  const selectedCity = watch("location.city");
  const [mapPosition, setMapPosition] = useState(null);

  // Auto-center map when city changes
  useEffect(() => {
    if (selectedCity && selectedState && selectedCountry) {
      const cities = City.getCitiesOfState(selectedCountry, selectedState);
      const cityData = cities.find((c) => c.name === selectedCity);
      if (cityData && cityData.latitude && cityData.longitude) {
        const lat = parseFloat(cityData.latitude);
        const lng = parseFloat(cityData.longitude);
        setMapPosition({ lat, lng });
        setValue("location.latitude", lat);
        setValue("location.longitude", lng);
      }
    }
  }, [selectedCity, selectedState, selectedCountry, setValue]);

  useEffect(() => {
    if (initialData?.location?.latitude && initialData?.location?.longitude) {
      setMapPosition({
        lat: initialData.location.latitude,
        lng: initialData.location.longitude,
      });
    } else {
      // Default to Pondicherry if no location
      setMapPosition({ lat: 11.9416, lng: 79.8083 });
    }
  }, [initialData]);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const queryParam = isSeller ? "?role=seller" : "";
        const [pTypes, aTypes] = await Promise.all([
          axios.get(
            `${import.meta.env.VITE_API_URL}/properties/property-types${queryParam}`,
          ),
          axios.get(
            `${import.meta.env.VITE_API_URL}/properties/approval-types${queryParam}`,
          ),
        ]);
        setPropertyTypes(pTypes.data);
        setApprovalTypes(aTypes.data);
      } catch (error) {
        console.error("Error fetching types", error);
        // Fallback or Toast
      }
    };
    fetchTypes();
  }, [isSeller]);

  // Handle Image Selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const totalCurrentImages = images.length + existingImages.length;

    if (totalCurrentImages + files.length > 10) {
      toast.error("Maximum 10 images allowed");
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  // Remove New Image
  const removeNewImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviews = [...imagePreviews];
    URL.revokeObjectURL(newPreviews[index]); // Cleanup memory
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  // Remove Existing Image
  const removeExistingImage = (index) => {
    const imageToRemove = existingImages[index];
    setImagesToDelete([
      ...imagesToDelete,
      imageToRemove._id || imageToRemove, // Use ID if available (standard), else whatever it is
    ]); // Store ID to delete

    const newExisting = [...existingImages];
    newExisting.splice(index, 1);
    setExistingImages(newExisting);
  };

  const handleFormSubmit = (data) => {
    // Prepare FormData or Object based on requirement
    // Usually FormData for file uploads
    const formData = new FormData();

    // Basic Fields
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("price", data.price);
    formData.append("area_size", data.area_size);
    formData.append("property_type", data.property_type);
    formData.append("approval", data.approval);

    // Structured Location - Stringify for FormData
    formData.append("location", JSON.stringify(data.location));

    // Key Attributes
    formData.append("key_attributes", JSON.stringify(data.key_attributes));

    // New Images
    images.forEach((image) => {
      formData.append("images", image);
    });

    // Images to Delete (only for edit)
    if (isEdit && imagesToDelete.length > 0) {
      formData.append("images_to_delete", JSON.stringify(imagesToDelete));
    }

    // Advertisement flag
    formData.append("advertiseOnSocialMedia", data.advertiseOnSocialMedia);

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Basic Details Card */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
          Basic Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Property Title <span className="text-red-500">*</span>
            </label>
            <input
              {...register("title", { required: "Title is required" })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
              placeholder="e.g. Luxurious 3BHK Villa in White Town"
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register("description", {
                required: "Description is required",
              })}
              rows="4"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 bg-gray-50/30"
              placeholder="Describe your property in detail..."
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Price (₹) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                ₹
              </span>
              <input
                type="number"
                {...register("price", { required: "Price is required" })}
                className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="0.00"
              />
            </div>
            {errors.price && (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {errors.price.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Area Size <span className="text-red-500">*</span>
            </label>
            <input
              {...register("area_size", { required: "Area size is required" })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              placeholder="e.g. 1500 sqft"
            />
            {errors.area_size && (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {errors.area_size.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Property Type <span className="text-red-500">*</span>
            </label>
            <select
              {...register("property_type", {
                required: "Property Type is required",
                onChange: (e) => {
                  const selectedTypeName = e.target.value;
                  const selectedType = propertyTypes.find(
                    (t) => t.name === selectedTypeName,
                  );

                  if (selectedType && selectedType.key_attributes) {
                    // Use getValues to avoid React Compiler warning about watch in event handler
                    const currentAttributes = getValues("key_attributes") || [];
                    const existingKeys = currentAttributes.map((a) => a.key);

                    const newAttributes = selectedType.key_attributes
                      .filter((attr) => !existingKeys.includes(attr))
                      .map((attr) => ({ key: attr, value: "" }));

                    if (newAttributes.length > 0) {
                      // Append new attributes
                      // using setValue instead of append to avoid field array issues with async state
                      const updatedAttributes = [
                        ...currentAttributes,
                        ...newAttributes,
                      ];
                      // If the first item is empty/default, remove it if we added new ones
                      if (
                        updatedAttributes.length > 1 &&
                        updatedAttributes[0].key === "" &&
                        updatedAttributes[0].value === ""
                      ) {
                        updatedAttributes.shift();
                      }
                      setValue("key_attributes", updatedAttributes);
                    }
                  }
                },
              })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white"
            >
              <option value="">Select Type</option>
              {propertyTypes.map((type) => (
                <option key={type._id || type.name} value={type.name}>
                  {type.name}
                </option>
              ))}
            </select>
            {errors.property_type && (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {errors.property_type.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Approval Type <span className="text-red-500">*</span>
            </label>
            <select
              {...register("approval", {
                required: "Approval Type is required",
              })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white"
            >
              <option value="">Select Approval</option>
              {approvalTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.approval && (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {errors.approval.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Location Card */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <div className="w-1 h-6 bg-green-500 rounded-full"></div>
          Location Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Address Line 1 <span className="text-red-500">*</span>
            </label>
            <input
              {...register("location.address_line_1", {
                required: "Address Line 1 is required",
              })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              placeholder="Street / Building Name"
            />
            {errors.location?.address_line_1?.message && (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {errors.location.address_line_1.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Address Line 2 (Optional)
            </label>
            <input
              {...register("location.address_line_2")}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              placeholder="Apartment / Unit No."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Country
            </label>
            <Controller
              control={control}
              name="location.country"
              render={({ field }) => (
                <select
                  {...field}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white"
                  onChange={(e) => {
                    field.onChange(e);
                    setValue("location.state", ""); // Reset state
                    setValue("location.city", ""); // Reset city
                  }}
                >
                  <option value="">Select Country</option>
                  {Country.getAllCountries().map((country) => (
                    <option key={country.isoCode} value={country.isoCode}>
                      {country.name}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              State
            </label>
            <Controller
              control={control}
              name="location.state"
              render={({ field }) => (
                <select
                  {...field}
                  disabled={!selectedCountry}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white disabled:bg-gray-50 disabled:text-gray-400"
                  onChange={(e) => {
                    field.onChange(e);
                    setValue("location.city", ""); // Reset city
                  }}
                >
                  <option value="">Select State</option>
                  {selectedCountry &&
                    State.getStatesOfCountry(selectedCountry).map((state) => (
                      <option key={state.isoCode} value={state.isoCode}>
                        {state.name}
                      </option>
                    ))}
                </select>
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              City
            </label>
            <Controller
              control={control}
              name="location.city"
              render={({ field }) => (
                <select
                  {...field}
                  disabled={!selectedState}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">Select City</option>
                  {selectedState &&
                    City.getCitiesOfState(selectedCountry, selectedState).map(
                      (city) => (
                        <option key={city.name} value={city.name}>
                          {city.name}
                        </option>
                      ),
                    )}
                </select>
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Pincode <span className="text-red-500">*</span>
            </label>
            <input
              {...register("location.pincode", {
                required: "Pincode is required",
              })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              placeholder="123456"
            />
            {errors.location?.pincode?.message && (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {errors.location.pincode.message}
              </p>
            )}
          </div>
        </div>

        {/* Map Section */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <MapPin size={16} className="text-red-500" /> Pin Location on Map
          </label>
          <div className="h-[350px] w-full rounded-lg overflow-hidden border border-gray-300 z-0 shadow-inner">
            {mapPosition && (
              <MapContainer
                center={mapPosition}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker
                  position={mapPosition}
                  setPosition={setMapPosition}
                  setValue={setValue}
                />
                <RecenterMap lat={mapPosition.lat} lng={mapPosition.lng} />
              </MapContainer>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Latitude
              </label>
              <input
                {...register("location.latitude")}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                placeholder="Ex: 11.9416"
                readOnly
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Longitude
              </label>
              <input
                {...register("location.longitude")}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                placeholder="Ex: 79.8083"
                readOnly
              />
            </div>
          </div>
        </div>
      </div>

      {/* Key Attributes Card */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
          Key Attributes
        </h3>
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300"
            >
              <div className="flex-1 w-full">
                <input
                  {...register(`key_attributes.${index}.key`)}
                  placeholder="Attribute Name (e.g. Bedrooms)"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white font-medium"
                />
              </div>
              <div className="hidden sm:block text-gray-400">:</div>
              <div className="flex-1 w-full">
                <input
                  {...register(`key_attributes.${index}.value`, {
                    required: "Value is required",
                  })}
                  placeholder="Value (e.g. 3)"
                  className={`w-full px-4 py-2 border ${errors.key_attributes?.[index]?.value ? "border-red-500" : "border-gray-200"} rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white`}
                />
              </div>
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-gray-400 hover:text-red-500 p-2 transition-colors self-end sm:self-auto"
                title="Remove Attribute"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => append({ key: "", value: "" })}
            className="flex items-center justify-center w-full py-3 text-sm text-blue-600 hover:text-blue-700 font-semibold border border-dashed border-blue-300 rounded-xl hover:bg-blue-50 transition-all"
          >
            <Plus size={18} className="mr-2" /> Add New Attribute
          </button>
        </div>
      </div>

      {/* Image Upload Card */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <div className="w-1 h-6 bg-orange-500 rounded-full"></div>
          Property Images
        </h3>

        <div className="grid grid-cols-1 gap-6">
          <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-blue-200 rounded-2xl cursor-pointer bg-blue-50/50 hover:bg-blue-50 hover:border-blue-400 transition-all group">
            <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-gray-900 font-medium mb-1">
                Click to upload images
              </p>
              <p className="text-sm text-gray-500">
                SVG, PNG, JPG (Max 10 images)
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
          </div>

          {/* Previews */}
          {(existingImages.length > 0 || imagePreviews.length > 0) && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {existingImages.map((img, index) => (
                <div
                  key={`existing-${index}`}
                  className="relative group rounded-xl overflow-hidden shadow-sm hover:shadow-md aspect-square border border-gray-100"
                >
                  <img
                    src={`${import.meta.env.VITE_API_URL.replace("/api", "")}${img.image_url || img}`}
                    alt={`Existing ${index}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect width='150' height='150' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='12' fill='%239ca3af' dominant-baseline='middle' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="bg-white text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors shadow-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {imagePreviews.map((src, index) => (
                <div
                  key={`new-${index}`}
                  className="relative group rounded-xl overflow-hidden shadow-sm hover:shadow-md aspect-square border border-gray-100"
                >
                  <img
                    src={src}
                    alt={`Preview ${index}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="bg-white text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors shadow-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Advertisement Opt-in */}
      {isSeller && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              {...register("advertiseOnSocialMedia")}
              id="advertiseOnSocialMedia"
              className="mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div className="flex-1">
              <label
                htmlFor="advertiseOnSocialMedia"
                className="block text-base font-semibold text-gray-800 cursor-pointer"
              >
                Advertise this property on social media
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Enable this to allow admins to promote your property and contact
                details on social media platforms for better reach.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end pt-4 pb-8 sticky bottom-4 z-[999]">
        <div className="bg-white/95 backdrop-blur-md p-2 rounded-xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] border border-gray-200 flex gap-4">
          <button
            type="button"
            className="px-6 py-3 text-gray-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => window.history.back()}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:translate-y-[-1px] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>Saving...</>
            ) : (
              <>{isEdit ? "Update Property" : "Publish Property"}</>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default PropertyForm;
