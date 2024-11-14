// src/components/ProjectForm.jsx
import { useState, useEffect } from "react";
import PropTypes from "prop-types";

function ProjectForm({ project, projectLocation, onSave, onCancel }) {
  // Initialiser formData med tomme strenge, som sikrer, at alle inputs starter som "controlled"
  const [formData, setFormData] = useState({
    name: project?.name || "",
    description: project?.description || "",
    latitude: projectLocation ? projectLocation.lat : project?.location?.coordinates?.[1] || "",
    longitude: projectLocation ? projectLocation.lng : project?.location?.coordinates?.[0] || "",
    initiatedBy: project?.initiatedBy || "",
  });

  // Brug useEffect til at opdatere formData, hvis projekt- eller koordinatdata ændrer sig
  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      name: project?.name || "",
      description: project?.description || "",
      latitude: projectLocation?.lat || project?.location?.coordinates?.[1] || "",
      longitude: projectLocation?.lng || project?.location?.coordinates?.[0] || "",
      initiatedBy: project?.initiatedBy || "",
    }));
  }, [project, projectLocation]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Kald onSave for at gemme projektdata
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label>Project Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full border p-2"
        />
      </div>
      <div>
        <label>Description:</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          className="w-full border p-2"
        />
      </div>
      <div>
        <label>Latitude:</label>
        <input
          type="number"
          name="latitude"
          value={formData.latitude || ""} // Sørg for, at værdi altid er en streng eller et tal
          onChange={handleChange}
          required
          className="w-full border p-2"
        />
      </div>
      <div>
        <label>Longitude:</label>
        <input
          type="number"
          name="longitude"
          value={formData.longitude || ""} // Sørg for, at værdi altid er en streng eller et tal
          onChange={handleChange}
          required
          className="w-full border p-2"
        />
      </div>
      <div>
        <label>Initiated By:</label>
        <input
          type="text"
          name="initiatedBy"
          value={formData.initiatedBy}
          onChange={handleChange}
          required
          className="w-full border p-2"
        />
      </div>
      <div className="flex space-x-4">
        <button type="submit" className="bg-blue-500 text-white p-2">Save</button>
        <button type="button" onClick={onCancel} className="bg-gray-500 text-white p-2">Cancel</button>
      </div>
    </form>
  );
}

ProjectForm.propTypes = {
  project: PropTypes.object,
  projectLocation: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }),
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default ProjectForm;
