import PropTypes from 'prop-types';
import { Tooltip as ReactTooltip } from "react-tooltip";
import 'react-tooltip/dist/react-tooltip.css';
import { BsPencilSquare } from "react-icons/bs";
import { TbPointerPlus } from "react-icons/tb";
import { BsBinoculars } from "react-icons/bs";
import { GoProjectSymlink } from "react-icons/go";
import { FaRegFolderOpen } from "react-icons/fa";
import { GoTrash } from "react-icons/go";


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
  onSaveSelectedAreas, // Ny funktion til at gemme valgte områder
  selectedAreas, // De valgte kvadrater
  toggleSavedAreas, // Ny prop
  isSavedAreasVisible,
  savedAreas,
  deleteSavedArea,
}) {
  const isAverageLabelNeeded = selectedArea && (selectedArea.name.includes(",") || selectedArea.name === "Brugerdefineret område");
  
  return (
    <aside className="bg-white w-80 p-4 border-l border-gray-300 shadow-lg">
          
        <div className="flex space-x-4 mb-4">
            <div
                title="Tegn område"
                className={`cursor-pointer ${isDrawActive ? "text-blue-500" : "hover:text-blue-500"}`}
                onClick={() => setIsDrawActive(!isDrawActive)}
            >
                <BsPencilSquare size={20} />
            </div>
            <div
                title="Vælg flere kvadrater"
                className={`cursor-pointer ${isMultiSelectActive ? "text-blue-500" : "hover:text-blue-500"}`}
                onClick={() => setIsMultiSelectActive(!isMultiSelectActive)}
            >
                <TbPointerPlus size={20} />
            </div>
            <div
                title="Vis detektioner"
                className={`cursor-pointer ${isInsectMarkersVisible ? "text-blue-500" : "hover:text-blue-500"}`}
                onClick={toggleInsectMarkers}
            >
                <BsBinoculars size={20} />
            </div>
            <div
              title="Vis projekter"
              className={`cursor-pointer ${isProjectMarkersVisible ? "text-blue-500" : "hover:text-blue-500"}`}
              onClick={() => {
                toggleProjectMarkers();
              }}
            >
              <GoProjectSymlink size={20} />
            </div>
            <div
              title="Vis Gemte Områder"
              className={`cursor-pointer ${isSavedAreasVisible ? "text-blue-500" : "hover:text-blue-500"}`}
              onClick={toggleSavedAreas}
            >
              <FaRegFolderOpen size={20} />
            </div>
        </div>

      <h2 className="text-lg font-bold mb-4">Detaljeret Information</h2>

      {selectedArea ? (
        <div>
          <p><strong>Område:</strong> {selectedArea.name}</p>
          <p><strong>Størrelse:</strong> {selectedArea.areaSize.toFixed(2)} m²</p>
          
          
          {selectedArea.shannonIndex !== null && (
            <p><strong>{isAverageLabelNeeded ? "Gennemsnitlig " : ""}Shannon Index:</strong> {selectedArea.shannonIndex}</p>
          )}
          {selectedArea.ndvi !== null && (
            <p><strong>{isAverageLabelNeeded ? "Gennemsnitlig " : ""}NDVI:</strong> {selectedArea.ndvi}</p>
          )}
          {selectedArea.soilQualityValue !== null && (
            <p><strong>{isAverageLabelNeeded ? "Gennemsnitlig " : ""}Jordkvalitet:</strong> {selectedArea.soilQualityValue}</p>
          )}

          
          <p>
            <strong>
              {isAverageLabelNeeded ? "Gennemsnitlig Naturværdi" : "Naturværdi"}
              :
            </strong>{" "}
            {selectedArea.natureValue}
          </p>
        </div>
      ) : (
        <p>Vælg et område på kortet for detaljer.</p>
      )}

{isSavedAreasVisible && (
    <div className="mt-4">
        <h3 className="font-semibold">Gemte Områder</h3>
        <ul className="mt-2">
            {savedAreas.length > 0 ? (
                savedAreas.map((area) => (
                    <li key={area.id} className="p-2 border-b border-gray-200 flex justify-between items-center">
                        <div>
                            <p><strong>{area.name}</strong></p>
                            <p>Størrelse: {area.area_size.toFixed(2)} m²</p>
                            <p>Gennemsnitlig Naturværdi: {area.nature_value.toFixed(2)}</p>
                        </div>
                        <GoTrash
                            onClick={() => {
                                if (window.confirm(`Er du sikker på, at du vil slette området "${area.name}"?`)) {
                                    deleteSavedArea(area.id);
                                }
                            }} // Popup for bekræftelse
                            className="text-red-500 cursor-pointer hover:text-red-700"
                            size={20} // Juster størrelsen på ikonet
                            title="Slet område" // Tooltip, når musen holdes over
                        />
                    </li>
                ))
            ) : (
                <p>Ingen gemte områder.</p>
            )}
        </ul>
    </div>
)}

      <div>
        <button
            data-tooltip-id="create-project-tooltip"
            data-tooltip-content="Klik på knappen og derefter på kortet"  
            onClick={startCreatingProject}
            className="bg-green-500 hover:bg-green-600 text-white p-2 mt-4 rounded-md"
          >
            Opret Projekt
        </button>
        <ReactTooltip id="create-project-tooltip" place="top-end" />
      </div>
      

      <button
        onClick={onSaveSelectedAreas}
        disabled={selectedAreas.length === 0} // Deaktiver, hvis ingen områder er valgt
        className={`p-2 mt-4 rounded-md ${
          selectedAreas.length === 0
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
      >
        Gem område
      </button>

    </aside>
  );
};

// Props validation med PropTypes
Sidebar.propTypes = {
    selectedArea: PropTypes.shape({
      name: PropTypes.string.isRequired,
      natureValue: PropTypes.number.isRequired,
      areaSize: PropTypes.number.isRequired,
      shannonIndex: PropTypes.number,
      ndvi: PropTypes.number,
      soilQualityValue: PropTypes.number,
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
    onSaveSelectedAreas: PropTypes.func.isRequired, // Ny prop
    selectedAreas: PropTypes.array.isRequired,
    toggleSavedAreas: PropTypes.func.isRequired,
    isSavedAreasVisible: PropTypes.bool.isRequired,
    savedAreas: PropTypes.array.isRequired,
    deleteSavedArea: PropTypes.func.isRequired,
};

export default Sidebar;



