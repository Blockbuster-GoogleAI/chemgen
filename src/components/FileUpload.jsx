import React, { useState } from "react";
import axios from "axios";
import { FaFileUpload, FaCogs } from "react-icons/fa";

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
                setColumns(Object.keys(response.data.data));
                setFileName(file.name);
            }
        } catch (error) {
            console.error("Upload error:", error);
        }
    };

    const runClustering = async () => {
        if (!selectedColumns.length) return alert("Please select features!");
        if (!fileName) return alert("No file uploaded!");

        try {
            const requestData = {
                file_name: fileName,
                features: selectedColumns,
                n_clusters: Number(numClusters),
            };

            const response = await axios.post("http://localhost:5000/cluster/", requestData, {
                headers: { "Content-Type": "application/json" },
            });

            setClusteringData(response.data.clusters);
        } catch (error) {
            console.error("Clustering failed:", error.response?.data || error);
        }
    };

    return (
        <div className="p-6 bg-gray-900 rounded-2xl shadow-lg w-full max-w-2xl text-white">
            <h3 className="text-xl font-bold text-teal-300 mb-4 flex items-center gap-2">
                <FaFileUpload /> Upload CSV & Cluster
            </h3>
            <input
                type="file"
                onChange={handleFileChange}
                className="w-full mb-4 p-2 bg-gray-800 text-white rounded border border-gray-700 cursor-pointer"
            />
            <button
                onClick={uploadFile}
                className="bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded font-medium transition duration-300 w-full mb-6"
            >
                Upload File
            </button>

            {columns.length > 0 && (
                <div>
                    <label className="block mb-1 font-medium">Select Features:</label>
                    <select
                        multiple
                        className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 mb-4"
                        onChange={(e) =>
                            setSelectedColumns([...e.target.selectedOptions].map((o) => o.value))
                        }
                    >
                        {columns.map((col) => (
                            <option key={col} value={col}>{col}</option>
                        ))}
                    </select>

                    <label className="block mb-1 font-medium">Number of Clusters:</label>
                    <input
                        type="number"
                        min="2"
                        max="10"
                        value={numClusters}
                        onChange={(e) => setNumClusters(parseInt(e.target.value))}
                        className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 mb-4"
                    />

                    <button
                        onClick={runClustering}
                        className="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded font-medium transition duration-300 w-full flex items-center justify-center gap-2"
                    >
                        <FaCogs /> Run Clustering
                    </button>
                </div>
            )}
        </div>
    );
}

export default FileUpload;
