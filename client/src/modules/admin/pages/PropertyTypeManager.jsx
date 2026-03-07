import React, { useState, useEffect } from "react";
import api from "@/services/api";
import {
    Plus,
    Edit,
    Trash2,
    Check,
    X,
    Search,
    Layout,
    Home,
    Building2,
    Square,
    Bed,
    Layers,
    Image as ImageIcon,
    Upload,
} from "lucide-react";
import { toast } from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL.replace("/api", "");


const PropertyTypeManager = () => {
    const [types, setTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingType, setEditingType] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        usageType: "Residential",
        hasRooms: false,
        hasFloor: false,
        hasPlot: false,
        hasCommercial: false,
        status: "active",
        image: null,
    });
    const [imagePreview, setImagePreview] = useState(null);


    const fetchTypes = async () => {
        setIsLoading(true);
        try {
            const response = await api.get("/property-types");
            setTypes(response.data);
        } catch (error) {
            toast.error("Failed to fetch property types");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTypes();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        if (type === "file") {
            const file = files[0];
            setFormData((prev) => ({ ...prev, [name]: file }));
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreview(reader.result);
                };
                reader.readAsDataURL(file);
            }
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: type === "checkbox" ? checked : value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach((key) => {
            if (key === "image" && formData[key]) {
                data.append("image", formData[key]);
            } else if (key !== "image") {
                data.append(key, formData[key]);
            }
        });

        try {
            if (editingType) {
                await api.put(`/property-types/${editingType._id}`, data, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                toast.success("Property type updated successfully");
            } else {
                await api.post("/property-types", data, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                toast.success("Property type created successfully");
            }
            setIsModalOpen(false);
            setEditingType(null);
            setFormData({
                name: "",
                usageType: "Residential",
                hasRooms: false,
                hasFloor: false,
                hasPlot: false,
                hasCommercial: false,
                status: "active",
                image: null,
            });
            setImagePreview(null);
            fetchTypes();
        } catch (error) {
            toast.error(error.response?.data?.error || "Something went wrong");
        }
    };

    const handleEdit = (type) => {
        setEditingType(type);
        setFormData({
            name: type.name,
            usageType: type.usageType,
            hasRooms: type.hasRooms,
            hasFloor: type.hasFloor,
            hasPlot: type.hasPlot,
            hasCommercial: type.hasCommercial,
            status: type.status,
            image: null,
        });
        setImagePreview(type.imageUrl ? `${API_URL}${type.imageUrl}` : null);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this property type?")) {
            try {
                await api.delete(`/property-types/${id}`);
                toast.success("Property type deleted successfully");
                fetchTypes();
            } catch (error) {
                toast.error("Failed to delete property type");
            }
        }
    };

    const filteredTypes = types.filter((t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Property Types</h1>
                        <p className="text-gray-500">Manage property types and their form fields</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingType(null);
                            setFormData({
                                name: "",
                                usageType: "Residential",
                                hasRooms: false,
                                hasFloor: false,
                                hasPlot: false,
                                hasCommercial: false,
                                status: "active",
                                image: null,
                            });
                            setImagePreview(null);
                            setIsModalOpen(true);
                        }}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Type
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search property types..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="bg-white h-48 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                ) : filteredTypes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTypes.map((type) => (
                            <div
                                key={type._id}
                                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative overflow-hidden"
                            >
                                {/* Status Badge */}
                                <div className="absolute top-4 right-4">
                                    <span
                                        className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${type.status === "active"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                            }`}
                                    >
                                        {type.status}
                                    </span>
                                </div>

                                <div className="flex items-center gap-4 mb-4">
                                    <div className="relative">
                                        <div className={`p-3 rounded-lg ${type.usageType === "Residential" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}>
                                            {type.imageUrl ? (
                                                <img 
                                                    src={`${API_URL}${type.imageUrl}`} 
                                                    alt={type.name} 
                                                    className="w-8 h-8 object-cover rounded"
                                                />
                                            ) : (
                                                type.usageType === "Residential" ? <Home className="w-6 h-6" /> : <Building2 className="w-6 h-6" />
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{type.name}</h3>
                                        <p className="text-xs text-gray-500">{type.usageType}</p>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-6">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Enabled Fields</p>
                                    <div className="flex flex-wrap gap-2">
                                        {type.hasRooms && (
                                            <span className="flex items-center gap-1 text-[11px] bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-medium">
                                                <Bed className="w-3 h-3" /> Rooms
                                            </span>
                                        )}
                                        {type.hasFloor && (
                                            <span className="flex items-center gap-1 text-[11px] bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-medium">
                                                <Layers className="w-3 h-3" /> Floor
                                            </span>
                                        )}
                                        {type.hasPlot && (
                                            <span className="flex items-center gap-1 text-[11px] bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-medium">
                                                <Square className="w-3 h-3" /> Plot
                                            </span>
                                        )}
                                        {type.hasCommercial && (
                                            <span className="flex items-center gap-1 text-[11px] bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-medium">
                                                <Building2 className="w-3 h-3" /> Commercial
                                            </span>
                                        )}
                                        {!type.hasRooms && !type.hasFloor && !type.hasPlot && !type.hasCommercial && (
                                            <span className="text-[11px] text-gray-400 italic">No specific sections</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                                    <button
                                        onClick={() => handleEdit(type)}
                                        className="flex-1 flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 rounded-lg text-sm transition-colors"
                                    >
                                        <Edit className="w-4 h-4" /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(type._id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-12 text-center rounded-2xl border-2 border-dashed border-gray-200">
                        <Layout className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No property types found</h3>
                        <p className="text-gray-500 mb-6">Start by adding your first property type configuration.</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                            Add New Type
                        </button>
                    </div>
                )}

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={() => setIsModalOpen(false)}
                        ></div>
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {editingType ? "Edit Property Type" : "Add New Property Type"}
                                </h2>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Type Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Flat / Apartment"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Usage Category
                                    </label>
                                    <select
                                        name="usageType"
                                        value={formData.usageType}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    >
                                        <option value="Residential">Residential</option>
                                        <option value="Commercial">Commercial</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Type Image
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                                            {imagePreview ? (
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon className="w-6 h-6 text-gray-300" />
                                            )}
                                        </div>
                                        <label className="flex-1">
                                            <div className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                                <Upload className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm font-medium text-gray-600">
                                                    {formData.image ? formData.image.name : "Upload Image"}
                                                </span>
                                            </div>
                                            <input
                                                type="file"
                                                name="image"
                                                accept="image/*"
                                                onChange={handleInputChange}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                    <p className="mt-1.5 text-[11px] text-gray-500">
                                        Recommended: SVG or small PNG/JPG, max 5MB
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Form Configuration (Select sections to show)
                                    </label>

                                    <div className="grid grid-cols-2 gap-4">
                                        <label className="flex items-center p-3 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                                            <input
                                                type="checkbox"
                                                name="hasRooms"
                                                checked={formData.hasRooms}
                                                onChange={handleInputChange}
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mr-3"
                                            />
                                            <span className="text-sm font-medium text-gray-700">Rooms / BHK</span>
                                        </label>

                                        <label className="flex items-center p-3 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                                            <input
                                                type="checkbox"
                                                name="hasFloor"
                                                checked={formData.hasFloor}
                                                onChange={handleInputChange}
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mr-3"
                                            />
                                            <span className="text-sm font-medium text-gray-700">Floor Details</span>
                                        </label>

                                        <label className="flex items-center p-3 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                                            <input
                                                type="checkbox"
                                                name="hasPlot"
                                                checked={formData.hasPlot}
                                                onChange={handleInputChange}
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mr-3"
                                            />
                                            <span className="text-sm font-medium text-gray-700">Plot / Area</span>
                                        </label>

                                        <label className="flex items-center p-3 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                                            <input
                                                type="checkbox"
                                                name="hasCommercial"
                                                checked={formData.hasCommercial}
                                                onChange={handleInputChange}
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mr-3"
                                            />
                                            <span className="text-sm font-medium text-gray-700">Commercial</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Status
                                    </label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="status"
                                                value="active"
                                                checked={formData.status === "active"}
                                                onChange={handleInputChange}
                                                className="mr-2"
                                            />
                                            Active
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="status"
                                                value="inactive"
                                                checked={formData.status === "inactive"}
                                                onChange={handleInputChange}
                                                className="mr-2"
                                            />
                                            Inactive
                                        </label>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-md"
                                    >
                                        {editingType ? "Update Type" : "Create Type"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PropertyTypeManager;
