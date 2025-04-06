import React, { useState } from "react";
import axios from "axios";

function FileUpload({ setClusteringData }) {
    const [file, setFile] = useState(null);
    const [columns, setColumns] = useState([]);
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [numClusters, setNumClusters] = useState(3);
    const [fileName, setFileName] = useState("");

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const uploadFile = async () => {
        if (!file) return alert("Please select a file!");

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post("http://localhost:5000/upload/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (response.data && response.data.data) {
                console.log("Upload success:", response.data);
                setColumns(Object.keys(response.data.data));  // Extract column names from the response
                setFileName(file.name);  // Save the filename for clustering
            } else {
                console.error("Unexpected response format:", response);
            }
        } catch (error) {
            if (error.response) {
                // Server responded with a status code out of 2xx range
                console.log("🟥 Backend responded with error:", error.response.data);
            } else if (error.request) {
                // Request was made but no response
                console.log("🟧 No response received from backend:", error.request);
            } else {
                // Something else went wrong
                console.log("🟨 Axios setup error:", error.message);
            }
        }
    };

    const runClustering = async () => {
        if (!selectedColumns.length) return alert("Please select features!");
        if (!fileName) return alert("No file uploaded!");

        try {
            const requestData = {
                file_name: fileName,
                features: selectedColumns, // ✅ Make sure it's an array
                n_clusters: Number(numClusters), // ✅ Convert to number
            };

            console.log("Sending request data:", requestData); // ✅ Debugging step

            const response = await axios.post("http://localhost:5000/cluster/", requestData, {
                headers: { "Content-Type": "application/json" },
            });

            console.log("Clustering success:", response.data);
            setClusteringData(response.data.clusters);
        } catch (error) {
            console.error("Clustering failed:", error.response?.data || error);
        }
    };


    return (
        <div className="p-4 bg-white shadow-md rounded-lg w-full max-w-md">
            <input type="file" onChange={handleFileChange} className="mb-2" />
            <button onClick={uploadFile} className="bg-blue-500 text-white px-4 py-2 rounded">Upload</button>

            {columns.length > 0 && (
                <div className="mt-4">
                    <label>Select Features:</label>
                    <select multiple className="border p-2 w-full" onChange={(e) => setSelectedColumns([...e.target.selectedOptions].map(o => o.value))}>
                        {columns.map(col => <option key={col} value={col}>{col}</option>)}
                    </select>
                    <label>Number of Clusters:</label>
                    <input type="number" min="2" max="10" value={numClusters} onChange={(e) => setNumClusters(parseInt(e.target.value))} className="border p-2 w-full" />
                    <button onClick={runClustering} className="bg-green-500 text-white px-4 py-2 mt-2 rounded">Run Clustering</button>
                </div>
            )}
        </div>
    );
}

export default FileUpload;
