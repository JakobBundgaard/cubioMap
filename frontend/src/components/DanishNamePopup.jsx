import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { fetchDanishName } from "../utils/fetchDanishName";

function DanishNamePopup({ data }) {
  const [danishName, setDanishName] = useState("Henter dansk navn...");

  useEffect(() => {
    const fetchName = async () => {
      const name = await fetchDanishName(data.species);
      setDanishName(name);
    };

    fetchName();
  }, [data.species]);

  return (
    <div>
      <strong>Artsnavn (Latin):</strong> {data.species || "Ukendt"}<br />
      <strong>Dansk navn:</strong> {danishName}<br />
      <strong>Detektionsdato:</strong> {data.occurrence_date || "Ikke angivet"}
    </div>
  );
}

DanishNamePopup.propTypes = {
  data: PropTypes.shape({
    species: PropTypes.string.isRequired,
    occurrence_date: PropTypes.string,
    coordinates: PropTypes.string,
  }).isRequired,
};

export default DanishNamePopup;
