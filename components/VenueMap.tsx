"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon, LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

const venuePosition: LatLngExpression = [36.0234, -78.4736];

const nearbyAttractions = [
  {
    name: "Falls Lake State Recreation Area",
    position: [36.0167, -78.5833] as LatLngExpression,
    description: "Beautiful lake for hiking and water activities",
    type: "nature",
  },
  {
    name: "Wake Forest Historic District",
    position: [35.9799, -78.5097] as LatLngExpression,
    description: "Charming downtown with shops and restaurants",
    type: "shopping",
  },
  {
    name: "Raleigh-Durham International Airport",
    position: [35.8801, -78.7880] as LatLngExpression,
    description: "Main airport serving the Triangle area",
    type: "transport",
  },
  {
    name: "Downtown Raleigh",
    position: [35.7796, -78.6382] as LatLngExpression,
    description: "State capital with museums and nightlife",
    type: "city",
  },
];

const venueIcon = new Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const attractionIcon = new Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function VenueMap() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[400px] bg-muted rounded-2xl flex items-center justify-center">
        <div className="text-muted-foreground">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] rounded-2xl overflow-hidden shadow-md" data-testid="venue-map-container">
      <MapContainer
        center={venuePosition}
        zoom={11}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={venuePosition} icon={venueIcon}>
          <Popup>
            <div className="text-center">
              <strong className="text-lg">Pine Hill Pavilion</strong>
              <p className="text-sm mt-1">375 Moores Pond Rd</p>
              <p className="text-sm">Youngsville, NC 27596</p>
              <p className="text-sm text-primary mt-2">Wedding Venue</p>
            </div>
          </Popup>
        </Marker>
        {nearbyAttractions.map((attraction) => (
          <Marker
            key={attraction.name}
            position={attraction.position}
            icon={attractionIcon}
          >
            <Popup>
              <div className="text-center">
                <strong>{attraction.name}</strong>
                <p className="text-sm mt-1">{attraction.description}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
