import { useState, useEffect } from "react";
import { wktToBounds } from "../utils/wktUtils";

export const useMapData = () => {
  const [areas, setAreas] = useState([]);
  const [gbifData, setGbifData] = useState([]);

  // Hent områder fra API
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/enhanced-areas/");
        const data = await response.json();
        const convertedData = data.map((area) => ({
          ...area,
          bounds: wktToBounds(area.geom),
          natureValue: parseFloat(area.nature_value),
          shannonIndex: parseFloat(area.shannon_index),
          soilQualityValue: parseFloat(area.soil_quality_value),
          ndvi: parseFloat(area.ndvi),
        }));
        setAreas(convertedData);
      } catch (error) {
        console.error("Error fetching area data:", error);
      }
    };

    fetchAreas();
  }, []);

  // Hent GBIF-data fra API
  useEffect(() => {
    const fetchGbifData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/gbif-data/");
        const data = await response.json();
        setGbifData(data);
      } catch (error) {
        console.error("Error fetching GBIF data:", error);
      }
    };

    fetchGbifData();
  }, []);

  return { areas, gbifData };
};
