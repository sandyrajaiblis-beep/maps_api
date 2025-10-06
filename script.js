// Inisialisasi peta
const jakarta = [-6.2088, 106.8456];
const map = L.map('map').setView(jakarta, 11);

// Tambahkan tile layer (peta dasar)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Array untuk menyimpan marker
const markers = [];

// Marker untuk lokasi awal (Jakarta)
const jakartaMarker = L.marker(jakarta).addTo(map);
jakartaMarker.bindPopup('Jakarta, Indonesia').openPopup();
markers.push(jakartaMarker);

// Update informasi lokasi
updateLocationInfo(jakarta, 'Jakarta, Indonesia');

// Event listener untuk klik pada peta
map.on('click', function(e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;
    
    // Update koordinat
    document.getElementById('coordinates').textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    
    // Reverse geocoding untuk mendapatkan alamat
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(response => response.json())
        .then(data => {
            if (data && data.display_name) {
                document.getElementById('address').textContent = data.display_name;
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
});

// Event listener untuk zoom
map.on('zoomend', function() {
    document.getElementById('zoomLevel').textContent = map.getZoom();
});

// Fungsi untuk mencari lokasi
function searchLocation() {
    const address = document.getElementById('searchInput').value;
    
    if (!address) {
        alert('Masukkan lokasi yang ingin dicari');
        return;
    }
    
    // Menggunakan Nominatim API untuk geocoding
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const result = data[0];
                const lat = parseFloat(result.lat);
                const lng = parseFloat(result.lon);
                
                // Pindahkan peta ke lokasi
                map.setView([lat, lng], 15);
                
                // Update nama lokasi
                document.getElementById('locationName').textContent = result.display_name.split(',')[0];
                
                // Tambahkan marker di lokasi hasil pencarian
                const marker = L.marker([lat, lng]).addTo(map);
                marker.bindPopup(result.display_name).openPopup();
                
                markers.push(marker);
                
                // Update informasi lokasi
                updateLocationInfo([lat, lng], result.display_name);
            } else {
                alert('Lokasi tidak ditemukan');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Terjadi kesalahan saat mencari lokasi');
        });
}

// Fungsi untuk menambah marker di tengah peta
function addMarker() {
    const center = map.getCenter();
    const title = prompt('Masukkan nama untuk marker ini:');
    
    if (!title) return;
    
    const marker = L.marker([center.lat, center.lng]).addTo(map);
    marker.bindPopup(title);
    
    markers.push(marker);
}

// Fungsi untuk menghapus semua marker
function clearMarkers() {
    if (markers.length === 0) {
        alert('Tidak ada marker untuk dihapus');
        return;
    }
    
    if (confirm('Apakah Anda yakin ingin menghapus semua marker?')) {
        markers.forEach(marker => {
            map.removeLayer(marker);
        });
        markers.length = 0;
    }
}

// Fungsi untuk mendapatkan lokasi pengguna
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                // Pindahkan peta ke lokasi pengguna
                map.setView([lat, lng], 15);
                
                // Tambahkan marker di lokasi pengguna
                const marker = L.marker([lat, lng]).addTo(map);
                marker.bindPopup('Lokasi Anda Saat Ini').openPopup();
                
                markers.push(marker);
                
                // Update informasi lokasi
                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data && data.display_name) {
                            document.getElementById('locationName').textContent = 'Lokasi Anda';
                            updateLocationInfo([lat, lng], data.display_name);
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        document.getElementById('locationName').textContent = 'Lokasi Anda';
                        updateLocationInfo([lat, lng], `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
                    });
            },
            error => {
                alert('Tidak dapat mendapatkan lokasi Anda: ' + error.message);
            }
        );
    } else {
        alert('Browser Anda tidak mendukung geolocation');
    }
}

// Fungsi untuk memperbarui informasi lokasi
function updateLocationInfo(coords, address) {
    document.getElementById('coordinates').textContent = `${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`;
    document.getElementById('address').textContent = address;
    document.getElementById('zoomLevel').textContent = map.getZoom();
}

// Event listener untuk tombol
document.getElementById('searchButton').addEventListener('click', searchLocation);
document.getElementById('addMarkerButton').addEventListener('click', addMarker);
document.getElementById('clearMarkersButton').addEventListener('click', clearMarkers);
document.getElementById('currentLocationButton').addEventListener('click', getCurrentLocation);

// Event listener untuk Enter di input pencarian
document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === '') {
        searchLocation();
    }
});
