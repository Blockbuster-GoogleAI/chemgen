from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from scipy.spatial.distance import cdist
import os
import json
import re
import google.generativeai as genai
from itertools import combinations
import chardet

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

API_KEY = "AIzaSyC-14KvcDMza5AXK5da-TMZf852OeSszmk"
genai.configure(api_key=API_KEY)

def detect_encoding(file_path):
    with open(file_path, "rb") as f:
        raw_data = f.read(100000)
    return chardet.detect(raw_data)["encoding"]

@app.route("/upload/", methods=["POST"])
def upload_csv():
    file = request.files["file"]
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    encodings = ["utf-8", "ISO-8859-1", "latin1"]
    for enc in encodings:
        try:
            df = pd.read_csv(file_path, encoding=enc)
            return {"message": "File processed successfully", "data": df.head().to_dict()}
        except Exception:
            continue
    return {"error": "File could not be decoded with any tested encoding"}

@app.route("/cluster/", methods=["POST"])
def perform_clustering():
    try:
        data = request.get_json()
        file_path = os.path.join(UPLOAD_FOLDER, data["file_name"])
        if not os.path.exists(file_path):
            return {"error": "File not found"}

        encoding = detect_encoding(file_path)
        df = pd.read_csv(file_path, encoding=encoding)

        features = data["features"]
        missing = [f for f in features if f not in df.columns]
        if missing:
            return {"error": f"Missing features: {missing}"}

        X = df[features].apply(pd.to_numeric, errors="coerce")
        X.fillna(0, inplace=True)

        model = KMeans(n_clusters=data["n_clusters"], random_state=42, n_init=10)
        df["Cluster"] = model.fit_predict(X)
        centers = model.cluster_centers_

        closest_points = []
        for i in range(data["n_clusters"]):
            cluster_data = df[df["Cluster"] == i][features]
            if cluster_data.empty:
                closest_points.append([])
                continue
            distances = cdist(cluster_data, [centers[i]], metric="euclidean")
            idx = np.argsort(distances[:, 0])
            points = df[df["Cluster"] == i].iloc[idx].head(3)
            points.fillna(0, inplace=True)
            points.replace([np.inf, -np.inf], 0, inplace=True)
            closest_points.append(points.to_dict(orient="records"))

        return json.loads(json.dumps({"clusters": closest_points}, allow_nan=False))

    except Exception as e:
        return {"error": str(e)}

def get_chemical_reaction_output(reactants, reagent):
    prompt = f"""
    Predict the chemical reaction outcome based on the following inputs:

    Reactants: {json.dumps(reactants)}
    Reagent: {json.dumps([reagent]) if reagent else '[]'}

    Return JSON format only:
    {{
        "reaction": {{
            "reactants": {json.dumps(reactants)},
            "reagent": {json.dumps([reagent]) if reagent else '[]'},
            "products": ["Predicted Product A", "Predicted Product B"],
            "notes": "Explanation"
        }}
    }}
    """
    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        match = re.search(r"\{.*\}", response_text, re.DOTALL)
        if match:
            parsed_response = json.loads(match.group(0))
            return {
                "reactants": reactants,
                "reagent": reagent,
                "products": parsed_response["reaction"].get("products", []),
                "notes": parsed_response["reaction"].get("notes", "No additional information.")
            }
        return {"error": "AI returned invalid JSON"}
    except Exception as e:
        return {"error": str(e)}

def generate_reaction_combinations(reactants, reagent, depth=2):
    queue = [(reactants, 0)]
    visited = set()
    all_reactions = []

    while queue:
        current_reactants, current_depth = queue.pop(0)
        if tuple(current_reactants) in visited or current_depth > depth:
            continue
        visited.add(tuple(current_reactants))

        products = get_chemical_reaction_output(current_reactants, reagent)
        all_reactions.append({
            "depth": current_depth,
            "reactants": current_reactants,
            "products": products.get("products", []),
            "notes": products.get("notes", "No additional information.")
        })

        if current_depth + 1 <= depth:
            new_combinations = [list(c) for c in combinations(current_reactants + products.get("products", []), 2)]
            for combo in new_combinations:
                queue.append((combo, current_depth + 1))

    return {"reactions": all_reactions}

@app.route("/predict", methods=["POST"])
def predict_reaction():
    try:
        data = request.get_json()
        reactant1 = data.get("reactant1", "").strip()
        reactant2 = data.get("reactant2", "").strip()
        reagent = data.get("reagent", "").strip()

        if not reactant1 or not reactant2:
            return jsonify({"error": "Both reactants are required"}), 400

        reactants = [reactant1, reactant2]
        result = generate_reaction_combinations(reactants, reagent)
        return jsonify({
            "input_reactants": reactants,
            "reagent": reagent,
            "all_reactions": result
        })

    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True)
