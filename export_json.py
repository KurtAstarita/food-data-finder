import pandas as pd
import os

PREPARED_DATA_FILE = 'prepared_food_data.pkl'
JSON_OUTPUT_FILE = 'food_data.json' # This will be the file your front-end reads

def export_data_to_json():
    """
    Loads the prepared food data and exports it to a JSON file.
    """
    print(f"Attempting to load data from '{PREPARED_DATA_FILE}'...")
    if not os.path.exists(PREPARED_DATA_FILE):
        print(f"Error: '{PREPARED_DATA_FILE}' not found.")
        print("Please run 'prepare_data.py' first to create it.")
        return

    try:
        df = pd.read_pickle(PREPARED_DATA_FILE)
        print(f"Successfully loaded {len(df)} food items from '{PREPARED_DATA_FILE}'.")

        # Convert DataFrame to a list of dictionaries (JSON format)
        # Using orient='records' creates a list where each element is a dictionary
        # representing a row.
        df.to_json(JSON_OUTPUT_FILE, orient='records', indent=4)
        
        print(f"Data successfully exported to '{JSON_OUTPUT_FILE}'.")

    except Exception as e:
        print(f"Error exporting data to JSON: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    export_data_to_json()