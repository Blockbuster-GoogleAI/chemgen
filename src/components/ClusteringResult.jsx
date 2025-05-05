import React from "react";
import { FaChartPie } from "react-icons/fa";

function ClusteringResult({ data }) {
    return (
        <div className="p-6 bg-gray-900 shadow-md rounded-2xl w-full max-w-4xl mt-6 text-white">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-teal-400">
                <FaChartPie /> Clustering Results
            </h2>
            {data.map((cluster, index) => (
                <div key={index} className="mb-6">
                    <h3 className="text-lg font-semibold text-cyan-400 mb-2">Cluster {index + 1}</h3>
                    <div className="overflow-x-auto">
                        <table className="table-auto w-full border-collapse border border-gray-700 text-sm">
                            <thead className="bg-gray-800 text-teal-300">
                                <tr>
                                    {Object.keys(cluster[0]).map((key) => (
                                        <th key={key} className="px-3 py-2 border border-gray-700">{key}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {cluster.map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-800">
                                        {Object.values(row).map((val, j) => (
                                            <td key={j} className="px-3 py-2 border border-gray-700">{val}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ClusteringResult;
