import { parse as parseWKT } from "terraformer-wkt-parser";

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
