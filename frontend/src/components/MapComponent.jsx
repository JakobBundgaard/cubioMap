import { useState } from 'react';
import { MapContainer, TileLayer, Rectangle, Popup, useMapEvents } from 'react-leaflet';
import djurslandGrid from '../data/djurslandGrid_small.json';

function MapComponent() {
    const [selectedArea, setSelectedArea] = useState(null);
    const [natureValue, setNatureValue] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(8);
    const [areaSize, setAreaSize] = useState(null);

    // Definer grid størrelser i meter
    const gridSizeLatMeters = 111320 * 0.001; // Baseret på grid_size_lat (ca. 100 meter)
    const gridSizeLngMeters = 111320 * 0.00175; // Baseret på grid_size_lng (ca. 100 meter ved den justerede værdi)


    // Funktion til at generere en tilfældig naturværdi mellem 50 og 100
  const generateNatureValue = () => {
    return Math.floor(Math.random() * 51) + 50;
    };
    
    // Beregn arealet af et område baseret på justerede grid størrelser
    const calculateAreaSize = () => {
        const areaInSquareMeters = gridSizeLatMeters * gridSizeLngMeters;
        return areaInSquareMeters.toFixed(2); 
    };
    
    // Håndter klik på rektangel
  const handleAreaClick = (area) => {
      setSelectedArea(area);
      setNatureValue(generateNatureValue());
      setAreaSize(calculateAreaSize());
    };
    
    // Overvåg kortets zoom-niveau
    const ZoomWatcher = () => {
        useMapEvents({
            zoomend: (e) => {
                setZoomLevel(e.target.getZoom());
            },
        });
        return null;
    };


  return (
    <MapContainer center={[56.2639, 9.5018]} zoom={8} style={{ height: "100vh", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
        <ZoomWatcher />

      {zoomLevel > 12 && djurslandGrid.map((area) => (
        <Rectangle
          key={area.id}
          bounds={area.bounds}
          eventHandlers={{
            click: () => handleAreaClick(area),
          }}
          pathOptions={{ color: 'green', weight: 0.5 }}
        />
      ))}

      {selectedArea && (
        <Popup
          position={[
            (selectedArea.bounds[0][0] + selectedArea.bounds[1][0]) / 2,
            (selectedArea.bounds[0][1] + selectedArea.bounds[1][1]) / 2
          ]}
          onClose={() => setSelectedArea(null)}
        >
          <div>
            <h3>{selectedArea.name}</h3>
            <p>Område: {areaSize} m²</p>
            <p>Naturværdi: {natureValue}</p>
          </div>
        </Popup>
      )}
    </MapContainer>
  );
}

export default MapComponent;
