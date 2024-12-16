
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
          return area.natureValue; 
      }
    });
  
    
    return Math.max(...values.filter((v) => v !== undefined && v !== null), 0);
  };
  