document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. TOAST NOTIFICATION SYSTEM ---
    const toastContainer = document.getElementById('toast-container');
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerText = `[SYSTEM]: ${message}`;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }

    // --- 2. BACKEND ACTION HANDLER ---
    function handleAction(actionId) {
        console.log(`Action triggered: ${actionId}`);
        
        // Map specific overrides (letting backend know, but handling UI locally)
        if (actionId === 'map_zoom_in') {
            map.zoomIn();
            showToast('Zooming In...');
            return;
        }
        if (actionId === 'map_zoom_out') {
            map.zoomOut();
            showToast('Zooming Out...');
            return;
        }

        showToast(`Executing command: ${actionId.replace(/_/g, ' ')}...`);

        // BACKEND DEV: ADD YOUR API CALLS HERE
        switch(actionId) {
            case 'global_alert': /* triggerAlert() */ break;
            case 'force_dispatch': /* sendDispatch() */ break;
        }
    }

    // Bind click events to all buttons
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const actionId = e.currentTarget.getAttribute('data-action');
            if(actionId) handleAction(actionId);
        });
    });


    // --- 3. LEAFLET MAP INITIALIZATION ---
    // Coordinates for Chennai, India
    const chennaiCoords = [13.0827, 80.2707];
    
    // Initialize map with zoom controls hidden (we use custom ones)
    const map = L.map('real-map', {
        center: chennaiCoords,
        zoom: 8,
        zoomControl: false,
        attributionControl: false
    });

    // Add Esri Satellite Imagery
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 17
    }).addTo(map);

    // Add the red Danger Zone Polygon (Approximate area around Chennai matching the image)
    const dangerZone = [
        [14.2, 79.8],
        [14.0, 80.4],
        [12.8, 80.3],
        [12.2, 79.7],
        [13.0, 79.2]
    ];
    
    L.polygon(dangerZone, {
        color: '#ff3333',
        fillColor: '#cc0000',
        fillOpacity: 0.35,
        weight: 2
    }).addTo(map);

    // Create Custom "X" Marker
    const xIcon = L.divIcon({
        className: 'custom-x-marker',
        html: 'X',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });

    const marker = L.marker([13.1, 80.0], {icon: xIcon}).addTo(map);

    // Add the Custom Tooltip Popup
    const tooltipHTML = `
        <div class="custom-tooltip-content">
            <div class="custom-tooltip-title">[CRITICAL] FLOOD RISK</div>
            <div>CONFIRMED: CHENNAI ZONE B</div>
        </div>
    `;
    
    marker.bindPopup(tooltipHTML, {
        closeButton: false,
        autoClose: false,
        closeOnClick: false,
        offset: [0, -5]
    }).openPopup();

    // Update Custom Zoom Slider visual based on map zoom
    const zoomThumb = document.getElementById('custom-zoom-thumb');
    map.on('zoomend', function() {
        const maxZoom = map.getMaxZoom();
        const minZoom = map.getMinZoom();
        const currentZoom = map.getZoom();
        
        // Calculate percentage (inverted because slider goes top to bottom)
        const percentage = 100 - (((currentZoom - minZoom) / (maxZoom - minZoom)) * 100);
        
        // Keep thumb within bounds
        const boundedPercentage = Math.max(0, Math.min(90, percentage));
        zoomThumb.style.top = `${boundedPercentage}%`;
    });

});
