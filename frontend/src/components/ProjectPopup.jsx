import PropTypes from 'prop-types';

function ProjectPopup({ project, onUpdate, onDelete }) {

  const handleDeleteClick = () => {
    const confirmed = window.confirm(`Are you sure you want to delete the project "${project.name}"?`);
    if (confirmed) {
      onDelete();
    }
  };


  return (
    <div>
      <h3>{project.name}</h3>
      <p><strong>Initiativtager:</strong> {project.initiatedBy}</p>
      <p>{project.description}</p>
      {project.image_url && (
        <img src={project.image_url} alt={`${project.name} billede`} style={{ width: '100%', height: 'auto' }} />
      )}
      <div className="flex space-x-2 mt-2">
        {/* Update knap */}
        <button
          onClick={() => onUpdate(project)}
          className="bg-blue-500 text-white p-1 rounded"
        >
          Update
        </button>
        {/* Delete knap */}
        <button
          onClick={handleDeleteClick}
          className="bg-red-500 text-white p-1 rounded"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

ProjectPopup.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    initiatedBy: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    image_url: PropTypes.string,
    location: PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default ProjectPopup;
