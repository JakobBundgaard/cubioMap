import { useState, useEffect } from "react";
import PropTypes from "prop-types";

function AreaProjectForm({ project, selectedArea, onSave, onCancel, initiatedBy }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "planned",
    dateInitiated: "",
    expectedDuration: "",
    image: null,
    area: selectedArea?.id || null, // Relateret område
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || "",
        description: project.description || "",
        status: project.status || "planned",
        dateInitiated: project.date_initiated || "",
        expectedDuration: project.expected_duration || "",
        image: null, // Sætter billede som null, da vi ikke har direkte adgang til filen
        area: project.area || null,
      });
    }
  }, [project]);

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
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("status", formData.status);
    data.append("date_initiated", formData.dateInitiated);
    data.append("expected_duration", formData.expectedDuration);
    data.append("area", formData.area);
    data.append("initiated_by", initiatedBy);
    if (formData.image) {
      data.append("image", formData.image);
    }
    onSave(data);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white shadow-md rounded-lg p-6 max-w-lg mx-auto"
    >
      <h2 className="text-xl font-bold text-gray-800">
        {project ? "Rediger Projekt" : "Opret Nyt Projekt"}
      </h2>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Projekt Navn:
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Beskrivelse:
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status:
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="planned">Planlagt</option>
          <option value="in_progress">I Gang</option>
          <option value="completed">Afsluttet</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Startdato:
        </label>
        <input
          type="date"
          name="dateInitiated"
          value={formData.dateInitiated}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Varighed (dage):
        </label>
        <input
          type="number"
          name="expectedDuration"
          value={formData.expectedDuration}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Billede:
        </label>
        <input
          type="file"
          name="image"
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex space-x-4">
        <button
          type="submit"
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md shadow-md"
        >
          Gem
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-2 px-4 rounded-md shadow-md"
        >
          Annuller
        </button>
      </div>
    </form>
  );
}

AreaProjectForm.propTypes = {
  project: PropTypes.object,
  selectedArea: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  initiatedBy: PropTypes.number.isRequired,
};

export default AreaProjectForm;


// import { useState } from "react";
// import PropTypes from "prop-types";

// function AreaProjectForm({ project, selectedArea, onSave, onCancel, initiatedBy }) {
//     console.log("Received props:", { project, selectedArea, initiatedBy }); 
//     const [formData, setFormData] = useState({
//         name: project?.name || "",
//         description: project?.description || "",
//         status: project?.status || "planned",
//         dateInitiated: project?.date_initiated || "",
//         expectedDuration: project?.expected_duration || "",
//         image: null,
//         area: selectedArea?.id || null, // Relateret område
//     });

//     const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleChange = (e) => {
//     const { name, value, files } = e.target;
//     setFormData((prevData) => ({
//       ...prevData,
//       [name]: files ? files[0] : value,
//     }));
//   };

//   const handleSubmit = (e) => {
//       e.preventDefault();
      
//       if (isSubmitting) return; // Forhindr flere tryk
//       setIsSubmitting(true);

//     const data = new FormData();
//     data.append("name", formData.name);
//     data.append("description", formData.description);
//     data.append("status", formData.status);
//     data.append("date_initiated", formData.dateInitiated);
//     data.append("expected_duration", formData.expectedDuration);
//       data.append("area", formData.area);
//       data.append("initiated_by", initiatedBy);
//     if (formData.image) {
//       data.append("image", formData.image);
//       }
//       console.log("Calling API with data:", Object.fromEntries(data.entries()));
//     onSave(data);
//   };
//   console.log("Rendering AreaProjectForm...");
//     return (
//         <>
           
//         <form
//           onSubmit={handleSubmit}
//           className="space-y-6 bg-white shadow-md rounded-lg p-6 max-w-lg mx-auto"
//         >
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Project Name:
//             </label>
//             <input
//               type="text"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               required
//               className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Description:
//             </label>
//             <textarea
//               name="description"
//               value={formData.description}
//               onChange={handleChange}
//               required
//               className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Status:
//             </label>
//             <select
//               name="status"
//               value={formData.status}
//               onChange={handleChange}
//               required
//               className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="planned">Planned</option>
//               <option value="in_progress">In Progress</option>
//               <option value="completed">Completed</option>
//             </select>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Date Initiated:
//             </label>
//             <input
//               type="date"
//               name="dateInitiated"
//               value={formData.dateInitiated}
//               onChange={handleChange}
//               required
//               className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Expected Duration (days):
//             </label>
//             <input
//               type="number"
//               name="expectedDuration"
//               value={formData.expectedDuration}
//               onChange={handleChange}
//               required
//               className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Image:
//             </label>
//             <input
//               type="file"
//               name="image"
//               onChange={handleChange}
//               className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//           <div className="flex space-x-4">
//             <button
//                         type="submit"
//                         disabled={isSubmitting}
//               className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md shadow-md"
//             >
//               {isSubmitting ? "Saving..." : "Save"}
//             </button>
//             <button
//               type="button"
//               onClick={onCancel}
//               className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-2 px-4 rounded-md shadow-md"
//             >
//               Cancel
//             </button>
//           </div>
//         </form>
//       </>
      
//   );
// }

// AreaProjectForm.propTypes = {
//   project: PropTypes.object,
//   selectedArea: PropTypes.object.isRequired,
//   onSave: PropTypes.func.isRequired,
//     onCancel: PropTypes.func.isRequired,
//     initiatedBy: PropTypes.number.isRequired,
// };

// export default AreaProjectForm;
