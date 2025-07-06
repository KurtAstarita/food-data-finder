import pandas as pd
import os

# Define the name of the prepared data file
PREPARED_DATA_FILE = 'prepared_food_data.pkl'

def load_prepared_data():
    """
    Loads the pre-processed food nutrition data from a pickle file.
    """
    print(f"Attempting to load prepared data from '{PREPARED_DATA_FILE}'...")
    if not os.path.exists(PREPARED_DATA_FILE):
        print(f"Error: '{PREPARED_DATA_FILE}' not found.")
        print("Please ensure you have run 'prepare_data.py' successfully.")
        return None
    
    try:
        df = pd.read_pickle(PREPARED_DATA_FILE)
        print(f"Successfully loaded {len(df)} food items.")
        return df
    except Exception as e:
        print(f"Error loading data from '{PREPARED_DATA_FILE}': {e}")
        print("The .pkl file might be corrupted or generated with a different Pandas version.")
        print("Try re-running 'prepare_data.py' to regenerate the file.")
        return None

def search_food(df, query):
    """
    Searches for food items by name (case-insensitive).
    """
    if df is None:
        return pd.DataFrame() # Return empty if data not loaded

    # Ensure 'Food Name' column exists before searching
    if 'Food Name' not in df.columns:
        print("Error: 'Food Name' column not found in the loaded data.")
        return pd.DataFrame()

    # Convert query and food names to lowercase for case-insensitive search
    query_lower = query.lower()
    
    # Check if 'Food Name' column is of string type
    if not pd.api.types.is_string_dtype(df['Food Name']):
        # If not string, attempt to convert or handle
        df['Food Name'] = df['Food Name'].astype(str)
        print("Warning: 'Food Name' column converted to string type for search.")

    # Search for query in 'Food Name'
    results = df[df['Food Name'].str.contains(query_lower, case=False, na=False)]
    return results

def display_food_details(food_item):
    """
    Displays the nutrition details for a single food item.
    """
    print("\n--- Nutrition Details ---")
    for col in food_item.index:
        # Skip internal columns like 'fdc_id' if they appear in display
        if col not in ['fdc_id', 'name', 'unit_name']: # 'name' and 'unit_name' should not be directly in final output, but good to guard
            print(f"{col}: {food_item[col]}")
    print("-------------------------\n")

def main():
    """
    Main function for the interactive food nutrition application.
    """
    food_data_df = load_prepared_data()

    if food_data_df is None or food_data_df.empty:
        print("Exiting application due to data loading issues.")
        return

    while True:
        search_query = input("Enter food name to search (or 'q' to quit): ").strip()
        if search_query.lower() == 'q':
            break

        if not search_query:
            print("Please enter a food name to search.")
            continue

        search_results = search_food(food_data_df, search_query)

        if search_results.empty:
            print(f"No food found matching '{search_query}'. Try a different search term.")
        else:
            print(f"\nFound {len(search_results)} matching food(s):")
            # Display limited results if too many, otherwise all
            for i, (idx, row_series) in enumerate(search_results.head(10).iterrows()):
                print(f"{i+1}. {row_series['Food Name']} (FDC ID: {row_series['fdc_id']})")
            
            if len(search_results) > 10:
                print(f"... and {len(search_results) - 10} more. Refine your search or select from the top 10.")
            
            while True:
                try:
                    choice = input("Enter the number of the food to see details, (s) to search again, or (q) to quit: ").strip().lower()
                    if choice == 'q':
                        return # Exit the whole application
                    elif choice == 's':
                        break # Break out of inner loop to search again
                    
                    choice_idx = int(choice) - 1
                    if 0 <= choice_idx < len(search_results):
                        selected_food = search_results.iloc[choice_idx]
                        display_food_details(selected_food)
                    else:
                        print("Invalid number. Please try again.")
                except ValueError:
                    print("Invalid input. Please enter a number, 's', or 'q'.")

    print("Thank you for using the Food Nutrition App!")

if __name__ == "__main__":
    main()