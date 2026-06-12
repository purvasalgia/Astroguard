document.addEventListener("DOMContentLoaded", () => {
    // Initializing Lucide Vector Vector Icons
    lucide.createIcons();

    // --- MAP ENGINE ARCHITECTURE (LEAFLET) ---
    const initialCoords = [20.0, 0.0]; 
    const map = L.map('map', {
        center: initialCoords,
        zoom: 2,
        zoomControl: false, // Standard overrides handled inside custom HUD components
        attributionControl: false
    });

    // Layer Registries
    const mapLayers = {
        earth: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }),
        satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19 }),
        terrain: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { maxZoom: 17 }),
        heatmap: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', { maxZoom: 20 })
    };

    // Activate Default Vector Setup
    mapLayers.earth.addTo(map);

    // Core Layer Switch Functionality Mappings
    function switchLayer(layerKey) {
        Object.keys(mapLayers).forEach(key => map.removeLayer(mapLayers[key]));
        mapLayers[layerKey].addTo(map);

        ['earth', 'satellite', 'terrain', 'heatmap'].forEach(k => {
            const btn = document.getElementById(`btn-layer-${k}`);
            if (btn) {
                if(k === layerKey) {
                    btn.className = "px-3 py-1.5 rounded-lg text-left bg-cyan-500/20 text-[#00D4FF] border border-cyan-500/30 font-medium transition-all";
                } else {
                    btn.className = "px-3 py-1.5 rounded-lg text-left text-slate-400 hover:bg-white/5 transition-all";
                }
            }
        });
        
        pushIngestQueue(`Visualization mode updated to [${layerKey.toUpperCase()}]`);
    }

    // Attach Event Listeners to Layer Controls
    ['earth', 'satellite', 'terrain', 'heatmap'].forEach(layerKey => {
        const el = document.getElementById(`btn-layer-${layerKey}`);
        if (el) el.addEventListener('click', () => switchLayer(layerKey));
    });

    // Zoom Handling Mappings
    const zoomInBtn = document.getElementById('btn-zoom-in');
    const zoomOutBtn = document.getElementById('btn-zoom-out');

    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', () => {
            map.zoomIn();
            pushIngestQueue("Telemetry focal adjustment: Zoom In triggered", "text-cyan-400");
        });
    }
    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', () => {
            map.zoomOut();
            pushIngestQueue("Telemetry focal adjustment: Zoom Out triggered", "text-slate-400");
        });
    }

    // Spatial Telemetry Interaction Update Handlers
    function updateTelemetry() {
        const center = map.getCenter();
        const zoom = map.getZoom();
        
        document.getElementById('telemetry-lat').innerText = `${center.lat.toFixed(4)}° N`;
        document.getElementById('telemetry-lng').innerText = `${center.lng.toFixed(4)}° E`;
        document.getElementById('telemetry-zoom').innerText = zoom;

        let region = "Global Operations";
        if (zoom > 10) region = "Urban Tactical Tile";
        else if (zoom > 6) region = "State / Regional Block";
        else if (zoom > 3) region = "Subcontinental Zone";
        document.getElementById('telemetry-region').innerText = region;
    }

    map.on('move', updateTelemetry);
    map.on('zoomend', updateTelemetry);
    updateTelemetry(); 

    // Live Cursor Coordinate Trackers
    map.on('mousemove', function(e) {
        document.getElementById('cursor-coords').innerText = `${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`;
        const dynamicAlt = Math.max(160, 600 - (map.getZoom() * 32));
        document.getElementById('cursor-alt').innerText = `${dynamicAlt} km (LEO)`;
    });


    // --- INGESTION PIPELINE DATA STREAM MOCK ---
    const queueElement = document.getElementById('ingest-queue');
    const standardLogs = [
        { text: "TILE_3A ingested: Landsat-8", color: "text-emerald-400" },
        { text: "Sentinel-2 Multi-Spectral Ingestion Linked", color: "text-cyan-400" },
        { text: "Processing Mask Generation Status: Active", color: "text-amber-400" },
        { text: "NDVI Normalized composite calculated", color: "text-[#00D4FF]" },
        { text: "GeoJSON boundary layers compiled", color: "text-slate-300" },
        { text: "SAR Ground Deformation raster mapped", color: "text-purple-400" }
    ];

    function pushIngestQueue(textString = null, customColor = null) {
        if (!queueElement) return;

        const date = new Date();
        const timestamp = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
        
        let logItem = standardLogs[Math.floor(Math.random() * standardLogs.length)];
        let text = textString || logItem.text;
        let color = customColor || logItem.color;

        const row = document.createElement('div');
        row.className = `flex items-start gap-1 p-1 rounded-sm bg-white/0 hover:bg-white/5 transition-colors border-l-2 border-transparent hover:border-cyan-400 opacity-0 transform translate-y-2 transition-all duration-300`;
        row.innerHTML = `<span class="text-slate-600 shrink-0">[${timestamp}]</span> <span class="${color} flex-1 break-all">${text}</span>`;
        
        queueElement.insertBefore(row, queueElement.firstChild);
        
        setTimeout(() => {
            row.classList.remove('opacity-0', 'translate-y-2');
        }, 10);

        if(queueElement.children.length > 25) {
            queueElement.removeChild(queueElement.lastChild);
        }
    }

    // Initialize Log Stack Streams
    for(let i=0; i<6; i++) {
        setTimeout(() => { pushIngestQueue(); }, i * 250);
    }
    setInterval(() => { pushIngestQueue(); }, 3500);


    // --- CHART.JS ANALYTICS ENGINE CONFIGURATION ---
    const chartCanvas = document.getElementById('analyticsChart');
    if (chartCanvas) {
        const ctx = chartCanvas.getContext('2d');
        
        const cyanGrad = ctx.createLinearGradient(0, 0, 0, 150);
        cyanGrad.addColorStop(0, 'rgba(0, 212, 255, 0.4)');
        cyanGrad.addColorStop(1, 'rgba(0, 212, 255, 0.0)');

        const greenGrad = ctx.createLinearGradient(0, 0, 0, 150);
        greenGrad.addColorStop(0, 'rgba(74, 222, 128, 0.3)');
        greenGrad.addColorStop(1, 'rgba(74, 222, 128, 0.0)');

        const analyticsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['0200', '0600', '1000', '1400', '1800', '2200'],
                datasets: [
                    {
                        label: 'Veg Density (NDVI)',
                        data: [0.62, 0.65, 0.68, 0.64, 0.61, 0.63],
                        borderColor: '#4ADE80',
                        backgroundColor: greenGrad,
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0
                    },
                    {
                        label: 'Urban Infra Variant',
                        data: [0.35, 0.35, 0.37, 0.39, 0.41, 0.41],
                        borderColor: '#00D4FF',
                        backgroundColor: cyanGrad,
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#94a3b8',
                            font: { family: 'Orbitron', size: 9 },
                            boxWidth: 8,
                            usePointStyle: true
                        }
                    },
                    tooltip: { enabled: true }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255,255,255,0.03)' },
                        ticks: { color: '#64748b', font: { family: 'Orbitron', size: 9 } }
                    },
                    y: {
                        grid: { color: 'rgba(255,255,255,0.03)' },
                        ticks: { color: '#64748b', font: { family: 'Orbitron', size: 9 } }
                    }
                }
            }
        });

        // Live Real-Time Micro Adjustments
        setInterval(() => {
            analyticsChart.data.datasets.forEach((dataset) => {
                const lastIdx = dataset.data.length - 1;
                let variation = (Math.random() - 0.5) * 0.04;
                dataset.data[lastIdx] = Math.max(0.1, Math.min(0.9, dataset.data[lastIdx] + variation));
            });
            analyticsChart.update('none');
        }, 2000);
    }
});