/**
 * Find maksimumværdi for et specifikt aktivt lag fra en liste af områder.
 * @param {Array} areas - Liste af områder med værdier for forskellige lag.
 * @param {string} activeLayer - Det aktuelle aktive lag (f.eks. Shannon Index, NDVI).
 * @returns {number|null} - Maksimumværdien for det aktive lag eller null, hvis ikke relevant.
 */
export const getMaxValue = (areas, activeLayer) => {
    if (!activeLayer || !areas || areas.length === 0) return null;
  
    const values = areas.map((area) => {
      switch (activeLayer) {
        case "Shannon Index":
          return area.shannonIndex;
        case "NDVI":
          return area.ndvi;
        case "Jordkvalitet":
          return area.soilQualityValue;
        default:
          return area.natureValue; // Standard til Naturværdi
      }
    });
  
    // Filtrer for gyldige værdier og returner maksimumværdi
    return Math.max(...values.filter((v) => v !== undefined && v !== null), 0);
  };
  