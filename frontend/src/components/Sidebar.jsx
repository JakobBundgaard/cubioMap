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
  onSaveSelectedAreas, 
  selectedAreas, 
  toggleSavedAreas, 
  isSavedAreasVisible,
  savedAreas,
  deleteSavedArea,
  activeLayer, // Ny prop
  setActiveLayer, // Ny prop
  onSavePolygonAreas,
}) {
  const isAverageLabelNeeded = selectedArea && (selectedArea.name.includes(",") || selectedArea.name === "Brugerdefineret område");
  
  return (
    <aside className="bg-gray-50 w-96 p-6 border-r border-gray-200 shadow-md flex flex-col">
          
      <div className="p-6">
          <div className="flex space-x-4 mb-6">
                <div
                    title="Marker område"
                    className={`cursor-pointer ${isDrawActive ? "text-blue-500" : "hover:text-blue-500"}`}
                    onClick={() => setIsDrawActive(!isDrawActive)}
                >
                    <BsPencilSquare size={24} />
                </div>
                <div
                    title="Vælg flere kvadrater"
                    className={`cursor-pointer ${isMultiSelectActive ? "text-blue-500" : "hover:text-blue-500"}`}
                    onClick={() => setIsMultiSelectActive(!isMultiSelectActive)}
                >
                    <TbPointerPlus size={24} />
                </div>
                <div
                    title="Vis detektioner"
                    className={`cursor-pointer ${isInsectMarkersVisible ? "text-blue-500" : "hover:text-blue-500"}`}
                    onClick={toggleInsectMarkers}
                >
                    <BsBinoculars size={24} />
                </div>
                <div
                  title="Vis projekter"
                  className={`cursor-pointer ${isProjectMarkersVisible ? "text-blue-500" : "hover:text-blue-500"}`}
                  onClick={() => {
                    toggleProjectMarkers();
                  }}
                >
                  <GoProjectSymlink size={24} />
                </div>
                <div
                  title="Vis Gemte Områder"
                  className={`cursor-pointer ${isSavedAreasVisible ? "text-blue-500" : "hover:text-blue-500"}`}
                  onClick={toggleSavedAreas}
                >
                  <FaRegFolderOpen size={24} />
                </div>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-800">Kortlag</h2>
        <div className="space-y-2 mt-4">
        <div className="flex items-center space-x-2">
          <input
            type="radio"
            id="none"
            name="activeLayer"
            value=""
            checked={activeLayer === null}
            onChange={() => setActiveLayer(null)} // Nulstil lag
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

          <h2 className="text-xl font-semibold text-gray-800 mt-4">Detaljeret område information</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-6">
        {selectedArea ? (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p
              className='truncate overflow-hidden whitespace-nowrap max-w-[16rem]'
              title={selectedArea.name}
            ><strong>Område:</strong> {selectedArea.name}
            </p>
            <p><strong>Størrelse:</strong> {selectedArea.areaSize.toFixed(2)} m²</p>
            
            
            {selectedArea.shannonIndex !== null && (
              <p><strong>{isAverageLabelNeeded ? "Gns. " : ""}Shannon Index:</strong> {selectedArea.shannonIndex}</p>
            )}
            {selectedArea.ndvi !== null && (
              <p><strong>{isAverageLabelNeeded ? "Gns. " : ""}NDVI:</strong> {selectedArea.ndvi}</p>
            )}
            {selectedArea.soilQualityValue !== null && (
              <p><strong>{isAverageLabelNeeded ? "Gns. " : ""}Jordkvalitet:</strong> {selectedArea.soilQualityValue}</p>
            )}

            
            <p>
              <strong>
                {isAverageLabelNeeded ? "Gns. Naturværdi" : "Naturværdi"}
                :
              </strong>{" "}
              {selectedArea.natureValue}
            </p>
          </div>
        ) : (
          <p className="text-gray-500 italic">Vælg et område på kortet for detaljer.</p>
        )}

        {isSavedAreasVisible && (
            <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800">Gemte Områder</h3>
                <ul className="mt-4 space-y-4">
                    {savedAreas.length > 0 ? (
                        savedAreas.map((area) => (
                          <li
                            key={area.id}
                            className="bg-white rounded-lg p-4 shadow-sm flex justify-between items-center space-x-4">
                                <div>
                              <p
                                className="font-semibold truncate overflow-hidden whitespace-nowrap max-w-[12rem]"
                                title={area.name}
                              >
                                {area.name}
                              </p>
                                    <p>Størrelse: {area.area_size.toFixed(2)} m²</p>
                                    <p>Gns. Naturværdi: {area.nature_value.toFixed(2)}</p>
                                </div>
                                <div className="flex items-center justify-center w-10 h-10">
                                  <GoTrash
                                    onClick={() => {
                                      if (
                                        window.confirm(
                                          `Er du sikker på, at du vil slette området "${area.name}"?`
                                        )
                                      ) {
                                        deleteSavedArea(area.id);
                                      }
                                    }}
                                    className="text-red-500 cursor-pointer hover:text-red-700"
                                    size={24} // Gør størrelsen ens
                                    title="Slet område"
                                  />
                                </div>
                            </li>
                        ))
                    ) : (
                        <p className="text-gray-500 italic">Ingen gemte områder.</p>
                    )}
                </ul>
            </div>
        )}
      </div>
        <div className="p-6">
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
            disabled={selectedAreas.length === 0 && !isDrawActive} // Deaktiver, hvis ingen områder er valgt
            className={`w-full mt-4 py-2 rounded-md text-sm font-medium ${
              selectedAreas.length === 0 && !isDrawActive
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
};


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
    onSaveSelectedAreas: PropTypes.func.isRequired, // Ny prop
    selectedAreas: PropTypes.array.isRequired,
    toggleSavedAreas: PropTypes.func.isRequired,
    isSavedAreasVisible: PropTypes.bool.isRequired,
    savedAreas: PropTypes.array.isRequired,
    deleteSavedArea: PropTypes.func.isRequired,
    activeLayer: PropTypes.string,
  setActiveLayer: PropTypes.func.isRequired,
  onSavePolygonAreas: PropTypes.func.isRequired,
};

export default Sidebar;



