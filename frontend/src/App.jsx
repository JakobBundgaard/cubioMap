import MapComponent from "./components/MapComponent";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import { useState, useEffect } from "react";
import ProjectForm from "./components/ProjectForm";
import { parseLocation } from "./utils/wktUtils";
import { parse as parseWKT } from "terraformer-wkt-parser";
// import * as turf from "@turf/turf";


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

  const [isSavedAreasVisible, setIsSavedAreasVisible] = useState(false); // Ny state
  const [savedAreas, setSavedAreas] = useState([]); // Ny state til gemte områder

  useEffect(() => {
    console.log("isCreatingProject ændret til:", isCreatingProject);
  }, [isCreatingProject]);

  useEffect(() => {
    console.log("Saved Areas:", savedAreas);
    console.log("Saved Areas Visibility:", isSavedAreasVisible);
  }, [savedAreas, isSavedAreasVisible]);

  // Funktion til at hente gemte områder
  const fetchSavedAreas = async () => {
    try {
        const response = await fetch("http://127.0.0.1:8000/api/user-selected-areas/by_user/?user_id=1");
        const data = await response.json();

        const formattedData = data.map((area) => {
            // Fjern SRID=4326; fra geom-strengen
            const cleanedGeom = area.geom.replace(/^SRID=\d+;/, ""); // Fjerner SRID=XXXX;
            return {
                ...area,
                nature_value: parseFloat(area.nature_value), // Konverter naturværdi til tal
                area_size: parseFloat(area.area_size), // Konverter areal til tal
                geom: parseWKT(cleanedGeom), // Konverter WKT til GeoJSON
            };
        });

        setSavedAreas(formattedData);
    } catch (error) {
        console.error("Error fetching saved areas:", error);
    }
};


  // Toggle-funktion
  const toggleSavedAreas = () => {
    setIsSavedAreasVisible((prev) => !prev);
    if (!isSavedAreasVisible) {
      fetchSavedAreas();
    }
  };

  const toggleInsectMarkers = () => {
    setIsInsectMarkersVisible(!isInsectMarkersVisible);
  };

  const toggleProjectMarkers = () => {
    setIsProjectMarkersVisible(!isProjectMarkersVisible);
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/projects/");
      const data = await response.json();
      const convertedData = data.map((project) => ({
        ...project,
        location: parseLocation(project.location), // Konverter til Leaflet's format
      }));
      setProjectsData(convertedData);
    } catch (error) {
      console.error("Error fetching projects data:", error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

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
            // Hvis det er en tegning, brug GeoJSON direkte
            geoJSON = selectedArea.geom;
        }

        console.log("Kombineret GeoJSON:", geoJSON);

        const response = await fetch("http://127.0.0.1:8000/api/user-selected-areas/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...(selectedArea?.name ? { name: selectedArea.name } : {}),
                natureValue: selectedArea?.natureValue || 0,
                areaSize: selectedArea?.areaSize || 0,
                geom: JSON.stringify(geoJSON),
                user_id: 1,
            }),
        });

        if (response.ok) {
            alert("Området blev gemt!");
            setSelectedAreas([]);
            fetchSavedAreas();
        } else {
            alert("Kunne ikke gemme området. Prøv igen.");
        }
    } catch (error) {
        console.error("Fejl ved gemning af området:", error);
        alert("Noget gik galt. Prøv igen.");
    }
};



  // const saveSelectedAreas = async () => {
  //   if (selectedAreas.length === 0) {
  //     alert("Ingen kvadrater valgt!");
  //     return;
  //   }
  
  //   try {
  //     // Tjek og luk polygonerne
  //     const polygons = selectedAreas.map((area) => {
  //       console.log("Behandler område:", area.name, area.bounds);
  
  //       // Kontroller, at bounds findes og har præcis 2 punkter (sydvest og nordøst)
  //       if (!area.bounds || area.bounds.length !== 2) {
  //         throw new Error(`Området "${area.name}" har ugyldige koordinater.`);
  //       }
  
  //       const [southWest, northEast] = area.bounds;
  
  //       // Generér fire hjørnepunkter for rektanglet (mod uret: sydvest, sydøst, nordøst, nordvest)
  //       const closedBounds = [
  //         [southWest[1], southWest[0]], // Sydvest (lng, lat)
  //         [northEast[1], southWest[0]], // Sydøst (lng, lat)
  //         [northEast[1], northEast[0]], // Nordøst (lng, lat)
  //         [southWest[1], northEast[0]], // Nordvest (lng, lat)
  //         [southWest[1], southWest[0]], // Luk polygonen ved at gentage sydvest
  //       ];
  
  //       console.log("Lukket rektangel for område:", area.name, closedBounds);
  
  //       return closedBounds; // Returnér kun koordinater
  //     });
  
  //     console.log("Genererede polygon-koordinater:", polygons);
  
  //     // Kombiner alle polygoner i en GeoJSON MultiPolygon
  //     const geoJSON = {
  //       type: "MultiPolygon",
  //       coordinates: polygons.map((coords) => [coords]), // Hver polygon tilføjes som en del af MultiPolygon
  //     };
  
  //     console.log("Kombineret GeoJSON MultiPolygon:", geoJSON);
  
  //     const response = await fetch("http://127.0.0.1:8000/api/user-selected-areas/", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         name: "",
  //         natureValue: selectedArea?.natureValue || 0,
  //         areaSize: selectedArea?.areaSize || 0,
  //         geom: JSON.stringify(geoJSON), // Send samlet geometri som GeoJSON
  //         user_id: 1, // Tilføj bruger-id (kan ændres baseret på login-systemet)
  //       }),
  //     });
  
  //     if (response.ok) {
  //       alert("Området blev gemt som et samlet område!");
  //       setSelectedAreas([]); // Nulstil valgte områder
  //       fetchSavedAreas();
  //     } else {
  //       alert("Kunne ikke gemme det valgte område. Prøv igen.");
  //     }
  //   } catch (error) {
  //     console.error("Fejl ved behandling af geometrier:", error);
  //     alert(`Noget gik galt: ${error.message}`);
  //   }
  // };
  
  
  const deleteSavedArea = async (areaId) => {
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/user-selected-areas/${areaId}/`, {
            method: "DELETE",
        });

        if (response.ok) {
            setSavedAreas((prevSavedAreas) =>
                prevSavedAreas.filter((area) => area.id !== areaId)
            );
            alert("Området blev slettet.");
        } else {
            alert("Kunne ikke slette området. Prøv igen.");
        }
    } catch (error) {
        console.error("Fejl ved sletning af området:", error);
        alert("Noget gik galt. Prøv igen.");
    }
};
 
  

  

  const startCreatingProject = () => {
    setIsCreatingProject(true);
    setProjectLocation(null);
  };

  // Funktion til at starte redigering
  const startEditingProject = (project) => {
    setSelectedProject(project);
    setIsEditingProject(true);
  };

  // Funktion til at gemme opdateringer
  const saveUpdatedProject = async (updatedData) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/projects/${selectedProject.id}/`, {
        method: "PUT",
        body: updatedData, // Multipart-formdata sendes direkte
      });
  
      if (response.ok) {
        fetchProjects();
        setSelectedProject(null);
        setIsEditingProject(false);
      } else {
        console.error("Failed to update project:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };


  // const saveUpdatedProject = async (updatedData) => {
  //   try {
  //     const response = await fetch(
  //       `http://127.0.0.1:8000/api/projects/${selectedProject.id}/`,
  //       {
  //         method: "PUT",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           ...updatedData,
  //           location: `POINT(${updatedData.longitude} ${updatedData.latitude})`,
  //         }),
  //       }
  //     );

  //     if (response.ok) {
  //       fetchProjects();
  //       setSelectedProject(null);
  //       setIsEditingProject(false);
  //     } else {
  //       console.error("Failed to update project:", response.statusText);
  //     }
  //   } catch (error) {
  //     console.error("Error updating project:", error);
  //   }
  // };

  // Funktion til at annullere redigering
  const cancelEditingProject = () => {
    setSelectedProject(null);
    setIsEditingProject(false);
  };

  const handleDelete = async (projectId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/projects/${projectId}/`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchProjects();
      } else {
        console.error("Fejl ved sletning:", response.statusText);
      }
    } catch (error) {
      console.error("Fejl ved API-kald:", error);
    }
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
          onSaveSelectedAreas={saveSelectedAreas} // Ny prop
          selectedAreas={selectedAreas} // Ny prop
          toggleSavedAreas={toggleSavedAreas} // Ny prop
          isSavedAreasVisible={isSavedAreasVisible} // Ny prop
          savedAreas={savedAreas}
          deleteSavedArea={deleteSavedArea}
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
            selectedAreas={selectedAreas} // Ny prop
            setSelectedAreas={setSelectedAreas} // Ny prop
            savedAreas={savedAreas} // Ny prop
            isSavedAreasVisible={isSavedAreasVisible} // Ny prop
          />
        </div> 

        {projectLocation && (
          <ProjectForm
            project={{ location: projectLocation }}
            projectLocation={projectLocation}

            onSave={async (data) => {
              try {
                const response = await fetch("http://127.0.0.1:8000/api/projects/", {
                  method: "POST",
                  body: data, // Multipart-formdata sendes direkte
                });
            
                if (response.ok) {
                  fetchProjects();
                  setProjectLocation(null);
                  setIsCreatingProject(false);
                } else {
                  console.error("Fejl ved oprettelse af projekt:", response.statusText);
                }
              } catch (error) {
                console.error("Fejl ved API-kald:", error);
              }
            }}

            // onSave={async (data) => {
            //   try {
            //     const response = await fetch("http://127.0.0.1:8000/api/projects/", {
            //       method: "POST",
            //       headers: {
            //         "Content-Type": "application/json",
            //       },
            //       body: JSON.stringify({
            //         ...data,
            //         location: `POINT(${projectLocation.lng} ${projectLocation.lat})`,
            //       }),
            //     });

            //     if (response.ok) {
            //       fetchProjects();
            //       setProjectLocation(null); 
            //       setIsCreatingProject(false); 
            //     } else {
            //       console.error("Fejl ved oprettelse af projekt:", response.statusText);
            //     }
            //   } catch (error) {
            //     console.error("Fejl ved API-kald:", error);
            //   }
            // }}
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
