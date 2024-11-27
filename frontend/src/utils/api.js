import { parse as parseWKT } from "terraformer-wkt-parser";
import { parseLocation } from "./wktUtils";

// Funktion til at hente gemte områder
export const fetchSavedAreas = async (userId) => { // Tilføj 'export'
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/user-selected-areas/by_user/?user_id=${userId}`);
        const data = await response.json();

        const formattedData = data.map((area) => {
            // Fjern SRID=4326; fra geom-strengen
            const cleanedGeom = area.geom.replace(/^SRID=\d+;/, ""); // Fjerner SRID=XXXX;
            return {
                ...area,
                nature_value: parseFloat(area.nature_value), // Konverter naturværdi til tal
                area_size: parseFloat(area.area_size), // Konverter areal til tal
                geom: parseWKT(cleanedGeom), // Konverter WKT til GeoJSON
            };
        });

        return formattedData; // Returnér de formaterede data
    } catch (error) {
        console.error("Error fetching saved areas:", error);
        throw error; // Kast fejlen videre, så du kan håndtere den i komponenten
    }
};

// Funktion til at hente projekter
export const fetchProjects = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/projects/");
      const data = await response.json();
  
      // Konverter data til Leaflet's format
      const formattedData = data.map((project) => ({
        ...project,
        location: parseLocation(project.location),
      }));
  
      return formattedData; // Returnér de formaterede data
    } catch (error) {
      console.error("Error fetching projects:", error);
      throw error; // Kast fejl videre
    }
};
  
// Gem kvadrater eller flere områder
export const saveSelectedAreasAPI = async (geoJSON, selectedArea, userId) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/user-selected-areas/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(selectedArea?.name ? { name: selectedArea.name } : {}),
          natureValue: selectedArea?.natureValue || 0,
          areaSize: selectedArea?.areaSize || 0,
          geom: JSON.stringify(geoJSON),
          user_id: userId,
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to save selected areas.");
      }
      return response.json(); // Returnér responsen, hvis nødvendigt
    } catch (error) {
      console.error("Error saving selected areas:", error);
      throw error;
    }
  };
  
  // Gem polygon-områder
  export const savePolygonAreasAPI = async (selectedArea, userId) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/user-selected-areas/save-polygon/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: selectedArea.name,
          natureValue: selectedArea.natureValue || 0,
          areaSize: selectedArea.areaSize || 0,
          geom: JSON.stringify(selectedArea.geom),
          user_id: userId,
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to save polygon areas.");
      }
      return response.json(); // Returnér responsen, hvis nødvendigt
    } catch (error) {
      console.error("Error saving polygon areas:", error);
      throw error;
    }
  };
  
// Slet et gemt område
export const deleteSavedAreaAPI = async (areaId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/user-selected-areas/${areaId}/`, {
        method: "DELETE",
      });
  
      if (!response.ok) {
        throw new Error("Failed to delete saved area.");
      }
      return true; // Return true, hvis sletningen lykkes
    } catch (error) {
      console.error("Error deleting saved area:", error);
      throw error;
    }
  };
  

  // Opret nyt projekt
export const createProjectAPI = async (projectData) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/projects/", {
        method: "POST",
        body: projectData, // Multipart-formdata
      });
  
      if (!response.ok) {
        throw new Error("Failed to create project.");
      }
      return response.json(); // Returnér oprettet projekt
    } catch (error) {
      console.error("Error creating project:", error);
      throw error;
    }
  };
  
  // Opdater eksisterende projekt
  export const updateProjectAPI = async (projectId, updatedData) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/projects/${projectId}/`, {
        method: "PUT",
        body: updatedData, // Multipart-formdata
      });
  
      if (!response.ok) {
        throw new Error("Failed to update project.");
      }
      return response.json(); // Returnér opdateret projekt
    } catch (error) {
      console.error("Error updating project:", error);
      throw error;
    }
  };
  
  // Slet projekt
  export const deleteProjectAPI = async (projectId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/projects/${projectId}/`, {
        method: "DELETE",
      });
  
      if (!response.ok) {
        throw new Error("Failed to delete project.");
      }
      return true; // Returnér true, hvis sletningen lykkes
    } catch (error) {
      console.error("Error deleting project:", error);
      throw error;
    }
  };
  