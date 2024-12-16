

export const getColorForValue = (value, maxValue, activeLayer) => {
    if (!activeLayer || value === null || value === undefined) return "green"; // Standardfarve
    const ratio = value / maxValue;
    return `rgb(${255 - ratio * 255}, ${255 - ratio * 100}, ${100 + ratio * 100})`; // Dynamisk RGB-farve
  };
  