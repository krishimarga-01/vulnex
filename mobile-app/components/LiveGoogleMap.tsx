import React, { useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { Locate, Layers, ShieldCheck } from 'lucide-react-native';
import { ShelterItem } from '../types';

interface LiveGoogleMapProps {
  latitude: number;
  longitude: number;
  district: string;
  state: string;
  shelters?: ShelterItem[];
  alertLevel?: 'RED' | 'ORANGE' | 'YELLOW' | 'GREEN';
  alertHeadline?: string;
  height?: number;
}

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export default function LiveGoogleMap({
  latitude,
  longitude,
  district,
  state,
  shelters = [],
  alertLevel = 'YELLOW',
  alertHeadline = 'Active IMD Warning Zone',
  height = 360,
}: LiveGoogleMapProps) {
  const webViewRef = useRef<WebView>(null);

  const hazardColor =
    alertLevel === 'RED'
      ? '#DC2626'
      : alertLevel === 'ORANGE'
      ? '#EA580C'
      : alertLevel === 'YELLOW'
      ? '#EAB308'
      : '#10B981';

  // Generate HTML for Google Maps with dark theme styling
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; background: #0B131E; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .gm-style-iw {
      background: #111D2D !important;
      color: #FFFFFF !important;
      border-radius: 10px !important;
      padding: 10px !important;
      border: 1px solid #1E2F46 !important;
    }
    .gm-style-iw-d { overflow: hidden !important; color: #FFFFFF !important; }
    .gm-style-iw-tc::after { background: #111D2D !important; }
    .iw-title { font-weight: 700; font-size: 13px; color: #38BDF8; margin-bottom: 4px; }
    .iw-desc { font-size: 11px; color: #CBD5E1; line-height: 14px; }
    .iw-tag { display: inline-block; background: #10B98122; color: #10B981; border: 1px solid #10B981; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 700; margin-top: 6px; }
  </style>
  <script src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}"></script>
</head>
<body>
  <div id="map"></div>
  <script>
    const darkStyle = [
      { "elementType": "geometry", "stylers": [{ "color": "#0B131E" }] },
      { "elementType": "labels.text.fill", "stylers": [{ "color": "#8AA0BC" }] },
      { "elementType": "labels.text.stroke", "stylers": [{ "color": "#0B131E" }] },
      { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#1E2F46" }] },
      { "featureType": "administrative.country", "elementType": "geometry.stroke", "stylers": [{ "color": "#38BDF8" }] },
      { "featureType": "administrative.province", "elementType": "geometry.stroke", "stylers": [{ "color": "#1E2F46" }] },
      { "featureType": "landscape", "stylers": [{ "color": "#111D2D" }] },
      { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#64748B" }] },
      { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#0E2218" }] },
      { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#1A2A3E" }] },
      { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#121F2F" }] },
      { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#263B54" }] },
      { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#1E2F46" }] },
      { "featureType": "transit", "stylers": [{ "color": "#1A2A3E" }] },
      { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#070E17" }] },
      { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#38BDF8" }] }
    ];

    function initMap() {
      const centerPos = { lat: ${latitude}, lng: ${longitude} };
      const map = new google.maps.Map(document.getElementById('map'), {
        center: centerPos,
        zoom: 12,
        styles: darkStyle,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
          position: google.maps.ControlPosition.TOP_RIGHT
        },
        streetViewControl: false,
        fullscreenControl: false
      });

      // User location marker
      const userMarker = new google.maps.Marker({
        position: centerPos,
        map: map,
        title: "${district}, ${state}",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: "#38BDF8",
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 2
        }
      });

      const userInfowindow = new google.maps.InfoWindow({
        content: '<div class="iw-title">Current Location</div><div class="iw-desc">${district}, ${state}</div><div class="iw-tag">ACTIVE MONITORING</div>'
      });
      userMarker.addListener('click', () => userInfowindow.open(map, userMarker));

      // Active Hazard Radius Circle
      new google.maps.Circle({
        strokeColor: "${hazardColor}",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "${hazardColor}",
        fillOpacity: 0.18,
        map: map,
        center: centerPos,
        radius: 4500
      });

      // Relief Shelters Markers
      const sheltersData = ${JSON.stringify(shelters)};
      sheltersData.forEach(function(sh, idx) {
        if (!sh.latitude || !sh.longitude) return;
        const shMarker = new google.maps.Marker({
          position: { lat: sh.latitude, lng: sh.longitude },
          map: map,
          title: sh.shelterName,
          icon: {
            path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
            scale: 6,
            fillColor: "#10B981",
            fillOpacity: 1,
            strokeColor: "#FFFFFF",
            strokeWeight: 1.5
          }
        });

        const shInfo = new google.maps.InfoWindow({
          content: '<div class="iw-title">' + (sh.shelterName || 'Relief Shelter') + '</div>' +
                   '<div class="iw-desc">' + (sh.address || '') + '<br/>Phone: ' + (sh.contactPhone || '112') + '</div>' +
                   '<div class="iw-tag">NDMA RELIEF CENTER</div>'
        });
        shMarker.addListener('click', function() { shInfo.open(map, shMarker); });
      });
    }

    window.onload = initMap;
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
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#DC2626" />
            <Text style={styles.loadingText}>Loading Real-World Google Map...</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1E2F46',
    backgroundColor: '#0B131E',
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
});
