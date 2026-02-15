import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import axios from "axios";
import { toast } from "react-hot-toast";

const AddProperty = () => {
    const { register, control, handleSubmit, setValue, formState: { errors } } = useForm({
        defaultValues: {
            key_attributes: [{ key: "", value: "" }],
            property_type: "Plot",
            approval: "DTCP"
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "key_attributes"
    });

    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [imagePreviews, setImagePreviews] = useState([]);

    // Admin specific type
    const propertyTypes = ["Plot", "Villa", "Apartment", "Commercial", "realestate_with_kamar"];
    const approvalTypes = ["DTCP", "RERA", "PPA", "CMDA"];

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (images.length + files.length > 10) {
            toast.error("Maximum 10 images allowed");
            return;
        }

        const newImages = [...images, ...files];
        setImages(newImages);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews([...imagePreviews, ...newPreviews]);
        toast.success(`${files.length} image(s) added`);
    };

    const removeImage = (index) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);

        const newPreviews = [...imagePreviews];
        URL.revokeObjectURL(newPreviews[index]);
        newPreviews.splice(index, 1);
        setImagePreviews(newPreviews);

        toast.success("Image removed");
    };

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const onSubmit = async (data) => {
        setLoading(true);
        const formData = new FormData();

        // Basic Fields
        formData.append("title", data.title);
        formData.append("description", data.description);
        formData.append("price", data.price);
        formData.append("location", data.location);
        formData.append("area_size", data.area_size);
        formData.append("property_type", data.property_type);
        formData.append("approval", data.approval);

        // Images
        images.forEach((image) => {
            formData.append("images", image);
        });

        // Key Attributes - convert to JSON string
        formData.append("key_attributes", JSON.stringify(data.key_attributes));

        // Status & User
        formData.append("status", "available");
        formData.append("is_verified", "true");

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/properties/create-property`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            toast.success("Property added successfully!");
            // Reset form
            setValue("title", "");
            setValue("description", "");
            setValue("price", "");
            setValue("location", "");
            setValue("area_size", "");
            // Reset Arrays
            setImages([]);
            setImagePreviews([]);
        } catch (error) {
            console.error("Error adding property:", error);
            toast.error(error.response?.data?.error || "Failed to add property");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Add New Property</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-xl shadow-lg space-y-6">

                {/* Title & Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                        <input
                            {...register("title", { required: "Title is required" })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="e.g. Luxury Villa in OMR"
                        />
                        {errors.title && <span className="text-red-500 text-xs">{errors.title.message}</span>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        <input
                            {...register("location", { required: "Location is required" })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="City, Area"
                        />
                        {errors.location && <span className="text-red-500 text-xs">{errors.location.message}</span>}
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                        {...register("description", { required: "Description is required" })}
                        rows="4"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="Detailed description of the property..."
                    ></textarea>
                    {errors.description && <span className="text-red-500 text-xs">{errors.description.message}</span>}
                </div>

                {/* Price & Area */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
                        <input
                            type="number"
                            {...register("price", { required: "Price is required" })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="0.00"
                        />
                        {errors.price && <span className="text-red-500 text-xs">{errors.price.message}</span>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Area Size</label>
                        <input
                            {...register("area_size", { required: "Area size is required" })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="e.g. 1200 sqft"
                        />
                        {errors.area_size && <span className="text-red-500 text-xs">{errors.area_size.message}</span>}
                    </div>
                </div>

                {/* Types */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                        <select
                            {...register("property_type")}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        >
                            {propertyTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Approval Type</label>
                        <select
                            {...register("approval")}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        >
                            {approvalTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Key Attributes */}
                <div className="border-t pt-4">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Key Attributes</h3>
                    <div className="space-y-3">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex gap-4 items-center">
                                <input
                                    {...register(`key_attributes.${index}.key`)}
                                    placeholder="Key (e.g. Bedrooms)"
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                                <input
                                    {...register(`key_attributes.${index}.value`)}
                                    placeholder="Value (e.g. 3)"
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                                <button type="button" onClick={() => remove(index)} className="text-red-500 hover:text-red-700">
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => append({ key: "", value: "" })}
                            className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            + Add Attribute
                        </button>
                    </div>
                </div>

                {/* Image Upload */}
                <div className="border-t pt-6">
                    <label className="block text-lg font-medium text-gray-800 mb-4">Property Images (Max 10)</label>

                    <div className="flex items-center justify-center w-full mb-6">
                        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors duration-300">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <svg className="w-10 h-10 mb-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                <p className="mb-2 text-sm text-gray-600"><span className="font-semibold text-blue-600">Click to upload</span> or drag and drop</p>
                                <p className="text-xs text-gray-500">PNG, JPG, JPEG, WEBP (MAX. 10 files)</p>
                            </div>
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
                    {images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {images.map((file, index) => (
                                <div key={index} className="relative group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    <div className="aspect-square relative">
                                        <img
                                            src={imagePreviews[index]}
                                            alt={`Preview ${index}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 hover:bg-red-600 shadow-md"
                                            title="Remove Image"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        </button>
                                    </div>
                                    <div className="p-2 text-center bg-gray-50 border-t border-gray-100">
                                        <p className="text-xs font-medium text-gray-700 truncate" title={file.name}>{file.name}</p>
                                        <p className="text-[10px] text-gray-500 mt-0.5">{formatSize(file.size)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end pt-6">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Adding..." : "Add Property"}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default AddProperty;
