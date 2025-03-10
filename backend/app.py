from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

def get_chemical_reaction_output(api_key, reaction_data):
    prompt = f"""
    Predict the chemical reaction outcome based on the following inputs:

    Reactants: {reaction_data.get('reactants', 'Unknown')}
    Reagents: {reaction_data.get('reagents', 'Unknown')}
    Conditions: {reaction_data.get('conditions', 'Reasonable laboratory conditions')}

    If no conditions are provided, assume reasonable default conditions such as room temperature (25°C) and 1 atm pressure.
    
    Return the output **strictly as a JSON object** with the following structure, without explanations or additional text:
    
    {{
        "reaction": {{
            "reactants": {reaction_data.get('reactants', [])},
            "reagents": {reaction_data.get('reagents', [])},
            "conditions": {reaction_data.get('conditions', {})},
            "products": ["Predicted Product A", "Predicted Product B"],
            "steps": ["Step 1: Mixing", "Step 2: Heating"],
            "side_products": ["Byproduct X"],
            "notes": "Some additional information about the reaction."
        }}
    }}
    
    Ensure that the response starts and ends with valid JSON syntax, without any extra text.
    """
    
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.0-flash')
    response = model.generate_content(prompt)
    
    response_text = response.text.strip()
    
    if response_text.startswith("```json"):
        response_text = response_text[7:]
    if response_text.endswith("```"):
        response_text = response_text[:-3]
    
    try:
        parsed_response = json.loads(response_text)
        reaction_info = parsed_response.get("reaction", {})

        return {
            "reaction": f"{', '.join(reaction_info.get('reactants', []))} + {', '.join(reaction_info.get('reagents', []))} → {', '.join(reaction_info.get('products', []))}",
            "steps": reaction_info.get("steps", []),
            "side_products": reaction_info.get("side_products", []),
            "notes": reaction_info.get("notes", "")
        }
    except json.JSONDecodeError:
        return {"error": "Failed to parse the response as JSON.", "raw_response": response_text}

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    reactant = data.get("reactant")
    reagent = data.get("reagent")
    temperature = data.get("temperature")
    
    if not reactant or not reagent or not temperature:
        return jsonify({"error": "Missing required fields"}), 400
    
    reaction_data = {
        "reactants": [reactant],
        "reagents": [reagent],
        "conditions": {"temperature": f"{temperature}C"}
    }
    
    api_key = "AIzaSyC-14KvcDMza5AXK5da-TMZf852OeSszmk"
    output = get_chemical_reaction_output(api_key, reaction_data)
    return jsonify(output)

if __name__ == "__main__":
    app.run(debug=True)
