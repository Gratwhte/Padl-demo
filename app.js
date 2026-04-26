(function () {
  const STORAGE_KEYS = {
    routes: 'wsdemo_routes',
    annotations: 'wsdemo_annotations',
    activities: 'wsdemo_activities'
  };

  const poiColors = {
    buffet: '#f59e0b',
    restaurant: '#ef4444',
    water_source: '#38bdf8',
    camping: '#22c55e',
    parking: '#6b7280',
    rental: '#8b5cf6',
    launch: '#06b6d4'
  };

  const annotationColors = {
    obstacle: '#dc2626',
    crossing: '#2563eb',
    hazard: '#ea580c',
    portage: '#16a34a',
    lock_weir: '#7c3aed',
    current_note: '#0891b2',
    flow_note: '#0f766e'
  };

  function loadStored(key) {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS[key]);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveStored(key, data) {
    localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data));
  }

  function toRad(d) {
    return d * Math.PI / 180;
  }

  function haversineKm(a, b) {
    const R = 6371;
    const dLat = toRad(b[0] - a[0]);
    const dLon = toRad(b[1] - a[1]);
    const lat1 = toRad(a[0]);
    const lat2 = toRad(b[0]);

    const x =
      Math.sin(dLat / 2) ** 2 +
      Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

    return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  }

  function polylineDistanceKm(points) {
    if (!points || points.length < 2) return 0;
    let total = 0;
    for (let i = 1; i < points.length; i++) {
      total += haversineKm(points[i - 1], points[i]);
    }
    return total;
  }

  function formatDurationHours(hours) {
    const totalMinutes = Math.round(hours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (h <= 0) return `${m} min`;
    return `${h} h ${m} min`;
  }

  function estimateDuration(distanceKm, speedKmh) {
    if (!speedKmh) return 0;
    return distanceKm / speedKmh;
  }

  function pointToSegmentDistanceApprox(point, a, b) {
    const px = point[1], py = point[0];
    const ax = a[1], ay = a[0];
    const bx = b[1], by = b[0];

    const dx = bx - ax;
    const dy = by - ay;

    if (dx === 0 && dy === 0) return Math.hypot(px - ax, py - ay);

    const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
    const cx = ax + t * dx;
    const cy = ay + t * dy;

    return Math.hypot(px - cx, py - cy);
  }

  function routeWaterWarning(routePoints, waters) {
    if (!routePoints || routePoints.length < 2) return null;

    const threshold = 0.03;

    for (const point of routePoints) {
      let nearAnyWater = false;

      for (const water of waters) {
        for (let i = 1; i < water.centerline.length; i++) {
          const dist = pointToSegmentDistanceApprox(point, water.centerline[i - 1], water.centerline[i]);
          if (dist < threshold) {
            nearAnyWater = true;
            break;
          }
        }
        if (nearAnyWater) break;
      }

      if (!nearAnyWater) {
        return 'Warning: parts of this route may leave mapped water corridors.';
      }
    }

    return null;
  }

  function exportJson(data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'watersport-demo-export.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function readJsonFile(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => {
        try {
          resolve(JSON.parse(r.result));
        } catch (e) {
          reject(e);
        }
      };
      r.onerror = reject;
      r.readAsText(file);
    });
  }

  const seed = window.SEED_DATA;

  const state = {
    pois: seed.pois.slice(),
    waters: seed.waters.slice(),
    routes: seed.routes.concat(loadStored('routes')),
    annotations: seed.annotations.concat(loadStored('annotations')),
    activities: loadStored('activities'),
    draftRoute: [],
    drawMode: false,
    annotationMode: false,
    trackingPath: [],
    livePosition: null,
    gpsWatchId: null,
    simTimer: null,
    simRouteIndex: 0,
    filters: {
      pois: true,
      annotations: true,
      routes: true,
      waters: true,
      tracking: true
    }
  };

  const map = L.map('map').setView([47.35, 19.2], 7);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  const layers = {
    pois: L.layerGroup().addTo(map),
    waters: L.layerGroup().addTo(map),
    annotations: L.layerGroup().addTo(map),
    routes: L.layerGroup().addTo(map),
    draft: L.layerGroup().addTo(map),
    tracking: L.layerGroup().addTo(map)
  };

  const els = {
    toggleDrawBtn: document.getElementById('toggleDrawBtn'),
    undoPointBtn: document.getElementById('undoPointBtn'),
    clearDraftBtn: document.getElementById('clearDraftBtn'),
    saveRouteBtn: document.getElementById('saveRouteBtn'),
    annotationType: document.getElementById('annotationType'),
    toggleAnnotationBtn: document.getElementById('toggleAnnotationBtn'),
    startGpsBtn: document.getElementById('startGpsBtn'),
    stopGpsBtn: document.getElementById('stopGpsBtn'),
    startSimBtn: document.getElementById('startSimBtn'),
    stopSimBtn: document.getElementById('stopSimBtn'),
    draftStats: document.getElementById('draftStats'),
    draftWarning: document.getElementById('draftWarning'),
    routesList: document.getElementById('routesList'),
    annotationsList: document.getElementById('annotationsList'),
    activitiesList: document.getElementById('activitiesList'),
    exportBtn: document.getElementById('exportBtn'),
    importFile: document.getElementById('importFile'),
    modeBadge: document.getElementById('modeBadge'),
    trackingBadge: document.getElementById('trackingBadge'),
    showPois: document.getElementById('showPois'),
    showAnnotations: document.getElementById('showAnnotations'),
    showRoutes: document.getElementById('showRoutes'),
    showWaters: document.getElementById('showWaters'),
    showTracking: document.getElementById('showTracking')
  };

  function saveCustomData() {
    const customRoutes = state.routes.filter(r => !seed.routes.some(sr => sr.id === r.id));
    const customAnnotations = state.annotations.filter(a => !seed.annotations.some(sa => sa.id === a.id));

    saveStored('routes', customRoutes);
    saveStored('annotations', customAnnotations);
    saveStored('activities', state.activities);
  }

  function setModeBadge() {
    let text = 'Mode: View';
    if (state.drawMode) text = 'Mode: Draw Route';
    if (state.annotationMode) text = 'Mode: Add Annotation';
    els.modeBadge.textContent = text;
  }

  function setTrackingBadge() {
    let text = 'Tracking: Off';
    if (state.gpsWatchId !== null) text = 'Tracking: GPS Active';
    else if (state.simTimer !== null) text = 'Tracking: Simulation Active';
    els.trackingBadge.textContent = text;
  }

  function updateDraftStats() {
    const dist = polylineDistanceKm(state.draftRoute);
    const eta = estimateDuration(dist, 5);
    els.draftStats.innerHTML = `
      <div>Points: ${state.draftRoute.length}</div>
      <div>Distance: ${dist.toFixed(2)} km</div>
      <div>ETA @ 5 km/h: ${formatDurationHours(eta)}</div>
    `;

    const warning = routeWaterWarning(state.draftRoute, state.waters);
    if (warning) {
      els.draftWarning.style.display = 'block';
      els.draftWarning.textContent = warning;
    } else {
      els.draftWarning.style.display = 'none';
      els.draftWarning.textContent = '';
    }
  }

  function applyLayerFilters() {
    toggleLayer(layers.pois, state.filters.pois);
    toggleLayer(layers.annotations, state.filters.annotations);
    toggleLayer(layers.routes, state.filters.routes);
    toggleLayer(layers.waters, state.filters.waters);
    toggleLayer(layers.tracking, state.filters.tracking);
  }

  function toggleLayer(layer, show) {
    if (show) {
      if (!map.hasLayer(layer)) layer.addTo(map);
    } else {
      if (map.hasLayer(layer)) map.removeLayer(layer);
    }
  }

  function renderWaters() {
    layers.waters.clearLayers();

    state.waters.forEach(water => {
      L.polyline(water.centerline, {
        color: '#38bdf8',
        weight: 6,
        opacity: 0.65
      })
        .bindPopup(`
          <strong>${water.name}</strong><br>
          Type: ${water.type}<br>
          Flow: ${water.properties.flow}<br>
          Current: ${water.properties.current}<br>
          ${water.properties.notes}
        `)
        .addTo(layers.waters);
    });
  }

  function renderPois() {
    layers.pois.clearLayers();

    state.pois.forEach(poi => {
      L.circleMarker(poi.position, {
        radius: 8,
        color: poiColors[poi.category] || '#0ea5e9',
        fillColor: poiColors[poi.category] || '#0ea5e9',
        fillOpacity: 0.9
      })
        .bindPopup(`
          <strong>${poi.name}</strong><br>
          ${poi.category}<br>
          ${poi.description}
        `)
        .addTo(layers.pois);
    });
  }

  function renderAnnotations() {
    layers.annotations.clearLayers();

    state.annotations.forEach(ann => {
      L.circleMarker(ann.position, {
        radius: 7,
        color: annotationColors[ann.type] || '#334155',
        fillColor: annotationColors[ann.type] || '#334155',
        fillOpacity: 0.9
      })
        .bindPopup(`
          <strong>${ann.title}</strong><br>
          ${ann.type}<br>
          ${ann.note || ''}
        `)
        .addTo(layers.annotations);
    });

    renderAnnotationsList();
  }

  function renderRoutes() {
    layers.routes.clearLayers();

    state.routes.forEach(route => {
      const dist = polylineDistanceKm(route.points);
      const eta = estimateDuration(dist, route.estimatedSpeedKmh || 5);

      L.polyline(route.points, {
        color: '#0f172a',
        weight: 4
      })
        .bindPopup(`
          <strong>${route.name}</strong><br>
          ${dist.toFixed(2)} km<br>
          ${formatDurationHours(eta)}
        `)
        .addTo(layers.routes);
    });

    renderRoutesList();
  }

  function renderDraftRoute() {
    layers.draft.clearLayers();

    if (state.draftRoute.length > 0) {
      L.polyline(state.draftRoute, {
        color: '#06b6d4',
        weight: 4,
        dashArray: '8 6'
      }).addTo(layers.draft);

      state.draftRoute.forEach((p, i) => {
        L.circleMarker(p, {
          radius: 5,
          color: '#0284c7',
          fillColor: '#06b6d4',
          fillOpacity: 1
        }).bindTooltip(`Point ${i + 1}`).addTo(layers.draft);
      });
    }

    updateDraftStats();
  }

  function liveDivIcon() {
    return L.divIcon({
      className: '',
      html: '<div class="live-marker"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
  }

  function renderTracking() {
    layers.tracking.clearLayers();

    if (state.trackingPath.length > 0) {
      L.polyline(state.trackingPath, {
        color: '#f97316',
        weight: 5
      }).addTo(layers.tracking);
    }

    if (state.livePosition) {
      L.marker(state.livePosition, { icon: liveDivIcon() })
        .bindPopup('Current tracked position')
        .addTo(layers.tracking);
    }

    renderActivitiesList();
  }

  function renderRoutesList() {
    if (state.routes.length === 0) {
      els.routesList.innerHTML = '<div class="muted">No routes yet.</div>';
      return;
    }

    els.routesList.innerHTML = '';
    state.routes.forEach(route => {
      const dist = polylineDistanceKm(route.points);
      const eta = estimateDuration(dist, route.estimatedSpeedKmh || 5);

      const item = document.createElement('div');
      item.className = 'list-item';
      item.innerHTML = `
        <div class="list-item-title">${route.name}</div>
        <div>${dist.toFixed(2)} km · ${formatDurationHours(eta)}</div>
        <div class="item-actions">
          <button class="small-btn danger" data-route-delete="${route.id}">Delete</button>
        </div>
      `;
      els.routesList.appendChild(item);
    });

    els.routesList.querySelectorAll('[data-route-delete]').forEach(btn => {
      btn.addEventListener('click', function () {
        const id = this.getAttribute('data-route-delete');
        state.routes = state.routes.filter(r => r.id !== id);
        saveCustomData();
        renderRoutes();
      });
    });
  }

  function renderAnnotationsList() {
    if (state.annotations.length === 0) {
      els.annotationsList.innerHTML = '<div class="muted">No annotations yet.</div>';
      return;
    }

    els.annotationsList.innerHTML = '';
    state.annotations.forEach(ann => {
      const item = document.createElement('div');
      item.className = 'list-item';
      item.innerHTML = `
        <div class="list-item-title">${ann.title}</div>
        <div>${ann.type}</div>
        <div>${ann.note || ''}</div>
        <div class="item-actions">
          <button class="small-btn danger" data-ann-delete="${ann.id}">Delete</button>
        </div>
      `;
      els.annotationsList.appendChild(item);
    });

    els.annotationsList.querySelectorAll('[data-ann-delete]').forEach(btn => {
      btn.addEventListener('click', function () {
        const id = this.getAttribute('data-ann-delete');
        state.annotations = state.annotations.filter(a => a.id !== id);
        saveCustomData();
        renderAnnotations();
      });
    });
  }

  function renderActivitiesList() {
    if (state.activities.length === 0) {
      els.activitiesList.innerHTML = '<div class="muted">No saved activities yet.</div>';
      return;
    }

    els.activitiesList.innerHTML = '';
    state.activities.forEach(act => {
      const item = document.createElement('div');
      item.className = 'list-item';
      item.innerHTML = `
        <div class="list-item-title">${act.name}</div>
        <div>${act.distanceKm.toFixed(2)} km</div>
        <div class="item-actions">
          <button class="small-btn danger" data-act-delete="${act.id}">Delete</button>
        </div>
      `;
      els.activitiesList.appendChild(item);
    });

    els.activitiesList.querySelectorAll('[data-act-delete]').forEach(btn => {
      btn.addEventListener('click', function () {
        const id = this.getAttribute('data-act-delete');
        state.activities = state.activities.filter(a => a.id !== id);
        saveCustomData();
        renderActivitiesList();
      });
    });
  }

  function saveDraftRoute() {
    if (state.draftRoute.length < 2) {
      alert('Add at least 2 route points.');
      return;
    }

    const warning = routeWaterWarning(state.draftRoute, state.waters);
    if (warning) {
      const proceed = confirm(warning + '\n\nSave anyway?');
      if (!proceed) return;
    }

    const name = prompt('Route name:', `Custom Route ${state.routes.length + 1}`);
    if (!name) return;

    const speedInput = prompt('Estimated paddling speed (km/h):', '5');
    const speed = Number(speedInput) || 5;

    state.routes.push({
      id: 'route-' + Date.now(),
      name,
      points: state.draftRoute.slice(),
      estimatedSpeedKmh: speed
    });

    state.draftRoute = [];
    state.drawMode = false;
    els.toggleDrawBtn.classList.remove('active');
    saveCustomData();
    setModeBadge();
    renderDraftRoute();
    renderRoutes();
  }

  function stopGps(saveActivity) {
    if (state.gpsWatchId !== null) {
      navigator.geolocation.clearWatch(state.gpsWatchId);
      state.gpsWatchId = null;
    }

    if (saveActivity && state.trackingPath.length > 1) {
      state.activities.unshift({
        id: 'act-' + Date.now(),
        name: 'GPS Activity ' + new Date().toLocaleString(),
        points: state.trackingPath.slice(),
        distanceKm: polylineDistanceKm(state.trackingPath)
      });
      saveCustomData();
    }

    state.trackingPath = [];
    state.livePosition = null;
    setTrackingBadge();
    renderTracking();
  }

  function startGps() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported in this browser.');
      return;
    }

    if (state.gpsWatchId !== null) {
      alert('GPS tracking is already active.');
      return;
    }

    state.trackingPath = [];
    state.livePosition = null;

    state.gpsWatchId = navigator.geolocation.watchPosition(
      function (pos) {
        const point = [pos.coords.latitude, pos.coords.longitude];
        state.livePosition = point;
        state.trackingPath.push(point);
        renderTracking();
      },
      function () {
        alert('Unable to read GPS position.');
        stopGps(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 10000
      }
    );

    setTrackingBadge();
    renderTracking();
  }

  function stopSimulation(saveActivity) {
    if (state.simTimer !== null) {
      clearInterval(state.simTimer);
      state.simTimer = null;
    }

    if (saveActivity && state.trackingPath.length > 1) {
      state.activities.unshift({
        id: 'act-' + Date.now(),
        name: 'Simulated Activity ' + new Date().toLocaleString(),
        points: state.trackingPath.slice(),
        distanceKm: polylineDistanceKm(state.trackingPath)
      });
      saveCustomData();
    }

    state.simRouteIndex = 0;
    state.trackingPath = [];
    state.livePosition = null;
    setTrackingBadge();
    renderTracking();
  }

  function startSimulation() {
    if (state.simTimer !== null) {
      alert('Simulation already running.');
      return;
    }

    const route = state.routes[0];
    if (!route || !route.points || route.points.length < 2) {
      alert('No available route to simulate.');
      return;
    }

    state.trackingPath = [];
    state.livePosition = null;
    state.simRouteIndex = 0;

    state.livePosition = route.points[0];
    state.trackingPath.push(route.points[0]);
    renderTracking();

    state.simTimer = setInterval(function () {
      state.simRouteIndex += 1;

      if (state.simRouteIndex >= route.points.length) {
        stopSimulation(true);
        return;
      }

      const point = route.points[state.simRouteIndex];
      state.livePosition = point;
      state.trackingPath.push(point);
      renderTracking();
    }, 1000);

    setTrackingBadge();
  }

  function importData(data) {
    if (Array.isArray(data.routes)) {
      state.routes = seed.routes.concat(data.routes);
    }
    if (Array.isArray(data.annotations)) {
      state.annotations = seed.annotations.concat(data.annotations);
    }
    if (Array.isArray(data.activities)) {
      state.activities = data.activities;
    }

    saveCustomData();
    renderAll();
    alert('Import successful.');
  }

  function renderAll() {
    renderWaters();
    renderPois();
    renderAnnotations();
    renderRoutes();
    renderDraftRoute();
    renderTracking();
    setModeBadge();
    setTrackingBadge();
    applyLayerFilters();
  }

  map.on('click', function (e) {
    const point = [e.latlng.lat, e.latlng.lng];

    if (state.drawMode) {
      state.draftRoute.push(point);
      renderDraftRoute();
      return;
    }

    if (state.annotationMode) {
      const type = els.annotationType.value;
      const title = prompt(`Enter title for ${type}:`);
      if (!title) return;

      const note = prompt('Optional note:') || '';

      state.annotations.push({
        id: 'ann-' + Date.now(),
        type,
        title,
        note,
        position: point
      });

      state.annotationMode = false;
      els.toggleAnnotationBtn.classList.remove('active');
      saveCustomData();
      setModeBadge();
      renderAnnotations();
    }
  });

  els.toggleDrawBtn.addEventListener('click', function () {
    state.drawMode = !state.drawMode;
    if (state.drawMode) state.annotationMode = false;

    this.classList.toggle('active', state.drawMode);
    els.toggleAnnotationBtn.classList.remove('active');
    setModeBadge();
  });

  els.undoPointBtn.addEventListener('click', function () {
    state.draftRoute.pop();
    renderDraftRoute();
  });

  els.clearDraftBtn.addEventListener('click', function () {
    state.draftRoute = [];
    renderDraftRoute();
  });

  els.saveRouteBtn.addEventListener('click', saveDraftRoute);

  els.toggleAnnotationBtn.addEventListener('click', function () {
    state.annotationMode = !state.annotationMode;
    if (state.annotationMode) state.drawMode = false;

    this.classList.toggle('active', state.annotationMode);
    els.toggleDrawBtn.classList.remove('active');
    setModeBadge();
  });

  els.startGpsBtn.addEventListener('click', startGps);
  els.stopGpsBtn.addEventListener('click', function () { stopGps(true); });
  els.startSimBtn.addEventListener('click', startSimulation);
  els.stopSimBtn.addEventListener('click', function () { stopSimulation(true); });

  els.exportBtn.addEventListener('click', function () {
    exportJson({
      routes: state.routes,
      annotations: state.annotations,
      activities: state.activities
    });
  });

  els.importFile.addEventListener('change', async function (e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    try {
      const data = await readJsonFile(file);
      importData(data);
    } catch (err) {
      alert('Import failed. Invalid JSON.');
    }

    e.target.value = '';
  });

  els.showPois.addEventListener('change', function () {
    state.filters.pois = this.checked;
    applyLayerFilters();
  });

  els.showAnnotations.addEventListener('change', function () {
    state.filters.annotations = this.checked;
    applyLayerFilters();
  });

  els.showRoutes.addEventListener('change', function () {
    state.filters.routes = this.checked;
    applyLayerFilters();
  });

  els.showWaters.addEventListener('change', function () {
    state.filters.waters = this.checked;
    applyLayerFilters();
  });

  els.showTracking.addEventListener('change', function () {
    state.filters.tracking = this.checked;
    applyLayerFilters();
  });

  renderAll();
})();
