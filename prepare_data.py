import pandas as pd
import os

# Define the path to your unzipped USDA FoodData Central CSVs
DATA_DIR = 'data/'

def load_and_prepare_data(data_dir):
    """
    Loads necessary CSVs from the USDA FoodData Central dataset,
    merges them, and prepares a comprehensive DataFrame for easy searching.
    This version processes specified data types (e.g., SR Legacy, Foundation).
    """
    print("Starting data loading and preparation for selected FoodData Central types...")
    try:
        # Load core files
        # food.csv contains descriptions and data_type for ALL foods
        food_df = pd.read_csv(os.path.join(data_dir, 'food.csv'))
        # food_nutrient.csv links foods to their nutrient amounts
        food_nutrients_df = pd.read_csv(os.path.join(data_dir, 'food_nutrient.csv'))
        # nutrient.csv defines nutrient names and units
        nutrients_df = pd.read_csv(os.path.join(data_dir, 'nutrient.csv'))

        print(f"\n--- Initial DataFrame Info ---")
        print(f"Loaded food.csv: {len(food_df)} rows")
        print(f"Loaded food_nutrient.csv: {len(food_nutrients_df)} rows")
        print(f"Loaded nutrient.csv: {len(nutrients_df)} rows")

        # Step 1: Determine which data types to include for your "huge list"
        # Common types for general food data include 'SR Legacy' and 'Foundation'.
        # 'Branded' includes specific products. 'Survey' is for dietary surveys.
        
        print("\n--- Data Types found in food.csv: ---")
        data_type_counts = food_df['data_type'].value_counts()
        print(data_type_counts)
        print("------------------------------------\n")

        # --- Define your target data types based on the above output ---
        # For a "huge chart" of general foods, 'SR Legacy' is usually the largest source.
        # 'Foundation' is also good for raw ingredients.
        # Add other types if you want them in your main "chart" (e.g., 'Branded').
        target_data_types = ['foundation_food']

        # Filter food_df to include only desired data types
        # This will be our base DataFrame for foods, replacing the old foundation_foods_with_desc_df
        filtered_foods_df = food_df[
            food_df['data_type'].isin(target_data_types)
        ].copy()

        print(f"Extracted {len(filtered_foods_df)} foods with descriptions from food.csv for types: {target_data_types}.")

        if filtered_foods_df.empty:
            print("CRITICAL ERROR: No foods found matching the target data types. Please check 'food.csv' and 'target_data_types'.")
            return pd.DataFrame()

        # Step 2: Merge the selected foods with their nutrient data
        # This links the filtered foods to their specific nutrient amounts
        merged_df = pd.merge(
            food_nutrients_df,
            filtered_foods_df[['fdc_id', 'description']], # Use filtered_foods_df here
            on='fdc_id',
            how='inner'
        )
        print(f"After merging food_nutrient with filtered food descriptions: {len(merged_df)} rows")

        # Step 3: Merge with nutrient definitions to get human-readable names and units
        final_df = pd.merge(
            merged_df,
            nutrients_df[['id', 'name', 'unit_name']],
            left_on='nutrient_id',
            right_on='id',
            how='inner',
            suffixes=('_food_nutrient', '_nutrient_info')
        )
        print(f"After merging with nutrient info: {len(final_df)} rows")

        # Rename 'description' to 'Food Name' for clarity
        final_df.rename(columns={'description': 'Food Name'}, inplace=True)

        # --- Define the nutrients you want in your final output ---
        selected_nutrient_names = [
            "Energy", "Protein", "Total lipid (fat)", "Carbohydrate, by difference",
            "Fiber, total dietary", "Sugars, total", "Calcium, Ca", "Iron, Fe",
            "Magnesium, Mg", "Phosphorus, P", "Potassium, K", "Sodium, Na",
            "Zinc, Zn", "Copper, Cu", "Manganese, Mn", "Selenium, Se",
            "Vitamin C, total ascorbic acid", "Vitamin A, RAE", "Vitamin E (alpha-tocopherol)",
            "Vitamin D (D2 + D3)", "Thiamin", "Riboflavin", "Niacin",
            "Vitamin B-6", "Folate, DFE", "Vitamin B-12", "Vitamin K (phylloquinone)"
        ]

        actual_nutrients_in_data = final_df['name'].unique().tolist()
        missing_selected_nutrients = [n for n in selected_nutrient_names if n not in actual_nutrients_in_data]
        if missing_selected_nutrients:
            print(f"Warning: The following selected nutrients were NOT found in the data (check spelling/existence): {missing_selected_nutrients}")
        else:
            print("All predefined selected nutrients found in the loaded data.")

        final_df_filtered_nutrients = final_df[final_df['name'].isin(selected_nutrient_names)]
        print(f"After filtering for selected nutrients: {len(final_df_filtered_nutrients)} rows")

        if final_df_filtered_nutrients.empty:
            print("CRITICAL WARNING: Filtering for selected nutrients resulted in an empty DataFrame.")
            print("Proceeding with ALL available nutrients for each food to prevent empty output.")
            pivot_df = final_df.pivot_table(
                index=['fdc_id', 'Food Name'],
                columns='name',
                values='amount',
                aggfunc='first'
            ).reset_index()
            selected_nutrient_names = [col for col in pivot_df.columns if col not in ['fdc_id', 'Food Name']]
        else:
            pivot_df = final_df_filtered_nutrients.pivot_table(
                index=['fdc_id', 'Food Name'],
                columns='name',
                values='amount',
                aggfunc='first'
            ).reset_index()
        print(f"After pivoting (number of unique foods): {len(pivot_df)} rows")

        OUNCE_TO_GRAM = 28.3495
        output_columns = ['fdc_id', 'Food Name']

        for nutrient_csv_name in selected_nutrient_names:
            if nutrient_csv_name in pivot_df.columns:
                display_name = nutrient_csv_name.replace(', by difference', '').replace(', total', '').replace(', Ca', '').replace(', Fe', '').replace(', Mg', '').replace(', P', '').replace(', K', '').replace(', Na', '').replace(', Zn', '').replace(', Cu', '').replace(', Mn', '').replace(', Se', '').replace(', total ascorbic acid', '').replace(', RAE', '').replace(' (alpha-tocopherol)', '').replace(' (D2 + D3)', '').replace(' (phylloquinone)', '').strip()
                if display_name == "Energy": display_name = "Calories"
                if display_name == "Total lipid (fat)": display_name = "Fat"
                if display_name == "Carbohydrate": display_name = "Carbohydrates"
                if display_name == "Fiber": display_name = "Fiber"
                if display_name == "Sugars": display_name = "Sugars"
                if display_name == "Vitamin B-6": display_name = "Vitamin B6"
                if display_name == "Folate": display_name = "Folate"
                if display_name == "Vitamin B-12": display_name = "Vitamin B12"

                pivot_df[f"{display_name} (per 100g)"] = pivot_df[nutrient_csv_name].round(2)
                pivot_df[f"{display_name} (per gram)"] = (pivot_df[nutrient_csv_name] / 100).round(4)
                pivot_df[f"{display_name} (per ounce)"] = (pivot_df[nutrient_csv_name] / 100 * OUNCE_TO_GRAM).round(4)

                output_columns.extend([
                    f"{display_name} (per 100g)",
                    f"{display_name} (per gram)",
                    f"{display_name} (per ounce)"
                ])

        existing_output_columns = [col for col in output_columns if col in pivot_df.columns]
        final_output_df = pivot_df[existing_output_columns].copy()
        final_output_df.fillna("N/A", inplace=True)

        print("\nData loading and preparation complete.")
        return final_output_df

    except FileNotFoundError as e:
        print(f"Error: {e}")
        print(f"Please ensure your USDA FoodData Central CSV files are unzipped and located in the '{data_dir}' folder.")
        print("Specifically check for: food.csv, food_nutrient.csv, nutrient.csv") # foundation_food.csv is not strictly needed now
        return pd.DataFrame()
    except ValueError as e:
        print(f"Data structure error: {e}")
        print("Please check the column names in your CSV files. They might differ from what the script expects.")
        return pd.DataFrame()
    except KeyError as e:
        print(f"Column not found error: {e}. A required column for merging or filtering is missing.")
        print("Please verify column names in the source CSVs.")
        return pd.DataFrame()
    except Exception as e:
        print(f"An unexpected error occurred during data loading: {e}")
        import traceback
        traceback.print_exc()
        return pd.DataFrame()

if __name__ == "__main__":
    print("This script will prepare the USDA FoodData Central data for your application.")
    food_data_df = load_and_prepare_data(DATA_DIR)

    if not food_data_df.empty:
        print(f"\nSuccessfully prepared data for {len(food_data_df)} food items.")
        print("\nFirst 5 rows of the prepared data:")
        print(food_data_df.head())

        output_pkl_file = "prepared_food_data.pkl"
        food_data_df.to_pickle(output_pkl_file)
        print(f"\nPrepared data saved to '{output_pkl_file}'")
        print("This '.pkl' file will be used by your search application.")
    else:
        print("\nData preparation failed or resulted in an empty dataset. Please check the error messages above.")
