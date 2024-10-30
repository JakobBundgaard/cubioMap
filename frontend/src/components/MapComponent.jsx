// src/MapComponent.jsx
import { MapContainer, TileLayer} from 'react-leaflet';

function MapComponent() {
  return (
    <MapContainer center={[56.2639, 9.5018]} zoom={8} style={{ height: "100vh", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
    </MapContainer>
  );
}

export default MapComponent;
