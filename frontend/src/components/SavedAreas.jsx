import PropTypes from "prop-types";
import { Polygon, Tooltip } from "react-leaflet";
import * as L from "leaflet";

const SavedAreas = ({ savedAreas, isSavedAreasVisible }) => {
  if (!isSavedAreasVisible) return null; 

  return savedAreas.map((area) => {
    let geomData;

    // Parse geomData fra GeoJSON
    try {
      geomData = typeof area.geom === "string" ? JSON.parse(area.geom) : area.geom;
    } catch (error) {
      console.error("Fejl ved parsing af geom:", error);
      return null;
    }

    // Tjek om geomData er gyldig
    if (!geomData || !geomData.type) {
      console.error("Ugyldig geomData:", geomData);
      return null;
    }

    // Opret GeoJSON-layer for at hente positionsdata
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

    // Hent første lag og positionsdata
    const firstLayer = layers[0];
    const positions = firstLayer.getLatLngs();

    return (
      <Polygon
        key={area.id}
        positions={positions}
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
  });
};

SavedAreas.propTypes = {
  savedAreas: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      area_size: PropTypes.number.isRequired,
      nature_value: PropTypes.number.isRequired,
      geom: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    })
  ).isRequired,
  isSavedAreasVisible: PropTypes.bool.isRequired,
};

export default SavedAreas;
