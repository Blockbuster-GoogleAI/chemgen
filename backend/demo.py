import tkinter as tk
from tkinter import messagebox
import json
import google.generativeai as genai
from itertools import combinations

def get_chemical_reaction_output(api_key, reactants, reagent):
    prompt = f"""
    Predict the chemical reaction outcome based on the following inputs:

    Reactants: {json.dumps(reactants)}
    Reagents: {json.dumps([reagent]) if reagent else '[]'}
    Conditions: Assume standard laboratory conditions (25°C, 1 atm pressure)

    Return the output *strictly as a JSON object* with the following structure, without explanations or additional text:

    {{
        "reaction": {{
            "reactants": {json.dumps(reactants)},
            "reagents": {json.dumps([reagent]) if reagent else '[]'},
            "products": ["Predicted Product A", "Predicted Product B"],
            "notes": "Explain if the reaction occurs or why it does not."
        }}
    }}
    """

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.0-flash')
    response = model.generate_content(prompt)

    response_text = response.text.strip()
    print("API Response:", response_text)  # Debugging log

    if response_text.startswith("json"):
        response_text = response_text[7:]
    if response_text.endswith(""):
        response_text = response_text[:-3]

    try:
        parsed_response = json.loads(response_text)
        reaction_info = parsed_response.get("reaction", {})
        products = reaction_info.get("products", [])
        return products
    except json.JSONDecodeError:
        return []

def generate_reaction_combinations(api_key, reactants, reagent, depth=2):
    queue = [(reactants, 0)]  # (Reactants, Depth)
    visited = set()
    reactions_by_depth = {i: [] for i in range(depth + 1)}

    while queue:
        current_reactants, current_depth = queue.pop(0)
        if tuple(current_reactants) in visited or current_depth > depth:
            continue
        visited.add(tuple(current_reactants))

        products = get_chemical_reaction_output(api_key, current_reactants, reagent)
        reactions_by_depth[current_depth].append((current_reactants, products))
        
        if current_depth + 1 <= depth:
            new_combinations = [list(combo) for combo in combinations(current_reactants + products, 2)]
            for combo in new_combinations:
                queue.append((combo, current_depth + 1))
    
    for d in range(depth + 1):
        print(f"\nDepth {d} Reactions:")
        for reactants, products in reactions_by_depth[d]:
            print(f"{reactants} -> {products}")

def predict_reaction():
    reactants = [entry.get().strip() for entry in reactant_entries if entry.get().strip()]
    reagent = reagent_entry.get().strip()
    
    if len(reactants) != 2:
        messagebox.showerror("Input Error", "Please enter exactly two reactants.")
        return
    
    api_key = "AIzaSyC-14KvcDMza5AXK5da-TMZf852OeSszmk"
    generate_reaction_combinations(api_key, reactants, reagent, depth=2)

# GUI Setup
root = tk.Tk()
root.title("Chemical Reaction Predictor")
root.geometry("500x400")

tk.Label(root, text="Enter Reactants:").pack(pady=5)

reactants_frame = tk.Frame(root)
reactants_frame.pack(pady=5)

reactant_entries = []
for i in range(2):
    tk.Label(reactants_frame, text=f"Reactant {i+1}:").pack()
    entry = tk.Entry(reactants_frame, width=40)
    entry.pack()
    reactant_entries.append(entry)

tk.Label(root, text="Reagent (optional):").pack(pady=5)
reagent_entry = tk.Entry(root, width=40)
reagent_entry.pack(pady=5)

tk.Button(root, text="Predict Reaction", command=predict_reaction).pack(pady=20)

result_label = tk.Label(root, text="", fg="blue")
result_label.pack(pady=10)

root.mainloop()