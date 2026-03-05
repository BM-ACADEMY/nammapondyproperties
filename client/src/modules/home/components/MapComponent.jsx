import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { formatIndianPrice } from "@/utils/formatPrice";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Link } from "react-router-dom";
import { getImageUrl } from "@/utils/imageUrl";

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

const UpdateMapCenter = ({ properties }) => {
  const map = useMap();

  useEffect(() => {
    if (properties.length > 0) {
      const validProperties = properties.filter(
        (p) => p.location?.coordinates?.lat && p.location?.coordinates?.lng,
      );

      if (validProperties.length > 0) {
        const bounds = L.latLngBounds(
          validProperties.map((p) => [
            p.location.coordinates.lat,
            p.location.coordinates.lng,
          ]),
        );
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }
  }, [properties, map]);

  return null;
};

const MapComponent = ({ properties }) => {
  // Default position (Pondicherry) if no properties or no location data
  const defaultPosition = [11.9416, 79.8083];

  return (
    <div className="h-full w-full rounded-xl overflow-hidden sticky top-24">
      <MapContainer
        center={defaultPosition}
        zoom={13}
        scrollWheelZoom={false}
        className="h-full w-full z-0"
        style={{ height: "100%", minHeight: "500px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {properties && properties.length > 0 && (
          <UpdateMapCenter properties={properties} />
        )}

        {properties.map((property) => {
          // Skip if no valid coordinates
          if (!property.location?.coordinates?.lat || !property.location?.coordinates?.lng)
            return null;

          return (
            <Marker
              key={property._id}
              position={[
                property.location.coordinates.lat,
                property.location.coordinates.lng,
              ]}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <Link
                    to={`/properties/${property.slug || property._id}`}
                    className="block group"
                  >
                    <div className="relative h-32 w-full mb-2 rounded-md overflow-hidden">
                      <img
                        src={getImageUrl(property.media?.featuredImage || property.media?.images?.[0])}
                        alt={property.basicInfo?.title || "Property"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm mb-1 leading-tight">
                      {property.basicInfo?.title || "Untitled Property"}
                    </h3>
                    <p className="text-xs text-gray-600 mb-1 truncate">
                      {property.location?.city || "Unknown City"}
                    </p>
                    <p className="text-sm font-semibold text-blue-600">
                      {formatIndianPrice(property.pricing?.sell?.price || property.pricing?.rent?.monthlyRent || 0)}
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
