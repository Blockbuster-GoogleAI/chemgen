import { useState } from "react";
import axios from "axios";

const FileUpload = ({ setData }) => {
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            alert("Please select a file first!");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        setIsUploading(true);

        try {
            const response = await axios.post("http://localhost:5000/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setData(response.data);
        } catch (error) {
            console.error("Error uploading file:", error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="border-2 border-dashed border-gray-400 p-6 text-center rounded-lg">
            <input
                type="file"
                accept=".csv"
                className="hidden"
                id="fileInput"
                onChange={handleFileChange}
            />
            <label htmlFor="fileInput" className="cursor-pointer ">
                <div className="text-gray-600">Drag & Drop or Click to Select a File</div>
            </label>
            {file && <p className="text-sm mt-2 text-gray-700">📄 {file.name}</p>}
            <button
                onClick={handleUpload}
                disabled={isUploading}
                className={`mt-4 w-full bg-blue-600 text-white py-2 rounded-lg ${isUploading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
                    }`}
            >
                {isUploading ? "Uploading..." : "Upload"}
            </button>
        </div>
    );
};

export default FileUpload;
