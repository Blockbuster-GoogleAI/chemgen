import React, { useState } from "react";
import axios from "axios";
import FileUpload from "./components/FileUpload.jsx";
import ClusteringResult from "./components/ClusteringResult.jsx";
import { FaFlask, FaMicroscope, FaProjectDiagram } from "react-icons/fa";
import "./App.css"; // Your separate CSS file

export default function App() {
  const [view, setView] = useState("reaction"); // 'reaction' or 'clustering'
  const [reactant1, setReactant1] = useState("");
  const [reactant2, setReactant2] = useState("");
  const [reagent, setReagent] = useState("");
  const [response, setResponse] = useState(null);
  const [clusteringData, setClusteringData] = useState(null);
  const reagents = ["H2O", "HCl", "NaOH", "CH3OH", "NH3"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reactant1 || !reactant2) {
      alert("Please enter both reactants.");
      return;
    }
    try {
      const res = await axios.post("http://127.0.0.1:5000/predict", {
        reactant1,
        reactant2,
        reagent,
      });

      if (res.data.error) {
        alert(`Error: ${res.data.error}`);
        return;
      }

      setResponse(res.data);
    } catch (error) {
      console.error("Error fetching data", error);
      alert("Failed to get prediction. Check console for details.");
    }
  };

  return (
    <div>
      {/* Nav Bar */}
      <nav className="navbar">
        <div className="nav-logo">
          <FaFlask className="logo-icon" />
          <span>ChemAI Lab</span>
        </div>
        <div className="nav-buttons">
          <button
            className={view === "reaction" ? "active" : ""}
            onClick={() => setView("reaction")}
          >
            🔬 Reaction Predictor
          </button>
          <button
            className={view === "clustering" ? "active" : ""}
            onClick={() => setView("clustering")}
          >
            📊 Clustering
          </button>
        </div>
      </nav>

      <div className="container">
        {view === "reaction" ? (
          <>
            <h2>Reaction Prediction</h2>
            <form onSubmit={handleSubmit}>
              <label>🧪 Reactant 1</label>
              <input
                type="text"
                value={reactant1}
                onChange={(e) => setReactant1(e.target.value)}
                placeholder="e.g. CH3CH2OH"
              />

              <label>🧪 Reactant 2</label>
              <input
                type="text"
                value={reactant2}
                onChange={(e) => setReactant2(e.target.value)}
                placeholder="e.g. H2SO4"
              />

              <label>🧬 Reagent</label>
              <select
                value={reagent}
                onChange={(e) => setReagent(e.target.value)}
              >
                <option value="">Select a reagent...</option>
                {reagents.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>

              <button type="submit">🔍 Predict Reaction</button>
            </form>

            {response && (
              <div className="table-container">
                <h3>
                  <FaMicroscope /> Reaction Output
                </h3>
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Reactants</th>
                      <th>Reagents</th>
                      <th>Products</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {response.all_reactions.reactions.map((reaction, index) => (
                      <tr key={index}>
                        <td>{reaction.depth + 1}</td>
                        <td>{reaction.reactants.join(" + ")}</td>
                        <td>{reaction.reagents?.join(", ") || "None"}</td>
                        <td>{reaction.products.join(", ")}</td>
                        <td>{reaction.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <>
            <h2>Clustering Analysis</h2>
            <FileUpload setClusteringData={setClusteringData} />
            {clusteringData && <ClusteringResult data={clusteringData} />}
          </>
        )}
      </div>
    </div>
  );
}
