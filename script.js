document.addEventListener('DOMContentLoaded', function() {
    // SheetBest API URL'sini buraya ekleyin
    const sheetBestUrl = "https://api.sheetbest.com/sheets/e21cc39a-5fe1-4d31-8702-dbc1f89b285a";
    
    // DOM Elementleri
    const entriesContainer = document.getElementById('entriesContainer');
    const loadingElement = document.getElementById('loading');
    const noResultsElement = document.getElementById('noResults');
    const resultCountElement = document.getElementById('resultCount');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const originFilter = document.getElementById('originFilter');
    const lingFilter = document.getElementById('lingFilter');
    const themeFilter = document.getElementById('themeFilter');
    const resetFiltersBtn = document.getElementById('resetFilters');
    
    // Veri depolama
    let allEntries = [];
    let filteredEntries = [];
    let uniqueOrigins = new Set();
    let uniqueLingCats = new Set();
    let uniqueThemeCats = new Set();
    
    // Verileri yükle
    fetchData();
    
    // Event listener'lar
    searchInput.addEventListener('input', filterEntries);
    searchButton.addEventListener('click', filterEntries);
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
            
            loadingElement.style.display = 'none';
        } catch (error) {
            console.error('Veri yükleme hatası:', error);
            loadingElement.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Daten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.
                </div>
            `;
        }
    }
    
    function formatEntryContent(entry) {
        let content = '';
        
        // Temel bilgiler
        if (entry['Transkription']) {
            content += `<p><strong>Transkription:</strong> ${entry['Transkription']}</p>`;
        }
        
        if (entry['IPA']) {
            content += `<p><strong>IPA:</strong> ${entry['IPA']}</p>`;
        }
        
        if (entry['Bedeutung (Deutsch)']) {
            content += `<p><strong>Bedeutung:</strong> ${entry['Bedeutung (Deutsch)']}</p>`;
        }
        
        // Köken bilgileri
        if (entry['Originalwort']) {
            content += `<p><strong>Originalwort:</strong> <span class="arabic-word">${entry['Originalwort']}</span></p>`;
        }
        
        if (entry['Herkunftssprache']) {
            content += `<p><strong>Herkunftssprache:</strong> ${entry['Herkunftssprache']}</p>`;
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
        // Herkunftssprache
        const sortedOrigins = Array.from(uniqueOrigins).sort();
        sortedOrigins.forEach(origin => {
            const option = document.createElement('option');
            option.value = origin;
            option.textContent = origin;
            originFilter.appendChild(option);
        });
        
        // Linguistische Kategorie
        const sortedLingCats = Array.from(uniqueLingCats).sort();
        sortedLingCats.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            lingFilter.appendChild(option);
        });
        
        // Thematische Kategorie
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
            // Arama
            const matchesSearch = 
                !searchTerm || 
                (entry['Arabisches Wort'] && entry['Arabisches Wort'].toLowerCase().includes(searchTerm)) || 
                (entry['Bedeutung (Deutsch)'] && entry['Bedeutung (Deutsch)'].toLowerCase().includes(searchTerm)) ||
                (entry['Originalwort'] && entry['Originalwort'].toLowerCase().includes(searchTerm));
            
            // Filtreler
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
            noResultsElement.style.display = 'block';
            resultCountElement.textContent = '0 Einträge';
        } else {
            noResultsElement.style.display = 'none';
            resultCountElement.textContent = `${entries.length} Einträge`;
            
            entries.forEach(entry => {
                const entryElement = createEntryElement(entry);
                entriesContainer.appendChild(entryElement);
            });
        }
    }
    
    function createEntryElement(entry) {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'entry-item';
        
        // Başlık ve meta bilgiler
        const headerDiv = document.createElement('div');
        headerDiv.className = 'entry-header';
        
        const titleElement = document.createElement('h3');
        titleElement.className = 'entry-title';
        titleElement.innerHTML = `<span class="arabic-word">${entry['Arabisches Wort'] || 'Unbekannt'}</span>`;
        
        const metaDiv = document.createElement('div');
        metaDiv.className = 'entry-meta';
        
        if (entry['Herkunftssprache']) {
            const originMeta = document.createElement('span');
            originMeta.className = 'meta-item';
            originMeta.textContent = `Herkunft: ${entry['Herkunftssprache']}`;
            metaDiv.appendChild(originMeta);
        }
        
        if (entry['linguistische Kategorie']) {
            entry['linguistische Kategorie'].split(',').forEach(cat => {
                const lingMeta = document.createElement('span');
                lingMeta.className = 'meta-item';
                lingMeta.textContent = cat.trim();
                metaDiv.appendChild(lingMeta);
            });
        }
        
        if (entry['Thematische Kategorie']) {
            entry['Thematische Kategorie'].split(',').forEach(cat => {
                const themeMeta = document.createElement('span');
                themeMeta.className = 'meta-item';
                themeMeta.textContent = cat.trim();
                metaDiv.appendChild(themeMeta);
            });
        }
        
        headerDiv.appendChild(titleElement);
        entryDiv.appendChild(headerDiv);
        entryDiv.appendChild(metaDiv);
        
        // İçerik
        const contentDiv = document.createElement('div');
        contentDiv.className = 'entry-content';
        contentDiv.innerHTML = entry.processedContent || 'Keine weiteren Informationen verfügbar';
        entryDiv.appendChild(contentDiv);
        
        return entryDiv;
    }
    
    function resetFilters() {
        searchInput.value = '';
        originFilter.value = '';
        lingFilter.value = '';
        themeFilter.value = '';
        filterEntries();
    }
});
