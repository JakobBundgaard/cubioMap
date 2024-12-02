// services/api.js
import { parse as parseWKT } from "terraformer-wkt-parser";
import { parseLocation } from "../utils/wktUtils"; // Opdateret sti, så den matcher strukturen

const BASE_URL = "http://127.0.0.1:8000/api";

const headers = {
  "Content-Type": "application/json",
};

const handleResponse = async (response) => {
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "API error");
    }
  
    // Hvis der ikke er indhold i responsen (204 No Content)
    const contentType = response.headers.get("Content-Type");
    if (!contentType || contentType.indexOf("application/json") === -1) {
      return null; // Returnér null, hvis der ikke er JSON-indhold
    }
  
    return response.json(); // Fortsæt med at parse JSON for andre svar
  };

export const apiGet = async (endpoint) => {
  const response = await fetch(`${BASE_URL}${endpoint}`, { method: "GET", headers });
  return handleResponse(response);
};

export const apiPost = async (endpoint, body, isFormData = false) => {
    const options = {
      method: "POST",
      body,
    };
  
    if (!isFormData) {
      options.headers = headers;
      options.body = JSON.stringify(body);
    }
  
    const response = await fetch(`${BASE_URL}${endpoint}`, options);

    // Fejlhåndtering for bedre logs
    if (!response.ok) {
        const errorDetails = await response.json();
        console.error(`Error from server:`, errorDetails); // Log serverens fejl
        throw new Error(errorDetails.detail || "API error"); // Returner fejl
    }

    return handleResponse(response);
  };

  export const apiPatch = async (endpoint, body, isFormData = false) => {
    const options = {
      method: "PATCH",
      body,
    };
  
    if (!isFormData) {
      options.headers = headers;
      options.body = JSON.stringify(body);
    }
  
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    return handleResponse(response);
  };

export const apiDelete = async (endpoint) => {
  const response = await fetch(`${BASE_URL}${endpoint}`, { method: "DELETE", headers });
  return handleResponse(response);
};

// Specific API functions

export const fetchSavedAreas = async (userId) => {
  const data = await apiGet(`/user-selected-areas/by_user/?user_id=${userId}`);
  return data.map((area) => {
    const cleanedGeom = area.geom.replace(/^SRID=\d+;/, ""); // Fjerner SRID=XXXX;
    return {
      ...area,
      nature_value: parseFloat(area.nature_value),
      area_size: parseFloat(area.area_size),
      geom: parseWKT(cleanedGeom), // Konverterer WKT til GeoJSON
    };
  });
};

export const fetchProjects = async () => {
  const data = await apiGet("/projects/");
  return data.map((project) => ({
    ...project,
    location: parseLocation(project.location), // Parser projektlokation
  }));
};

export const saveSelectedAreasAPI = (geoJSON, selectedArea, userId) =>
  apiPost("/user-selected-areas/", {
    ...(selectedArea?.name ? { name: selectedArea.name } : {}),
    natureValue: selectedArea?.natureValue || 0,
    areaSize: selectedArea?.areaSize || 0,
    geom: JSON.stringify(geoJSON),
    user_id: userId,
  });

export const savePolygonAreasAPI = (selectedArea, userId) =>
  apiPost("/user-selected-areas/save-polygon/", {
    name: selectedArea.name,
    natureValue: selectedArea.natureValue || 0,
    areaSize: selectedArea.areaSize || 0,
    geom: JSON.stringify(selectedArea.geom),
    user_id: userId,
  });

export const deleteSavedAreaAPI = (areaId) => apiDelete(`/user-selected-areas/${areaId}/`);

export const createProjectAPI = (projectData) => apiPost("/projects/", projectData, true);

export const updateProjectAPI = (projectId, updatedData) =>
  apiPatch(`/projects/${projectId}/`, updatedData, true);

export const deleteProjectAPI = (projectId) => apiDelete(`/projects/${projectId}/`);

export const createAreaProjectAPI = (projectData) => apiPost("/area-projects/", projectData, true);

export const fetchProjectsByArea = async (areaId) => apiGet(`/area-projects/by_area/?area_id=${areaId}`);

export const updateAreaProjectAPI = (projectId, updatedData) => apiPatch(`/area-projects/${projectId}/`, updatedData, true);

export const deleteAreaProjectAPI = (projectId) => apiDelete(`/area-projects/${projectId}/`);

