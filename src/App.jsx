import React, { useState } from "react";
import FileUpload from "./components/FileUpload.jsx";
import ClusteringResult from "./components/ClusteringResult.jsx";

function App() {
  const [clusteringData, setClusteringData] = useState(null);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4">
      <h1 className="text-2xl font-bold text-center">FIND THE RIGHT PERSON TO TEST</h1>
      <FileUpload setClusteringData={setClusteringData} />
      {clusteringData && <ClusteringResult data={clusteringData} />}
    </div>
  );
}

export default App;
