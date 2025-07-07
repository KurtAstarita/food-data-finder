// script.js

// 1. --- Global Constants & Variable Declarations ---
// This object defines the structure for displaying nutrients, mapping user-friendly names
// to the exact keys found in your food_data.json for different units.
// NOW INCLUDES 'displayUnit' FOR EACH NUTRIENT!
const nutrientGroups = {
    "Macros": {
        "Calories": { "100g": "Calories (per 100g)", "gram": "Calories (per gram)", "ounce": "Calories (per ounce)", "displayUnit": "kcal" },
        "Protein": { "100g": "Protein (per 100g)", "gram": "Protein (per gram)", "ounce": "Protein (per ounce)", "displayUnit": "g" },
        "Fat": { "100g": "Fat (per 100g)", "gram": "Fat (per gram)", "ounce": "Fat (per ounce)", "displayUnit": "g" },
        "Carbohydrates": { "100g": "Carbohydrates (per 100g)", "gram": "Carbohydrates (per gram)", "ounce": "Carbohydrates (per ounce)", "displayUnit": "g" },
        "Fiber": { "100g": "Fiber dietary (per 100g)", "gram": "Fiber dietary (per gram)", "ounce": "Fiber dietary (per ounce)", "displayUnit": "g" }
    },
    "Minerals": {
        "Calcium": { "100g": "Calcium (per 100g)", "gram": "Calcium (per gram)", "ounce": "Calcium (per ounce)", "displayUnit": "mg" },
        "Iron": { "100g": "Iron (per 100g)", "gram": "Iron (per gram)", "ounce": "Iron (per ounce)", "displayUnit": "mg" },
        "Magnesium": { "100g": "Magnesium (per 100g)", "gram": "Magnesium (per gram)", "ounce": "Magnesium (per ounce)", "displayUnit": "mg" },
        "Phosphorus": { "100g": "Phosphorus (per 100g)", "gram": "Phosphorus (per gram)", "ounce": "Phosphorus (per ounce)", "displayUnit": "mg" },
        "Potassium": { "100g": "Potassium (per 100g)", "gram": "Potassium (per gram)", "ounce": "Potassium (per ounce)", "displayUnit": "mg" },
        "Sodium": { "100g": "Sodium (per 100g)", "gram": "Sodium (per gram)", "ounce": "Sodium (per ounce)", "displayUnit": "mg" },
        "Zinc": { "100g": "Zinc (per 100g)", "gram": "Zinc (per gram)", "ounce": "Zinc (per ounce)", "displayUnit": "mg" },
        "Copper": { "100g": "Copper (per 100g)", "gram": "Copper (per gram)", "ounce": "Copper (per ounce)", "displayUnit": "mg" },
        "Manganese": { "100g": "Manganese (per 100g)", "gram": "Manganese (per gram)", "ounce": "Manganese (per ounce)", "displayUnit": "mg" },
        "Selenium": { "100g": "Selenium (per 100g)", "gram": "Selenium (per gram)", "ounce": "Selenium (per ounce)", "displayUnit": "mcg" }
    },
    "Vitamins": {
        "Vitamin C": { "100g": "Vitamin C ascorbic acid (per 100g)", "gram": "Vitamin C ascorbic acid (per gram)", "ounce": "Vitamin C ascorbic acid (per ounce)", "displayUnit": "mg" },
        "Vitamin A": { "100g": "Vitamin A (per 100g)", "gram": "Vitamin A (per gram)", "ounce": "Vitamin A (per ounce)", "displayUnit": "mcg" },
        "Vitamin E": { "100g": "Vitamin E (per 100g)", "gram": "Vitamin E (per gram)", "ounce": "Vitamin E (per ounce)", "displayUnit": "mg" },
        "Vitamin D": { "100g": "Vitamin D (per 100g)", "gram": "Vitamin D (per gram)", "ounce": "Vitamin D (per ounce)", "displayUnit": "mcg" },
        "Thiamin (B1)": { "100g": "Thiamin (per 100g)", "gram": "Thiamin (per gram)", "ounce": "Thiamin (per ounce)", "displayUnit": "mg" },
        "Riboflavin (B2)": { "100g": "Riboflavin (per 100g)", "gram": "Riboflavin (per gram)", "ounce": "Riboflavin (per ounce)", "displayUnit": "mg" },
        "Niacin (B3)": { "100g": "Niacin (per 100g)", "gram": "Niacin (per gram)", "ounce": "Niacin (per ounce)", "displayUnit": "mg" },
        "Vitamin B6": { "100g": "Vitamin B6 (per 100g)", "gram": "Vitamin B6 (per gram)", "ounce": "Vitamin B6 (per ounce)", "displayUnit": "mg" },
        "Vitamin B12": { "100g": "Vitamin B12 (per 100g)", "gram": "Vitamin B12 (per gram)", "ounce": "Vitamin B12 (per ounce)", "displayUnit": "mcg" },
        "Vitamin K": { "100g": "Vitamin K (per 100g)", "gram": "Vitamin K (per gram)", "ounce": "Vitamin K (per ounce)", "displayUnit": "mcg" }
    }
};

// Global variables to manage food data, pagination, and currently displayed food details.
let foodData = []; // Stores the entire dataset from food_data.json
let currentPage = 1; // Current page for the main food table
let itemsPerPage; // Number of items to display per page in the table, set on load
let currentFoodDetails = null;
// New global variables for sorting
let currentSortColumn = 'Food Name'; // Default sort column
let currentSortDirection = 'asc'; // Default sort direction

// 2. --- Asynchronous Data Loading Function ---
// Fetches food data from the 'food_data.json' file.
async function loadFoodData() {
    try {
        const response = await fetch('food_data.json');
        if (!response.ok) {
            // If the HTTP response status is not 2xx, throw an error.
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        foodData = await response.json(); // Parse the JSON data and assign it to foodData.
        console.log(`Loaded ${foodData.length} food items.`);
        // Update the total food count displayed on the page.
        document.getElementById('totalFoodsCount').textContent = foodData.length;

        // After data is successfully loaded, set the initial itemsPerPage
        // from the select element and render the main food table.
        itemsPerPage = parseInt(document.getElementById('itemsPerPageSelect').value);
        renderTable(); // Initial display of the "chart"
    } catch (error) {
        // Log any errors during data loading and update the UI to reflect the error.
        console.error("Could not load food data:", error);
        document.getElementById('searchResults').innerHTML = '<p class="error-message">Error loading food data. Please ensure food_data.json exists and is valid.</p>';
        document.getElementById('totalFoodsCount').textContent = 'Error';
    }
}

function handleHeaderClick(column) {
    if (currentSortColumn === column) {
        // If same column, toggle direction
        currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        // If different column, set new column and default to ascending
        // Make sure "Food Name" is handled as a string comparison, others as numeric
        currentSortColumn = column;
        currentSortDirection = 'asc';
    }
    currentPage = 1; // Reset to the first page when sort order changes
    renderTable(); // Re-render the table with the new sort order
}

function renderTable() {
    const tableBody = document.getElementById('tableBody');
    const tableHeader = document.getElementById('tableHeader');
    const pageInfoSpan = document.getElementById('pageInfo');
    const prevPageButton = document.getElementById('prevPage');
    const nextPageButton = document.getElementById('nextPage');

    tableBody.innerHTML = '';
    tableHeader.innerHTML = '';

    if (foodData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="100">No data to display.</td></tr>';
        return;
    }

    const sampleFood = foodData[0];
    const primaryCols = ['Food Name'];
    const nutrientColsForTable = [
        "Calories (per 100g)",
        "Protein (per 100g)",
        "Fat (per 100g)",
        "Carbohydrates (per 100g)",
        "Fiber dietary (per 100g)",
        "Sodium (per 100g)"
    ];
        
    const displayColumns = [...primaryCols];
    nutrientColsForTable.forEach(col => {
        if (sampleFood.hasOwnProperty(col)) {
            displayColumns.push(col);
        }
    });

    // Create table headers dynamically with sorting capabilities
    displayColumns.forEach(col => {
        const th = document.createElement('th');
        // Use .textContent for safety, and remove units from header text for cleaner display.
        th.textContent = col.replace(/\s*\(.*\)\s*$/, '');
        
        // Add a data attribute to store the original column key for sorting
        th.setAttribute('data-column', col);
        th.classList.add('sortable'); // Add a class for styling sortable headers

        // Add sort indicator if this is the currently sorted column
        if (currentSortColumn === col) {
            const arrow = document.createElement('span');
            arrow.classList.add('sort-arrow');
            arrow.innerHTML = currentSortDirection === 'asc' ? ' &#9650;' : ' &#9660;'; // Up arrow or Down arrow
            th.appendChild(arrow);
        }

        // Add click listener for sorting
        th.addEventListener('click', () => {
            handleHeaderClick(col); // Call the new handler function
        });
        
        tableHeader.appendChild(th);
    });

    // Add a "View Details" column header (not sortable)
    const thDetails = document.createElement('th');
    thDetails.textContent = 'Details';
    tableHeader.appendChild(thDetails);

    // --- IMPORTANT: Apply Sorting Before Pagination ---
    // Create a copy of foodData and sort it based on currentSortColumn and currentSortDirection
    const sortedFoodData = [...foodData].sort((a, b) => {
        const valA = a[currentSortColumn];
        const valB = b[currentSortColumn];

        // Handle numeric columns (including estimated calories in the table)
        if (nutrientColsForTable.includes(currentSortColumn)) {
            // Parse to float, default to negative infinity for N/A for ascending sort
            const numA = parseFloat(valA) || -Infinity;
            const numB = parseFloat(valB) || -Infinity;

            if (currentSortDirection === 'asc') {
                return numA - numB;
            } else {
                return numB - numA;
            }
        }
        // Handle string columns (like 'Food Name')
        else if (currentSortColumn === 'Food Name') {
            const strA = (valA || '').toLowerCase();
            const strB = (valB || '').toLowerCase();
            if (currentSortDirection === 'asc') {
                return strA.localeCompare(strB);
            } else {
                return strB.localeCompare(strA);
            }
        }
        return 0; // Should not happen if currentSortColumn is always valid
    });

    // Calculate pagination details based on the SORTED data.
    const totalPages = Math.ceil(sortedFoodData.length / itemsPerPage);
    currentPage = Math.min(Math.max(1, currentPage), totalPages);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, sortedFoodData.length);
    const foodsToDisplay = sortedFoodData.slice(startIndex, endIndex); // Slice from sorted data

    // Populate the table body with food data.
    foodsToDisplay.forEach(food => {
        const tr = document.createElement('tr');
        displayColumns.forEach(col => {
            const td = document.createElement('td');
            let displayValue; // Variable to hold the final value for display

            // --- NEW: Special handling for Calories (per 100g) to include estimation ---
            if (col === "Calories (per 100g)") {
                const originalValue = food[col];
                // Check if original value is missing or invalid (e.g., "N/A" or undefined)
                if (typeof originalValue !== 'number' || isNaN(parseFloat(originalValue))) { 
                    // Get 100g values for macros using the nutrientGroups mapping
                    const proteinKey = nutrientGroups.Macros.Protein["100g"];
                    const fatKey = nutrientGroups.Macros.Fat["100g"];
                    const carbsKey = nutrientGroups.Macros.Carbohydrates["100g"];

                    // Retrieve macro values, defaulting to 0 if N/A or invalid
                    const proteinVal = parseFloat(food[proteinKey]) || 0; 
                    const fatVal = parseFloat(food[fatKey]) || 0;         
                    const carbsVal = parseFloat(food[carbsKey]) || 0; 

                    // Only estimate if at least one macronutrient is available
                    if (proteinVal > 0 || fatVal > 0 || carbsVal > 0) {
                        const estimatedCalories = (proteinVal * 4) + (carbsVal * 4) + (fatVal * 9);
                        displayValue = estimatedCalories.toFixed(2) + ' (Est.)';
                        td.classList.add('estimated-value'); // Optional: Add a class for styling estimated values
                    } else {
                        displayValue = 'N/A'; // Still N/A if macros are also missing
                    }
                } else {
                    displayValue = parseFloat(originalValue).toFixed(2); // Use original value if valid, ensure it's parsed
                }
            } else {
                // General handling for other columns
                const value = food[col];
                // If it's a number OR a string that can be parsed to a number, format it.
                // Otherwise, display the value as is or 'N/A'.
                if ((typeof value === 'number' && !isNaN(value)) || (typeof value === 'string' && !isNaN(parseFloat(value)))) {
                    displayValue = parseFloat(value).toFixed(2);
                } else if (value !== undefined && value !== null && value !== '') {
                    displayValue = value;
                } else {
                    displayValue = 'N/A';
                }
            }

            td.textContent = displayValue;
            tr.appendChild(td);
        });

        const tdDetails = document.createElement('td');
        const detailButton = document.createElement('button');
        detailButton.textContent = 'View';
        detailButton.classList.add('detail-button');
        detailButton.addEventListener('click', () => {
            document.getElementById('searchResults').innerHTML = '';
            displayFoodDetails(food);
            document.getElementById('foodDetails').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        tdDetails.appendChild(detailButton);
        tr.appendChild(tdDetails);

        tableBody.appendChild(tr);
    });

    pageInfoSpan.textContent = `Page ${currentPage} of ${totalPages}`;
    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage === totalPages;
}


// --- Search Functionality ---
// Displays search results in a list format.
function displaySearchResults(query) {
    const searchResultsList = document.getElementById('searchResults');
    const foodDetailsDiv = document.getElementById('foodDetails');

    searchResultsList.innerHTML = ''; // Clear previous search results.
    foodDetailsDiv.style.display = 'none'; // Hide the food details section when searching.

    if (!query) {
        searchResultsList.innerHTML = '<p class="info-message">Please enter a food name to search.</p>';
        return;
    }

    const lowerCaseQuery = query.toLowerCase().trim(); // Trim whitespace
    // Split the query into individual words, filtering out empty strings
    const queryWords = lowerCaseQuery.split(/\s+/).filter(word => word.length > 0);

    if (queryWords.length === 0) { // Check if there are any meaningful words after splitting
        searchResultsList.innerHTML = '<p class="info-message">Please enter valid search terms.</p>';
        return;
    }

    // Filter food data based on the search query (case-insensitive, all words match)
    const results = foodData.filter(food => {
        const foodNameLowerCase = food['Food Name'] ? food['Food Name'].toLowerCase() : '';
        
        // Check if the foodNameLowerCase includes ALL words from the queryWords array
        // This makes the search more flexible, matching words in any order.
        return queryWords.every(word => foodNameLowerCase.includes(word));
    });

    if (results.length === 0) {
        // Display a message if no results are found, sanitizing the query.
        searchResultsList.innerHTML = `<p class="info-message">No food found matching "${DOMPurify.sanitize(query)}". Try a different search term.</p>`; 
        return;
    }

    // Limit and display top 10 search results.
    results.slice(0, 10).forEach((food, index) => {
        const li = document.createElement('li');
        li.classList.add('result-item');
        // Use .textContent for safety when displaying food name and FDC ID.
        li.textContent = `${food['Food Name']} (FDC ID: ${food['fdc_id']})`; 
        li.addEventListener('click', () => {
            // Clear results, show details, and scroll to details section when a result is clicked.
            searchResultsList.innerHTML = '';
            foodDetailsDiv.style.display = 'block';
            displayFoodDetails(food);
            foodDetailsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        searchResultsList.appendChild(li);
    });

    // Display a message if there are more than 10 results.
    if (results.length > 10) {
        const moreResultsInfo = document.createElement('li');
        moreResultsInfo.classList.add('info-message-item');
        moreResultsInfo.textContent = `... and ${results.length - 10} more. Refine your search or select from the top 10.`; 
        searchResultsList.appendChild(moreResultsInfo);
    }
}

/**
 * Renders or re-renders the nutrient details based on the current food, quantity, and unit.
 * This function performs the actual calculation and display of individual nutrients.
 * @param {Object} food - The food item object.
 * @param {number} quantity - The user-specified quantity.
 * @param {string} unit - The selected unit ('gram', 'ounce').
 */
function updateNutrientDetailsDisplay(food, quantity, unit) {
    const nutrientDetailsDisplay = document.getElementById('nutrientDetailsDisplay');
    nutrientDetailsDisplay.innerHTML = ''; // Clear previous details before re-rendering.

    // Ensure quantity is a valid positive number, default to 1 if invalid or zero.
    quantity = parseFloat(quantity);
    if (isNaN(quantity) || quantity <= 0) {
        quantity = 1;
    }

    // Iterate through each main nutrient category (Macros, Minerals, Vitamins).
    for (const groupCategory in nutrientGroups) {
        const groupSection = document.createElement('div');
        groupSection.className = 'nutrient-group';

        const groupHeading = document.createElement('h3');
        groupHeading.textContent = groupCategory; // e.g., "Macros"
        groupSection.appendChild(groupHeading);

        const groupList = document.createElement('ul');
        groupList.className = 'nutrient-list';

        // Iterate through each specific nutrient within the category (e.g., "Energy", "Protein").
        for (const nutrientDisplayName in nutrientGroups[groupCategory]) {
            const nutrientMapping = nutrientGroups[groupCategory][nutrientDisplayName];
            
            let baseValue = 0; // Stores the raw nutrient value from the JSON.
            let calculatedValue = 'N/A'; // Stores the calculated value for the given quantity/unit.
            let displayUnit = nutrientMapping.displayUnit || ''; // Get intrinsic displayUnit
            let isEstimated = false; // Flag to indicate if calories were estimated

            // Determine which key to use from the food data based on the selected unit
            let keyToUse = '';
            if (unit === 'gram' && nutrientMapping['gram']) { 
                keyToUse = nutrientMapping['gram'];
            } else if (unit === 'ounce' && nutrientMapping['ounce']) { 
                keyToUse = nutrientMapping['ounce'];
            }

            // --- IMPORTANT: Robust parsing for baseValue from food data ---
            // Parse the value from the JSON. If it's "N/A" or not a valid number, it becomes NaN,
            // then defaults to 0 for calculations using the || 0.
            baseValue = parseFloat(food[keyToUse]) || 0; 
            calculatedValue = baseValue * quantity;

            // --- LOGIC FOR CALORIES ESTIMATION ---
            if (nutrientDisplayName === "Calories") {
                // Check if the original 'Calories' value was effectively "N/A" or invalid.
                // We use parseFloat on the original food[keyToUse] to see if it's a valid number.
                const originalCaloriesValue = parseFloat(food[nutrientMapping[unit]]);
                if (isNaN(originalCaloriesValue) || originalCaloriesValue === 0) { // Also check for 0 to re-estimate if necessary
                    const proteinKey = nutrientGroups.Macros.Protein[unit];
                    const fatKey = nutrientGroups.Macros.Fat[unit];
                    const carbsKey = nutrientGroups.Macros.Carbohydrates[unit];

                    // Apply parseFloat directly to macro values from food data, default to 0 if N/A or invalid
                    const proteinVal = parseFloat(food[proteinKey]) || 0; 
                    const fatVal = parseFloat(food[fatKey]) || 0;         
                    const carbsVal = parseFloat(food[carbsKey]) || 0;     

                    // Only estimate if at least one macronutrient is available
                    if (proteinVal > 0 || fatVal > 0 || carbsVal > 0) {
                        const estimatedBaseCalories = (proteinVal * 4) + (carbsVal * 4) + (fatVal * 9);
                        calculatedValue = estimatedBaseCalories * quantity;
                        isEstimated = true;
                        displayUnit = 'kcal'; // Ensure unit is kcal for estimated calories
                    } else {
                        // If no macros are available either, then it's genuinely N/A
                        calculatedValue = 'N/A';
                    }
                } else {
                    // If original calories value is valid, use it.
                    calculatedValue = originalCaloriesValue * quantity;
                }
            }
            // --- END LOGIC FOR CALORIES ESTIMATION ---

            // Format the calculated value to 2 decimal places or 'N/A'.
            const formattedDisplayValue = (typeof calculatedValue === 'number' && !isNaN(calculatedValue)) ? calculatedValue.toFixed(2) : 'N/A';
            
            // Create list item and populate it with sanitized content.
            const listItem = document.createElement('li');
            const sanitizedDisplayName = DOMPurify.sanitize(nutrientDisplayName);
            const sanitizedFormattedDisplayValue = DOMPurify.sanitize(formattedDisplayValue.toString());
            const sanitizedDisplayUnit = DOMPurify.sanitize(displayUnit);

            let displayLabel = sanitizedDisplayName;
            if (isEstimated) {
                displayLabel += ' (Estimated)'; // Add ' (Estimated)' to the label for clarity
            }

            listItem.innerHTML = `<strong>${displayLabel}:</strong> ${sanitizedFormattedDisplayValue}${sanitizedDisplayUnit ? ` ${sanitizedDisplayUnit}` : ''}`;
            groupList.appendChild(listItem);
        }
        groupSection.appendChild(groupList);
        nutrientDetailsDisplay.appendChild(groupSection);
    }
}

// Function to display detailed nutrition for a selected food.
// This function sets up the details section, including quantity/unit inputs.
function displayFoodDetails(food) {
    const foodDetailsDiv = document.getElementById('foodDetails');
    
    // Clear previous content in the entire foodDetailsDiv.
    foodDetailsDiv.innerHTML = '';
    foodDetailsDiv.style.display = 'block'; // Ensure the details section is visible.

    // Create and prepend the food name heading.
    const foodNameHeading = document.createElement('h2');
    foodNameHeading.textContent = food['Food Name']; // Using textContent for safety.
    foodDetailsDiv.appendChild(foodNameHeading); // Append first, then prepend below.

    // Create and append the quantity input group.
    const quantityInputGroup = document.createElement('div');
    quantityInputGroup.classList.add('quantity-input-group');
    quantityInputGroup.innerHTML = `
        <label for="quantityInput">Quantity:</label>
        <input type="number" id="quantityInput" value="100" min="1" step="any">
        <select id="unitSelect">
            <option value="gram">gram</option>
            <option value="ounce">ounce</option>
        </select>
    `;
    foodDetailsDiv.appendChild(quantityInputGroup);

    // Create and append the div where nutrient details will be displayed.
    const nutrientDetailsDisplay = document.createElement('div');
    nutrientDetailsDisplay.id = 'nutrientDetailsDisplay';
    foodDetailsDiv.appendChild(nutrientDetailsDisplay);

    // Re-get references to the newly created/appended input elements.
    const reconnectedQuantityInput = document.getElementById('quantityInput');
    const reconnectedUnitSelect = document.getElementById('unitSelect');

    // Store the current food object globally for recalculations.
    currentFoodDetails = food;

    // Set initial values for quantity and unit when a new food is displayed.
    reconnectedQuantityInput.value = 100;
    reconnectedUnitSelect.value = 'gram'; // Default to 'gram' since '100g' option is removed.

    // Perform initial display of nutrient details based on default quantity/unit.
    updateNutrientDetailsDisplay(currentFoodDetails, 
                                 parseFloat(reconnectedQuantityInput.value), 
                                 reconnectedUnitSelect.value);

    // Add event listeners to quantity and unit inputs for dynamic updates.
    reconnectedQuantityInput.addEventListener('input', () => {
        if (currentFoodDetails) {
            updateNutrientDetailsDisplay(currentFoodDetails, 
                                         parseFloat(reconnectedQuantityInput.value), 
                                         reconnectedUnitSelect.value);
        }
    });

    reconnectedUnitSelect.addEventListener('change', () => {
        if (currentFoodDetails) {
            updateNutrientDetailsDisplay(currentFoodDetails, 
                                         parseFloat(reconnectedQuantityInput.value), 
                                         reconnectedUnitSelect.value);
        }
    });
}


// --- Event Listeners and Initial Setup (runs when DOM is fully loaded) ---
document.addEventListener('DOMContentLoaded', () => {
    // Get all necessary HTML elements by their IDs.
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResultsList = document.getElementById('searchResults');
    const foodDetailsDiv = document.getElementById('foodDetails'); // Main container for details
    const totalFoodsCountSpan = document.getElementById('totalFoodsCount');
    const downloadJsonButton = document.getElementById('downloadJsonButton');
    const prevPageButton = document.getElementById('prevPage');
    const nextPageButton = document.getElementById('nextPage');
    const itemsPerPageSelect = document.getElementById('itemsPerPageSelect');
    // Note: tableHeader and tableBody are used directly in renderTable, no need to get them here.

    // Event listeners for pagination controls.
    prevPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    });

    nextPageButton.addEventListener('click', () => {
        const totalPages = Math.ceil(foodData.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
        }
    });

    // Event listener for changing items per page.
    itemsPerPageSelect.addEventListener('change', (e) => {
        itemsPerPage = parseInt(e.target.value);
        currentPage = 1; // Reset to first page when items per page changes.
        renderTable();
    });

    // Event listeners for search functionality.
    searchButton.addEventListener('click', () => {
        displaySearchResults(searchInput.value.trim());
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            displaySearchResults(searchInput.value.trim());
        }
    });

    // --- Download JSON functionality ---
    // Event listener for the download button.
    downloadJsonButton.addEventListener('click', () => {
        const dataStr = JSON.stringify(foodData, null, 4); // Pretty print the JSON data.
        const blob = new Blob([dataStr], { type: 'application/json' }); // Create a Blob from the JSON string.
        const url = URL.createObjectURL(blob); // Create a URL for the Blob.
        const a = document.createElement('a'); // Create a temporary anchor element.
        a.href = url;
        a.download = 'food_nutrition_data.json'; // Set the download file name.
        document.body.appendChild(a); // Append to body to make it clickable.
        a.click(); // Programmatically click the link to trigger download.
        document.body.removeChild(a); // Clean up the temporary link.
        URL.revokeObjectURL(url); // Release the object URL.
    });

    // Initial load of data when the page loads.
    // This is the starting point for fetching your food data.
    loadFoodData();
});
