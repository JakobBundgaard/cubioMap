import { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Rectangle, Tooltip, FeatureGroup, useMapEvents } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import * as L from "leaflet";
import PropTypes from 'prop-types';
import { wktToBounds } from "../utils/wktUtils";
// import parseWKT from "wkt-parser-helper";


function MapComponent({ setSelectedArea, isMultiSelectActive, isDrawActive }) {
    const [zoomLevel, setZoomLevel] = useState(8);
    const [selectedAreas, setSelectedAreas] = useState([]);
    const [areas, setAreas] = useState([]); // Tilføj state til API-data
    const rectangleClicked = useRef(false);
    const featureGroupRef = useRef(null);

    useEffect(() => {
      fetch('http://127.0.0.1:8000/api/areas/')
        .then((response) => response.json())
        .then((data) => {
          const convertedData = data.map((area) => ({
            ...area,
            bounds: wktToBounds(area.geom),  // Konverter geom til bounds
            natureValue: parseFloat(area.nature_value),
          }));
          setAreas(convertedData);
        })
        .catch((error) => console.error('Error fetching data:', error));
    }, []);

    // Beregn kvadratets areal baseret på koordinaterne i bounds
    const calculateAreaSize = (bounds) => {
        if (!bounds || bounds.length !== 2) return 0;

        const [southWest, northEast] = bounds;
        const latDiff = Math.abs(northEast[0] - southWest[0]);
        const lngDiff = Math.abs(northEast[1] - southWest[1]);
        const latDistance = latDiff * 111320;
        const lngDistance = lngDiff * 111320 * Math.cos(southWest[0] * (Math.PI / 180));

        return parseFloat((latDistance * lngDistance).toFixed(2));
    };

    // Håndter klik på rektangel
    const handleAreaClick = (area) => {
        rectangleClicked.current = true;
    
        if (isMultiSelectActive) {
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
          const areaSize = calculateAreaSize(area.bounds);
          setSelectedAreas([{ ...area, areaSize }]);
        }
    };
    
    useEffect(() => {
        const totalNatureValue = selectedAreas.reduce((acc, area) => acc + (area.natureValue || 0), 0);
        const totalAreaSize = selectedAreas.reduce((acc, area) => acc + (parseFloat(area.areaSize) || 0), 0);
        const areaNames = selectedAreas.map(area => area.name).join(", ");
        const averageNatureValue = selectedAreas.length > 0 ? parseFloat((totalNatureValue / selectedAreas.length).toFixed(2)) : 0;
    
        setSelectedArea({
            name: selectedAreas.length > 0 ? areaNames : "Ingen områder valgt",
            natureValue: averageNatureValue,
            areaSize: totalAreaSize,
        });
    }, [selectedAreas, setSelectedArea]);

    // Beregn overlap med brugerdefineret område
    const calculateAverageNatureValueForDrawnArea = (layer) => {
        const overlappingAreas = areas.filter((area) => {
            const areaBounds = L.latLngBounds(area.bounds);
    
            if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
                const drawnBounds = L.latLngBounds(layer.getLatLngs()[0]);
                return areaBounds.overlaps(drawnBounds) || drawnBounds.contains(areaBounds);
            } else if (layer instanceof L.Circle) {
                const center = layer.getLatLng();
                const radius = layer.getRadius();
                return areaBounds.contains(center) || areaBounds.distanceTo(center) <= radius || areaBounds.within(layer.getBounds()); 
            }
            
            return false;
        });
    
        const totalNatureValue = overlappingAreas.reduce((acc, area) => acc + (area.natureValue || 0), 0);
        const averageNatureValue = overlappingAreas.length > 0 ? (totalNatureValue / overlappingAreas.length) : 0;
        return parseFloat(averageNatureValue.toFixed(2));
    };

    const onCreated = (e) => {
        const layer = e.layer;
        let areaSize = 0;

        if (layer instanceof L.Rectangle || layer instanceof L.Polygon) {
            areaSize = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
        } else if (layer instanceof L.Circle) {
            areaSize = Math.PI * Math.pow(layer.getRadius(), 2);
        }

        const averageNatureValue = calculateAverageNatureValueForDrawnArea(layer);

        setSelectedArea({
            name: "Brugerdefineret område",
            natureValue: averageNatureValue,
            areaSize: parseFloat(areaSize.toFixed(2)),
        });
    };

    useEffect(() => {
        if (!isDrawActive && featureGroupRef.current) {
            featureGroupRef.current.clearLayers();
        }
    }, [isDrawActive]);

    const MapClickListener = () => {
        useMapEvents({
          click: () => {
            if (!rectangleClicked.current) {
              setSelectedAreas([]);
              setSelectedArea(null);
            }
            rectangleClicked.current = false;
          },
        });
        return null;
      };
    
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

        <FeatureGroup ref={featureGroupRef}>
            {isDrawActive && (
                <EditControl
                    position="topright"
                    onCreated={onCreated}
                    draw={{
                        polygon: true,
                        circle: false,
                        rectangle: false,
                        polyline: false,
                    }}
                />
            )}
        </FeatureGroup>

      {zoomLevel > 12 &&
        areas.map((area) => {
          const isSelected = selectedAreas.some(selected => selected.id === area.id);
          
          return (
            <Rectangle
              key={area.id}
              bounds={area.bounds}
              pathOptions={{ color: isSelected ? "blue" : "green", weight: 0.5 }}
              eventHandlers={{
                click: (e) => {
                  e.originalEvent.stopPropagation();
                  handleAreaClick(area);
                },
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                <div>
                  <strong>{area.name}</strong>
                  <p>Naturværdi: {area.nature_value}</p>
                </div>
              </Tooltip>
            </Rectangle>
          );
        })}
    </MapContainer>
  );
}

MapComponent.propTypes = {
    setSelectedArea: PropTypes.func.isRequired,
    isMultiSelectActive: PropTypes.bool.isRequired,
    isDrawActive: PropTypes.bool.isRequired,
  };

export default MapComponent;


// import { useState, useRef, useEffect } from "react";
// import { MapContainer, TileLayer, Rectangle, Tooltip, FeatureGroup, useMapEvents } from "react-leaflet";
// import { EditControl } from "react-leaflet-draw";
// import "leaflet-draw/dist/leaflet.draw.css";
// import * as L from "leaflet";
// import djurslandGrid from "../data/djurslandGrid_small.json";
// import PropTypes from 'prop-types';

// function MapComponent({ setSelectedArea, isMultiSelectActive, isDrawActive }) {
//     const [zoomLevel, setZoomLevel] = useState(8);
//     const [selectedAreas, setSelectedAreas] = useState([]);
//     const rectangleClicked = useRef(false);
//     const featureGroupRef = useRef(null);


//     // Beregn kvadratets areal baseret på koordinaterne i bounds
//     const calculateAreaSize = (bounds) => {
//         if (!bounds || bounds.length !== 2) return 0; // Sikring mod ukorrekte bounds

//         const [southWest, northEast] = bounds;
//         const latDiff = Math.abs(northEast[0] - southWest[0]);
//         const lngDiff = Math.abs(northEast[1] - southWest[1]);
//         const latDistance = latDiff * 111320;
//         const lngDistance = lngDiff * 111320 * Math.cos(southWest[0] * (Math.PI / 180));

//         return parseFloat((latDistance * lngDistance).toFixed(2));
//     };


//     // Håndter klik på rektangel
//     const handleAreaClick = (area) => {
//         rectangleClicked.current = true;
    
//         if (isMultiSelectActive) {
//           setSelectedAreas(prevSelected => {
//             const isSelected = prevSelected.find(a => a.id === area.id);
//             if (isSelected) {
//               return prevSelected.filter(a => a.id !== area.id);
//             } else {
//               const areaSize = calculateAreaSize(area.bounds);
//               return [...prevSelected, { ...area, areaSize }];
//             }
//           });
//         } else {
//           const areaSize = calculateAreaSize(area.bounds);
//           setSelectedAreas([{ ...area, areaSize }]);
//         }
//     };
    
//     useEffect(() => {
//         const totalNatureValue = selectedAreas.reduce((acc, area) => acc + (area.natureValue || 0), 0);
//         const totalAreaSize = selectedAreas.reduce((acc, area) => acc + (parseFloat(area.areaSize) || 0), 0);
//         const areaNames = selectedAreas.map(area => area.name).join(", ");
//         const averageNatureValue = selectedAreas.length > 0 ? parseFloat((totalNatureValue / selectedAreas.length).toFixed(2)) : 0;
    
//         setSelectedArea({
//             name: selectedAreas.length > 0 ? areaNames : "Ingen områder valgt",
//             natureValue: averageNatureValue, // Gennemsnit af naturværdierne som tal
//             areaSize: totalAreaSize, // Opbevar som tal
//         });
//     }, [selectedAreas, setSelectedArea]);

//     // Funktion til at beregne overlap af brugerdefineret område med kvadrater

//     const calculateAverageNatureValueForDrawnArea = (layer) => {
//         const overlappingAreas = djurslandGrid.filter((area) => {
//             const areaBounds = L.latLngBounds(area.bounds);
    
//             // Hvis det tegnede område er en polygon eller rektangel
//             if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
//                 const drawnBounds = L.latLngBounds(layer.getLatLngs()[0]);
//                 return areaBounds.overlaps(drawnBounds) || drawnBounds.contains(areaBounds); // Tjekker både overlap og fuld indeholdelse
//             } 
            
//             // Hvis det tegnede område er en cirkel
//             else if (layer instanceof L.Circle) {
//                 const center = layer.getLatLng();
//                 const radius = layer.getRadius();
//                 return areaBounds.contains(center) || areaBounds.distanceTo(center) <= radius || areaBounds.within(layer.getBounds()); 
//             }
            
//             return false;
//         });
    
//         const totalNatureValue = overlappingAreas.reduce((acc, area) => acc + (area.natureValue || 0), 0);
//         const averageNatureValue = overlappingAreas.length > 0 ? (totalNatureValue / overlappingAreas.length) : 0;
//         return parseFloat(averageNatureValue.toFixed(2));
//     };
    

//     // Funktion til at håndtere tegning af brugerdefinerede områder
//     const onCreated = (e) => {
//         const layer = e.layer;
//         let areaSize = 0;

//         // Beregn arealet for forskellige lagtyper
//         if (layer instanceof L.Rectangle || layer instanceof L.Polygon) {
//             areaSize = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
//         } else if (layer instanceof L.Circle) {
//             areaSize = Math.PI * Math.pow(layer.getRadius(), 2);
//         }

//         const averageNatureValue = calculateAverageNatureValueForDrawnArea(layer);

//         setSelectedArea({
//             name: "Brugerdefineret område",
//             natureValue: averageNatureValue,
//             areaSize: parseFloat(areaSize.toFixed(2)),
//         });
//     };

//     // Funktion til at nulstille FeatureGroup ved deaktivering af tegnemode
//     useEffect(() => {
//         if (!isDrawActive && featureGroupRef.current) {
//             featureGroupRef.current.clearLayers();  // Clear all drawn layers when draw mode is off
//         }
//     }, [isDrawActive]);

//     const MapClickListener = () => {
//         useMapEvents({
//           click: () => {
//             if (!rectangleClicked.current) {
//               setSelectedAreas([]); // Nulstil ved klik uden for et kvadrat
//               setSelectedArea(null);
//             }
//             rectangleClicked.current = false;
//           },
//         });
//         return null;
//       };
    


//   // Overvåg kortets zoom-niveau
//   const ZoomWatcher = () => {
//     useMapEvents({
//       zoomend: (e) => setZoomLevel(e.target.getZoom()),
//     });
//     return null;
//   };

//     return (
      
//         <MapContainer
//       center={[56.2639, 9.5018]}
//       zoom={8}
//       style={{ height: "100vh", width: "100%" }}
//     >
//       <TileLayer
//         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//       />

//         <ZoomWatcher />
//         <MapClickListener />
            

//         {/* Tegneværktøjer aktiveret, hvis isDrawActive er true */}
//         <FeatureGroup ref={featureGroupRef}>
//             {isDrawActive && (
//                 <EditControl
//                     position="topright"
//                     onCreated={onCreated}
//                     draw={{
//                         polygon: true,
//                         circle: false,
//                         rectangle: false,
//                         polyline: false, // Polyline bruges ikke, da det ikke danner et område
//                     }}
//                 />
//             )}
//         </FeatureGroup>

//       {zoomLevel > 12 &&
//         djurslandGrid.map((area) => {
//           // Tjek om området er valgt
//           const isSelected = selectedAreas.some(selected => selected.id === area.id);
          
//           return (
//             <Rectangle
//               key={area.id}
//               bounds={area.bounds}
//               pathOptions={{ color: isSelected ? "blue" : "green", weight: 0.5 }} // Ændr farve til blå, hvis valgt
//               eventHandlers={{
//                 click: (e) => {
//                   e.originalEvent.stopPropagation(); // Forhindre propagation af event til MapClickListener
//                   handleAreaClick(area);
//                 },
//               }}
//             >
//               <Tooltip direction="top" offset={[0, -10]} opacity={1}>
//                 <div>
//                   <strong>{area.name}</strong>
//                   <p>Naturværdi: {area.natureValue}</p>
//                 </div>
//               </Tooltip>
//             </Rectangle>
//           );
//         })}
//     </MapContainer>
//   );
// }

// MapComponent.propTypes = {
//     setSelectedArea: PropTypes.func.isRequired,
//     isMultiSelectActive: PropTypes.bool.isRequired,
//     isDrawActive: PropTypes.bool.isRequired,
//   };

// export default MapComponent;


