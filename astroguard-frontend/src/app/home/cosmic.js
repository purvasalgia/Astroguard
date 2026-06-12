// Initialize Icons
lucide.createIcons();

/* ==========================================
    LEAFLET.JS - DEEP SPACE MAP IMPLEMENTATION
    ========================================== */
const map = L.map('skyMap', {
    zoomControl: false,
    crs: L.CRS.Simple,
    minZoom: -1,
    maxZoom: 2,
    zoomSnap: 0.1
});

// Deep Space Image Dimensions
const w = 1920, h = 1080;
const url = 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2000&auto=format&fit=crop';

// Calculate edges
const southWest = map.unproject([0, h], map.getMaxZoom() - 1);
const northEast = map.unproject([w, 0], map.getMaxZoom() - 1);
const bounds = new L.LatLngBounds(southWest, northEast);

// Add Image Overlay
L.imageOverlay(url, bounds).addTo(map);
map.fitBounds(bounds);
map.setZoom(0);

// Helper to draw detection boxes
function addTargetBox(latlng1, latlng2, color, isDashed = true) {
    const rectBounds = [latlng1, latlng2];
    L.rectangle(rectBounds, {
        color: color,
        weight: 1.5,
        fillColor: color,
        fillOpacity: 0.05,
        dashArray: isDashed ? '4 4' : '',
        className: 'target-box'
    }).addTo(map);

    // Add center target marker
    const centerLat = (latlng1[0] + latlng2[0]) / 2;
    const centerLng = (latlng1[1] + latlng2[1]) / 2;
    
    L.circleMarker([centerLat, centerLng], {
        radius: 4,
        color: color,
        fillColor: '#000',
        fillOpacity: 1,
        weight: 2
    }).addTo(map);
}

// Add dummy target regions mapped roughly to the UI
addTargetBox([-20, 30], [-40, 50], '#59e9ff', true);   // Cyan Box
addTargetBox([-60, 90], [-70, 105], '#59e9ff', true);  // Cyan Box 2
addTargetBox([-30, 80], [-40, 90], '#ffd84a', true);   // Yellow Box
addTargetBox([-15, 110], [-25, 120], '#ffd84a', false);// Yellow Box 2


/* ==========================================
    CHART.JS - LIGHT CURVE GRAPH
    ========================================== */

// Custom Plugin to draw vertical error bars
const errorBarPlugin = {
    id: 'errorBars',
    afterDatasetsDraw: (chart) => {
        const { ctx } = chart;
        chart.data.datasets.forEach((dataset, i) => {
            const meta = chart.getDatasetMeta(i);
            meta.data.forEach((element, index) => {
                const val = dataset.data[index];
                if (val !== null && val !== undefined) {
                    ctx.beginPath();
                    ctx.strokeStyle = dataset.borderColor;
                    ctx.lineWidth = 1.5;
                    // Draw vertical line
                    ctx.moveTo(element.x, element.y - 12);
                    ctx.lineTo(element.x, element.y + 12);
                    ctx.stroke();
                    
                    // Draw top cap
                    ctx.beginPath();
                    ctx.moveTo(element.x - 3, element.y - 12);
                    ctx.lineTo(element.x + 3, element.y - 12);
                    ctx.stroke();

                    // Draw bottom cap
                    ctx.beginPath();
                    ctx.moveTo(element.x - 3, element.y + 12);
                    ctx.lineTo(element.x + 3, element.y + 12);
                    ctx.stroke();
                }
            });
        });
    }
};

const ctx = document.getElementById('lightCurveChart').getContext('2d');

// Generate realistic rising/falling curve data
const labels = Array.from({length: 28}, (_, i) => i);

// Cyan curve (Rise to peak)
const cyanData = [18, 20, 21, 23, 26, 29, 31, 35, 42, 55, 75, 95, 120, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null];

// Yellow curve (Slow decline with error bars)
const yellowData = [null, null, null, null, null, null, null, null, null, null, null, null, 120, 100, 85, 70, 58, 48, 45, 42, 38, 35, 30, 27, 24, 21, 19, 18];

new Chart(ctx, {
    type: 'line',
    plugins: [errorBarPlugin],
    data: {
        labels: labels,
        datasets: [
            {
                label: 'Cyan Rise',
                data: cyanData,
                borderColor: '#59e9ff',
                backgroundColor: '#59e9ff',
                borderWidth: 2,
                tension: 0.3, // Smooth curve
                pointRadius: 2,
                pointBackgroundColor: '#59e9ff'
            },
            {
                label: 'Yellow Decline',
                data: yellowData,
                borderColor: '#ffd84a',
                backgroundColor: '#ffd84a',
                borderWidth: 2,
                borderDash: [5, 5], // Dashed effect between points
                tension: 0.3, // Smooth curve
                pointRadius: 0 // Points handled by error bar plugin
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 20, right: 20 } },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(8, 22, 29, 0.9)',
                titleColor: '#59e9ff',
                bodyColor: '#e0f2f1',
                borderColor: 'rgba(89, 233, 255, 0.3)',
                borderWidth: 1
            }
        },
        scales: {
            x: {
                title: { display: true, text: 'Time', color: '#8a9ca8', font: { family: 'Inter', size: 12 } },
                grid: { color: 'rgba(80, 255, 180, 0.05)', drawBorder: false },
                ticks: { display: false } // Hide numbers to match image
            },
            y: {
                title: { display: true, text: 'Light cone', color: '#8a9ca8', font: { family: 'Inter', size: 12 } },
                grid: { color: 'rgba(80, 255, 180, 0.05)', drawBorder: false },
                ticks: { display: false }, // Hide numbers to match image
                min: 0,
                max: 140
            }
        }
    }
});