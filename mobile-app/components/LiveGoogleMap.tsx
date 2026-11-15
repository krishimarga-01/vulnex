import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { Plus, Minus, Locate, Globe, Layers } from 'lucide-react-native';
import { ShelterItem, IndiaDisasterMapRegion } from '../types';

export interface LiveGoogleMapRef {
  focusRegion: (latitude: number, longitude: number, zoom?: number) => void;
  resetToAllIndia: () => void;
  focusMyLocation: () => void;
  toggleLayer: () => void;
}

interface LiveGoogleMapProps {
  latitude: number;
  longitude: number;
  district: string;
  state: string;
  disasterRegions?: IndiaDisasterMapRegion[];
  shelters?: ShelterItem[];
  alertLevel?: 'RED' | 'ORANGE' | 'YELLOW' | 'GREEN';
  alertHeadline?: string;
  height?: number;
  onRegionSelect?: (regionId: string) => void;
}

const LiveGoogleMap = forwardRef<LiveGoogleMapRef, LiveGoogleMapProps>(({
  latitude,
  longitude,
  district,
  state,
  disasterRegions = [],
  shelters = [],
  alertLevel = 'YELLOW',
  alertHeadline = 'Active Monitoring Zone',
  height = 420,
  onRegionSelect,
}, ref) => {
  const webViewRef = useRef<WebView>(null);

  useImperativeHandle(ref, () => ({
    focusRegion(lat: number, lng: number, zoom = 10) {
      webViewRef.current?.postMessage(
        JSON.stringify({ type: 'FLY_TO', lat, lng, zoom })
      );
    },
    resetToAllIndia() {
      webViewRef.current?.postMessage(JSON.stringify({ type: 'FIT_ALL_INDIA' }));
    },
    focusMyLocation() {
      webViewRef.current?.postMessage(
        JSON.stringify({ type: 'FLY_TO', lat: latitude, lng: longitude, zoom: 12 })
      );
    },
    toggleLayer() {
      webViewRef.current?.postMessage(JSON.stringify({ type: 'TOGGLE_LAYER' }));
    },
  }));

  const handleZoomIn = () => {
    webViewRef.current?.postMessage(JSON.stringify({ type: 'ZOOM_IN' }));
  };

  const handleZoomOut = () => {
    webViewRef.current?.postMessage(JSON.stringify({ type: 'ZOOM_OUT' }));
  };

  const handleMyLocation = () => {
    webViewRef.current?.postMessage(
      JSON.stringify({ type: 'FLY_TO', lat: latitude, lng: longitude, zoom: 12 })
    );
  };

  const handleFitAllIndia = () => {
    webViewRef.current?.postMessage(JSON.stringify({ type: 'FIT_ALL_INDIA' }));
  };

  const handleToggleTile = () => {
    webViewRef.current?.postMessage(JSON.stringify({ type: 'TOGGLE_LAYER' }));
  };

  // Build the complete interactive HTML with Leaflet and multi-layer tiles
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=18.0, user-scalable=yes" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; background: #0B131E; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; overflow: hidden; }
    
    /* Custom Popup Styles */
    .leaflet-popup-content-wrapper {
      background: #111D2D !important;
      color: #FFFFFF !important;
      border-radius: 12px !important;
      box-shadow: 0 10px 25px rgba(0,0,0,0.6) !important;
      border: 1px solid #1E3A5F !important;
      padding: 4px 6px !important;
    }
    .leaflet-popup-tip {
      background: #111D2D !important;
      border: 1px solid #1E3A5F !important;
    }
    .leaflet-popup-content {
      margin: 8px 10px !important;
      line-height: 1.4 !important;
    }
    .popup-badge {
      display: inline-block;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.5px;
      padding: 3px 8px;
      border-radius: 6px;
      margin-bottom: 6px;
      text-transform: uppercase;
    }
    .badge-red { background: rgba(220, 38, 38, 0.25); color: #EF4444; border: 1px solid #EF4444; }
    .badge-orange { background: rgba(234, 88, 12, 0.25); color: #F97316; border: 1px solid #F97316; }
    .badge-yellow { background: rgba(234, 179, 8, 0.25); color: #FBBF24; border: 1px solid #FBBF24; }
    .badge-green { background: rgba(16, 185, 129, 0.25); color: #10B981; border: 1px solid #10B981; }
    .badge-blue { background: rgba(56, 189, 248, 0.25); color: #38BDF8; border: 1px solid #38BDF8; }
    
    .popup-title {
      font-size: 13px;
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 3px;
    }
    .popup-headline {
      font-size: 11px;
      font-weight: 600;
      color: #38BDF8;
      margin-bottom: 4px;
    }
    .popup-desc {
      font-size: 10px;
      color: #94A3B8;
      margin-bottom: 6px;
      max-width: 220px;
    }
    .popup-stat {
      font-size: 9px;
      font-weight: 700;
      color: #E2E8F0;
      background: #18283D;
      padding: 4px 6px;
      border-radius: 4px;
      display: inline-block;
    }

    /* Pulse Radar Animations */
    @keyframes pulse-red {
      0% { transform: scale(0.95); opacity: 0.9; }
      50% { transform: scale(1.15); opacity: 0.4; }
      100% { transform: scale(0.95); opacity: 0.9; }
    }
    @keyframes pulse-cyan {
      0% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.7); }
      70% { transform: scale(1.1); box-shadow: 0 0 0 12px rgba(56, 189, 248, 0); }
      100% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(56, 189, 248, 0); }
    }
    .disaster-pin {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      color: white;
      font-weight: bold;
      border: 2px solid white;
      box-shadow: 0 4px 10px rgba(0,0,0,0.5);
      animation: pulse-red 2.4s infinite ease-in-out;
    }
    .my-location-pin {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: #38BDF8;
      border: 3px solid #FFFFFF;
      box-shadow: 0 0 15px #38BDF8;
      animation: pulse-cyan 2s infinite ease-in-out;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
    }
  </style>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
</head>
<body>
  <div id="map"></div>
  <script>
    const userLat = ${latitude};
    const userLon = ${longitude};
    const userDistrict = "${district}";
    const userState = "${state}";
    const disasterRegions = ${JSON.stringify(disasterRegions)};
    const shelters = ${JSON.stringify(shelters)};

    // Tile Layers
    const darkTile = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: 'VULNEX Disaster Intel | CartoDB',
      subdomains: 'abcd',
      maxZoom: 19
    });

    const satTile = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Esri World Imagery',
      maxZoom: 18
    });

    const streetTile = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'OpenStreetMap',
      maxZoom: 19
    });

    const tileLayers = [darkTile, satTile, streetTile];
    let currentTileIndex = 0;

    // Initialize Map
    const map = L.map('map', {
      center: [userLat, userLon],
      zoom: 6,
      layers: [darkTile],
      zoomControl: false,
      attributionControl: false
    });

    // Layer Groups
    const disasterLayerGroup = L.layerGroup().addTo(map);
    const shelterLayerGroup = L.layerGroup().addTo(map);
    const userLayerGroup = L.layerGroup().addTo(map);

    // Hazard Color and Icon Helpers
    function getHazardColor(level) {
      if (level === 'RED') return '#DC2626';
      if (level === 'ORANGE') return '#EA580C';
      if (level === 'YELLOW') return '#EAB308';
      return '#10B981';
    }

    function getHazardIcon(type) {
      const t = (type || '').toUpperCase();
      if (t.includes('FLOOD') || t.includes('RAIN')) return '🌊';
      if (t.includes('CYCLONE') || t.includes('WIND') || t.includes('SQUALL')) return '🌀';
      if (t.includes('HEAT')) return '🔥';
      if (t.includes('THUNDER') || t.includes('LIGHTNING')) return '⚡';
      return '⚠️';
    }

    const markersMap = {};

    // 1. PLOT ALL DISASTER AFFECTED AREAS ACROSS INDIA
    disasterRegions.forEach(function(r) {
      if (!r.latitude || !r.longitude) return;
      const color = getHazardColor(r.alertLevel);
      const iconEmoji = getHazardIcon(r.hazardType);

      // Warning Perimeter Circle (20km to 35km radius)
      const radiusMeters = r.alertLevel === 'RED' ? 38000 : (r.alertLevel === 'ORANGE' ? 28000 : 20000);
      L.circle([r.latitude, r.longitude], {
        color: color,
        fillColor: color,
        fillOpacity: 0.22,
        weight: 2,
        radius: radiusMeters
      }).addTo(disasterLayerGroup);

      // Pulsing Custom Marker Pin
      const pinHtml = '<div class="disaster-pin" style="background:' + color + ';">' + iconEmoji + '</div>';
      const icon = L.divIcon({
        className: 'custom-disaster-marker',
        html: pinHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18]
      });

      const badgeClass = r.alertLevel === 'RED' ? 'badge-red' : (r.alertLevel === 'ORANGE' ? 'badge-orange' : 'badge-yellow');
      const popupHtml = 
        '<span class="popup-badge ' + badgeClass + '">' + r.alertLevel + ' ALERT</span>' +
        '<div class="popup-title">' + r.district + ', ' + r.state + '</div>' +
        '<div class="popup-headline">' + r.hazardType.replace('_', ' ') + '</div>' +
        '<div class="popup-desc">' + (r.headline || r.advisory || 'Severe Weather Warning') + '</div>' +
        '<div class="popup-stat">👥 ' + (r.affectedVulnerableCount || 5) + ' High-Risk Dependents at Site</div>';

      const marker = L.marker([r.latitude, r.longitude], { icon: icon })
        .bindPopup(popupHtml)
        .addTo(disasterLayerGroup);

      markersMap[r.id] = { marker: marker, lat: r.latitude, lng: r.longitude };
    });

    // 2. PLOT USER'S LIVE DETECTED GPS LOCATION
    const userPinHtml = '<div class="my-location-pin">📍</div>';
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: userPinHtml,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
      popupAnchor: [0, -14]
    });

    const userPopupHtml = 
      '<span class="popup-badge badge-blue">YOUR PRESENT LOCATION</span>' +
      '<div class="popup-title">' + userDistrict + ', ' + userState + '</div>' +
      '<div class="popup-desc">GPS Satellite Positioning Active</div>' +
      '<div class="popup-stat">📍 Lat: ' + userLat.toFixed(4) + ' | Lon: ' + userLon.toFixed(4) + '</div>';

    const userMarker = L.marker([userLat, userLon], { icon: userIcon, zIndexOffset: 1000 })
      .bindPopup(userPopupHtml)
      .addTo(userLayerGroup);

    // User location boundary circle
    L.circle([userLat, userLon], {
      color: '#38BDF8',
      fillColor: '#38BDF8',
      fillOpacity: 0.12,
      weight: 1.5,
      dashArray: '4, 4',
      radius: 12000
    }).addTo(userLayerGroup);

    // 3. PLOT RELIEF SHELTERS
    shelters.forEach(function(sh) {
      if (!sh.latitude || !sh.longitude) return;
      const shIcon = L.divIcon({
        className: 'shelter-marker',
        html: '<div style="background:#10B981;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:12px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.5);">🏥</div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -14]
      });

      const shPopupHtml = 
        '<span class="popup-badge badge-green">NDMA RELIEF SHELTER</span>' +
        '<div class="popup-title">' + (sh.shelterName || 'Relief Center') + '</div>' +
        '<div class="popup-desc">' + (sh.address || '') + '<br/>📞 Helpline: ' + (sh.contactPhone || '1078') + '</div>' +
        '<div class="popup-stat">Distance: ' + (sh.distanceKm ? sh.distanceKm.toFixed(1) + ' km' : 'Nearby') + '</div>';

      L.marker([sh.latitude, sh.longitude], { icon: shIcon })
        .bindPopup(shPopupHtml)
        .addTo(shelterLayerGroup);
    });

    // 4. HANDLE REACT NATIVE MESSAGES (Zoom, FlyTo, FitBounds, ToggleLayer)
    function handleMessage(event) {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'ZOOM_IN') {
          map.zoomIn();
        } else if (data.type === 'ZOOM_OUT') {
          map.zoomOut();
        } else if (data.type === 'FLY_TO') {
          map.flyTo([data.lat, data.lng], data.zoom || 11, { duration: 1.2 });
        } else if (data.type === 'FOCUS_REGION' && markersMap[data.id]) {
          const item = markersMap[data.id];
          map.flyTo([item.lat, item.lng], 10, { duration: 1.2 });
          item.marker.openPopup();
        } else if (data.type === 'FIT_ALL_INDIA') {
          const bounds = [];
          disasterRegions.forEach(r => { if (r.latitude && r.longitude) bounds.push([r.latitude, r.longitude]); });
          bounds.push([userLat, userLon]);
          if (bounds.length > 0) {
            map.fitBounds(bounds, { padding: [40, 40], maxZoom: 8 });
          }
        } else if (data.type === 'TOGGLE_LAYER') {
          map.removeLayer(tileLayers[currentTileIndex]);
          currentTileIndex = (currentTileIndex + 1) % tileLayers.length;
          map.addLayer(tileLayers[currentTileIndex]);
        }
      } catch (e) {
        console.warn('Map msg error', e);
      }
    }

    window.addEventListener('message', handleMessage);
    document.addEventListener('message', handleMessage);
  </script>
</body>
</html>
  `;

  return (
    <View style={[styles.container, { height }]}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        nestedScrollEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#DC2626" />
            <Text style={styles.loadingText}>Loading Live Disaster Map...</Text>
          </View>
        )}
      />

      {/* Floating On-Map Interactive Quick Controls */}
      <View style={styles.floatingControls}>
        <TouchableOpacity
          style={styles.controlBtn}
          onPress={handleZoomIn}
          activeOpacity={0.7}
        >
          <Plus size={18} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlBtn}
          onPress={handleZoomOut}
          activeOpacity={0.7}
        >
          <Minus size={18} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.controlDivider} />

        <TouchableOpacity
          style={styles.controlBtn}
          onPress={handleMyLocation}
          activeOpacity={0.7}
        >
          <Locate size={18} color="#38BDF8" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlBtn}
          onPress={handleFitAllIndia}
          activeOpacity={0.7}
        >
          <Globe size={18} color="#FBBF24" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlBtn}
          onPress={handleToggleTile}
          activeOpacity={0.7}
        >
          <Layers size={18} color="#10B981" />
        </TouchableOpacity>
      </View>
    </View>
  );
});

export default LiveGoogleMap;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1E2F46',
    backgroundColor: '#0B131E',
    position: 'relative',
  },
  webview: {
    flex: 1,
    backgroundColor: '#0B131E',
  },
  loadingBox: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0B131E',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  floatingControls: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(17, 29, 45, 0.92)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E3A5F',
    padding: 4,
    gap: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  controlBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#18283D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlDivider: {
    width: 24,
    height: 1,
    backgroundColor: '#1E3A5F',
    marginVertical: 2,
  },
});
