import MapComponent from "./components/MapComponent";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import { useState } from "react";

function App() {
  const [selectedArea, setSelectedArea] = useState(null);

  return (
    <div className="h-screen flex flex-col">
      {/* Headerbar */}
      <Header />

      <div className="flex flex-grow">

        
      <Sidebar selectedArea={selectedArea} />

        {/* Kortkomponent */}
        <div className="flex-grow">
        <MapComponent setSelectedArea={setSelectedArea} />
        </div>

        
      </div>
    </div>
  )
}

export default App
