import { useState, useRef } from "react";
import { MapContainer, TileLayer, Rectangle, Tooltip, useMapEvents } from "react-leaflet";
import djurslandGrid from "../data/djurslandGrid_small.json";
import PropTypes from 'prop-types';

function MapComponent({ setSelectedArea }) {
    const [zoomLevel, setZoomLevel] = useState(8);
    const rectangleClicked = useRef(false);

  // Funktion til at generere en tilfældig naturværdi mellem 50 og 100
  const generateNatureValue = () => Math.floor(Math.random() * 51) + 50;

  // Beregn kvadratets areal baseret på koordinaterne i bounds
  const calculateAreaSize = (bounds) => {
    const [southWest, northEast] = bounds;

    // Beregn forskellen i bredde- og længdegrad
    const latDiff = Math.abs(northEast[0] - southWest[0]);
    const lngDiff = Math.abs(northEast[1] - southWest[1]);

    // Konverter bredde- og længdegrad til meter
    const latDistance = latDiff * 111320; // ca. meter per breddegrad
    const lngDistance = lngDiff * 111320 * Math.cos(southWest[0] * (Math.PI / 180)); // længdegrad afhænger af bredde

    // Beregn arealet i kvadratmeter
    const areaInSquareMeters = latDistance * lngDistance;
    return areaInSquareMeters.toFixed(2); // afrundet til 2 decimaler
  };

  // Håndter klik på rektangel
  const handleAreaClick = (area) => {
    const natureValue = generateNatureValue();
    const areaSize = calculateAreaSize(area.bounds);
    setSelectedArea({
      name: area.name,
      natureValue: natureValue,
      areaSize: areaSize,
    });
    rectangleClicked.current = true;
    };
    
    const handleMapClickOutside = () => {
        if (!rectangleClicked.current) {
          setSelectedArea(null); // Nulstil sidebaren hvis der ikke er klikket på et rektangel
        }
        rectangleClicked.current = false; // Nulstil til falsk efter hvert kortklik
      };
    
    const MapClickListener = () => {
        useMapEvents({
          click: handleMapClickOutside, 
        });
        return null;
      };

  // Overvåg kortets zoom-niveau
  const ZoomWatcher = () => {
    useMapEvents({
      zoomend: (e) => setZoomLevel(e.target.getZoom()),
    });
    return null;
  };

  return (
    <MapContainer
      center={[56.2639, 9.5018]}
      zoom={8}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

          <ZoomWatcher />
          <MapClickListener />

      {/* Vis grid kun hvis zoom-niveauet er højere end 12 */}
      {zoomLevel > 12 &&
        djurslandGrid.map((area) => (
          <Rectangle
            key={area.id}
            bounds={area.bounds}
            pathOptions={{ color: "green", weight: 0.5 }}
            eventHandlers={{
                click: (e) => {
                  e.originalEvent.stopPropagation(); // Forhindre propagation af event til MapClickListener
                  handleAreaClick(area);
                },
              }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1}>
              <div>
                <strong>{area.name}</strong>
                <p>Naturværdi: {generateNatureValue()}</p>
              </div>
            </Tooltip>
          </Rectangle>
        ))}
    </MapContainer>
  );
}

MapComponent.propTypes = {
  setSelectedArea: PropTypes.func.isRequired,
};

export default MapComponent;


