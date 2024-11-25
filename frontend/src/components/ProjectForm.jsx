// src/components/ProjectForm.jsx
import { useState, useEffect } from "react";
import PropTypes from "prop-types";

function ProjectForm({ project, projectLocation, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: project?.name || "",
    description: project?.description || "",
    latitude: projectLocation?.lat || "",
    longitude: projectLocation?.lng || "",
    initiatedBy: project?.initiatedBy || "",
    image: null,
  });

 
    useEffect(() => {
        console.log("Received projectLocation in ProjectForm:", projectLocation);
    if (projectLocation) {
      setFormData((prevData) => ({
        ...prevData,
        latitude: projectLocation.lat,
        longitude: projectLocation.lng,
      }));
    }
  }, [projectLocation]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(); 
  
    // Konvertér latitude og longitude til WKT-format
    const wktLocation = `POINT(${formData.longitude} ${formData.latitude})`;
  
    
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("location", wktLocation); 
    data.append("initiatedBy", formData.initiatedBy);
    if (formData.image) {
      data.append("image", formData.image); 
    }
  
    onSave(data);
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
          value={formData.latitude} 
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
          value={formData.longitude}
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
      <div>
        <label>Image:</label>
        <input type="file" name="image" onChange={handleChange} className="w-full border p-2" />
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
