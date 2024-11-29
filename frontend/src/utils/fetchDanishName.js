// /utils/fetchDanishName.js
export async function fetchDanishName(scientificName) {
    try {
      const response = await fetch(`https://api.gbif.org/v1/species?name=${scientificName}`);
      const data = await response.json();
  
      if (data.results && data.results.length > 0) {
        const species = data.results[0];
        
        if (species.vernacularName) {
          return species.vernacularName;
        }
  
        const vernacularNames = species.vernacularNames || [];
        const danishNameEntry = vernacularNames.find(name => name.language === "dan");
  
        return danishNameEntry ? danishNameEntry.vernacularName : "Dansk navn ikke tilgængeligt";
      }
  
      return "Dansk navn ikke tilgængeligt";
    } catch (error) {
      console.error("Fejl ved hentning af dansk navn:", error);
      return "Fejl ved API-opslag";
    }
  }
  