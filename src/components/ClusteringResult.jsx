import React from "react";

function ClusteringResult({ data }) {
    return (
        <div className="p-4 bg-black shadow-md rounded-lg w-full max-w-2xl mt-4 text-white">
            <h2 className="text-xl font-semibold mb-2">Clustering Results</h2>
            {data.map((cluster, index) => (
                <div key={index} className="mb-4">
                    <h3 className="font-bold text-blue-600">Cluster {index}</h3>
                    <table className="table-auto w-full border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-200">
                                {Object.keys(cluster[0]).map((key) => (
                                    <th key={key} className="border border-gray-300 px-2 py-1">{key}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {cluster.map((row, i) => (
                                <tr key={i}>
                                    {Object.values(row).map((val, j) => (
                                        <td key={j} className="border border-gray-300 px-2 py-1">{val}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
}

export default ClusteringResult;
