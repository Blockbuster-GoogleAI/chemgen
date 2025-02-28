const DataDisplay = ({ data }) => {
    return (
        <div>
            {data.length > 0 ? (
                <pre className="bg-gray-200 p-3 mt-2 rounded-md text-sm overflow-x-auto">
                    {JSON.stringify(data, null, 2)}
                </pre>
            ) : (
                <p className="text-gray-500">No data yet.</p>
            )}
        </div>
    );
};

export default DataDisplay;
