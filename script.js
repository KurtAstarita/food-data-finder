document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResultsDiv = document.getElementById('searchResults');
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
            searchResultsDiv.innerHTML = '<p class="error-message">Error loading food data. Please ensure food_data.json exists and is valid.</p>';
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
        const sampleFood = foodData[0];
        const primaryCols = ['Food Name'];
        const nutrientPrefix = ['Calories (per 100g)', 'Protein (per 100g)', 'Fat (per 100g)', 'Carbohydrates (per 100g)', 'Fiber dietary (per 100g)', 'Sodium (per 100g)'];
        
        // Dynamically get available nutrients for header, prioritize selected
        const availableNutrientCols = Object.keys(sampleFood).filter(key => 
            key.includes('(per 100g)') && !primaryCols.includes(key)
        ).sort(); // Sort them alphabetically for consistency

        const displayColumns = [...primaryCols, ...nutrientPrefix.filter(col => availableNutrientCols.includes(col))];

        // Create table headers
        displayColumns.forEach(col => {
            const th = document.createElement('th');
            th.textContent = col;
            tableHeader.appendChild(th);
        });

        // Add a "View Details" column
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
                td.textContent = food[col] !== undefined ? food[col] : 'N/A';
                tr.appendChild(td);
            });

            // Add Details button
            const tdDetails = document.createElement('td');
            const detailButton = document.createElement('button');
            detailButton.textContent = 'View';
            detailButton.classList.add('detail-button'); // Add class for styling
            detailButton.addEventListener('click', () => {
                // Clear search results and scroll to food details
                searchResultsDiv.innerHTML = ''; 
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

    // --- Search functionality (mostly existing, but updated display logic) ---
    function displaySearchResults(query) {
        searchResultsDiv.innerHTML = ''; // Clear previous results
        foodDetailsDiv.style.display = 'none'; // Hide details when searching

        if (!query) {
            searchResultsDiv.innerHTML = '<p class="info-message">Please enter a food name to search.</p>';
            return;
        }

        const lowerCaseQuery = query.toLowerCase();
        const results = foodData.filter(food => 
            food['Food Name'] && food['Food Name'].toLowerCase().includes(lowerCaseQuery)
        );

        if (results.length === 0) {
            searchResultsDiv.innerHTML = `<p class="info-message">No food found matching "${query}". Try a different search term.</p>`;
            return;
        }

        const ul = document.createElement('ul');
        ul.style.listStyleType = 'none';
        ul.style.padding = '0';

        results.slice(0, 10).forEach((food, index) => { // Limit to top 10 results
            const li = document.createElement('li');
            li.classList.add('result-item');
            li.textContent = `${food['Food Name']} (FDC ID: ${food['fdc_id']})`;
            //li.dataset.fdcId = food['fdc_id']; // Not strictly needed with direct object pass
            li.addEventListener('click', () => displayFoodDetails(food));
            ul.appendChild(li);
        });
        searchResultsDiv.appendChild(ul);

        if (results.length > 10) {
            searchResultsDiv.innerHTML += `<p class="info-message">... and ${results.length - 10} more. Refine your search or select from the top 10.</p>`;
        }
    }

    // Function to display detailed nutrition for a selected food (from search or table)
    function displayFoodDetails(food) {
        foodDetailsDiv.innerHTML = ''; // Clear previous details
        foodDetailsDiv.style.display = 'block'; // Show the details section

        const h2 = document.createElement('h2');
        h2.textContent = food['Food Name'];
        foodDetailsDiv.appendChild(h2);

        // Iterate over all keys (columns) in the food object
        for (const key in food) {
            // Skip FDC ID, and the internal 'name' column if it was generated during python processing
            // The 'name' column is the original nutrient name from nutrient.csv before renaming
            // We want to show the processed 'Food Name' and the calculated nutrient columns
            if (key !== 'fdc_id' && key !== 'name') { 
                const p = document.createElement('p');
                p.innerHTML = `<strong>${key}:</strong> ${food[key]}`;
                foodDetailsDiv.appendChild(p);
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