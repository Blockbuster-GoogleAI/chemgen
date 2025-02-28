import { useState } from "react";
import FileUpload from "./components/FileUpload";
import DataDisplay from "./components/DataDisplay";

function App() {
  const [data, setData] = useState([]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 text-center">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-lg">
        <h1 className="text-2xl font-bold text-center mb-4">CSV File Uploader</h1>
        <FileUpload setData={setData} />
      </div>

      <div className="mt-6 w-full max-w-lg bg-white shadow-md p-4 rounded-lg">
        <h2 className="text-lg font-semibold">Processed Data:</h2>
        <DataDisplay data={data} />
      </div>
    </div>
  );
}

export default App;
