// script.js

// 1. --- Global Constants & Variable Declarations ---
// This object defines the structure for displaying nutrients, mapping user-friendly names
// to the exact keys found in your food_data.json for different units (per 100g, per gram, per ounce).
// The '100g' keys are kept here because your data might still contain them,
// even if it's no longer a selectable unit in the UI for calculation purposes.
const nutrientGroups = {
    "Macros": {
        "Energy": { "100g": "Calories (per 100g)", "gram": "Calories (per gram)", "ounce": "Calories (per ounce)" },
        "Protein": { "100g": "Protein (per 100g)", "gram": "Protein (per gram)", "ounce": "Protein (per ounce)" },
        "Fat": { "100g": "Fat (per 100g)", "gram": "Fat (per gram)", "ounce": "Fat (per ounce)" },
        "Carbohydrates": { "100g": "Carbohydrates (per 100g)", "gram": "Carbohydrates (per gram)", "ounce": "Carbohydrates (per ounce)" },
        "Fiber": { "100g": "Fiber dietary (per 100g)", "gram": "Fiber dietary (per gram)", "ounce": "Fiber dietary (per ounce)" }
    },
    "Minerals": {
        "Calcium": { "100g": "Calcium (per 100g)", "gram": "Calcium (per gram)", "ounce": "Calcium (per ounce)" },
        "Iron": { "100g": "Iron (per 100g)", "gram": "Iron (per gram)", "ounce": "Iron (per ounce)" },
        "Magnesium": { "100g": "Magnesium (per 100g)", "gram": "Magnesium (per gram)", "ounce": "Magnesium (per ounce)" },
        "Phosphorus": { "100g": "Phosphorus (per 100g)", "gram": "Phosphorus (per gram)", "ounce": "Phosphorus (per ounce)" },
        "Potassium": { "100g": "Potassium (per 100g)", "gram": "Potassium (per gram)", "ounce": "Potassium (per ounce)" },
        "Sodium": { "100g": "Sodium (per 100g)", "gram": "Sodium (per gram)", "ounce": "Sodium (per ounce)" },
        "Zinc": { "100g": "Zinc (per 100g)", "gram": "Zinc (per gram)", "ounce": "Zinc (per ounce)" },
        "Copper": { "100g": "Copper (per 100g)", "gram": "Copper (per gram)", "ounce": "Copper (per ounce)" },
        "Manganese": { "100g": "Manganese (per 100g)", "gram": "Manganese (per gram)", "ounce": "Manganese (per ounce)" },
        "Selenium": { "100g": "Selenium (per 100g)", "gram": "Selenium (per gram)", "ounce": "Selenium (per ounce)" }
    },
    "Vitamins": {
        "Vitamin C": { "100g": "Vitamin C ascorbic acid (per 100g)", "gram": "Vitamin C ascorbic acid (per gram)", "ounce": "Vitamin C ascorbic acid (per ounce)" },
        "Vitamin A": { "100g": "Vitamin A (per 100g)", "gram": "Vitamin A (per gram)", "ounce": "Vitamin A (per ounce)" },
        "Vitamin E": { "100g": "Vitamin E (per 100g)", "gram": "Vitamin E (per gram)", "ounce": "Vitamin E (per ounce)" },
        "Vitamin D": { "100g": "Vitamin D (per 100g)", "gram": "Vitamin D (per gram)", "ounce": "Vitamin D (per ounce)" },
        "Thiamin (B1)": { "100g": "Thiamin (per 100g)", "gram": "Thiamin (per gram)", "ounce": "Thiamin (per ounce)" },
        "Riboflavin (B2)": { "100g": "Riboflavin (per 100g)", "gram": "Riboflavin (per gram)", "ounce": "Riboflavin (per ounce)" },
        "Niacin (B3)": { "100g": "Niacin (per 100g)", "gram": "Niacin (per gram)", "ounce": "Niacin (per ounce)" },
        "Vitamin B6": { "100g": "Vitamin B6 (per 100g)", "gram": "Vitamin B6 (per gram)", "ounce": "Vitamin B6 (per ounce)" },
        "Vitamin B12": { "100g": "Vitamin B12 (per 100g)", "gram": "Vitamin B12 (per gram)", "ounce": "Vitamin B12 (per ounce)" },
        "Vitamin K": { "100g": "Vitamin K (per 100g)", "gram": "Vitamin K (per gram)", "ounce": "Vitamin K (per ounce)" }
    }
};

// Global variables to manage food data, pagination, and currently displayed food details.
let foodData = []; // Stores the entire dataset from food_data.json
let currentPage = 1; // Current page for the main food table
let itemsPerPage; // Number of items to display per page in the table, set on load
let currentFoodDetails = null; // Stores the food object currently being displayed in the details section

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

// --- Table Rendering and Pagination Functions ---
// Renders the main table of food items based on current page and items per page.
function renderTable() {
    const tableBody = document.getElementById('tableBody');
    const tableHeader = document.getElementById('tableHeader');
    const pageInfoSpan = document.getElementById('pageInfo');
    const prevPageButton = document.getElementById('prevPage');
    const nextPageButton = document.getElementById('nextPage');

    tableBody.innerHTML = ''; // Clear existing table rows.
    tableHeader.innerHTML = ''; // Clear existing table headers.

    // If no food data is loaded, display a fallback message.
    if (foodData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="100">No data to display.</td></tr>';
        return;
    }

    // Define columns to display in the main table.
    // 'Food Name' is always included. Other nutrients are based on 'per 100g' keys.
    const sampleFood = foodData[0]; // Use the first food item to determine available columns.
    const primaryCols = ['Food Name'];
    const nutrientColsForTable = [
        "Calories (per 100g)",
        "Protein (per 100g)",
        "Fat (per 100g)",
        "Carbohydrates (per 100g)",
        "Fiber dietary (per 100g)",
        "Sodium (per 100g)"
    ];
       
    // Build the final list of columns to display, checking if they exist in the data.
    const displayColumns = [...primaryCols];
    nutrientColsForTable.forEach(col => {
        if (sampleFood.hasOwnProperty(col)) {
            displayColumns.push(col);
        }
    });

    // Create table headers dynamically.
    displayColumns.forEach(col => {
        const th = document.createElement('th');
        // Use .textContent for safety, and remove units from header text for cleaner display.
        th.textContent = col.replace(/\s*\(.*\)\s*$/, '');
        tableHeader.appendChild(th);
    });

    // Add a "View Details" column header.
    const thDetails = document.createElement('th');
    thDetails.textContent = 'Details';
    tableHeader.appendChild(thDetails);

    // Calculate pagination details.
    const totalPages = Math.ceil(foodData.length / itemsPerPage);
    // Ensure currentPage is within valid bounds.
    currentPage = Math.min(Math.max(1, currentPage), totalPages);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, foodData.length);
    const foodsToDisplay = foodData.slice(startIndex, endIndex);

    // Populate the table body with food data.
    foodsToDisplay.forEach(food => {
        const tr = document.createElement('tr');
        displayColumns.forEach(col => {
            const td = document.createElement('td');
            const value = food[col];
            // Format numeric values to 2 decimal places, display 'N/A' for missing/invalid data.
            td.textContent = (typeof value === 'number' && !isNaN(value)) ? value.toFixed(2) : (value !== undefined && value !== null && value !== '') ? value : 'N/A';
            tr.appendChild(td);
        });

        // Add a "View Details" button for each food item.
        const tdDetails = document.createElement('td');
        const detailButton = document.createElement('button');
        detailButton.textContent = 'View';
        detailButton.classList.add('detail-button'); // Add class for styling.
        detailButton.addEventListener('click', () => {
            // Clear search results, display food details, and scroll to the details section.
            document.getElementById('searchResults').innerHTML = '';
            displayFoodDetails(food);
            document.getElementById('foodDetails').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        tdDetails.appendChild(detailButton);
        tr.appendChild(tdDetails);

        tableBody.appendChild(tr);
    });

    // Update pagination information displayed on the page.
    pageInfoSpan.textContent = `Page ${currentPage} of ${totalPages}`;
    prevPageButton.disabled = currentPage === 1; // Disable 'Previous' button on first page.
    nextPageButton.disabled = currentPage === totalPages; // Disable 'Next' button on last page.
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

    const lowerCaseQuery = query.toLowerCase();
    // Filter food data based on the search query (case-insensitive).
    const results = foodData.filter(food =>
        food['Food Name'] && food['Food Name'].toLowerCase().includes(lowerCaseQuery)
    );

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
            let displayUnit = ''; // Stores the unit to display (g, oz).

            // Determine which key to use from the food data based on the selected unit
            // and perform the calculation.
            if (unit === 'gram' && nutrientMapping['gram'] && typeof food[nutrientMapping['gram']] === 'number') {
                baseValue = food[nutrientMapping['gram']];
                calculatedValue = baseValue * quantity;
                displayUnit = 'g';
            } else if (unit === 'ounce' && nutrientMapping['ounce'] && typeof food[nutrientMapping['ounce']] === 'number') {
                baseValue = food[nutrientMapping['ounce']];
                calculatedValue = baseValue * quantity;
                displayUnit = 'oz';
            }
            // If the specific unit key is not found or its value is not a number,
            // calculatedValue remains 'N/A'. The '100g' option is no longer handled here.

            // Format the calculated value to 2 decimal places or 'N/A'.
            const formattedDisplayValue = (typeof calculatedValue === 'number' && !isNaN(calculatedValue)) ? calculatedValue.toFixed(2) : 'N/A';
            
            // Create list item and populate it with sanitized content.
            const listItem = document.createElement('li');
            const sanitizedDisplayName = DOMPurify.sanitize(nutrientDisplayName);
            const sanitizedFormattedDisplayValue = DOMPurify.sanitize(formattedDisplayValue.toString());
            const sanitizedDisplayUnit = DOMPurify.sanitize(displayUnit);

            listItem.innerHTML = `<strong>${sanitizedDisplayName}:</strong> ${sanitizedFormattedDisplayValue}${sanitizedDisplayUnit ? ` ${sanitizedDisplayUnit}` : ''}`;
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
