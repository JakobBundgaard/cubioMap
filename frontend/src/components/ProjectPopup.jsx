import PropTypes from 'prop-types';

function ProjectPopup({ project, onUpdate, onDelete }) {

  const handleDeleteClick = () => {
    const confirmed = window.confirm(`Are you sure you want to delete the project "${project.name}"?`);
    if (confirmed) {
      onDelete();
    }
  };


  return (
    <div className="max-w-sm p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-bold text-gray-800">{project.name}</h3>
      <p className="mt-2 text-sm text-gray-500">
        <strong className="text-gray-700">Initiativtager:</strong> {project.initiatedBy}
      </p>
      <p className="mt-2 text-gray-600">{project.description}</p>
      {project.image_url && (
        <img
          src={project.image_url}
          alt={`${project.name} billede`}
          className="mt-4 w-full h-48 object-cover rounded-md border border-gray-200"
        />
      )}
      <div className="flex justify-between mt-4">
        {/* Update knap */}
        <button
          onClick={() => onUpdate(project)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
        >
          Update
        </button>
        {/* Delete knap */}
        <button
          onClick={handleDeleteClick}
          className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-300"
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
