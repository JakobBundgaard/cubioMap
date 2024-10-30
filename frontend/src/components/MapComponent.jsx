import { useState } from 'react';
import { MapContainer, TileLayer, Rectangle, Popup } from 'react-leaflet';
import djurslandGrid from '../data/djurslandGrid_small.json';

function MapComponent() {
    const [selectedArea, setSelectedArea] = useState(null);
    const [natureValue, setNatureValue] = useState(null);

    // Definer områder over Djursland (koordinater: sydvest og nordøst hjørner)
//   const areas = [
//     { id: 1, bounds: [[56.348, 10.484], [56.358, 10.504]], name: "Område A" },
//     { id: 2, bounds: [[56.358, 10.484], [56.368, 10.504]], name: "Område B" },
//     { id: 3, bounds: [[56.348, 10.504], [56.358, 10.524]], name: "Område C" },
//     { id: 4, bounds: [[56.358, 10.504], [56.368, 10.524]], name: "Område D" }
//     ];

    // Funktion til at generere en tilfældig naturværdi mellem 50 og 100
  const generateNatureValue = () => {
    return Math.floor(Math.random() * 51) + 50;
  };
    
    // Håndter klik på rektangel
  const handleAreaClick = (area) => {
      setSelectedArea(area);
      setNatureValue(generateNatureValue());
  };

  return (
    <MapContainer center={[56.2639, 9.5018]} zoom={8} style={{ height: "100vh", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {djurslandGrid.map((area) => (
        <Rectangle
          key={area.id}
          bounds={area.bounds}
          eventHandlers={{
            click: () => handleAreaClick(area),
          }}
          pathOptions={{ color: 'green', weight: 1 }}
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
            <p>Naturværdi: {natureValue}</p>
          </div>
        </Popup>
      )}
    </MapContainer>
  );
}

export default MapComponent;
