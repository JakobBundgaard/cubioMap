// src/MapComponent.jsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

function MapComponent() {
  return (
    <MapContainer center={[56.2639, 9.5018]} zoom={7} style={{ height: "100vh", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={[56.2639, 9.5018]}>
        <Popup>Danmark</Popup>
      </Marker>
    </MapContainer>
  );
}

export default MapComponent;
