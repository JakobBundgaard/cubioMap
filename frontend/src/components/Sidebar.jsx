import PropTypes from 'prop-types';
import { Tooltip as ReactTooltip } from "react-tooltip"; 
import 'react-tooltip/dist/react-tooltip.css'; 
import ActionButtons from "./ActionButtons"; 
import SavedAreasList from './SavedAreasList';
import AreaDetails from "./AreaDetails"; 

function Sidebar({
  selectedArea,
  isMultiSelectActive,
  setIsMultiSelectActive,
  isDrawActive,
  setIsDrawActive,
  toggleInsectMarkers,
  isInsectMarkersVisible,
  toggleProjectMarkers,
  isProjectMarkersVisible,
  startCreatingProject,
  onSaveSelectedAreas, 
  selectedAreas, 
  toggleSavedAreas, 
  isSavedAreasVisible,
  savedAreas,
  deleteSavedArea,
  activeLayer,
  setActiveLayer,
  onSavePolygonAreas,
  startCreatingAreaProject,
  startEditingAreaProject,
  deleteAreaProject,
}) {
  return (
    <aside className="bg-gray-50 w-96 border-r border-gray-200 shadow-md flex flex-col h-full">
      {/* Øverste sektion */}
      <div className="p-6 flex-shrink-0">
        <ActionButtons
          isMultiSelectActive={isMultiSelectActive}
          setIsMultiSelectActive={setIsMultiSelectActive}
          isDrawActive={isDrawActive}
          setIsDrawActive={setIsDrawActive}
          toggleInsectMarkers={toggleInsectMarkers}
          isInsectMarkersVisible={isInsectMarkersVisible}
          toggleProjectMarkers={toggleProjectMarkers}
          isProjectMarkersVisible={isProjectMarkersVisible}
          toggleSavedAreas={toggleSavedAreas}
          isSavedAreasVisible={isSavedAreasVisible}
        />

        {/* Lagvælger */}
        <h2 className="text-xl font-semibold text-gray-800">Kortlag</h2>
        <div className="space-y-2 mt-4">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="none"
              name="activeLayer"
              value=""
              checked={activeLayer === null}
              onChange={() => setActiveLayer(null)} 
              className="cursor-pointer"
            />
            <label htmlFor="none" className="cursor-pointer">Ingen lag</label>
          </div>
          {["Shannon Index", "NDVI", "Jordkvalitet", "Naturværdi"].map((layer) => (
            <div key={layer} className="flex items-center space-x-2">
              <input
                type="radio"
                id={layer}
                name="activeLayer"
                value={layer}
                checked={activeLayer === layer}
                onChange={() => setActiveLayer(layer)}
                className="cursor-pointer"
              />
              <label htmlFor={layer} className="cursor-pointer">
                {layer}
              </label>
            </div>
          ))}
        </div>

        {/* Detaljeret områdeinformation */}
        <AreaDetails selectedArea={selectedArea} />
      </div>

      {/* Scrollområde */}
      <div className="flex-grow overflow-y-auto px-6">
        {isSavedAreasVisible && (
          <SavedAreasList
            savedAreas={savedAreas}
            deleteSavedArea={deleteSavedArea}
            startCreatingAreaProject={startCreatingAreaProject}
            startEditingAreaProject={startEditingAreaProject}
            deleteAreaProject={deleteAreaProject}
          />
        )}
      </div>

      {/* Sticky Handling Buttons */}
      <div className="p-6 bg-gray-50 flex-shrink-0">
        <button
          data-tooltip-id="create-project-tooltip"
          data-tooltip-content="Klik på knappen og derefter på kortet"
          onClick={startCreatingProject}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-md text-sm font-medium"
        >
          Opret Projekt
        </button>
        <ReactTooltip id="create-project-tooltip" place="top-end" />

        <button
          onClick={onSaveSelectedAreas}
          disabled={!isMultiSelectActive || selectedAreas.length === 0} // Deaktiver, hvis ingen områder er valgt
          className={`w-full mt-4 py-2 rounded-md text-sm font-medium ${
            !isMultiSelectActive || selectedAreas.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Gem Rektangel
        </button>

        <button
          onClick={onSavePolygonAreas}
          disabled={!isDrawActive || !selectedArea || !selectedArea.geom}
          className={`w-full mt-4 py-2 rounded-md text-sm font-medium ${
            !isDrawActive || !selectedArea || !selectedArea.geom
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Gem Polygon
        </button>
      </div>
    </aside>
  );
}

Sidebar.propTypes = {
  selectedArea: PropTypes.shape({
    name: PropTypes.string.isRequired,
    natureValue: PropTypes.number.isRequired,
    areaSize: PropTypes.number.isRequired,
    shannonIndex: PropTypes.number,
    ndvi: PropTypes.number,
    soilQualityValue: PropTypes.number,
    geom: PropTypes.object,
  }),
  isMultiSelectActive: PropTypes.bool.isRequired,
  setIsMultiSelectActive: PropTypes.func.isRequired,
  isDrawActive: PropTypes.bool.isRequired,
  setIsDrawActive: PropTypes.func.isRequired,
  toggleInsectMarkers: PropTypes.func.isRequired,
  isInsectMarkersVisible: PropTypes.bool.isRequired,
  toggleProjectMarkers: PropTypes.func.isRequired,
  isProjectMarkersVisible: PropTypes.bool.isRequired,
  startCreatingProject: PropTypes.func.isRequired,
  onSaveSelectedAreas: PropTypes.func.isRequired,
  selectedAreas: PropTypes.array.isRequired,
  toggleSavedAreas: PropTypes.func.isRequired,
  isSavedAreasVisible: PropTypes.bool.isRequired,
  savedAreas: PropTypes.array.isRequired,
  deleteSavedArea: PropTypes.func.isRequired,
  activeLayer: PropTypes.string,
  setActiveLayer: PropTypes.func.isRequired,
  onSavePolygonAreas: PropTypes.func.isRequired,
  startCreatingAreaProject: PropTypes.func.isRequired,
  startEditingAreaProject: PropTypes.func.isRequired,
  deleteAreaProject: PropTypes.func.isRequired,
};

export default Sidebar;





