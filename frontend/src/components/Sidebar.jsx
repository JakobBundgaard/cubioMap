import PropTypes from 'prop-types';

function Sidebar({ selectedArea }) {
  return (
    <aside className="bg-white w-80 p-4 border-l border-gray-300 shadow-lg">
      <h2 className="text-lg font-bold mb-4">Detaljeret Information</h2>

      {/* Detaljer om det valgte område */}
      {selectedArea ? (
        <div>
          <p><strong>Navn:</strong> {selectedArea.name}</p>
          <p><strong>Naturværdi:</strong> {selectedArea.natureValue}</p>
          <p><strong>Område:</strong> {selectedArea.areaSize} m²</p>
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
  };

export default Sidebar;
