import PropTypes from "prop-types";

function AreaDetails({ selectedArea }) {
  if (!selectedArea) {
    return <p className="text-gray-500 italic">Vælg et område på kortet for detaljer.</p>;
  }

  const isAverageLabelNeeded =
    selectedArea.name.includes(",") || selectedArea.name === "Brugerdefineret område";

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <p
        className="truncate overflow-hidden whitespace-nowrap max-w-[16rem]"
        title={selectedArea.name}
      >
        <strong>Område:</strong> {selectedArea.name}
      </p>
      <p>
        <strong>Størrelse:</strong> {selectedArea.areaSize.toFixed(2)} m²
      </p>

      {selectedArea.shannonIndex !== null && (
        <p>
          <strong>{isAverageLabelNeeded ? "Gns. " : ""}Shannon Index:</strong>{" "}
          {selectedArea.shannonIndex}
        </p>
      )}
      {selectedArea.ndvi !== null && (
        <p>
          <strong>{isAverageLabelNeeded ? "Gns. " : ""}NDVI:</strong> {selectedArea.ndvi}
        </p>
      )}
      {selectedArea.soilQualityValue !== null && (
        <p>
          <strong>{isAverageLabelNeeded ? "Gns. " : ""}Jordkvalitet:</strong>{" "}
          {selectedArea.soilQualityValue}
        </p>
      )}

      <p>
        <strong>
          {isAverageLabelNeeded ? "Gns. Naturværdi" : "Naturværdi"}:
        </strong>{" "}
        {selectedArea.natureValue}
      </p>
    </div>
  );
}

AreaDetails.propTypes = {
  selectedArea: PropTypes.shape({
    name: PropTypes.string.isRequired,
    natureValue: PropTypes.number.isRequired,
    areaSize: PropTypes.number.isRequired,
    shannonIndex: PropTypes.number,
    ndvi: PropTypes.number,
    soilQualityValue: PropTypes.number,
  }),
};

export default AreaDetails;
