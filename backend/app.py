from fastapi import FastAPI, UploadFile, File
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from scipy.spatial.distance import cdist
import os
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import chardet  # Auto-detect encoding

class ClusterRequest(BaseModel):
    file_name: str
    features: List[str]  # ✅ Expecting a list of strings
    n_clusters: int      # ✅ Expecting an integer

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Allow React frontend
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)


UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.post("/upload/")
async def upload_csv(file: UploadFile = File(...)):
    try:    
        file_location = os.path.join(UPLOAD_FOLDER, file.filename)
        with open(file_location, "wb") as buffer:
            buffer.write(await file.read())

        # Try different encodings
        encodings = ["utf-8", "ISO-8859-1", "latin1"]
        df = None
        for enc in encodings:
            try:
                df = pd.read_csv(file_location, encoding=enc)
                break
            except UnicodeDecodeError:
                print(f"Encoding {enc} failed, trying next...")  # Debugging info
                continue

        if df is None:
            return {"error": "File could not be decoded with any tested encoding"}

        return {"message": "File processed successfully", "data": df.head().to_dict()}

    except Exception as e:
        return {"error": str(e)}



def detect_encoding(file_path):
    with open(file_path, "rb") as f:
        raw_data = f.read(100000)  # Read a chunk of the file
    return chardet.detect(raw_data)["encoding"]  # Detect encoding

@app.post("/cluster/")
async def perform_clustering(request: ClusterRequest):
    try:
        file_path = f"{UPLOAD_FOLDER}/{request.file_name}"
        if not os.path.exists(file_path):
            return {"error": "File not found!"}

        # ✅ Detect encoding before reading the CSV
        encoding = detect_encoding(file_path)
        df = pd.read_csv(file_path, encoding=encoding)

        # ✅ Ensure the features exist in the CSV file
        missing_features = [f for f in request.features if f not in df.columns]
        if missing_features:
            return {"error": f"Invalid feature names: {missing_features}"}

        X = df[request.features]
        model = KMeans(n_clusters=request.n_clusters, random_state=42, n_init=10)
        df["Cluster"] = model.fit_predict(X)
        cluster_centers = model.cluster_centers_

        closest_points = []
        for i in range(request.n_clusters):
            cluster_data = df[df["Cluster"] == i][request.features]
            distances = cdist(cluster_data, [cluster_centers[i]], metric="euclidean")
            closest_idx = np.argsort(distances[:, 0])
            closest_points.append(df[df["Cluster"] == i].iloc[closest_idx].head(3).to_dict(orient="records"))

        return {"clusters": closest_points}

    except Exception as e:
        return {"error": str(e)}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
