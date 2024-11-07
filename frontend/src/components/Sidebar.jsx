import PropTypes from 'prop-types';
import { BsPencilSquare } from "react-icons/bs";
import { TbPointerPlus } from "react-icons/tb";
// import { IoSettingsOutline } from "react-icons/io5";

function Sidebar({ selectedArea, isMultiSelectActive, setIsMultiSelectActive, isDrawActive, setIsDrawActive }) {
  return (
      <aside className="bg-white w-80 p-4 border-l border-gray-300 shadow-lg">
          
        <div className="flex space-x-4 mb-4">
            <div
                title="Tegn område"
                className={`cursor-pointer ${isDrawActive ? "text-blue-500" : "hover:text-blue-500"}`}
                onClick={() => setIsDrawActive(!isDrawActive)} // Aktiver/deaktiver tegnefunktionen
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
            {/* <div title="Indstillinger" className="cursor-pointer hover:text-blue-500">
                <IoSettingsOutline size={20} />
            </div> */}
        </div>

      <h2 className="text-lg font-bold mb-4">Detaljeret Information</h2>

          {/* Detaljer om det valgte område */}
          {selectedArea ? (
        <div>
          <p><strong>Område:</strong> {selectedArea.name}</p>
          <p><strong>Størrelse:</strong> {selectedArea.areaSize.toFixed(2)} m²</p>
          <p>
            {/* Ændrer etiketten til "Gennemsnitlig Naturværdi" for flere områder eller brugerdefinerede områder */}
            <strong>
              {selectedArea.name.includes(",") || selectedArea.name === "Brugerdefineret område" 
                ? "Gennemsnitlig Naturværdi" 
                : "Naturværdi"}
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
    }),
    isMultiSelectActive: PropTypes.bool.isRequired,
    setIsMultiSelectActive: PropTypes.func.isRequired,
    isDrawActive: PropTypes.bool.isRequired,
    setIsDrawActive: PropTypes.func.isRequired,
  };

export default Sidebar;
