'use client'

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from 'leaflet';

// Fix for default markers in react-leaflet
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export const Map = () => {
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    // Set default icon for all markers
    L.Marker.prototype.options.icon = icon;

    // Cleanup on hot-reload/unmount to avoid “Map container is already initialized”
    return () => {
      const container = document.getElementById('contact-map');
      if (container && (container as any)._leaflet_id) {
        // @ts-ignore - Leaflet stores its id on the DOM element
        delete (container as any)._leaflet_id;
      }
    };
  }, []);

  return (
    <MapContainer
      center={[57.3553, 12.108]}
      zoom={14}
      scrollWheelZoom={false}
      id="contact-map"
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={[57.3553, 12.108]} icon={icon}>
        <Popup>
          1753 Skincare <br /> Södra Skjutbanevägen 10
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default Map; 