import { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Rectangle, Tooltip, FeatureGroup, Marker, Popup, Polygon, useMapEvents } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import MarkerClusterGroup from "react-leaflet-markercluster";
import "leaflet-draw/dist/leaflet.draw.css";
import * as L from "leaflet";
import PropTypes from 'prop-types';
import "leaflet/dist/leaflet.css";
import ProjectPopup from "./ProjectPopup";
import { useMapData } from "../hooks/useMapData";


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

// Beregn overlap med brugerdefineret område
const calculateAverageValuesForDrawnArea = (layer, areas) => {
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
  const totalShannonIndex = overlappingAreas.reduce((acc, area) => acc + (area.shannonIndex || 0), 0);
  const totalNDVI = overlappingAreas.reduce((acc, area) => acc + (area.ndvi || 0), 0);
  const totalSoilQualityValue = overlappingAreas.reduce((acc, area) => acc + (area.soilQualityValue || 0), 0);
  const averageNatureValue = overlappingAreas.length > 0 ? parseFloat((totalNatureValue / overlappingAreas.length).toFixed(2)) : 0;
  const averageShannonIndex = overlappingAreas.length > 0 ? parseFloat((totalShannonIndex / overlappingAreas.length).toFixed(2)) : 0;
  const averageNDVI = overlappingAreas.length > 0 ? parseFloat((totalNDVI / overlappingAreas.length).toFixed(2)) : 0;
  const averageSoilQualityValue = overlappingAreas.length > 0 ? parseFloat((totalSoilQualityValue / overlappingAreas.length).toFixed(2)) : 0;

  return {
      natureValue: averageNatureValue,
      shannonIndex: averageShannonIndex,
      ndvi: averageNDVI,
      soilQualityValue: averageSoilQualityValue,
  };
};

const getColorForValue = (value, maxValue, activeLayer) => {
  if (!activeLayer || value === null || value === undefined) return "green";
  const ratio = value / maxValue;
  return `rgb(${255 - ratio * 255}, ${255 - ratio * 100}, ${100 + ratio * 100})`; // Dynamisk RGB-farve
};

// Kortklik-håndteringskomponent
const MapClickHandler = ({ isCreatingProject, setProjectLocation }) => {
  useMapEvents({
    click(e) {
      console.log("Kort klik:", e.latlng, "isCreatingProject:", isCreatingProject);
      if (isCreatingProject) {
        const { lat, lng } = e.latlng;
        setProjectLocation({ lat, lng });
        console.log("Project Location set to:", { lat, lng });
      }
    },
  });
  return null;
};

function MapComponent({
  setSelectedArea,
  isMultiSelectActive,
  isDrawActive,
  isInsectMarkersVisible,
  isProjectMarkersVisible,
  isCreatingProject, 
  setIsCreatingProject,
  setProjectLocation,
  projectsData,
  onUpdate,
  onDelete,
  selectedAreas, 
  setSelectedAreas, 
  savedAreas, 
  isSavedAreasVisible, 
  activeLayer,
}) {
  const { areas, gbifData } = useMapData();
  const [zoomLevel, setZoomLevel] = useState(8);
  const rectangleClicked = useRef(false);
  const featureGroupRef = useRef(null);
  
    
    
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
      const totalShannonIndex = selectedAreas.reduce((acc, area) => acc + (area.shannonIndex || 0), 0);
      const totalNDVI = selectedAreas.reduce((acc, area) => acc + (area.ndvi || 0), 0);
      const totalSoilQualityValue = selectedAreas.reduce((acc, area) => acc + (area.soilQualityValue || 0), 0);
      const totalAreaSize = selectedAreas.reduce((acc, area) => acc + (parseFloat(area.areaSize) || 0), 0);
      const areaNames = selectedAreas.map(area => area.name).join(", ");
      
      const averageNatureValue = selectedAreas.length > 0 ? parseFloat((totalNatureValue / selectedAreas.length).toFixed(2)) : 0;
      const averageShannonIndex = selectedAreas.length > 0 ? parseFloat((totalShannonIndex / selectedAreas.length).toFixed(2)) : 0;
      const averageNDVI = selectedAreas.length > 0 ? parseFloat((totalNDVI / selectedAreas.length).toFixed(2)) : 0;
      const averageSoilQualityValue = selectedAreas.length > 0 ? parseFloat((totalSoilQualityValue / selectedAreas.length).toFixed(2)) : 0;
  
      setSelectedArea({
          name: selectedAreas.length > 0 ? areaNames : "Ingen områder valgt",
          natureValue: averageNatureValue,
          areaSize: totalAreaSize,
          shannonIndex: averageShannonIndex,
          ndvi: averageNDVI,
          soilQualityValue: averageSoilQualityValue,
      });
  }, [selectedAreas, setSelectedArea]);
  

    const onCreated = (e) => {
        const layer = e.layer;
        let areaSize = 0;

        if (layer instanceof L.Rectangle || layer instanceof L.Polygon) {
            areaSize = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
        } else if (layer instanceof L.Circle) {
            areaSize = Math.PI * Math.pow(layer.getRadius(), 2);
        }

        const geom = layer.toGeoJSON().geometry;
      
        const averages  = calculateAverageValuesForDrawnArea(layer, areas);

        setSelectedArea({
            name: "",
            natureValue: averages.natureValue,
            areaSize: parseFloat(areaSize.toFixed(2)),
            shannonIndex: averages.shannonIndex,
            ndvi: averages.ndvi,
            soilQualityValue: averages.soilQualityValue,
            geom: geom,
        });
      
      // Fjern laget, hvis ikke længere aktiv
    if (!isDrawActive && featureGroupRef.current) {
      featureGroupRef.current.clearLayers();
  }
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

  

  const getMaxValue = () => {
    if (!activeLayer) return null; // Ingen lag valgt
    const values = areas.map((area) =>
        activeLayer === "Shannon Index"
            ? area.shannonIndex
            : activeLayer === "NDVI"
            ? area.ndvi
            : activeLayer === "Jordkvalitet"
            ? area.soilQualityValue
            : area.natureValue
    );
    return Math.max(...values.filter((v) => v !== undefined && v !== null), 0); // Undgå NaN
};

  const maxValue = getMaxValue();

    return (
      
        <MapContainer
            center={[56.2639, 9.5018]}
            zoom={8}
            maxZoom={20}
            style={{ height: "100vh", width: "100%", zIndex: 1 }}
        >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <MapClickHandler
            isCreatingProject={isCreatingProject}
            setProjectLocation={setProjectLocation}
            setIsCreatingProject={setIsCreatingProject}
          />

        <ZoomWatcher />
        <MapClickListener />

        {isSavedAreasVisible &&
            savedAreas.map((area) => {
              let geomData;
              try {
                // Hvis geom allerede er et objekt, brug det direkte
                geomData = typeof area.geom === "string" ? JSON.parse(area.geom) : area.geom;
              } catch (error) {
                console.error("Fejl ved parsing af geom:", error);
                return null;
              }

              // Check om geomData er gyldig
              if (!geomData || !geomData.type) {
                console.error("Ugyldig geomData:", geomData);
                return null;
              }

              let geoJSONLayer;
              try {
                geoJSONLayer = L.geoJSON(geomData);
              } catch (error) {
                console.error("Fejl ved oprettelse af geoJSONLayer:", error);
                return null;
              }

              const layers = geoJSONLayer.getLayers();
              if (!layers || layers.length === 0) {
                console.error("Ingen lag fundet i geoJSONLayer:", geoJSONLayer);
                return null;
              }

              const firstLayer = layers[0]; // Hent første lag
              const geometryType = firstLayer.feature?.geometry?.type;

              if (!geometryType) {
                console.error("Geometry type er ikke defineret:", firstLayer.feature);
                return null;
              }

              const positions = firstLayer.getLatLngs();

              if (geometryType === "Polygon" || geometryType === "MultiPolygon") {
                return (
                  <Polygon
                    key={area.id}
                    positions={positions} // Brug LatLngs fra GeoJSON
                    pathOptions={{ color: "blue", weight: 2 }}
                  >
                    <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                      <div>
                        <strong>{area.name}</strong>
                        <p>Størrelse: {area.area_size.toFixed(2)} m²</p>
                        <p>Gennemsnitlig Naturværdi: {area.nature_value.toFixed(2)}</p>
                      </div>
                    </Tooltip>
                  </Polygon>
                );
              }

              console.warn("Ugyldig geometri-type fundet:", geometryType);
              return null;
            })}

      
        {zoomLevel > 8 && isProjectMarkersVisible && (
          <MarkerClusterGroup>
            {projectsData.map((project) => {
                const { lat, lng } = project.location;
                if (lat !== undefined && lng !== undefined) {
                  return (
                    <Marker key={project.id} position={[lat, lng]}>
                      <Popup>
                        <ProjectPopup
                          project={project}
                          onUpdate={() => onUpdate(project)} 
                          onDelete={() => onDelete(project.id)}
                        />
                      </Popup>
                    </Marker>
                  );
                }
                return null; 
              })}
          </MarkerClusterGroup>
        )}

        
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

            // Vælg værdi og beregn farve for aktivt lag           
            activeLayer === "Shannon Index"
              ? area.shannonIndex
              : activeLayer === "NDVI"
              ? area.ndvi
              : activeLayer === "Jordkvalitet"
              ? area.soilQualityValue
              : area.natureValue; // Default til Naturværdi

              const color = getColorForValue(
                area[
                  activeLayer === "Shannon Index"
                    ? "shannonIndex"
                    : activeLayer === "NDVI"
                    ? "ndvi"
                    : activeLayer === "Jordkvalitet"
                    ? "soilQualityValue"
                    : "natureValue"
                ],
                maxValue,
                activeLayer
              );
            
            return (
              <Rectangle
                key={area.id}
                bounds={area.bounds}
                pathOptions={{
                  color: isSelected ? "blue" : color, 
                  fillColor: isSelected ? "blue" : color, 
                  fillOpacity: 0.5, 
                  opacity: 0.5, 
                  weight: 0.3, 
                }}
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
                    {activeLayer ? (
                        <p>
                            {activeLayer}:{" "}
                            {area[
                                activeLayer === "Shannon Index"
                                    ? "shannonIndex"
                                    : activeLayer === "NDVI"
                                    ? "ndvi"
                                    : activeLayer === "Jordkvalitet"
                                    ? "soilQualityValue"
                                    : "natureValue"
                            ] || "Ingen data"}
                        </p>
                    ) : (
                        <p>Naturværdi: {area.natureValue || "Ingen data"}</p> 
                    )}
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



MapComponent.propTypes = {
    savedAreas: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        nature_value: PropTypes.number.isRequired,
        geom: PropTypes.object.isRequired, 
      })
    ).isRequired,
    isSavedAreasVisible: PropTypes.bool.isRequired,
    setSelectedArea: PropTypes.func.isRequired,
    isMultiSelectActive: PropTypes.bool.isRequired,
    isDrawActive: PropTypes.bool.isRequired,
    isInsectMarkersVisible: PropTypes.bool.isRequired,
    isProjectMarkersVisible: PropTypes.bool.isRequired,
    isCreatingProject: PropTypes.bool.isRequired,
    setIsCreatingProject: PropTypes.func.isRequired,
    setProjectLocation: PropTypes.func.isRequired,
    projectsData: PropTypes.array.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    selectedAreas: PropTypes.array.isRequired,
    setSelectedAreas: PropTypes.func.isRequired,
    activeLayer: PropTypes.string,
};
  
DanishNamePopup.propTypes = {
  data: PropTypes.shape({
      species: PropTypes.string.isRequired,
      occurrence_date: PropTypes.string,   
      coordinates: PropTypes.string        
  }).isRequired
};

MapClickHandler.propTypes = {
  isCreatingProject: PropTypes.bool.isRequired,
  setProjectLocation: PropTypes.func.isRequired,
  setIsCreatingProject: PropTypes.func.isRequired,
};

export default MapComponent;




