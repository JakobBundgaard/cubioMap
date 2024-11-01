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
