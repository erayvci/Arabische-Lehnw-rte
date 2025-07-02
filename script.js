document.addEventListener('DOMContentLoaded', function() {
    // SheetBest API endpoint (SheetBest entegrasyonu yaptıktan sonra burayı güncelleyin)
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
        try { https://api.sheetbest.com/sheets/e21cc39a-5fe1-4d31-8702-dbc1f89b285a }  
            // Gerçek SheetBest API URL'si ile değiştirin
            const response = await fetch(sheetBestUrl);
            const data = await response.json();
            
            allEntries = data.map(entry => ({
                ...entry,
                // Arapça kelimeleri işaretlemek için özel bir işlem
                processedContent: processArabicWords(entry['Inhalt'] || '')
            }));
            
            // Benzersiz kategorileri topla
            collectUniqueCategories();
            
            // Filtre seçeneklerini doldur
            populateFilterOptions();
            
            // Tüm girişleri göster
            filteredEntries = [...allEntries];
            displayEntries(filteredEntries);
            
            loadingElement.classList.add('d-none');
        } catch (error) {
            console.error('Veri yüklenirken hata oluştu:', error);
            loadingElement.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Veriler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.
                </div>
            `;
        }
    }
    
    function processArabicWords(content) {
        // Bu regex Arapça karakterleri tespit eder (Unicode Arapça aralığı)
        const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+/g;
        
        // Arapça kelimeleri span ile sar ve özel class ekle
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
            // Arama terimi kontrolü
            const matchesSearch = 
                !searchTerm || 
                (entry['Stichwort'] && entry['Stichwort'].toLowerCase().includes(searchTerm)) || 
                (entry['Inhalt'] && entry['Inhalt'].toLowerCase().includes(searchTerm));
            
            // Herkunftssprache kontrolü
            const matchesOrigin = 
                !selectedOrigin || 
                (entry['Herkunftssprache'] && entry['Herkunftssprache'] === selectedOrigin);
            
            // Linguistische Kategorie kontrolü
            const matchesLingCat = 
                !selectedLingCat || 
                (entry['linguistische Kategorie'] && 
                 entry['linguistische Kategorie'].split(',').map(cat => cat.trim()).includes(selectedLingCat));
            
            // Thematische Kategorie kontrolü
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
            resultCountElement.textContent = '0 sonuç';
        } else {
            noResultsElement.classList.add('d-none');
            resultCountElement.textContent = `${entries.length} sonuç`;
            
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
        cardHeader.innerHTML = `<h5>${entry['Stichwort'] || 'Başlıksız'}</h5>`;
        
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';
        
        // Kategori badge'leri
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
        
        // İçerik
        const contentDiv = document.createElement('div');
        contentDiv.className = 'entry-content';
        contentDiv.innerHTML = entry.processedContent || 'İçerik yok';
        
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
