import pandas as pd
import sys
import json

file_path = sys.argv[1]

try:
    df = pd.read_csv(file_path, encoding="utf-8")  # Explicitly set UTF-8
except UnicodeDecodeError:
    try:
        df = pd.read_csv(file_path, encoding="ISO-8859-1")  # Try Latin-1 encoding
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

# Process Data (Modify this part based on your needs)
data = df.to_dict(orient="records")

# Return JSON Output
print(json.dumps(data))
sys.exit(0)
