import * as L from "leaflet";


export const calculateAreaSize = (bounds) => {
  if (!bounds || bounds.length !== 2) return 0;

  const [southWest, northEast] = bounds;
  const latDiff = Math.abs(northEast[0] - southWest[0]);
  const lngDiff = Math.abs(northEast[1] - southWest[1]);
  const latDistance = latDiff * 111320;
  const lngDistance = lngDiff * 111320 * Math.cos(southWest[0] * (Math.PI / 180));

  return parseFloat((latDistance * lngDistance).toFixed(2));
};


export const calculateAverageValuesForDrawnArea = (layer, areas) => {
  const overlappingAreas = areas.filter((area) => {
    const areaBounds = L.latLngBounds(area.bounds);

    if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
      const drawnBounds = L.latLngBounds(layer.getLatLngs()[0]);
      return areaBounds.overlaps(drawnBounds) || drawnBounds.contains(areaBounds);
    } else if (layer instanceof L.Circle) {
      const center = layer.getLatLng();
      const radius = layer.getRadius();
      return (
        areaBounds.contains(center) ||
        areaBounds.distanceTo(center) <= radius ||
        areaBounds.within(layer.getBounds())
      );
    }

    return false;
  });

  const totalNatureValue = overlappingAreas.reduce((acc, area) => acc + (area.natureValue || 0), 0);
  const totalShannonIndex = overlappingAreas.reduce((acc, area) => acc + (area.shannonIndex || 0), 0);
  const totalNDVI = overlappingAreas.reduce((acc, area) => acc + (area.ndvi || 0), 0);
  const totalSoilQualityValue = overlappingAreas.reduce(
    (acc, area) => acc + (area.soilQualityValue || 0),
    0
  );

  const averageNatureValue =
    overlappingAreas.length > 0 ? parseFloat((totalNatureValue / overlappingAreas.length).toFixed(2)) : 0;
  const averageShannonIndex =
    overlappingAreas.length > 0
      ? parseFloat((totalShannonIndex / overlappingAreas.length).toFixed(2))
      : 0;
  const averageNDVI =
    overlappingAreas.length > 0 ? parseFloat((totalNDVI / overlappingAreas.length).toFixed(2)) : 0;
  const averageSoilQualityValue =
    overlappingAreas.length > 0
      ? parseFloat((totalSoilQualityValue / overlappingAreas.length).toFixed(2))
      : 0;

  return {
    natureValue: averageNatureValue,
    shannonIndex: averageShannonIndex,
    ndvi: averageNDVI,
    soilQualityValue: averageSoilQualityValue,
  };
};
