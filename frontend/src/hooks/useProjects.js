import { useState, useEffect } from "react";
import {
  fetchProjects,
  createProjectAPI,
  updateProjectAPI,
  deleteProjectAPI,
} from "../services/api";

export function useProjects() {
  const [projectsData, setProjectsData] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [projectLocation, setProjectLocation] = useState(null);

  // Fetch projects from API
  const fetchProjectsInApp = async () => {
    try {
      const projects = await fetchProjects();
      setProjectsData(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  // Create new project
  const createProject = async (projectData) => {
    try {
      await createProjectAPI(projectData);
      alert("Projekt blev oprettet!");
      fetchProjectsInApp();
      setIsCreatingProject(false);
      setProjectLocation(null);
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Noget gik galt. Prøv igen.");
    }
  };

  // Update existing project
  const saveUpdatedProject = async (updatedData) => {
    if (!selectedProject) return;
    try {
      await updateProjectAPI(selectedProject.id, updatedData);
      alert("Projekt blev opdateret!");
      fetchProjectsInApp();
      setSelectedProject(null);
      setIsEditingProject(false);
    } catch (error) {
      console.error("Error updating project:", error);
      alert("Noget gik galt. Prøv igen.");
    }
  };

  // Delete project
  const deleteProject = async (projectId) => {
    try {
      await deleteProjectAPI(projectId);
      alert("Projekt blev slettet!");
      fetchProjectsInApp();
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Noget gik galt. Prøv igen.");
    }
  };

  // Start creating project
  const startCreatingProject = () => {
    setIsCreatingProject(true);
    setProjectLocation(null);
  };

  // Start editing project
  const startEditingProject = (project) => {
    setSelectedProject(project);
    setIsEditingProject(true);
  };

  // Cancel editing
  const cancelEditingProject = () => {
    setSelectedProject(null);
    setIsEditingProject(false);
    setIsCreatingProject(false); 
    setProjectLocation(null); 
  };

  useEffect(() => {
    fetchProjectsInApp();
  }, []);

  return {
    projectsData,
    selectedProject,
    isEditingProject,
    isCreatingProject,
    projectLocation,
    setProjectLocation,
    createProject,
    saveUpdatedProject,
    deleteProject,
    startCreatingProject,
    startEditingProject,
    cancelEditingProject,
  };
}
