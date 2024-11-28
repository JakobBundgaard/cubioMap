import MapComponent from "./components/MapComponent";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import { useState, useEffect } from "react";
import ProjectForm from "./components/ProjectForm";
import {
  fetchSavedAreas,
  fetchProjects,
  saveSelectedAreasAPI,
  savePolygonAreasAPI,
  deleteSavedAreaAPI,
  createProjectAPI, 
  updateProjectAPI, 
  deleteProjectAPI  
} from "./utils/api";


function App() {
  const [selectedArea, setSelectedArea] = useState(null);
  const [isMultiSelectActive, setIsMultiSelectActive] = useState(false);
  const [isDrawActive, setIsDrawActive] = useState(false);
  const [isInsectMarkersVisible, setIsInsectMarkersVisible] = useState(false);
  const [isProjectMarkersVisible, setIsProjectMarkersVisible] = useState(false);

  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [projectLocation, setProjectLocation] = useState(null);
  const [projectsData, setProjectsData] = useState([]);

  const [selectedProject, setSelectedProject] = useState(null);
  const [isEditingProject, setIsEditingProject] = useState(false);

  const [selectedAreas, setSelectedAreas] = useState([]);

  const [isSavedAreasVisible, setIsSavedAreasVisible] = useState(false); 
  const [savedAreas, setSavedAreas] = useState([]);

  const [activeLayer, setActiveLayer] = useState(null);

  useEffect(() => {
    console.log("isCreatingProject ændret til:", isCreatingProject);
  }, [isCreatingProject]);

  useEffect(() => {
    console.log("Saved Areas:", savedAreas);
    console.log("Saved Areas Visibility:", isSavedAreasVisible);
  }, [savedAreas, isSavedAreasVisible]);

  // Funktion til at hente gemte områder
  const fetchSavedAreasInApp = async () => {
    try {
        const areas = await fetchSavedAreas(1); 
        setSavedAreas(areas); 
    } catch (error) {
        console.error("Error fetching saved areas in App.jsx:", error);
    }
};

const saveSelectedAreas = async () => {
  if (selectedAreas.length === 0 && (!selectedArea || !selectedArea.geom)) {
    alert("Ingen områder valgt!");
    return;
  }

  try {
    let geoJSON;

    // Hvis det er kvadrater (multiple selection)
    if (selectedAreas.length > 0) {
      const polygons = selectedAreas.map((area) => {
        if (!area.bounds || area.bounds.length !== 2) {
          throw new Error(`Området "${area.name}" har ugyldige koordinater.`);
        }
        const [southWest, northEast] = area.bounds;
        return [
          [southWest[1], southWest[0]],
          [northEast[1], southWest[0]],
          [northEast[1], northEast[0]],
          [southWest[1], northEast[0]],
          [southWest[1], southWest[0]],
        ];
      });

      geoJSON = {
        type: "MultiPolygon",
        coordinates: polygons.map((coords) => [coords]),
      };
    } else if (selectedArea?.geom) {
      geoJSON = selectedArea.geom;
    }

    console.log("Kombineret GeoJSON:", geoJSON);

    
    await saveSelectedAreasAPI(geoJSON, selectedArea, 1); 
    alert("Området blev gemt!");
    setSelectedAreas([]);
    fetchSavedAreasInApp(); 
  } catch (error) {
    console.error("Fejl ved gemning af området:", error);
    alert("Noget gik galt. Prøv igen.");
  }
};


const savePolygonAreas = async () => {
  if (!selectedArea || !selectedArea.geom) {
    alert("Ingen polygon valgt!");
    return;
  }

  try {
    await savePolygonAreasAPI(selectedArea, 1); 
    alert("Polygon blev gemt!");
    setSelectedArea(null); 
    fetchSavedAreasInApp(); 
  } catch (error) {
    console.error("Fejl ved gemning af polygon:", error);
    alert("Noget gik galt. Prøv igen.");
  }
};

useEffect(() => {
    fetchSavedAreasInApp();
}, []);


  // Toggle-funktion
  const toggleSavedAreas = () => {
    setIsSavedAreasVisible((prev) => !prev);
    if (!isSavedAreasVisible) {
      fetchSavedAreasInApp();
    }
  };

  const deleteSavedArea = async (areaId) => {
    try {      
      await deleteSavedAreaAPI(areaId);      
      setSavedAreas((prevSavedAreas) =>
        prevSavedAreas.filter((area) => area.id !== areaId)
      );
      alert("Området blev slettet.");
    } catch (error) {
      console.error("Fejl ved sletning af området:", error);
      alert("Kunne ikke slette området. Prøv igen.");
    }
  };

  const toggleInsectMarkers = () => {
    setIsInsectMarkersVisible(!isInsectMarkersVisible);
  };

  const toggleProjectMarkers = () => {
    setIsProjectMarkersVisible(!isProjectMarkersVisible);
  };

  const fetchProjectsInApp = async () => {
    try {
      const projects = await fetchProjects();
      setProjectsData(projects);
    } catch (error) {
      console.error("Error fetching projects in App.jsx:", error);
    }
  };

  // Funktion til at oprette projekt
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
  
  useEffect(() => {
    fetchProjectsInApp(); 
  }, []);

  
  const startCreatingProject = () => {
    setIsCreatingProject(true);
    setProjectLocation(null);
  };

  // Funktion til at starte redigering
  const startEditingProject = (project) => {
    setSelectedProject(project);
    setIsEditingProject(true);
  };

  

  // Funktion til at opdatere projekt
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
  
    // Funktion til at slette projekt
const handleDelete = async (projectId) => {
  try {
    await deleteProjectAPI(projectId);
    alert("Projekt blev slettet!");
    fetchProjectsInApp(); 
  } catch (error) {
    console.error("Error deleting project:", error);
    alert("Noget gik galt. Prøv igen.");
  }
};

  // Funktion til at annullere redigering
  const cancelEditingProject = () => {
    setSelectedProject(null);
    setIsEditingProject(false);
  };



  useEffect(() => {
    console.log("Updated projectLocation in App:", projectLocation);
  }, [projectLocation]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      
      <Header />

      <div className="flex flex-grow overflow-hidden">
        <Sidebar
          selectedArea={selectedArea}
          isMultiSelectActive={isMultiSelectActive}
          setIsMultiSelectActive={setIsMultiSelectActive}
          isDrawActive={isDrawActive}
          setIsDrawActive={setIsDrawActive}
          toggleInsectMarkers={toggleInsectMarkers}
          isInsectMarkersVisible={isInsectMarkersVisible}
          isProjectMarkersVisible={isProjectMarkersVisible} 
          toggleProjectMarkers={toggleProjectMarkers}
          startCreatingProject={startCreatingProject}
          onSaveSelectedAreas={saveSelectedAreas} 
          selectedAreas={selectedAreas} 
          toggleSavedAreas={toggleSavedAreas} 
          isSavedAreasVisible={isSavedAreasVisible} 
          savedAreas={savedAreas}
          deleteSavedArea={deleteSavedArea}
          activeLayer={activeLayer} 
          setActiveLayer={setActiveLayer} 
          onSavePolygonAreas={savePolygonAreas}
        />

        
        <div className="flex-grow overflow-hidden">
          <MapComponent
            setSelectedArea={setSelectedArea}
            isMultiSelectActive={isMultiSelectActive}
            isDrawActive={isDrawActive}
            isInsectMarkersVisible={isInsectMarkersVisible}
            isProjectMarkersVisible={isProjectMarkersVisible}
            isCreatingProject={isCreatingProject} 
            setIsCreatingProject={setIsCreatingProject}  
            setProjectLocation={setProjectLocation}
            projectsData={projectsData}
            onUpdate={startEditingProject}
            onDelete={handleDelete}
            selectedAreas={selectedAreas} 
            setSelectedAreas={setSelectedAreas}
            savedAreas={savedAreas} 
            isSavedAreasVisible={isSavedAreasVisible} 
            activeLayer={activeLayer}
          />
        </div> 

        {projectLocation && (
          <ProjectForm
            project={{ location: projectLocation }}
            projectLocation={projectLocation}
            onSave={createProject}
            onCancel={() => {
            setProjectLocation(null);
            setIsCreatingProject(false);
            }}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "white",
              padding: "20px",
              border: "1px solid #ccc",
              zIndex: 10000,
              width: "400px",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          />
        )}

        {isEditingProject && selectedProject && (
                  <ProjectForm
                    project={selectedProject}
                    projectLocation={selectedProject.location}
                    onSave={saveUpdatedProject}
                    onCancel={cancelEditingProject}
                    style={{
                      position: "fixed",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      backgroundColor: "white",
                      padding: "20px",
                      border: "1px solid #ccc",
                      zIndex: 10000,
                      width: "400px",
                      maxHeight: "80vh",
                      overflowY: "auto",
                  }}
                />
            )}
      </div>
    </div>
  )
}



export default App
