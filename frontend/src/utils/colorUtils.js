
/**
 * Beregn farve baseret på en værdi, dens maksimale værdi og det aktive lag.
 * @param {number} value - Den aktuelle værdi.
 * @param {number} maxValue - Den maksimale værdi.
 * @param {string} activeLayer - Det aktuelle aktive lag (f.eks. Shannon Index, NDVI).
 * @returns {string} - En RGB-farve som string.
 */
export const getColorForValue = (value, maxValue, activeLayer) => {
    if (!activeLayer || value === null || value === undefined) return "green"; // Standardfarve
    const ratio = value / maxValue;
    return `rgb(${255 - ratio * 255}, ${255 - ratio * 100}, ${100 + ratio * 100})`; // Dynamisk RGB-farve
  };
  