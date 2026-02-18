import React, { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Country, State, City } from "country-state-city";
import { toast } from "react-hot-toast";
import axios from "axios";
import { X, Upload, Plus, Trash2, MapPin } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
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

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

// Component to recenter map programmatically
function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], map.getZoom());
    }
  }, [lat, lng]);
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
      const cityData = cities.find(c => c.name === selectedCity);
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
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-8 bg-white p-6 rounded-xl shadow-sm"
    >
      {/* Basic Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Property Title
          </label>
          <input
            {...register("title", { required: "Title is required" })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            placeholder="e.g. Luxurious 3BHK Villa"
          />
          {errors.title && (
            <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            {...register("description", {
              required: "Description is required",
            })}
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            placeholder="Detailed description..."
          />
          {errors.description && (
            <p className="text-red-500 text-xs mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price (₹)
          </label>
          <input
            type="number"
            {...register("price", { required: "Price is required" })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            placeholder="0.00"
          />
          {errors.price && (
            <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Area Size
          </label>
          <input
            {...register("area_size", { required: "Area size is required" })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            placeholder="e.g. 1500 sqft"
          />
          {errors.area_size && (
            <p className="text-red-500 text-xs mt-1">
              {errors.area_size.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Property Type
          </label>
          <select
            {...register("property_type", {
              required: "Property Type is required",
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          >
            <option value="">Select Type</option>
            {propertyTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.property_type && (
            <p className="text-red-500 text-xs mt-1">
              {errors.property_type.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Approval Type
          </label>
          <select
            {...register("approval", { required: "Approval Type is required" })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          >
            <option value="">Select Approval</option>
            {approvalTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.approval && (
            <p className="text-red-500 text-xs mt-1">
              {errors.approval.message}
            </p>
          )}
        </div>
      </div>

      {/* Location Section */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Location Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 1
            </label>
            <input
              {...register("location.address_line_1", {
                required: "Address Line 1 is required",
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="Street / Building Name"
            />
            {errors.location?.address_line_1?.message && (
              <p className="text-red-500 text-xs mt-1">
                {errors.location.address_line_1.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 2 (Optional)
            </label>
            <input
              {...register("location.address_line_2")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="Apartment / Unit No."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <Controller
              control={control}
              name="location.country"
              render={({ field }) => (
                <select
                  {...field}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <Controller
              control={control}
              name="location.state"
              render={({ field }) => (
                <select
                  {...field}
                  disabled={!selectedCountry}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <Controller
              control={control}
              name="location.city"
              render={({ field }) => (
                <select
                  {...field}
                  disabled={!selectedState}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pincode
            </label>
            <input
              {...register("location.pincode", {
                required: "Pincode is required",
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="123456"
            />
            {errors.location?.pincode?.message && (
              <p className="text-red-500 text-xs mt-1">
                {errors.location.pincode.message}
              </p>
            )}
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pin Location on Map
          </label>
          <div className="h-[300px] w-full rounded-lg overflow-hidden border border-gray-300 z-0">
            {mapPosition && (
              <MapContainer
                center={mapPosition}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={mapPosition} setPosition={setMapPosition} setValue={setValue} />
                <RecenterMap lat={mapPosition.lat} lng={mapPosition.lng} />
              </MapContainer>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <label className="block text-xs text-gray-500">Latitude</label>
              <input
                {...register("location.latitude")}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                placeholder="Ex: 11.9416"
                onChange={(e) => {
                  setValue("location.latitude", e.target.value);
                  const lat = parseFloat(e.target.value);
                  const lng = parseFloat(getValues("location.longitude"));
                  if (!isNaN(lat) && !isNaN(lng)) {
                    setMapPosition({ lat, lng });
                  }
                }}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500">Longitude</label>
              <input
                {...register("location.longitude")}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                placeholder="Ex: 79.8083"
                onChange={(e) => {
                  setValue("location.longitude", e.target.value);
                  const lng = parseFloat(e.target.value);
                  const lat = parseFloat(getValues("location.latitude"));
                  if (!isNaN(lat) && !isNaN(lng)) {
                    setMapPosition({ lat, lng });
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Key Attributes */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Key Attributes
        </h3>
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-4 items-center">
              <input
                {...register(`key_attributes.${index}.key`)}
                placeholder="Key (e.g. Bedrooms)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                {...register(`key_attributes.${index}.value`)}
                placeholder="Value (e.g. 3)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-red-500 hover:text-red-700 p-2"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => append({ key: "", value: "" })}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium mt-2"
          >
            <Plus size={16} className="mr-1" /> Add Attribute
          </button>
        </div>
      </div>

      {/* Image Upload */}
      <div className="border-t pt-6">
        <label className="block text-lg font-semibold text-gray-800 mb-4">
          Property Images (Max 10)
        </label>

        <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors">
          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
            <Upload className="w-8 h-8 text-blue-500 mb-2" />
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-blue-600">
                Click to upload
              </span>{" "}
              or drag and drop
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {existingImages.map((img, index) => (
            <div
              key={`existing-${index}`}
              className="relative group rounded-xl overflow-hidden shadow-sm hover:shadow-md h-32"
            >
              <img
                src={`${import.meta.env.VITE_API_URL.replace("/api", "")}${img.image_url || img}`} // Handle object or string
                alt={`Existing ${index}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect width='150' height='150' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='12' fill='%239ca3af' dominant-baseline='middle' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E";
                }} // Fallback
              />
              <button
                type="button"
                onClick={() => removeExistingImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          {imagePreviews.map((src, index) => (
            <div
              key={`new-${index}`}
              className="relative group rounded-xl overflow-hidden shadow-sm hover:shadow-md h-32"
            >
              <img
                src={src}
                alt={`Preview ${index}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeNewImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Advertisement Opt-in */}
      {isSeller && (
        <div className="border-t pt-6">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              {...register("advertiseOnSocialMedia")}
              id="advertiseOnSocialMedia"
              className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div className="flex-1">
              <label
                htmlFor="advertiseOnSocialMedia"
                className="block text-sm font-medium text-gray-700 cursor-pointer"
              >
                Advertise this property on social media
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Enable this to allow admins to promote your property and contact details on social media platforms.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition disabled:opacity-50"
        >
          {loading ? "Saving..." : isEdit ? "Update Property" : "Add Property"}
        </button>
      </div>
    </form >
  );
};

export default PropertyForm;
