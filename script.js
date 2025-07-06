// script.js

// 1. --- Global Constants & Variable Declarations ---
// This is the correct, consistent nutrientGroups object we worked on.
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

// This 'foodData' variable should be declared ONCE at the top level
// so all functions can access the same data after it's loaded.
let foodData = [];
let currentPage = 1;
let itemsPerPage; // Will be set from itemsPerPageSelect value later

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

        // After data is loaded, set the initial itemsPerPage and render the table
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

    // Determine columns to display in the table
    const sampleFood = foodData[0]; // Assuming first item is representative
    const primaryCols = ['Food Name'];
    // IMPORTANT: THESE KEYS MIGHT NEED ADJUSTMENT based on your exact JSON structure.
    // The keys in nutrientGroups are "Calories (per 100g)", etc.
    // If your table needs "Energy (kcal)", "Protein (g)" etc., ensure those specific keys exist in your JSON.
    const nutrientColsForTable = [
        "Calories (per 100g)", // Use the (per 100g) keys for consistency with nutrientGroups
        "Protein (per 100g)",
        "Fat (per 100g)",
        "Carbohydrates (per 100g)",
        "Fiber dietary (per 100g)",
        "Sodium (per 100g)" // Example, added Sodium for consistency
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
    currentPage = Math.min(Math.max(1, currentPage), totalPages); // Keep current page within bounds

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, foodData.length);
    const foodsToDisplay = foodData.slice(startIndex, endIndex);

    // Populate table body
    foodsToDisplay.forEach(food => {
        const tr = document.createElement('tr');
        displayColumns.forEach(col => {
            const td = document.createElement('td');
            const value = food[col];
            // Format numbers to 2 decimal places, show 'N/A' if undefined/null/empty string
            td.textContent = (typeof value === 'number' && !isNaN(value)) ? value.toFixed(2) : (value !== undefined && value !== null && value !== '') ? value : 'N/A';
            tr.appendChild(td);
        });

        // Add Details button
        const tdDetails = document.createElement('td');
        const detailButton = document.createElement('button');
        detailButton.textContent = 'View';
        detailButton.classList.add('detail-button'); // Add class for styling
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
        searchResultsList.innerHTML = `<p class="info-message">No food found matching "${query}". Try a different search term.</p>`;
        return;
    }

    // Limit to top 10 results for search dropdown
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
        moreResultsInfo.classList.add('info-message-item'); // Add a class for styling
        moreResultsInfo.textContent = `... and ${results.length - 10} more. Refine your search or select from the top 10.`;
        searchResultsList.appendChild(moreResultsInfo);
    }
}

// Function to display detailed nutrition for a selected food (from search or table)
function displayFoodDetails(food) {
    // Use the already defined foodDetailsDiv variable (no need to redefine it here)
    const foodDetailsDiv = document.getElementById('foodDetails');
    foodDetailsDiv.innerHTML = ''; // Clear previous details
    foodDetailsDiv.style.display = 'block'; // Show the details section

    const foodNameHeading = document.createElement('h2');
    foodNameHeading.textContent = food['Food Name'];
    foodDetailsDiv.appendChild(foodNameHeading);

    // IMPORTANT: USE THE GLOBAL nutrientGroups object defined at the top of the script!
    // Do NOT redefine it here.
    for (const groupCategory in nutrientGroups) { // Iterates through "Macros", "Minerals", "Vitamins"
        const groupSection = document.createElement('div');
        groupSection.className = 'nutrient-group'; // For CSS styling

        const groupHeading = document.createElement('h3');
        groupHeading.textContent = groupCategory; // e.g., "Macros"
        groupSection.appendChild(groupHeading);

        const groupList = document.createElement('ul');
        groupList.className = 'nutrient-list'; // For CSS styling

        // Iterate through each nutrient within the group (e.g., "Energy", "Protein")
        for (const nutrientDisplayName in nutrientGroups[groupCategory]) {
            const nutrientKeys = nutrientGroups[groupCategory][nutrientDisplayName];
            
            // Prioritize '100g' display for details, then 'gram', then 'ounce'
            // You can adjust this logic if you have a default unit selector for details
            let nutrientKeyToUse = nutrientKeys['100g'] || nutrientKeys['gram'] || nutrientKeys['ounce'];

            if (food.hasOwnProperty(nutrientKeyToUse)) {
                const listItem = document.createElement('li');
                const value = food[nutrientKeyToUse];

                const displayValue = (typeof value === 'number' && !isNaN(value)) ? value.toFixed(2) : (value !== undefined && value !== null && value !== '') ? value : 'N/A';
                
                // Use the readable display name for the nutrient (e.g., "Energy", "Protein")
                listItem.innerHTML = `<strong>${nutrientDisplayName}:</strong> ${displayValue} (${nutrientKeyToUse.split('(')[1] || ''}`; // Extracts unit like "per 100g)"
                groupList.appendChild(listItem);
            }
        }
        groupSection.appendChild(groupList);
        foodDetailsDiv.appendChild(groupSection);
    }
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
    // Call the GLOBAL loadFoodData function.
    loadFoodData();
});
