import { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Rectangle, Tooltip, FeatureGroup, Marker, Popup, useMapEvents } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import MarkerClusterGroup from "react-leaflet-markercluster";
import "leaflet-draw/dist/leaflet.draw.css";
import * as L from "leaflet";
import PropTypes from 'prop-types';
import "leaflet/dist/leaflet.css";
import ProjectPopup from "./ProjectPopup";
import SavedAreas from "./SavedAreas";
import DanishNamePopup from "./DanishNamePopup";
import { useMapData } from "../hooks/useMapData";
import { calculateAreaSize, calculateAverageValuesForDrawnArea } from "../utils/areaCalculations";
import { getColorForValue } from "../utils/colorUtils";
import { getMaxValue } from "../utils/layerUtils";


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


  const maxValue = getMaxValue(areas, activeLayer);

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
        />

        <ZoomWatcher />
        <MapClickListener />
        <SavedAreas savedAreas={savedAreas} isSavedAreasVisible={isSavedAreasVisible} />
      
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
                      marker: false,
                      circlemarker: false,
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
              : area.natureValue; 

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
};

export default MapComponent;




