// Sheetbest API URL’sini buraya yapıştır (DEINE_API_ID kısmını kendi API ID’nle değiştir)
const apiUrl = 'https://api.sheetbest.com/sheets/e21cc39a-5fe1-4d31-8702-dbc1f89b285a';

// Verileri çek ve sayfayı başlat
fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
        populateFilters(data);
        displayData(data);
    })
    .catch(error => console.error('Fehler beim Abrufen der Daten:', error));

// Filtre menülerini doldur
function populateFilters(data) {
    const thematischeFilter = document.getElementById('thematischeFilter');
    const linguistischeFilter = document.getElementById('linguistischeFilter');
    const herkunftspracheFilter = document.getElementById('herkunftspracheFilter');

    const thematischeValues = [...new Set(data.map(item => item.Thematische))];
    const linguistischeValues = [...new Set(data.map(item => item.Linguistische))];
    const herkunftspracheValues = [...new Set(data.map(item => item.Herkunftsprache))];

    thematischeValues.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        thematischeFilter.appendChild(option);
    });

    linguistischeValues.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        linguistischeFilter.appendChild(option);
    });

    herkunftspracheValues.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        herkunftspracheFilter.appendChild(option);
    });

    // Filtreleme olaylarını ekle
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
        return (!thematischeFilter || item.Thematische === thematischeFilter) &&
               (!linguistischeFilter || item.Linguistische === linguistischeFilter) &&
               (!herkunftspracheFilter || item.Herkunftsprache === herkunftspracheFilter);
    });

    displayData(filteredData);
}

// Verileri kartlar halinde göster
function displayData(data) {
    const container = document.getElementById('dataContainer');
    container.innerHTML = '';

    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h2>${item.Entry}</h2>
            <p><strong>Thematische:</strong> ${item.Thematische}</p>
            <p><strong>Linguistische:</strong> ${item.Linguistische}</p>
            <p><strong>Herkunftsprache:</strong> ${item.Herkunftsprache}</p>
        `;
        container.appendChild(card);
    });
}
