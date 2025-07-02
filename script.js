
// Sheetbest API URL’sini buraya yapıştır (DEINE_API_ID kısmını kendi API ID’nle değiştir)
const apiUrl = 'https://api.sheetbest.com/sheets/e21cc39a-5fe1-4d31-8702-dbc1f89b285a';

// Dil ve koordinat eşleştirmesi
const languageCoordinates = {
    "Griechisch": [37.9838, 23.7275], // Atina, Yunanistan
    "Latein": [41.9028, 12.4964], // Roma, İtalya
    "Altäthiopischa": [9.0320, 38.7578], // Addis Ababa, Etiyopya
    "Persisch": [35.6892, 51.3890], // Tahran, İran
    "Spanisch": [40.4168, -3.7038], // Madrid, İspanya
    "Italienisch": [43.7696, 11.2558], // Floransa, İtalya
    "Sanskrit": [25.3176, 82.9739], // Varanasi, Hindistan
    "Tamil": [13.0827, 80.2707], // Chennai, Hindistan
    "Französisch": [48.8566, 2.3522], // Paris, Fransa
    "Englische": [51.505, -0.09], // Londra, İngiltere
    "Hindi": [28.7041, 77.1025], // Delhi, Hindistan
    "Syrisch": [33.5138, 36.2765], // Şam, Suriye
    "Aramäisch": [36.3418, 43.1300], // Musul, Irak
    "Türkisch": [41.0082, 28.9784] // İstanbul, Türkiye
};

// Verileri çek ve sayfayı başlat
fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
        populateFilters(data);
        displayData(data);
        initializeMap(data);
    })
    .catch(error => console.error('Fehler beim Abrufen der Daten:', error));

// Haritayı başlat
function initializeMap(data) {
    const map = L.map('map').setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    data.forEach(item => {
        const language = item.Herkunftssprache;
        if (language && language !== "Hebrew" && languageCoordinates[language]) {
            const [lat, lng] = languageCoordinates[language];
            const marker = L.marker([lat, lng]).addTo(map);
            marker.bindPopup(`
                <b>${item['Arabisches Wort'] || 'N/A'}</b><br>
                Bedeutung: ${item['Bedeutung (Deutsch)'] || 'N/A'}<br>
                Transkription: ${item.Transkription || 'N/A'}<br>
                Herkunftssprache: ${item.Herkunftssprache || 'N/A'}
            `);
        }
    });
}

// Filtre menülerini doldur
function populateFilters(data) {
    const thematischeFilter = document.getElementById('thematischeFilter');
    const linguistischeFilter = document.getElementById('linguistischeFilter');
    const herkunftspracheFilter = document.getElementById('herkunftspracheFilter');

    const thematischeValues = [...new Set(data.map(item => item['Thematische Kategorie']))];
    const linguistischeValues = [...new Set(data.map(item => item['linguistische Kategorie']))];
    const herkunftspracheValues = [...new Set(data.map(item => item.Herkunftssprache))];

    thematischeValues.forEach(value => {
        if (value) {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            thematischeFilter.appendChild(option);
        }
    });

    linguistischeValues.forEach(value => {
        if (value) {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            linguistischeFilter.appendChild(option);
        }
    });

    herkunftspracheValues.forEach(value => {
        if (value) {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            herkunftspracheFilter.appendChild(option);
        }
    });

    thematischeFilter.addEventListener('change', () => filterData(data));
    linguistischeFilter.addEventListener('change', () => filterData(data));
    herkunftspracheFilter.addEventListener('change', () => filterData(data));
}

// Verileri filtrele ve göster
function filterData(data) {
    const thematischeFilter = document.getElementById('thematischeFilter').value;
    const linguistischeFilter = document.getElementById('linguistischeFilter').value;
    const herkunftspracheFilter = document.getElementById('herkunftspracheFilter').value;

    const filteredData = data.filter(item => {
        return (!thematischeFilter || item['Thematische Kategorie'] === thematischeFilter) &&
               (!linguistischeFilter || item['linguistische Kategorie'] === linguistischeFilter) &&
               (!herkunftspracheFilter || item.Herkunftssprache === herkunftspracheFilter);
    });

    displayData(filteredData);
    updateMap(filteredData);
}

// Verileri kartlar halinde göster
function displayData(data) {
    const container = document.getElementById('dataContainer');
    container.innerHTML = '';

    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h2>${item['Arabisches Wort'] || 'N/A'}</h2>
            <p><strong>Transkription:</strong> ${item.Transkription || 'N/A'}</p>
            <p><strong>IPA:</strong> ${item.IPA || 'N/A'}</p>
            <p><strong>Bedeutung (Deutsch):</strong> ${item['Bedeutung (Deutsch)'] || 'N/A'}</p>
            <p><strong>Herkunftssprache:</strong> ${item.Herkunftssprache || 'N/A'}</p>
            <p><strong>Originalwort:</strong> ${item.Originalwort || 'N/A'}</p>
            <p><strong>Übernahmepfad:</strong> ${item.Übernahmepfad || 'N/A'}</p>
            <p><strong>Historischer Kontext:</strong> ${item['Historischer Kontext'] || 'N/A'}</p>
            <p><strong>Linguistische Kategorie:</strong> ${item['linguistische Kategorie'] || 'N/A'}</p>
            <p><strong>Thematische Kategorie:</strong> ${item['Thematische Kategorie'] || 'N/A'}</p>
        `;
        container.appendChild(card);
    });
}

// Haritayı filtreye göre güncelle
function updateMap(data) {
    const map = L.map('map').setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    data.forEach(item => {
        const language = item.Herkunftssprache;
        if (language && language !== "Hebrew" && languageCoordinates[language]) {
            const [lat, lng] = languageCoordinates[language];
            const marker = L.marker([lat, lng]).addTo(map);
            marker.bindPopup(`
                <b>${item['Arabisches Wort'] || 'N/A'}</b><br>
                Bedeutung: ${item['Bedeutung (Deutsch)'] || 'N/A'}<br>
                Transkription: ${item.Transkription || 'N/A'}<br>
                Herkunftssprache: ${item.Herkunftssprache || 'N/A'}
            `);
        }
    });
}
