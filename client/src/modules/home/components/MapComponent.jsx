import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Link } from "react-router-dom";

// Fix for default marker icon in React-Leaflet
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to update map center when properties change
const UpdateMapCenter = ({ properties }) => {
    const map = useMap();

    useEffect(() => {
        if (properties.length > 0) {
            const bounds = L.latLngBounds(
                properties.map((p) => [
                    p.location?.latitude || 11.9416,
                    p.location?.longitude || 79.8083,
                ])
            );
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [properties, map]);

    return null;
};

const MapComponent = ({ properties }) => {
    // Default position (Pondicherry) if no properties or no location data
    const defaultPosition = [11.9416, 79.8083];

    return (
        <div className="h-full w-full rounded-xl overflow-hidden shadow-lg border border-gray-200 sticky top-24">
            <MapContainer
                center={defaultPosition}
                zoom={13}
                scrollWheelZoom={false}
                className="h-full w-full z-0"
                style={{ height: "calc(100vh - 150px)", minHeight: "500px" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {properties && properties.length > 0 && <UpdateMapCenter properties={properties} />}

                {properties.map((property) => {
                    // Skip if no valid coordinates
                    if (!property.location?.latitude || !property.location?.longitude) return null;

                    return (
                        <Marker
                            key={property._id}
                            position={[property.location.latitude, property.location.longitude]}
                        >
                            <Popup>
                                <div className="min-w-[200px]">
                                    <Link to={`/properties/${property._id}`} className="block group">
                                        <div className="relative h-32 w-full mb-2 rounded-md overflow-hidden">
                                            <img
                                                src={
                                                    property.images?.[0]?.image_url
                                                        ? `${import.meta.env.VITE_API_URL.replace("/api", "")}${property.images[0].image_url}`
                                                        : "https://placehold.co/600x400?text=No+Image"
                                                }
                                                alt={property.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                        <h3 className="font-bold text-gray-900 text-sm mb-1 leading-tight">{property.title}</h3>
                                        <p className="text-xs text-gray-600 mb-1 truncate">
                                            {property.location?.city || "Unknown City"}
                                        </p>
                                        <p className="text-sm font-semibold text-blue-600">
                                            ₹ {property.price?.toLocaleString() || "N/A"}
                                        </p>
                                    </Link>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default MapComponent;
