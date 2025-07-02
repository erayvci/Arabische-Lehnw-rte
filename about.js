// Modal ve buton elemanlarını seç
const aboutButton = document.getElementById('aboutButton');
const aboutModal = document.getElementById('aboutModal');
const closeModal = document.getElementById('closeModal');

// Butona tıklayınca modalı göster
aboutButton.addEventListener('click', () => {
    aboutModal.style.display = 'flex';
});

// Kapat butonuna tıklayınca modalı gizle
closeModal.addEventListener('click', () => {
    aboutModal.style.display = 'none';
});

// Modalın dışına tıklayınca kapanmasını sağla
window.addEventListener('click', (event) => {
    if (event.target === aboutModal) {
        aboutModal.style.display = 'none';
    }
});
