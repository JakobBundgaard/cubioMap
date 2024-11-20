import { parseFromWK } from "wkt-parser-helper";

export const wktToBounds = (wkt) => {
    const geometry = parseFromWK(wkt);
  if (geometry && geometry.type === "Polygon") {
    const coordinates = geometry.coordinates[0];
    const southWest = [coordinates[0][1], coordinates[0][0]]; // Startpunkt
    const northEast = [coordinates[2][1], coordinates[2][0]]; // Modsat hjørne
    return [southWest, northEast];
  }
  return null;
};

// Funktion til at konvertere en WKT-streng til et objekt med lat/lng
export function parseLocation(wktString) {
  const match = /POINT \(([^ ]+) ([^ ]+)\)/.exec(wktString);
  if (match) {
    const lon = parseFloat(match[1]);
    const lat = parseFloat(match[2]);
    return { lat, lng: lon };
  }
  return { lat: undefined, lng: undefined }; // Returner undefined hvis ikke i forventet format
}
