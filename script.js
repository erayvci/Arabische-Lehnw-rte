document.addEventListener('DOMContentLoaded', function() {
    // SheetBest API endpointinizi buraya yapıştırın
    const sheetBestUrl = "https://api.sheetbest.com/sheets/e21cc39a-5fe1-4d31-8702-dbc1f89b285a";
    
    const entriesContainer = document.getElementById('entriesContainer');
    const loadingElement = document.getElementById('loading');
    const noResultsElement = document.getElementById('noResults');
    const resultCountElement = document.getElementById('resultCount');
    const searchInput = document.getElementById('searchInput');
    const originFilter = document.getElementById('originFilter');
    const lingFilter = document.getElementById('lingFilter');
    const themeFilter = document.getElementById('themeFilter');
    const resetFiltersBtn = document.getElementById('resetFilters');
    
    let allEntries = [];
    let filteredEntries = [];
    let uniqueOrigins = new Set();
    let uniqueLingCats = new Set();
    let uniqueThemeCats = new Set();
    
    // Verileri yükle
    fetchData();
    
    // Filtreleme event listener'ları
    searchInput.addEventListener('input', filterEntries);
    originFilter.addEventListener('change', filterEntries);
    lingFilter.addEventListener('change', filterEntries);
    themeFilter.addEventListener('change', filterEntries);
    resetFiltersBtn.addEventListener('click', resetFilters);
    
    async function fetchData() {
        try {
            const response = await fetch(sheetBestUrl);
            const data = await response.json();
            
            allEntries = data.map(entry => ({
                ...entry,
                processedContent: formatEntryContent(entry)
            }));
            
            collectUniqueCategories();
            populateFilterOptions();
            filteredEntries = [...allEntries];
            displayEntries(filteredEntries);
            
            loadingElement.classList.add('d-none');
        } catch (error) {
            console.error('Daten konnten nicht geladen werden:', error);
            loadingElement.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Fehler beim Laden der Daten. Bitte überprüfen Sie die API-URL.
                </div>
            `;
        }
    }
    
    function formatEntryContent(entry) {
        let content = '';
        
        if (entry['Arabisches Wort']) {
            content += `<p><strong>Arabisches Wort:</strong> <span class="arabic-word">${entry['Arabisches Wort']}</span></p>`;
        }
        
        if (entry['Transkription']) {
            content += `<p><strong>Transkription:</strong> ${entry['Transkription']}</p>`;
        }
        
        if (entry['IPA']) {
            content += `<p><strong>IPA:</strong> ${entry['IPA']}</p>`;
        }
        
        if (entry['Bedeutung (Deutsch)']) {
            content += `<p><strong>Bedeutung:</strong> ${entry['Bedeutung (Deutsch)']}</p>`;
        }
        
        if (entry['Originalwort']) {
            content += `<p><strong>Originalwort:</strong> ${entry['Originalwort']}</p>`;
        }
        
        if (entry['Übernahmepfad']) {
            content += `<p><strong>Übernahmepfad:</strong> ${entry['Übernahmepfad']}</p>`;
        }
        
        if (entry['Historischer Kontext']) {
            content += `<p><strong>Historischer Kontext:</strong> ${entry['Historischer Kontext']}</p>`;
        }
        
        return content;
    }
    
    function collectUniqueCategories() {
        allEntries.forEach(entry => {
            if (entry['Herkunftssprache']) {
                uniqueOrigins.add(entry['Herkunftssprache']);
            }
            
            if (entry['linguistische Kategorie']) {
                const categories = entry['linguistische Kategorie'].split(',').map(cat => cat.trim());
                categories.forEach(cat => uniqueLingCats.add(cat));
            }
            
            if (entry['Thematische Kategorie']) {
                const categories = entry['Thematische Kategorie'].split(',').map(cat => cat.trim());
                categories.forEach(cat => uniqueThemeCats.add(cat));
            }
        });
    }
    
    function populateFilterOptions() {
        // Herkunftssprache seçenekleri
        const sortedOrigins = Array.from(uniqueOrigins).sort();
        sortedOrigins.forEach(origin => {
            const option = document.createElement('option');
            option.value = origin;
            option.textContent = origin;
            originFilter.appendChild(option);
        });
        
        // Linguistische Kategorie seçenekleri
        const sortedLingCats = Array.from(uniqueLingCats).sort();
        sortedLingCats.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            lingFilter.appendChild(option);
        });
        
        // Thematische Kategorie seçenekleri
        const sortedThemeCats = Array.from(uniqueThemeCats).sort();
        sortedThemeCats.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            themeFilter.appendChild(option);
        });
    }
    
    function filterEntries() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedOrigin = originFilter.value;
        const selectedLingCat = lingFilter.value;
        const selectedThemeCat = themeFilter.value;
        
        filteredEntries = allEntries.filter(entry => {
            const matchesSearch = 
                !searchTerm || 
                (entry['Arabisches Wort'] && entry['Arabisches Wort'].toLowerCase().includes(searchTerm)) || 
                (entry['Bedeutung (Deutsch)'] && entry['Bedeutung (Deutsch)'].toLowerCase().includes(searchTerm));
            
            const matchesOrigin = 
                !selectedOrigin || 
                (entry['Herkunftssprache'] && entry['Herkunftssprache'] === selectedOrigin);
            
            const matchesLingCat = 
                !selectedLingCat || 
                (entry['linguistische Kategorie'] && 
                 entry['linguistische Kategorie'].split(',').map(cat => cat.trim()).includes(selectedLingCat));
            
            const matchesThemeCat = 
                !selectedThemeCat || 
                (entry['Thematische Kategorie'] && 
                 entry['Thematische Kategorie'].split(',').map(cat => cat.trim()).includes(selectedThemeCat));
            
            return matchesSearch && matchesOrigin && matchesLingCat && matchesThemeCat;
        });
        
        displayEntries(filteredEntries);
    }
    
    function displayEntries(entries) {
        entriesContainer.innerHTML = '';
        
        if (entries.length === 0) {
            noResultsElement.classList.remove('d-none');
            resultCountElement.textContent = '0 Ergebnisse';
        } else {
            noResultsElement.classList.add('d-none');
            resultCountElement.textContent = `${entries.length} Ergebnisse`;
            
            entries.forEach(entry => {
                const entryCard = createEntryCard(entry);
                entriesContainer.appendChild(entryCard);
            });
        }
    }
    
    function createEntryCard(entry) {
        const col = document.createElement('div');
        col.className = 'col-12 col-md-6 col-lg-4';
        
        const card = document.createElement('div');
        card.className = 'card entry-card mb-3';
        
        const cardHeader = document.createElement('div');
        cardHeader.className = 'card-header';
        cardHeader.innerHTML = `<h5>${entry['Arabisches Wort'] || 'Ohne Titel'}</h5>`;
        
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';
        
        // Kategorie badge'leri
        const categoriesDiv = document.createElement('div');
        categoriesDiv.className = 'mb-3';
        
        if (entry['Herkunftssprache']) {
            const originBadge = document.createElement('span');
            originBadge.className = 'badge origin-badge badge-category';
            originBadge.textContent = entry['Herkunftssprache'];
            categoriesDiv.appendChild(originBadge);
        }
        
        if (entry['linguistische Kategorie']) {
            entry['linguistische Kategorie'].split(',').forEach(cat => {
                const lingBadge = document.createElement('span');
                lingBadge.className = 'badge ling-badge badge-category';
                lingBadge.textContent = cat.trim();
                categoriesDiv.appendChild(lingBadge);
            });
        }
        
        if (entry['Thematische Kategorie']) {
            entry['Thematische Kategorie'].split(',').forEach(cat => {
                const themeBadge = document.createElement('span');
                themeBadge.className = 'badge theme-badge badge-category';
                themeBadge.textContent = cat.trim();
                categoriesDiv.appendChild(themeBadge);
            });
        }
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'entry-content';
        contentDiv.innerHTML = entry.processedContent || 'Keine Inhalte verfügbar';
        
        cardBody.appendChild(categoriesDiv);
        cardBody.appendChild(contentDiv);
        card.appendChild(cardHeader);
        card.appendChild(cardBody);
        col.appendChild(card);
        
        return col;
    }
    
    function resetFilters() {
        searchInput.value = '';
        originFilter.value = '';
        lingFilter.value = '';
        themeFilter.value = '';
        filterEntries();
    }
});
