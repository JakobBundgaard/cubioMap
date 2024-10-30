import { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Rectangle, Tooltip, useMapEvents } from "react-leaflet";
import djurslandGrid from "../data/djurslandGrid_small.json";
import PropTypes from 'prop-types';

function MapComponent({ setSelectedArea, isMultiSelectActive }) {
    const [zoomLevel, setZoomLevel] = useState(8);
    const [selectedAreas, setSelectedAreas] = useState([]);
    const rectangleClicked = useRef(false);



    // Beregn kvadratets areal baseret på koordinaterne i bounds
    
    const calculateAreaSize = (bounds) => {
        if (!bounds || bounds.length !== 2) return 0; // Sikring mod ukorrekte bounds

        const [southWest, northEast] = bounds;
        const latDiff = Math.abs(northEast[0] - southWest[0]);
        const lngDiff = Math.abs(northEast[1] - southWest[1]);
        const latDistance = latDiff * 111320;
        const lngDistance = lngDiff * 111320 * Math.cos(southWest[0] * (Math.PI / 180));

        return parseFloat((latDistance * lngDistance).toFixed(2));
    };


//   const calculateAreaSize = (bounds) => {
//     const [southWest, northEast] = bounds;

//     // Beregn forskellen i bredde- og længdegrad
//     const latDiff = Math.abs(northEast[0] - southWest[0]);
//     const lngDiff = Math.abs(northEast[1] - southWest[1]);

//     // Konverter bredde- og længdegrad til meter
//     const latDistance = latDiff * 111320; // ca. meter per breddegrad
//     const lngDistance = lngDiff * 111320 * Math.cos(southWest[0] * (Math.PI / 180)); // længdegrad afhænger af bredde

//     // Beregn arealet i kvadratmeter
//     const areaInSquareMeters = latDistance * lngDistance;
//     return areaInSquareMeters.toFixed(2); // afrundet til 2 decimaler
//   };

    // Håndter klik på rektangel
    const handleAreaClick = (area) => {
        rectangleClicked.current = true;
    
        if (isMultiSelectActive) {
          // Multi-select: tilføj eller fjern området fra valgte områder
          setSelectedAreas(prevSelected => {
            const isSelected = prevSelected.find(a => a.id === area.id);
            if (isSelected) {
              return prevSelected.filter(a => a.id !== area.id);
            } else {
              const areaSize = calculateAreaSize(area.bounds);
              return [...prevSelected, { ...area, areaSize }];
            }
          });
        } else {
          // Single-select: vælg kun ét område
          const areaSize = calculateAreaSize(area.bounds);
          setSelectedAreas([{ ...area, areaSize }]);
        }
    };
    
//   const handleAreaClick = (area) => {
//     // const natureValue = generateNatureValue();
//     const areaSize = calculateAreaSize(area.bounds);
//     setSelectedArea({
//       name: area.name,
//       natureValue: area.natureValue,
//       areaSize: areaSize,
//     });
//     rectangleClicked.current = true;
    //     };
    

    useEffect(() => {
        const totalNatureValue = selectedAreas.reduce((acc, area) => acc + (area.natureValue || 0), 0);
        const totalAreaSize = selectedAreas.reduce((acc, area) => acc + (parseFloat(area.areaSize) || 0), 0);
    
        setSelectedArea({
            name: selectedAreas.length > 0 ? `${selectedAreas.length} valgte områder` : "Ingen områder valgt",
            natureValue: totalNatureValue,
            areaSize: totalAreaSize, // Opbevar som tal
        });
    }, [selectedAreas, setSelectedArea]);



    // useEffect(() => {
    //     const totalNatureValue = selectedAreas.reduce((acc, area) => acc + (area.natureValue || 0), 0);
    //     const totalAreaSize = selectedAreas.reduce((acc, area) => acc + (parseFloat(area.areaSize) || 0), 0); // Sørg for, at det er et tal

    //     setSelectedArea({
    //         name: selectedAreas.length > 0 ? `${selectedAreas.length} valgte områder` : "Ingen områder valgt",
    //         natureValue: totalNatureValue,
    //         areaSize: totalAreaSize.toFixed(2),
    //     });
    // }, [selectedAreas, setSelectedArea]);

   
// useEffect(() => {
//     const totalNatureValue = selectedAreas.reduce((acc, area) => acc + (area.natureValue || 0), 0);
//     const totalAreaSize = selectedAreas.reduce((acc, area) => acc + (area.areaSize || 0), 0);
  
//     setSelectedArea({
//       name: selectedAreas.length > 0 ? `${selectedAreas.length} valgte områder` : "Ingen områder valgt",
//       natureValue: totalNatureValue,
//       areaSize: totalAreaSize > 0 ? totalAreaSize.toFixed(2) : "0.00", // Sikrer, at det altid er et tal
//     });
//   }, [selectedAreas, setSelectedArea]);
    
// useEffect(() => {
//     const totalNatureValue = selectedAreas.reduce((acc, area) => acc + area.natureValue, 0);
//     const totalAreaSize = selectedAreas.reduce((acc, area) => acc + area.areaSize, 0);

//     setSelectedArea({
//       name: selectedAreas.length > 0 ? `${selectedAreas.length} valgte områder` : "Ingen områder valgt",
//       natureValue: totalNatureValue,
//       areaSize: totalAreaSize > 0 ? totalAreaSize.toFixed(2) : "0.00", // Sikrer, at det altid er et tal
//     });
//   }, [selectedAreas, setSelectedArea]);
    
    // const handleMapClickOutside = () => {
    //     if (!rectangleClicked.current) {
    //       setSelectedArea(null); // Nulstil sidebaren hvis der ikke er klikket på et rektangel
    //     }
    //     rectangleClicked.current = false; // Nulstil til falsk efter hvert kortklik
    // };
    
    const MapClickListener = () => {
        useMapEvents({
          click: () => {
            if (!rectangleClicked.current) {
              setSelectedAreas([]); // Nulstil ved klik uden for et kvadrat
              setSelectedArea(null);
            }
            rectangleClicked.current = false;
          },
        });
        return null;
      };
    
    // const MapClickListener = () => {
    //     useMapEvents({
    //       click: handleMapClickOutside, 
    //     });
    //     return null;
    //   };

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
                <p>Naturværdi: {area.natureValue}</p>
              </div>
            </Tooltip>
          </Rectangle>
        ))}
    </MapContainer>
  );
}

MapComponent.propTypes = {
    setSelectedArea: PropTypes.func.isRequired,
    isMultiSelectActive: PropTypes.bool.isRequired,
  };

export default MapComponent;


