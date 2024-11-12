import PropTypes from 'prop-types';

function ProjectPopup({ project }) {
  return (
    <div>
      <h3>{project.name}</h3>
      <p><strong>Initiativtager:</strong> {project.initiatedBy}</p>
      <p>{project.description}</p>
      {project.image && (
        <img src={project.image} alt={`${project.name} billede`} style={{ width: '100%', height: 'auto' }} />
      )}
    </div>
  );
}

ProjectPopup.propTypes = {
  project: PropTypes.shape({
    name: PropTypes.string.isRequired,
    initiatedBy: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    image: PropTypes.string,
  }).isRequired,
};

export default ProjectPopup;
