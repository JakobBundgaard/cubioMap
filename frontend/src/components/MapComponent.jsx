import { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Rectangle, Tooltip, FeatureGroup, Marker, Popup, useMapEvents } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import MarkerClusterGroup from "react-leaflet-markercluster";
import "leaflet-draw/dist/leaflet.draw.css";
import * as L from "leaflet";
import PropTypes from 'prop-types';
import { wktToBounds } from "../utils/wktUtils";
import "leaflet/dist/leaflet.css";

async function fetchDanishName(scientificName) {
  try {
      const response = await fetch(`https://api.gbif.org/v1/species?name=${scientificName}`);
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
          const species = data.results[0];
          
          // Først, tjek om "vernacularName" findes direkte på rodeniveau
          if (species.vernacularName) {
              return species.vernacularName;
          }
          
          // Hvis ikke, forsøg at finde det i "vernacularNames" listen
          const vernacularNames = species.vernacularNames || [];
          const danishNameEntry = vernacularNames.find(name => name.language === "dan");

          return danishNameEntry ? danishNameEntry.vernacularName : "Dansk navn ikke tilgængeligt";
      }
      
      return "Dansk navn ikke tilgængeligt";
  } catch (error) {
      console.error("Fejl ved hentning af dansk navn:", error);
      return "Fejl ved API-opslag";
  }
}

function MapComponent({ setSelectedArea, isMultiSelectActive, isDrawActive, isInsectMarkersVisible }) {
    const [zoomLevel, setZoomLevel] = useState(8);
    const [selectedAreas, setSelectedAreas] = useState([]);
    const [areas, setAreas] = useState([]); // Tilføj state til API-data
    const [gbifData, setGbifData] = useState([]);
    const rectangleClicked = useRef(false);
    const featureGroupRef = useRef(null);
    
  
    useEffect(() => {
      // Hent områder fra API
      fetch('http://127.0.0.1:8000/api/enhanced-areas/')
        .then((response) => response.json())
        .then((data) => {
          const convertedData = data.map((area) => ({
            ...area,
            bounds: wktToBounds(area.geom),  // Konverter geom til bounds
            natureValue: parseFloat(area.nature_value),
            shannonIndex: parseFloat(area.shannon_index),
            soilQualityValue: parseFloat(area.soil_quality_value),
            ndvi: parseFloat(area.ndvi),
          }));
          setAreas(convertedData);
        })
        .catch((error) => console.error('Error fetching area data:', error));
      
      // Hent GBIF-data fra API
      fetch('http://127.0.0.1:8000/api/gbif-data/') 
        .then((response) => response.json())
        .then((data) => {
          console.log("GBIF Data:", data);
          setGbifData(data);
        })
        .catch((error) => console.error('Error fetching GBIF data:', error));
    }, []);
  
    // For bug fixing. Delete later
    useEffect(() => {
      console.log("isInsectMarkersVisible:", isInsectMarkersVisible);
    }, [isInsectMarkersVisible]);
    
    useEffect(() => {
      console.log("Current Zoom Level:", zoomLevel);
    }, [zoomLevel]);
  

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
          shannonIndex: selectedAreas.length > 0 ? selectedAreas[0].shannonIndex : null,
          soilQualityValue: selectedAreas.length > 0 ? selectedAreas[0].soilQualityValue : null,
          ndvi: selectedAreas.length > 0 ? selectedAreas[0].ndvi : null,
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
            maxZoom={20}
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
                    <p>Shannon Index: {area.shannonIndex}</p>
                    <p>NDVI: {area.ndvi}</p>
                    <p>Jordkvalitet: {area.soilQualityValue}</p>
                    <p>Naturværdi: {area.nature_value}</p>
                  </div>
                </Tooltip>
              </Rectangle>
            );
          })}

          {zoomLevel > 12 && isInsectMarkersVisible && (
                <MarkerClusterGroup disableClusteringAtZoom={18}>
                  {gbifData.map((data) => {
                    const wktString = data.coordinates;
                    const match = /POINT \(([^ ]+) ([^ ]+)\)/.exec(wktString);
                    if (!match) return null;

                    const lon = parseFloat(match[1]);
                    const lat = parseFloat(match[2]);

                    return (
                      <Marker
                        key={data.source_id}
                        position={[lat, lon]}
                      >
                        <Popup>
                          <DanishNamePopup data={data} />
                        </Popup>
                      </Marker>
                    );
            })}
          </MarkerClusterGroup>
        )}
    </MapContainer>
  );
}

function DanishNamePopup({ data }) {
  const [danishName, setDanishName] = useState("Henter dansk navn...");

  useEffect(() => {
      const fetchName = async () => {
          const name = await fetchDanishName(data.species);
          setDanishName(name);
      };
      fetchName();
  }, [data.species]);

  return (
      <div>
          <strong>Artsnavn (Latin):</strong> {data.species || "Ukendt"}<br />
          <strong>Dansk navn:</strong> {danishName}<br />
          <strong>Detektionsdato:</strong> {data.occurrence_date || "Ikke angivet"}
      </div>
  );
}

MapComponent.propTypes = {
    setSelectedArea: PropTypes.func.isRequired,
    isMultiSelectActive: PropTypes.bool.isRequired,
    isDrawActive: PropTypes.bool.isRequired,
    isInsectMarkersVisible: PropTypes.bool.isRequired
};
  
DanishNamePopup.propTypes = {
  data: PropTypes.shape({
      species: PropTypes.string.isRequired,
      occurrence_date: PropTypes.string,   
      coordinates: PropTypes.string        
  }).isRequired
};

export default MapComponent;




