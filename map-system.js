// Interactive Map System for Community Hub
class MapSystem {
  constructor() {
    this.map = null;
    this.markers = [];
    this.markerClusters = null;
    this.currentLocation = null;
    this.settings = this.loadSettings();
    this.initialized = false;
    
    // Map configuration
    this.config = {
      defaultZoom: 13,
      maxZoom: 18,
      minZoom: 8,
      clusterDistance: 50,
      defaultCenter: [40.7128, -74.0060], // NYC default
      tileLayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    };
    
    // Issue icons
    this.icons = {
      waste: '🗑️',
      infrastructure: '🚧',
      environment: '🌱',
      pollution: '💨',
      other: '📝',
      resolved: '✅'
    };
    
    this.colors = {
      waste: '#f59e0b',
      infrastructure: '#3b82f6',
      environment: '#10b981',
      pollution: '#ef4444',
      other: '#6b7280',
      resolved: '#22c55e'
    };
  }
  
  async init(containerId) {
    if (this.initialized) return;
    
    try {
      await this.loadLeafletLibrary();
      await this.loadMarkerClusterLibrary();
      
      this.createMap(containerId);
      this.setupControls();
      this.loadProblems();
      this.getUserLocation();
      
      this.initialized = true;
      console.log('🗺️ Map System initialized');
      
      // Show notification
      if (window.notifications) {
        window.notifications.success('Interactive map loaded successfully!');
      }
    } catch (error) {
      console.error('Failed to initialize map:', error);
      if (window.notifications) {
        window.notifications.error('Failed to load map. Please refresh the page.');
      }
    }
  }
  
  async loadLeafletLibrary() {
    return new Promise((resolve, reject) => {
      if (window.L) {
        resolve();
        return;
      }
      
      // Load CSS
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(css);
      
      // Load JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Leaflet'));
      document.head.appendChild(script);
    });
  }
  
  async loadMarkerClusterLibrary() {
    return new Promise((resolve, reject) => {
      if (window.L && L.markerClusterGroup) {
        resolve();
        return;
      }
      
      // Load CSS
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.css';
      document.head.appendChild(css);
      
      const defaultCss = document.createElement('link');
      defaultCss.rel = 'stylesheet';
      defaultCss.href = 'https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.Default.css';
      document.head.appendChild(defaultCss);
      
      // Load JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet.markercluster@1.4.1/dist/leaflet.markercluster.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load MarkerCluster'));
      document.head.appendChild(script);
    });
  }
  
  createMap(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Map container '${containerId}' not found`);
    }
    
    // Create map
    this.map = L.map(containerId, {
      center: this.settings.center || this.config.defaultCenter,
      zoom: this.settings.zoom || this.config.defaultZoom,
      zoomControl: false
    });
    
    // Add tile layer
    L.tileLayer(this.config.tileLayer, {
      attribution: this.config.attribution,
      maxZoom: this.config.maxZoom,
      minZoom: this.config.minZoom
    }).addTo(this.map);
    
    // Create marker cluster group
    this.markerClusters = L.markerClusterGroup({
      maxClusterRadius: this.config.clusterDistance,
      iconCreateFunction: (cluster) => this.createClusterIcon(cluster)
    });
    
    this.map.addLayer(this.markerClusters);
    
    // Save map state on move/zoom
    this.map.on('moveend zoomend', () => {
      this.saveMapState();
    });
    
    // Add click handler for new issues
    this.map.on('click', (e) => {
      if (this.settings.clickToReport) {
        this.showReportDialog(e.latlng);
      }
    });
  }
  
  setupControls() {
    // Custom zoom control
    L.control.zoom({
      position: 'topright'
    }).addTo(this.map);
    
    // Layer control for filters
    this.createLayerControl();
    
    // Custom controls
    this.createCustomControls();
    
    // Legend
    this.createLegend();
  }
  
  createLayerControl() {
    // Create layer groups for each category
    this.layerGroups = {};
    Object.keys(this.icons).forEach(category => {
      this.layerGroups[category] = L.layerGroup();
    });
    
    // Add resolved issues layer
    this.layerGroups.resolved = L.layerGroup();
    
    const overlays = {
      '🗑️ Waste Management': this.layerGroups.waste,
      '🚧 Infrastructure': this.layerGroups.infrastructure,
      '🌱 Environmental': this.layerGroups.environment,
      '💨 Pollution': this.layerGroups.pollution,
      '📝 Other Issues': this.layerGroups.other,
      '✅ Resolved Issues': this.layerGroups.resolved
    };
    
    this.layerControl = L.control.layers(null, overlays, {
      position: 'topleft',
      collapsed: false
    }).addTo(this.map);
    
    // Initially show all layers
    Object.values(this.layerGroups).forEach(group => {
      this.map.addLayer(group);
    });
  }
  
  createCustomControls() {
    // Locate user button
    const locateControl = L.control({ position: 'topright' });
    locateControl.onAdd = () => {
      const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
      container.innerHTML = `
        <a href="#" title="Find my location" class="locate-btn">
          <span style="font-size: 16px;">📍</span>
        </a>
      `;
      container.onclick = (e) => {
        e.preventDefault();
        this.locateUser();
      };
      return container;
    };
    locateControl.addTo(this.map);
    
    // Fullscreen toggle
    const fullscreenControl = L.control({ position: 'topright' });
    fullscreenControl.onAdd = () => {
      const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
      container.innerHTML = `
        <a href="#" title="Toggle fullscreen" class="fullscreen-btn">
          <span style="font-size: 16px;">🔳</span>
        </a>
      `;
      container.onclick = (e) => {
        e.preventDefault();
        this.toggleFullscreen();
      };
      return container;
    };
    fullscreenControl.addTo(this.map);
    
    // Settings button
    const settingsControl = L.control({ position: 'topright' });
    settingsControl.onAdd = () => {
      const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
      container.innerHTML = `
        <a href="#" title="Map settings" class="settings-btn">
          <span style="font-size: 16px;">⚙️</span>
        </a>
      `;
      container.onclick = (e) => {
        e.preventDefault();
        this.showSettingsDialog();
      };
      return container;
    };
    settingsControl.addTo(this.map);
  }
  
  createLegend() {
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'map-legend');
      div.innerHTML = `
        <h4>🗺️ Issue Types</h4>
        ${Object.entries(this.icons).map(([category, icon]) => 
          `<div class="legend-item">
            <span class="legend-icon" style="color: ${this.colors[category]}">${icon}</span>
            <span class="legend-label">${this.getCategoryName(category)}</span>
          </div>`
        ).join('')}
      `;
      return div;
    };
    legend.addTo(this.map);
  }
  
  getCategoryName(category) {
    const names = {
      waste: 'Waste Management',
      infrastructure: 'Infrastructure',
      environment: 'Environmental',
      pollution: 'Pollution',
      other: 'Other Issues',
      resolved: 'Resolved'
    };
    return names[category] || category;
  }
  
  loadProblems() {
    try {
      const problems = JSON.parse(localStorage.getItem('problems')) || [];
      this.clearMarkers();
      
      problems.forEach(problem => {
        if (problem.location && problem.location.latitude && problem.location.longitude) {
          this.addProblemMarker(problem);
        }
      });
      
      console.log(`📍 Loaded ${problems.length} problems on map`);
    } catch (error) {
      console.error('Failed to load problems on map:', error);
    }
  }
  
  addProblemMarker(problem) {
    const { latitude, longitude } = problem.location;
    const category = problem.status === 'Resolved' ? 'resolved' : problem.category;
    const icon = this.createCustomIcon(category, problem.priority);
    
    const marker = L.marker([latitude, longitude], { icon })
      .bindPopup(this.createPopupContent(problem), {
        maxWidth: 300,
        className: 'custom-popup'
      });
    
    // Add to appropriate layer group
    if (this.layerGroups[category]) {
      this.layerGroups[category].addLayer(marker);
    }
    
    this.markers.push(marker);
  }
  
  createCustomIcon(category, priority = 'medium') {
    const color = this.colors[category];
    const icon = this.icons[category];
    const size = priority === 'high' ? 40 : priority === 'medium' ? 35 : 30;
    
    return L.divIcon({
      html: `
        <div class="custom-marker" style="
          background: ${color};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${size * 0.4}px;
          color: white;
          font-weight: bold;
        ">${icon}</div>
      `,
      className: 'custom-marker-container',
      iconSize: [size, size],
      iconAnchor: [size/2, size/2],
      popupAnchor: [0, -size/2]
    });
  }
  
  createClusterIcon(cluster) {
    const count = cluster.getChildCount();
    let className = 'marker-cluster-small';
    
    if (count >= 10) className = 'marker-cluster-large';
    else if (count >= 5) className = 'marker-cluster-medium';
    
    return new L.DivIcon({
      html: `<div><span>${count}</span></div>`,
      className: `marker-cluster ${className}`,
      iconSize: new L.Point(40, 40)
    });
  }
  
  createPopupContent(problem) {
    const images = problem.images && problem.images.length > 0 ? 
      `<div class="popup-images">
        ${problem.images.slice(0, 3).map(img => 
          `<img src="${img.data}" alt="Problem image" style="width: 80px; height: 60px; object-fit: cover; margin: 2px; border-radius: 4px; cursor: pointer;" onclick="window.viewImage('${img.data}')">`
        ).join('')}
        ${problem.images.length > 3 ? `<span class="more-images">+${problem.images.length - 3} more</span>` : ''}
      </div>` : '';
    
    const statusBadge = problem.status === 'Resolved' ? 
      '<span class="status-badge resolved">✅ Resolved</span>' :
      '<span class="status-badge pending">⏳ Pending</span>';
    
    const priorityBadge = `<span class="priority-badge priority-${problem.priority}">${problem.priority.toUpperCase()}</span>`;
    
    return `
      <div class="problem-popup">
        <div class="popup-header">
          <h3>${this.icons[problem.category]} ${this.getCategoryName(problem.category)}</h3>
          <div class="popup-badges">
            ${statusBadge}
            ${priorityBadge}
          </div>
        </div>
        ${images}
        <div class="popup-description">
          <p><strong>Description:</strong> ${problem.description}</p>
        </div>
        <div class="popup-details">
          <p><strong>📅 Submitted:</strong> ${problem.submittedOn}</p>
          ${problem.resolvedOn ? `<p><strong>✅ Resolved:</strong> ${problem.resolvedOn}</p>` : ''}
          ${problem.manualLocation ? `<p><strong>📍 Location:</strong> ${problem.manualLocation}</p>` : ''}
        </div>
        <div class="popup-actions">
          <button onclick="window.viewProblemDetails('${problem.id}')" class="btn-primary">
            👁️ View Details
          </button>
          ${problem.status !== 'Resolved' ? 
            `<button onclick="window.markAsResolved('${problem.id}')" class="btn-success">
              ✅ Mark Resolved
            </button>` : ''
          }
        </div>
      </div>
    `;
  }
  
  clearMarkers() {
    this.markers.forEach(marker => {
      Object.values(this.layerGroups).forEach(group => {
        group.removeLayer(marker);
      });
    });
    this.markers = [];
  }
  
  locateUser() {
    if (window.notifications) {
      const progress = window.notifications.showProgress('Getting your location', 0);
    }
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.currentLocation = { latitude, longitude };
          
          // Add user location marker
          this.addUserLocationMarker(latitude, longitude);
          
          // Center map on user location
          this.map.setView([latitude, longitude], 15);
          
          if (window.notifications) {
            window.notifications.success('📍 Your location found!');
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          if (window.notifications) {
            window.notifications.error('Could not get your location. Please check permissions.');
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      if (window.notifications) {
        window.notifications.error('Geolocation is not supported by your browser.');
      }
    }
  }
  
  addUserLocationMarker(lat, lng) {
    // Remove existing user marker
    if (this.userMarker) {
      this.map.removeLayer(this.userMarker);
    }
    
    this.userMarker = L.marker([lat, lng], {
      icon: L.divIcon({
        html: `
          <div style="
            background: #3b82f6;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 4px solid white;
            box-shadow: 0 0 10px rgba(59,130,246,0.5);
            animation: pulse 2s infinite;
          "></div>
        `,
        className: 'user-location-marker',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      })
    }).bindPopup('📍 Your current location').addTo(this.map);
    
    // Add pulse animation
    this.injectUserLocationStyles();
  }
  
  injectUserLocationStyles() {
    if (document.getElementById('user-location-styles')) return;
    
    const styles = `
      <style id="user-location-styles">
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(59,130,246,0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(59,130,246,0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(59,130,246,0);
          }
        }
      </style>
    `;
    document.head.insertAdjacentHTML('beforeend', styles);
  }
  
  toggleFullscreen() {
    const mapContainer = this.map.getContainer();
    
    if (mapContainer.classList.contains('fullscreen')) {
      mapContainer.classList.remove('fullscreen');
      document.body.style.overflow = '';
    } else {
      mapContainer.classList.add('fullscreen');
      document.body.style.overflow = 'hidden';
    }
    
    // Invalidate size to redraw map
    setTimeout(() => {
      this.map.invalidateSize();
    }, 100);
  }
  
  showReportDialog(latlng) {
    const modal = document.createElement('div');
    modal.className = 'map-report-modal';
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>📝 Report Issue at this Location</h3>
          <button class="modal-close">✕</button>
        </div>
        <div class="modal-body">
          <p><strong>📍 Coordinates:</strong> ${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}</p>
          <div class="form-group">
            <label>🏷️ Category:</label>
            <select id="quickCategory">
              <option value="waste">🗑️ Waste Management</option>
              <option value="infrastructure">🚧 Infrastructure</option>
              <option value="environment">🌱 Environmental</option>
              <option value="pollution">💨 Pollution</option>
              <option value="other">📝 Other</option>
            </select>
          </div>
          <div class="form-group">
            <label>⚡ Priority:</label>
            <select id="quickPriority">
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
          </div>
          <div class="form-group">
            <label>📝 Quick Description:</label>
            <textarea id="quickDescription" placeholder="Describe the issue briefly..." rows="3"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="quick-report-btn">Quick Report</button>
          <button class="full-report-btn">Full Report Form</button>
          <button class="cancel-btn">Cancel</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
    
    // Event listeners
    modal.querySelector('.modal-close').onclick = () => this.closeModal(modal);
    modal.querySelector('.cancel-btn').onclick = () => this.closeModal(modal);
    modal.querySelector('.modal-backdrop').onclick = () => this.closeModal(modal);
    
    modal.querySelector('.quick-report-btn').onclick = () => {
      this.submitQuickReport(latlng, modal);
    };
    
    modal.querySelector('.full-report-btn').onclick = () => {
      this.closeModal(modal);
      // Redirect to full report form with location pre-filled
      const url = `request.html?lat=${latlng.lat}&lng=${latlng.lng}`;
      window.location.href = url;
    };
  }
  
  submitQuickReport(latlng, modal) {
    const category = document.getElementById('quickCategory').value;
    const priority = document.getElementById('quickPriority').value;
    const description = document.getElementById('quickDescription').value.trim();
    
    if (!description) {
      if (window.notifications) {
        window.notifications.warning('Please provide a description');
      }
      return;
    }
    
    const problem = {
      id: Date.now(),
      category,
      priority,
      description,
      status: 'Pending',
      submittedOn: new Date().toLocaleDateString(),
      submittedAt: new Date().toISOString(),
      resolvedOn: null,
      location: { latitude: latlng.lat, longitude: latlng.lng },
      manualLocation: '',
      images: []
    };
    
    // Save to localStorage
    const problems = JSON.parse(localStorage.getItem('problems')) || [];
    problems.push(problem);
    localStorage.setItem('problems', JSON.stringify(problems));
    
    // Add to map
    this.addProblemMarker(problem);
    
    this.closeModal(modal);
    
    if (window.notifications) {
      window.notifications.success('Issue reported successfully! 📍', {
        actions: [{
          id: 'view',
          text: 'View Details',
          handler: () => window.viewProblemDetails(problem.id)
        }]
      });
    }
  }
  
  showSettingsDialog() {
    const modal = document.createElement('div');
    modal.className = 'map-settings-modal';
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>⚙️ Map Settings</h3>
          <button class="modal-close">✕</button>
        </div>
        <div class="modal-body">
          <div class="setting-group">
            <label>
              <input type="checkbox" ${this.settings.clickToReport ? 'checked' : ''}> 
              Enable click-to-report on map
            </label>
          </div>
          <div class="setting-group">
            <label>Cluster Distance:</label>
            <input type="range" min="20" max="100" value="${this.config.clusterDistance}" class="cluster-slider">
            <span class="cluster-value">${this.config.clusterDistance}px</span>
          </div>
          <div class="setting-group">
            <label>Default Map View:</label>
            <button class="save-current-view">Save Current View as Default</button>
          </div>
        </div>
        <div class="modal-footer">
          <button class="save-settings-btn">Save Settings</button>
          <button class="reset-settings-btn">Reset to Defaults</button>
          <button class="cancel-btn">Cancel</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
    
    // Event listeners
    const clickToReportToggle = modal.querySelector('input[type="checkbox"]');
    const clusterSlider = modal.querySelector('.cluster-slider');
    const clusterValue = modal.querySelector('.cluster-value');
    
    clusterSlider.oninput = () => {
      clusterValue.textContent = clusterSlider.value + 'px';
    };
    
    modal.querySelector('.modal-close').onclick = () => this.closeModal(modal);
    modal.querySelector('.cancel-btn').onclick = () => this.closeModal(modal);
    modal.querySelector('.modal-backdrop').onclick = () => this.closeModal(modal);
    
    modal.querySelector('.save-current-view').onclick = () => {
      const center = this.map.getCenter();
      const zoom = this.map.getZoom();
      this.settings.center = [center.lat, center.lng];
      this.settings.zoom = zoom;
      if (window.notifications) {
        window.notifications.info('Current view saved as default');
      }
    };
    
    modal.querySelector('.save-settings-btn').onclick = () => {
      this.settings.clickToReport = clickToReportToggle.checked;
      this.config.clusterDistance = parseInt(clusterSlider.value);
      this.saveSettings();
      this.closeModal(modal);
      
      // Update cluster distance
      if (this.markerClusters) {
        this.markerClusters.options.maxClusterRadius = this.config.clusterDistance;
      }
      
      if (window.notifications) {
        window.notifications.success('Map settings saved');
      }
    };
    
    modal.querySelector('.reset-settings-btn').onclick = () => {
      if (confirm('Reset all map settings to defaults?')) {
        this.settings = {};
        this.config.clusterDistance = 50;
        this.saveSettings();
        this.closeModal(modal);
        
        if (window.notifications) {
          window.notifications.info('Map settings reset to defaults');
        }
      }
    };
  }
  
  closeModal(modal) {
    modal.classList.add('hiding');
    setTimeout(() => {
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
    }, 300);
  }
  
  saveMapState() {
    if (!this.map) return;
    
    const center = this.map.getCenter();
    const zoom = this.map.getZoom();
    
    this.settings.lastCenter = [center.lat, center.lng];
    this.settings.lastZoom = zoom;
    
    this.saveSettings();
  }
  
  saveSettings() {
    try {
      localStorage.setItem('community-hub-map', JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Could not save map settings:', e);
    }
  }
  
  loadSettings() {
    try {
      const stored = localStorage.getItem('community-hub-map');
      return stored ? JSON.parse(stored) : {
        clickToReport: true,
        showClusters: true
      };
    } catch (e) {
      console.warn('Could not load map settings:', e);
      return {
        clickToReport: true,
        showClusters: true
      };
    }
  }
  
  // Public API methods
  refresh() {
    this.loadProblems();
  }
  
  centerOnProblem(problemId) {
    try {
      const problems = JSON.parse(localStorage.getItem('problems')) || [];
      const problem = problems.find(p => p.id == problemId);
      
      if (problem && problem.location) {
        this.map.setView([problem.location.latitude, problem.location.longitude], 16);
        
        // Find and open popup
        this.markers.forEach(marker => {
          const popup = marker.getPopup();
          if (popup && popup.getContent().includes(problemId)) {
            marker.openPopup();
          }
        });
      }
    } catch (error) {
      console.error('Failed to center on problem:', error);
    }
  }
  
  addMapStyles() {
    const styles = `
      <style id="map-system-styles">
        .leaflet-container {
          font-family: inherit;
        }
        
        .leaflet-container.fullscreen {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          width: 100% !important;
          height: 100% !important;
          z-index: 10000 !important;
        }
        
        .leaflet-control-custom a {
          background: var(--surface);
          color: var(--text-primary);
          border: 1px solid var(--border);
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          line-height: 1;
        }
        
        .leaflet-control-custom a:hover {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }
        
        .map-legend {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius, 8px);
          padding: 1rem;
          box-shadow: var(--shadow-md);
          font-size: 0.875rem;
        }
        
        .map-legend h4 {
          margin: 0 0 0.75rem 0;
          color: var(--text-primary);
          font-size: 0.95rem;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.25rem;
        }
        
        .legend-icon {
          font-size: 1rem;
          width: 20px;
          text-align: center;
        }
        
        .legend-label {
          color: var(--text-secondary);
          font-size: 0.8rem;
        }
        
        .custom-popup .leaflet-popup-content {
          margin: 0;
          padding: 0;
        }
        
        .problem-popup {
          font-family: inherit;
          max-width: 280px;
        }
        
        .popup-header {
          background: var(--surface-dark);
          padding: 1rem;
          border-bottom: 1px solid var(--border);
        }
        
        .popup-header h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1rem;
          color: var(--text-primary);
        }
        
        .popup-badges {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        .status-badge, .priority-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
        }
        
        .status-badge.resolved {
          background: #d1fae5;
          color: #059669;
        }
        
        .status-badge.pending {
          background: #fef3c7;
          color: #d97706;
        }
        
        .priority-badge.high {
          background: #fecaca;
          color: #dc2626;
        }
        
        .priority-badge.medium {
          background: #fef3c7;
          color: #d97706;
        }
        
        .priority-badge.low {
          background: #d1fae5;
          color: #059669;
        }
        
        .popup-images {
          padding: 1rem;
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        .popup-description, .popup-details {
          padding: 0 1rem 1rem;
        }
        
        .popup-description p, .popup-details p {
          margin: 0 0 0.5rem 0;
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }
        
        .popup-actions {
          padding: 1rem;
          border-top: 1px solid var(--border);
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        .popup-actions button {
          padding: 0.5rem 0.75rem;
          border: none;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          flex: 1;
          min-width: 100px;
        }
        
        .btn-primary {
          background: var(--primary);
          color: white;
        }
        
        .btn-primary:hover {
          background: var(--primary-dark);
        }
        
        .btn-success {
          background: #10b981;
          color: white;
        }
        
        .btn-success:hover {
          background: #059669;
        }
        
        .map-report-modal,
        .map-settings-modal {
          position: fixed;
          inset: 0;
          z-index: 10002;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
        }
        
        .map-report-modal.show,
        .map-settings-modal.show {
          opacity: 1;
          visibility: visible;
        }
        
        .map-report-modal.hiding,
        .map-settings-modal.hiding {
          opacity: 0;
        }
        
        .modal-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
        }
        
        .modal-content {
          background: var(--surface);
          border-radius: var(--radius-lg, 16px);
          box-shadow: var(--shadow-xl);
          width: 90%;
          max-width: 500px;
          position: relative;
          z-index: 1;
          max-height: 90vh;
          overflow-y: auto;
        }
        
        .modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .modal-header h3 {
          margin: 0;
          color: var(--text-primary);
        }
        
        .modal-close {
          background: none;
          border: none;
          font-size: 1.25rem;
          color: var(--text-light);
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          transition: all 0.2s;
        }
        
        .modal-close:hover {
          background: var(--surface-dark);
          color: var(--text-secondary);
        }
        
        .modal-body {
          padding: 1.5rem;
        }
        
        .form-group {
          margin-bottom: 1rem;
        }
        
        .form-group label {
          display: block;
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }
        
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--border);
          border-radius: var(--radius, 8px);
          background: var(--surface);
          color: var(--text-primary);
          font-family: inherit;
          font-size: 0.9rem;
        }
        
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
        }
        
        .setting-group {
          margin-bottom: 1.5rem;
        }
        
        .setting-group label {
          display: block;
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }
        
        .setting-group input[type="checkbox"] {
          margin-right: 0.5rem;
        }
        
        .setting-group input[type="range"] {
          width: 100%;
        }
        
        .save-current-view {
          background: var(--surface-dark);
          border: 1px solid var(--border);
          color: var(--text-primary);
          padding: 0.75rem 1rem;
          border-radius: var(--radius, 8px);
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s;
        }
        
        .save-current-view:hover {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
        }
        
        .modal-footer {
          padding: 1.5rem;
          border-top: 1px solid var(--border);
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          flex-wrap: wrap;
        }
        
        .modal-footer button {
          padding: 0.75rem 1.5rem;
          border: 1px solid var(--border);
          border-radius: var(--radius, 8px);
          font-family: inherit;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          min-width: 100px;
        }
        
        .quick-report-btn,
        .save-settings-btn {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
        }
        
        .quick-report-btn:hover,
        .save-settings-btn:hover {
          background: var(--primary-dark);
        }
        
        .full-report-btn {
          background: var(--accent);
          border-color: var(--accent);
          color: white;
        }
        
        .full-report-btn:hover {
          opacity: 0.9;
        }
        
        .reset-settings-btn {
          background: #f59e0b;
          border-color: #f59e0b;
          color: white;
        }
        
        .reset-settings-btn:hover {
          background: #d97706;
        }
        
        .cancel-btn {
          background: var(--surface-dark);
          color: var(--text-secondary);
        }
        
        .cancel-btn:hover {
          background: var(--surface-darker);
          color: var(--text-primary);
        }
        
        @media (max-width: 768px) {
          .modal-content {
            margin: 1rem;
            width: calc(100% - 2rem);
          }
          
          .modal-footer {
            flex-direction: column;
          }
          
          .popup-actions {
            flex-direction: column;
          }
          
          .popup-actions button {
            min-width: auto;
          }
        }
        
        /* Custom marker cluster styles */
        .marker-cluster {
          background: rgba(34, 197, 94, 0.6);
          border: 2px solid rgba(34, 197, 94, 0.8);
        }
        
        .marker-cluster div {
          background: rgba(34, 197, 94, 0.8);
          color: white;
          font-weight: bold;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }
        
        .marker-cluster-small {
          width: 30px !important;
          height: 30px !important;
        }
        
        .marker-cluster-medium {
          width: 35px !important;
          height: 35px !important;
        }
        
        .marker-cluster-large {
          width: 40px !important;
          height: 40px !important;
        }
      </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', styles);
  }
}

// Global functions for popup actions
window.viewProblemDetails = function(problemId) {
  // Navigate to problem details
  window.location.href = `listed.html#problem-${problemId}`;
};

window.markAsResolved = function(problemId) {
  try {
    const problems = JSON.parse(localStorage.getItem('problems')) || [];
    const problemIndex = problems.findIndex(p => p.id == problemId);
    
    if (problemIndex !== -1) {
      problems[problemIndex].status = 'Resolved';
      problems[problemIndex].resolvedOn = new Date().toLocaleDateString();
      localStorage.setItem('problems', JSON.stringify(problems));
      
      if (window.notifications) {
        window.notifications.success('Issue marked as resolved! ✅');
      }
      
      // Refresh map
      if (window.mapSystem) {
        window.mapSystem.refresh();
      }
      
      // Close any open popups
      document.querySelectorAll('.leaflet-popup-close-button').forEach(btn => btn.click());
    }
  } catch (error) {
    console.error('Failed to mark problem as resolved:', error);
    if (window.notifications) {
      window.notifications.error('Failed to update issue status');
    }
  }
};

window.viewImage = function(imageData) {
  // Create image modal
  const modal = document.createElement('div');
  modal.className = 'image-modal';
  modal.innerHTML = `
    <div class="image-modal-backdrop"></div>
    <div class="image-modal-content">
      <button class="image-modal-close">✕</button>
      <img src="${imageData}" alt="Issue image" style="max-width: 100%; max-height: 100%; object-fit: contain;">
    </div>
  `;
  
  modal.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 10003;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.9);
  `;
  
  modal.querySelector('.image-modal-close').style.cssText = `
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    font-size: 2rem;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  
  document.body.appendChild(modal);
  
  // Close on click
  modal.onclick = (e) => {
    if (e.target === modal || e.target.className.includes('backdrop') || e.target.className.includes('close')) {
      document.body.removeChild(modal);
    }
  };
};

// Initialize map system when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we have a map container
    if (document.getElementById('map')) {
      window.mapSystem = new MapSystem();
      window.mapSystem.addMapStyles();
    }
  });
} else {
  if (document.getElementById('map')) {
    window.mapSystem = new MapSystem();
    window.mapSystem.addMapStyles();
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MapSystem;
}