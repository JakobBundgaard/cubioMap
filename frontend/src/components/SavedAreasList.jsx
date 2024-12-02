// SavedAreasList.jsx
import PropTypes from "prop-types";
import { GoTrash } from "react-icons/go";

function SavedAreasList({ savedAreas, deleteSavedArea }) {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-800">Gemte Områder</h3>
      <ul className="mt-4 space-y-4">
        {savedAreas.length > 0 ? (
          savedAreas.map((area) => (
            <li
              key={area.id}
              className="bg-white rounded-lg p-4 shadow-sm flex justify-between items-center space-x-4"
            >
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
                  size={24}
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
  );
}

SavedAreasList.propTypes = {
  savedAreas: PropTypes.array.isRequired,
  deleteSavedArea: PropTypes.func.isRequired,
};

export default SavedAreasList;
