// script.js

// 1. --- Global Constants & Variable Declarations ---
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

let foodData = [];
let currentPage = 1;
let itemsPerPage;
let currentFoodDetails = null; // Store the food object currently being displayed in details

// 2. --- Asynchronous Data Loading Function (Defined once globally) ---
async function loadFoodData() {
    try {
        const response = await fetch('food_data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        foodData = await response.json();
        console.log(`Loaded ${foodData.length} food items.`);
        document.getElementById('totalFoodsCount').textContent = foodData.length; // Update total count

        itemsPerPage = parseInt(document.getElementById('itemsPerPageSelect').value);
        renderTable(); // Initial display of the "chart"
    } catch (error) {
        console.error("Could not load food data:", error);
        document.getElementById('searchResults').innerHTML = '<p class="error-message">Error loading food data. Please ensure food_data.json exists and is valid.</p>';
        document.getElementById('totalFoodsCount').textContent = 'Error';
    }
}

// --- Table Rendering and Pagination ---
function renderTable() {
    const tableBody = document.getElementById('tableBody');
    const tableHeader = document.getElementById('tableHeader');
    const pageInfoSpan = document.getElementById('pageInfo');
    const prevPageButton = document.getElementById('prevPage');
    const nextPageButton = document.getElementById('nextPage');

    tableBody.innerHTML = ''; // Clear existing rows
    tableHeader.innerHTML = ''; // Clear existing headers

    if (foodData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="100">No data to display.</td></tr>'; // Fallback
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

    // Create table headers
    displayColumns.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col.replace(/\s*\(.*\)\s*$/, ''); // Remove units for cleaner display
        tableHeader.appendChild(th);
    });

    // Add a "View Details" column header
    const thDetails = document.createElement('th');
    thDetails.textContent = 'Details';
    tableHeader.appendChild(thDetails);

    // Calculate pagination
    const totalPages = Math.ceil(foodData.length / itemsPerPage);
    currentPage = Math.min(Math.max(1, currentPage), totalPages);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, foodData.length);
    const foodsToDisplay = foodData.slice(startIndex, endIndex);

    // Populate table body
    foodsToDisplay.forEach(food => {
        const tr = document.createElement('tr');
        displayColumns.forEach(col => {
            const td = document.createElement('td');
            const value = food[col];
            td.textContent = (typeof value === 'number' && !isNaN(value)) ? value.toFixed(2) : (value !== undefined && value !== null && value !== '') ? value : 'N/A';
            tr.appendChild(td);
        });

        const tdDetails = document.createElement('td');
        const detailButton = document.createElement('button');
        detailButton.textContent = 'View';
        detailButton.classList.add('detail-button');
        detailButton.addEventListener('click', () => {
            document.getElementById('searchResults').innerHTML = ''; // Clear search results list
            displayFoodDetails(food);
            document.getElementById('foodDetails').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        tdDetails.appendChild(detailButton);
        tr.appendChild(tdDetails);

        tableBody.appendChild(tr);
    });

    // Update pagination info
    pageInfoSpan.textContent = `Page ${currentPage} of ${totalPages}`;
    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage === totalPages;
}


// --- Search functionality ---
function displaySearchResults(query) {
    const searchResultsList = document.getElementById('searchResults');
    const foodDetailsDiv = document.getElementById('foodDetails');

    searchResultsList.innerHTML = ''; // Clear previous results
    foodDetailsDiv.style.display = 'none'; // Hide details when searching

    if (!query) {
        searchResultsList.innerHTML = '<p class="info-message">Please enter a food name to search.</p>';
        return;
    }

    const lowerCaseQuery = query.toLowerCase();
    const results = foodData.filter(food =>
        food['Food Name'] && food['Food Name'].toLowerCase().includes(lowerCaseQuery)
    );

    if (results.length === 0) {
        searchResultsList.innerHTML = `<p class="info-message">No food found matching "${DOMPurify.sanitize(query)}". Try a different search term.</p>`; 
        return;
    }

    results.slice(0, 10).forEach((food, index) => {
        const li = document.createElement('li');
        li.classList.add('result-item');
        li.textContent = `${food['Food Name']} (FDC ID: ${food['fdc_id']})`; 
        li.addEventListener('click', () => {
            searchResultsList.innerHTML = ''; // Clear results after selecting one
            foodDetailsDiv.style.display = 'block'; // Ensure details div is visible
            displayFoodDetails(food);
            foodDetailsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        searchResultsList.appendChild(li);
    });

    if (results.length > 10) {
        const moreResultsInfo = document.createElement('li');
        moreResultsInfo.classList.add('info-message-item');
        moreResultsInfo.textContent = `... and ${results.length - 10} more. Refine your search or select from the top 10.`; 
        searchResultsList.appendChild(moreResultsInfo);
    }
}

/**
 * Renders or re-renders the nutrient details based on the current food, quantity, and unit.
 * @param {Object} food - The food item object.
 * @param {number} quantity - The user-specified quantity.
 * @param {string} unit - The selected unit ('100g', 'gram', 'ounce').
 */
function updateNutrientDetailsDisplay(food, quantity, unit) {
    const nutrientDetailsDisplay = document.getElementById('nutrientDetailsDisplay');
    nutrientDetailsDisplay.innerHTML = ''; // Clear previous details

    for (const groupCategory in nutrientGroups) {
        const groupSection = document.createElement('div');
        groupSection.className = 'nutrient-group';

        const groupHeading = document.createElement('h3');
        groupHeading.textContent = groupCategory;
        groupSection.appendChild(groupHeading);

        const groupList = document.createElement('ul');
        groupList.className = 'nutrient-list';

        for (const nutrientDisplayName in nutrientGroups[groupCategory]) {
            const nutrientKeys = nutrientGroups[groupCategory][nutrientDisplayName];
            
            // Determine the base key (per 100g, per gram, or per ounce) to use from the food data
            let baseNutrientKey = nutrientKeys[unit]; // Tries to match the selected unit directly
            
            // Fallback if the specific unit key isn't found in food data or is '100g' for scaling
            if (!food.hasOwnProperty(baseNutrientKey) || unit === '100g') {
                baseNutrientKey = nutrientKeys['100g'] || nutrientKeys['gram'] || nutrientKeys['ounce'];
                // If the selected unit is 100g, we need to ensure we use the 100g key if available
                if (unit === '100g' && nutrientKeys['100g']) {
                    baseNutrientKey = nutrientKeys['100g'];
                }
            }
            
            if (food.hasOwnProperty(baseNutrientKey)) {
                const listItem = document.createElement('li');
                const baseValue = food[baseNutrientKey];
                let calculatedValue = baseValue;
                let displayUnit = ''; // To show in parentheses after the value

                // Perform calculation based on the selected unit
                if (typeof baseValue === 'number' && !isNaN(baseValue)) {
                    if (unit === 'gram') {
                        calculatedValue = baseValue * quantity;
                        displayUnit = 'g';
                    } else if (unit === 'ounce') {
                        calculatedValue = baseValue * quantity;
                        displayUnit = 'oz';
                    } else if (unit === '100g') {
                        // Scale 100g value if quantity is not 100
                        calculatedValue = (baseValue / 100) * quantity;
                        displayUnit = 'g'; // Display in grams if 100g unit selected
                    }
                } else {
                    calculatedValue = 'N/A'; // If base value is not a valid number
                }

                const displayValue = (typeof calculatedValue === 'number' && !isNaN(calculatedValue)) ? calculatedValue.toFixed(2) : 'N/A';
                
                // Sanitize all parts before inserting into innerHTML
                const sanitizedDisplayName = DOMPurify.sanitize(nutrientDisplayName);
                const sanitizedDisplayValue = DOMPurify.sanitize(displayValue.toString());
                const sanitizedDisplayUnit = DOMPurify.sanitize(displayUnit);

                listItem.innerHTML = `<strong>${sanitizedDisplayName}:</strong> ${sanitizedDisplayValue}${sanitizedDisplayUnit ? ` ${sanitizedDisplayUnit}` : ''}`;
                groupList.appendChild(listItem);
            }
        }
        groupSection.appendChild(groupList);
        nutrientDetailsDisplay.appendChild(groupSection);
    }
}

// Function to display detailed nutrition for a selected food (from search or table)
function displayFoodDetails(food) {
    const foodDetailsDiv = document.getElementById('foodDetails');
    const quantityInput = document.getElementById('quantityInput');
    const unitSelect = document.getElementById('unitSelect');
    const foodNameHeading = document.createElement('h2');
    
    // Clear previous details and show the section
    foodDetailsDiv.innerHTML = ''; // Clear everything including quantity inputs first
    foodDetailsDiv.style.display = 'block';

    // Re-append the quantity input group, as we cleared the entire div
    const quantityInputGroup = document.createElement('div');
    quantityInputGroup.classList.add('quantity-input-group');
    quantityInputGroup.innerHTML = `
        <label for="quantityInput">Quantity:</label>
        <input type="number" id="quantityInput" value="100" min="1" step="any">
        <select id="unitSelect">
            <option value="100g">100g</option>
            <option value="gram">gram</option>
            <option value="ounce">ounce</option>
        </select>
    `;
    foodDetailsDiv.appendChild(quantityInputGroup);

    // Re-get the elements after re-appending them to the DOM
    const reconnectedQuantityInput = document.getElementById('quantityInput');
    const reconnectedUnitSelect = document.getElementById('unitSelect');
    const nutrientDetailsDisplay = document.createElement('div');
    nutrientDetailsDisplay.id = 'nutrientDetailsDisplay';
    foodDetailsDiv.appendChild(nutrientDetailsDisplay);


    foodNameHeading.textContent = food['Food Name'];
    foodDetailsDiv.prepend(foodNameHeading); // Prepend to place it before quantity input

    // Store the current food globally for recalculation
    currentFoodDetails = food;

    // Set initial values for quantity and unit when a new food is displayed
    reconnectedQuantityInput.value = 100;
    reconnectedUnitSelect.value = '100g';

    // Initial display of nutrient details based on default quantity/unit
    updateNutrientDetailsDisplay(currentFoodDetails, 
                                 parseFloat(reconnectedQuantityInput.value), 
                                 reconnectedUnitSelect.value);

    // Add event listeners for quantity and unit changes
    reconnectedQuantityInput.oninput = () => {
        if (currentFoodDetails) {
            updateNutrientDetailsDisplay(currentFoodDetails, 
                                         parseFloat(reconnectedQuantityInput.value), 
                                         reconnectedUnitSelect.value);
        }
    };
    reconnectedUnitSelect.onchange = () => {
        if (currentFoodDetails) {
            updateNutrientDetailsDisplay(currentFoodDetails, 
                                         parseFloat(reconnectedQuantityInput.value), 
                                         reconnectedUnitSelect.value);
        }
    };
}


// --- Event Listeners and Initial Setup (inside DOMContentLoaded) ---
document.addEventListener('DOMContentLoaded', () => {
    // Get all necessary HTML elements
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResultsList = document.getElementById('searchResults');
    const foodDetailsDiv = document.getElementById('foodDetails');
    const totalFoodsCountSpan = document.getElementById('totalFoodsCount');
    const downloadJsonButton = document.getElementById('downloadJsonButton');
    const prevPageButton = document.getElementById('prevPage');
    const nextPageButton = document.getElementById('nextPage');
    const itemsPerPageSelect = document.getElementById('itemsPerPageSelect');

    // Event listeners for pagination
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

    itemsPerPageSelect.addEventListener('change', (e) => {
        itemsPerPage = parseInt(e.target.value);
        currentPage = 1; // Reset to first page when items per page changes
        renderTable();
    });

    // Event Listeners for search
    searchButton.addEventListener('click', () => {
        displaySearchResults(searchInput.value.trim());
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            displaySearchResults(searchInput.value.trim());
        }
    });

    // --- Download JSON functionality ---
    downloadJsonButton.addEventListener('click', () => {
        const dataStr = JSON.stringify(foodData, null, 4); // Pretty print
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'food_nutrition_data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // Initial load of data when the page loads
    loadFoodData();
});
