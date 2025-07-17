
import "leaflet-defaulticon-compatibility";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export const Map = () => {
  return (
    <MapContainer
      center={[57.3553, 12.108]}
      zoom={14}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={[57.3553, 12.108]}>
        <Popup>
          1753 Skincare <br /> Södra Skjutbanevägen 10
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default Map; 