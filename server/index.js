import express from "express";
import multer from "multer";
import cors from "cors";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: path.join(__dirname, "uploads/") });

app.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        console.error("❌ No file uploaded");
        return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("✅ File received:", req.file.originalname);

    const filePath = path.join(__dirname, "uploads", req.file.filename);
    console.log("📄 Processing file:", filePath);
    const pythonProcess = spawn("python", ["./scripts/process_csv.py", filePath]);



    let outputData = "";
    let errorData = "";

    pythonProcess.stdout.on("data", (data) => {
        outputData += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
        errorData += data.toString();
        console.error("🐍 Python Error:", data.toString());
    });

    pythonProcess.on("close", (code) => {
        console.log("🔄 Python process exited with code:", code);

        fs.unlinkSync(filePath); // Delete file after processing

        if (code === 0) {
            console.log("✅ Data Sent to Frontend:", outputData);
            res.status(200).json(JSON.parse(outputData));
        } else {
            console.error("❌ Python processing failed:", errorData);
            res.status(500).json({ error: "Failed to process CSV", details: errorData });
        }
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
