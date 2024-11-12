import PropTypes from 'prop-types';
import { BsPencilSquare } from "react-icons/bs";
import { TbPointerPlus } from "react-icons/tb";
import { BsBinoculars } from "react-icons/bs";
import { GoProjectSymlink } from "react-icons/go";

function Sidebar({ selectedArea, isMultiSelectActive, setIsMultiSelectActive, isDrawActive, setIsDrawActive, toggleInsectMarkers, isInsectMarkersVisible, toggleProjectMarkers, isProjectMarkersVisible }) {
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
};

export default Sidebar;



