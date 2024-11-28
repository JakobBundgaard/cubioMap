import PropTypes from "prop-types";
import { BsPencilSquare, BsBinoculars } from "react-icons/bs";
import { TbPointerPlus } from "react-icons/tb";
import { GoProjectSymlink } from "react-icons/go";
import { FaRegFolderOpen } from "react-icons/fa";

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
        onClick={toggleProjectMarkers}
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
