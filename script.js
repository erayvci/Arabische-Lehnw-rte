document.addEventListener('DOMContentLoaded', function() {
    // SheetBest API endpoint (Nach der SheetBest-Integration aktualisieren)
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
    
    // Daten laden
    fetchData();
    
    // Filter-Event-Listener
    searchInput.addEventListener('input', filterEntries);
    originFilter.addEventListener('change', filterEntries);
    lingFilter.addEventListener('change', filterEntries);
    themeFilter.addEventListener('change', filterEntries);
    resetFiltersBtn.addEventListener('click', resetFilters);
    
    async function fetchData() {
        try {
            // Mit der tatsächlichen SheetBest API-URL ersetzen
            const response = await fetch(sheetBestUrl);
            const data = await response.json();
            
            allEntries = data.map(entry => ({
                ...entry,
                // Arabische Wörter markieren
                processedContent: processArabicWords(entry['Inhalt'] || '')
            }));
            
            // Einzigartige Kategorien sammeln
            collectUniqueCategories();
            
            // Filteroptionen füllen
            populateFilterOptions();
            
            // Alle Einträge anzeigen
            filteredEntries = [...allEntries];
            displayEntries(filteredEntries);
            
            loadingElement.classList.add('d-none');
        } catch (error) {
            console.error('Fehler beim Laden der Daten:', error);
            loadingElement.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Beim Laden der Daten ist ein Fehler aufgetreten. Bitte versuchen Sie es später noch einmal.
                </div>
            `;
        }
    }
    
    function processArabicWords(content) {
        // Regex für arabische Zeichen (Unicode-Bereich für Arabisch)
        const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+/g;
        
        // Arabische Wörter mit span umschließen und spezielle Klasse hinzufügen
        return content.replace(arabicRegex, match => 
            `<span class="arabic-word">${match}</span>`
        );
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
        // Herkunftssprache Optionen
        const sortedOrigins = Array.from(uniqueOrigins).sort();
        sortedOrigins.forEach(origin => {
            const option = document.createElement('option');
            option.value = origin;
            option.textContent = origin;
            originFilter.appendChild(option);
        });
        
        // Linguistische Kategorie Optionen
        const sortedLingCats = Array.from(uniqueLingCats).sort();
        sortedLingCats.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            lingFilter.appendChild(option);
        });
        
        // Thematische Kategorie Optionen
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
            // Suchbegriff überprüfen
            const matchesSearch = 
                !searchTerm || 
                (entry['Stichwort'] && entry['Stichwort'].toLowerCase().includes(searchTerm)) || 
                (entry['Inhalt'] && entry['Inhalt'].toLowerCase().includes(searchTerm));
            
            // Herkunftssprache überprüfen
            const matchesOrigin = 
                !selectedOrigin || 
                (entry['Herkunftssprache'] && entry['Herkunftssprache'] === selectedOrigin);
            
            // Linguistische Kategorie überprüfen
            const matchesLingCat = 
                !selectedLingCat || 
                (entry['linguistische Kategorie'] && 
                 entry['linguistische Kategorie'].split(',').map(cat => cat.trim()).includes(selectedLingCat));
            
            // Thematische Kategorie überprüfen
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
        cardHeader.innerHTML = `<h5>${entry['Stichwort'] || 'Ohne Titel'}</h5>`;
        
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';
        
        // Kategorie-Badges
        const categoriesDiv = document.createElement('div');
        categoriesDiv.className = 'mb-3';
        
        // Herkunftssprache
        if (entry['Herkunftssprache']) {
            const originBadge = document.createElement('span');
            originBadge.className = 'badge origin-badge badge-category';
            originBadge.textContent = entry['Herkunftssprache'];
            categoriesDiv.appendChild(originBadge);
        }
        
        // Linguistische Kategorie
        if (entry['linguistische Kategorie']) {
            entry['linguistische Kategorie'].split(',').forEach(cat => {
                const lingBadge = document.createElement('span');
                lingBadge.className = 'badge ling-badge badge-category';
                lingBadge.textContent = cat.trim();
                categoriesDiv.appendChild(lingBadge);
            });
        }
        
        // Thematische Kategorie
        if (entry['Thematische Kategorie']) {
            entry['Thematische Kategorie'].split(',').forEach(cat => {
                const themeBadge = document.createElement('span');
                themeBadge.className = 'badge theme-badge badge-category';
                themeBadge.textContent = cat.trim();
                categoriesDiv.appendChild(themeBadge);
            });
        }
        
        // Inhalt
        const contentDiv = document.createElement('div');
        contentDiv.className = 'entry-content';
        contentDiv.innerHTML = entry.processedContent || 'Kein Inhalt';
        
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
