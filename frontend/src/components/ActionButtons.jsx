import PropTypes from "prop-types";
import { BsPencilSquare, BsBinoculars } from "react-icons/bs";
import { TbPointerPlus } from "react-icons/tb";
import { FiMapPin } from "react-icons/fi";
import { TfiMapAlt } from "react-icons/tfi";

const ActionButtons = ({
  isDrawActive,
  setIsDrawActive,
  isMultiSelectActive,
  setIsMultiSelectActive,
  toggleInsectMarkers,
  isInsectMarkersVisible,
  toggleProjectMarkers,
  isProjectMarkersVisible,
  toggleSavedAreas,
  isSavedAreasVisible,
}) => {
  return (
    <div className="flex space-x-4 mb-6">
      <div
        title="Marker område"
        className={`cursor-pointer ${isDrawActive ? "text-blue-500" : "hover:text-blue-500"}`}
        // onClick={() => setIsDrawActive(!isDrawActive)}
        onClick={() => {
          setIsDrawActive(!isDrawActive);
          if (!isDrawActive) setIsMultiSelectActive(false); // Deaktiver den anden knap
        }}
      >
        <BsPencilSquare size={24} />
      </div>
      <div
        title="Vælg flere kvadrater"
        className={`cursor-pointer ${isMultiSelectActive ? "text-blue-500" : "hover:text-blue-500"}`}
        // onClick={() => setIsMultiSelectActive(!isMultiSelectActive)}
        onClick={() => {
          setIsMultiSelectActive(!isMultiSelectActive);
          if (!isMultiSelectActive) setIsDrawActive(false); // Deaktiver den anden knap
        }}
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
        title="Vis markører"
        className={`cursor-pointer ${isProjectMarkersVisible ? "text-blue-500" : "hover:text-blue-500"}`}
        onClick={toggleProjectMarkers}
      >
        <FiMapPin size={24} />
      </div>
      <div
        title="Vis Gemte Områder"
        className={`cursor-pointer ${isSavedAreasVisible ? "text-blue-500" : "hover:text-blue-500"}`}
        onClick={toggleSavedAreas}
      >
        <TfiMapAlt size={24} />
      </div>
    </div>
  );
};

ActionButtons.propTypes = {
  isDrawActive: PropTypes.bool.isRequired,
  setIsDrawActive: PropTypes.func.isRequired,
  isMultiSelectActive: PropTypes.bool.isRequired,
  setIsMultiSelectActive: PropTypes.func.isRequired,
  toggleInsectMarkers: PropTypes.func.isRequired,
  isInsectMarkersVisible: PropTypes.bool.isRequired,
  toggleProjectMarkers: PropTypes.func.isRequired,
  isProjectMarkersVisible: PropTypes.bool.isRequired,
  toggleSavedAreas: PropTypes.func.isRequired,
  isSavedAreasVisible: PropTypes.bool.isRequired,
};

export default ActionButtons;
