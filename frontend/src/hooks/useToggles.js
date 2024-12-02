import { useState, useCallback } from "react";

export function useToggles() {
  // State for toggles
  const [isSavedAreasVisible, setIsSavedAreasVisible] = useState(false);
  const [isInsectMarkersVisible, setIsInsectMarkersVisible] = useState(false);
  const [isProjectMarkersVisible, setIsProjectMarkersVisible] = useState(false);

  // Toggle handlers
  const toggleSavedAreas = useCallback(() => {
    setIsSavedAreasVisible((prev) => !prev);
  }, []);

  const toggleInsectMarkers = useCallback(() => {
    setIsInsectMarkersVisible((prev) => !prev);
  }, []);

  const toggleProjectMarkers = useCallback(() => {
    setIsProjectMarkersVisible((prev) => !prev);
  }, []);

  return {
    isSavedAreasVisible,
    isInsectMarkersVisible,
    isProjectMarkersVisible,
    toggleSavedAreas,
    toggleInsectMarkers,
    toggleProjectMarkers,
  };
}
