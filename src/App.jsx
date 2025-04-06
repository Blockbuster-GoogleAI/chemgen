import React, { useState } from "react";
import axios from "axios";
import FileUpload from "./components/FileUpload.jsx";
import ClusteringResult from "./components/ClusteringResult.jsx";

export default function App() {
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-black p-6 text-white">
      <h1 className="text-3xl font-bold mb-6 text-center">Chemical Reaction Predictor</h1>

      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
        <label className="block font-semibold mb-2">Reactant 1:</label>
        <input
          type="text"
          value={reactant1}
          onChange={(e) => setReactant1(e.target.value)}
          placeholder="Enter first reactant..."
          className="w-full p-3 border rounded-lg mb-4 text-lg bg-gray-700 text-white placeholder:text-gray-400"
        />

        <label className="block font-semibold mb-2">Reactant 2:</label>
        <input
          type="text"
          value={reactant2}
          onChange={(e) => setReactant2(e.target.value)}
          placeholder="Enter second reactant..."
          className="w-full p-3 border rounded-lg mb-4 text-lg bg-gray-700 text-white placeholder:text-gray-400"
        />

        <label className="block font-semibold mb-2">Reagent:</label>
        <select
          value={reagent}
          onChange={(e) => setReagent(e.target.value)}
          className="w-full p-3 border rounded-lg mb-4 text-lg bg-gray-700 text-white"
        >
          <option value="">Select Reagent</option>
          {reagents.map((r) => (
            <option key={r} value={r} className="text-black">{r}</option>
          ))}
        </select>

        <button type="submit" className="w-full bg-blue-500 p-3 rounded-lg text-lg hover:bg-blue-600 transition">
          Predict
        </button>
      </form>

      {response && (
        <div className="mt-6 bg-gray-800 p-6 rounded-lg shadow-lg w-full overflow-x-auto">
          <h2 className="text-lg font-bold mb-2">Reaction Output:</h2>
          <table className="w-full text-left border-collapse border border-gray-700">
            <thead>
              <tr className="bg-gray-900">
                <th className="border border-gray-700 p-2">S.No</th>
                <th className="border border-gray-700 p-2">Reactants</th>
                <th className="border border-gray-700 p-2">Reagents</th>
                <th className="border border-gray-700 p-2">Products</th>
                <th className="border border-gray-700 p-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {response.all_reactions.reactions.map((reaction, index) => (
                <tr key={index} className="border border-gray-700">
                  <td className="border border-gray-700 p-2">{reaction.depth + 1}</td>
                  <td className="border border-gray-700 p-2">{reaction.reactants.join(" + ")}</td>
                  <td className="border border-gray-700 p-2">{reaction.reagents?.join(", ") || "None"}</td>
                  <td className="border border-gray-700 p-2">{reaction.products.join(", ")}</td>
                  <td className="border border-gray-700 p-2">{reaction.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h1 className="text-2xl font-bold text-center mt-10">FIND THE RIGHT PERSON TO TEST</h1>
      <FileUpload setClusteringData={setClusteringData} />
      {clusteringData && <ClusteringResult data={clusteringData} />}
    </div>
  );
}
