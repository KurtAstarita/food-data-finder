document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResultsList = document.getElementById('searchResults'); // Changed from Div to List
    const foodDetailsDiv = document.getElementById('foodDetails');
    const totalFoodsCountSpan = document.getElementById('totalFoodsCount');
    const downloadJsonButton = document.getElementById('downloadJsonButton');

    // Pagination elements
    const prevPageButton = document.getElementById('prevPage');
    const nextPageButton = document.getElementById('nextPage');
    const pageInfoSpan = document.getElementById('pageInfo');
    const itemsPerPageSelect = document.getElementById('itemsPerPageSelect');
    const foodTable = document.getElementById('foodTable');
    const tableHeader = document.getElementById('tableHeader');
    const tableBody = document.getElementById('tableBody');

    let foodData = []; // This will store our loaded food data
    let currentPage = 1;
    let itemsPerPage = parseInt(itemsPerPageSelect.value); // Default from select

    // Function to load food data from JSON file
    async function loadFoodData() {
        try {
            const response = await fetch('food_data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            foodData = await response.json();
            console.log(`Loaded ${foodData.length} food items.`);
            totalFoodsCountSpan.textContent = foodData.length; // Update total count

            // Initial display of the "chart"
            renderTable();
        } catch (error) {
            console.error("Could not load food data:", error);
            searchResultsList.innerHTML = '<p class="error-message">Error loading food data. Please ensure food_data.json exists and is valid.</p>';
            totalFoodsCountSpan.textContent = 'Error';
        }
    }

    // --- Table Rendering and Pagination ---
    function renderTable() {
        tableBody.innerHTML = ''; // Clear existing rows
        tableHeader.innerHTML = ''; // Clear existing headers

        if (foodData.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="100">No data to display.</td></tr>'; // Fallback
            return;
        }

        // Determine columns to display in the table
        // We'll show Food Name, and then some common nutrients
        const sampleFood = foodData[0]; // Assuming first item is representative
        const primaryCols = ['Food Name'];
        // Use exact nutrient names from your data
        const nutrientColsForTable = [
            'Energy (kcal)', 'Protein (g)', 'Total lipid (fat) (g)', 'Carbohydrate, by difference (g)',
            'Fiber, total dietary (g)', 'Sugars, total (g)', 'Sodium, Na (mg)' // Adjusted based on your data names
        ];
        
        // Ensure these columns exist in the first food item, otherwise they won't show
        const displayColumns = [...primaryCols];
        nutrientColsForTable.forEach(col => {
            if (sampleFood.hasOwnProperty(col)) {
                displayColumns.push(col);
            }
        });

        // Create table headers
        displayColumns.forEach(col => {
            const th = document.createElement('th');
            // Remove units from headers for cleaner display in the table
            th.textContent = col.replace(/\s*\(.*\)\s*$/, ''); 
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
                // Format numbers to 2 decimal places, show 'N/A' if undefined/null
                td.textContent = (typeof value === 'number' && !isNaN(value)) ? value.toFixed(2) : (value !== undefined ? value : 'N/A');
                tr.appendChild(td);
            });

            // Add Details button
            const tdDetails = document.createElement('td');
            const detailButton = document.createElement('button');
            detailButton.textContent = 'View';
            detailButton.classList.add('detail-button'); // Add class for styling
            detailButton.addEventListener('click', () => {
                // Clear search results and scroll to food details
                searchResultsList.innerHTML = ''; // Clear search results list
                displayFoodDetails(food);
                foodDetailsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

    // --- Search functionality ---
    function displaySearchResults(query) {
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
        foodDetailsDiv.innerHTML = ''; // Clear previous details
        foodDetailsDiv.style.display = 'block'; // Show the details section

        const foodNameHeading = document.createElement('h2');
        foodNameHeading.textContent = food['Food Name'];
        foodDetailsDiv.appendChild(foodNameHeading);

        // Define nutrient groups. Ensure these match the exact keys from your food_data.json
        const nutrientGroups = {
            'Macros & Energy (per 100g)': [
                'Energy (kcal)', 'Protein (g)', 'Total lipid (fat) (g)',
                'Carbohydrate, by difference (g)', 'Fiber, total dietary (g)', 'Sugars, total (g)',
                'Water (g)'
            ],
            'Vitamins (per 100g)': [
                'Vitamin A, RAE (mcg)', 'Vitamin D (D2 + D3) (mcg)', 'Vitamin E (alpha-tocopherol) (mg)',
                'Vitamin K (phylloquinone) (mcg)', 'Vitamin C, total ascorbic acid (mg)', 'Thiamin (mg)',
                'Riboflavin (mg)', 'Niacin (mg)', 'Vitamin B-6 (mg)', 'Folate, DFE (mcg)',
                'Vitamin B-12 (mcg)'
            ],
            'Minerals (per 100g)': [
                'Calcium, Ca (mg)', 'Iron, Fe (mg)', 'Magnesium, Mg (mg)', 'Phosphorus, P (mg)',
                'Potassium, K (mg)', 'Sodium, Na (mg)', 'Zinc, Zn (mg)', 'Copper, Cu (mg)',
                'Manganese, Mn (mg)', 'Selenium, Se (mcg)'
            ],
            'Other (per 100g)': [ // Add other specific nutrients if you have them and want to display them here
                'Cholesterol (mg)'
            ]
        };

        // Iterate through each group and create a section for it
        for (const groupName in nutrientGroups) {
            if (nutrientGroups.hasOwnProperty(groupName)) {
                const groupSection = document.createElement('div');
                groupSection.className = 'nutrient-group'; // For CSS styling

                const groupHeading = document.createElement('h3');
                groupHeading.textContent = groupName;
                groupSection.appendChild(groupHeading);

                const groupList = document.createElement('ul');
                groupList.className = 'nutrient-list'; // For CSS styling

                nutrientGroups[groupName].forEach(nutrientKey => {
                    // Check if the nutrient key exists in the food object
                    if (food.hasOwnProperty(nutrientKey)) {
                        const listItem = document.createElement('li');
                        const value = food[nutrientKey];

                        // Format numeric values to 2 decimal places, keep 'N/A' as is
                        const displayValue = (typeof value === 'number' && !isNaN(value)) ? value.toFixed(2) : value;

                        // Remove unit from key for cleaner display (e.g., "Protein (g)" becomes "Protein")
                        const cleanNutrientName = nutrientKey.replace(/\s*\(.*\)\s*$/, ''); // Removes (unit) at end

                        listItem.innerHTML = `<strong>${cleanNutrientName}:</strong> ${displayValue}`;
                        groupList.appendChild(listItem);
                    }
                });
                groupSection.appendChild(groupList);
                detailsDiv.appendChild(groupSection);
            }
        }
    }

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

    // Event Listeners for search
    searchButton.addEventListener('click', () => {
        displaySearchResults(searchInput.value.trim());
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            displaySearchResults(searchInput.value.trim());
        }
    });

    // Initial load of data when the page loads
    loadFoodData();
});
