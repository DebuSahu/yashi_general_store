import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import L from 'leaflet';

// Haversine distance calculator
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

export default function LocationPicker({
  shopLat = 26.4519124,
  shopLon = 80.3537057,
  maxRadiusKm = 5,
  initialUserLat,
  initialUserLon,
  onLocationSelected
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  const circleRef = useRef(null);

  const [userLocation, setUserLocation] = useState(
    initialUserLat && initialUserLon
      ? { lat: initialUserLat, lng: initialUserLon }
      : { lat: shopLat + 0.015, lng: shopLon + 0.015 } // default near shop (approx 2 km)
  );
  const [distance, setDistance] = useState(0);
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState('');

  // Calculate distance whenever userLocation or shop changes
  useEffect(() => {
    if (userLocation) {
      const d = calculateDistance(shopLat, shopLon, userLocation.lat, userLocation.lng);
      setDistance(d);
      const isEligible = d <= maxRadiusKm;
      onLocationSelected?.({
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        distanceKm: d,
        isEligible
      });
    }
  }, [userLocation, shopLat, shopLon, maxRadiusKm]);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView([shopLat, shopLon], 13);
      mapInstanceRef.current = map;

      // Clean OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Custom icon for Shop
      const shopIcon = L.divIcon({
        className: 'custom-shop-icon',
        html: `
          <div style="background-color: #047857; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3); border: 2.5px solid white; font-weight: bold; font-size: 14px;">
            🏪
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      L.marker([shopLat, shopLon], { icon: shopIcon })
        .addTo(map)
        .bindPopup('<b>Yashi General Store</b><br>510, Elliot Lane, Mirpur Cantt, Kanpur<br>5 km Delivery Center')
        .openPopup();

      // 5km Delivery Radius Circle
      circleRef.current = L.circle([shopLat, shopLon], {
        radius: maxRadiusKm * 1000,
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.14,
        weight: 2.5
      }).addTo(map);

      // User destination marker
      const userIcon = L.divIcon({
        className: 'custom-user-icon',
        html: `
          <div style="background-color: #ef4444; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3); border: 2px solid white; font-size: 15px;">
            📍
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
        draggable: true
      }).addTo(map);

      // Handle marker drag
      userMarkerRef.current.on('dragend', (e) => {
        const marker = e.target;
        const position = marker.getLatLng();
        setUserLocation({ lat: position.lat, lng: position.lng });
      });

      // Handle map clicks
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        setUserLocation({ lat, lng });
        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng([lat, lng]);
        }
      });
    }

    // Force map size invalidation
    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 200);
  }, []);

  // Update shop center and circle radius when shopLat/shopLon/maxRadiusKm changes
  useEffect(() => {
    if (mapInstanceRef.current && circleRef.current) {
      circleRef.current.setRadius(maxRadiusKm * 1000);
      circleRef.current.setLatLng([shopLat, shopLon]);
    }
  }, [shopLat, shopLon, maxRadiusKm]);

  // Update user marker position when userLocation changes
  useEffect(() => {
    if (userMarkerRef.current && userLocation) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    }
  }, [userLocation]);

  // Detect GPS geolocation from device
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('GPS Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setGeoError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLocation({ lat, lng });

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 14);
        }

        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        setGeoError(
          'Could not retrieve your location. Please check browser permissions or click directly on the map.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const isEligible = distance <= maxRadiusKm;

  return (
    <div className="space-y-3 w-full max-w-full">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
          <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Set Delivery Point (Shop has a strict 5km limit)</span>
        </div>

        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={isLocating}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition active:scale-95 disabled:opacity-50"
        >
          <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? 'Detecting GPS...' : '📍 Use My GPS Location'}</span>
        </button>
      </div>

      {geoError && (
        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p>{geoError}</p>
        </div>
      )}

      {/* Map Canvas */}
      <div className="w-full h-52 sm:h-64 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 relative shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full" />
        
        {/* Floating helper overlay */}
        <div className="absolute top-2 right-2 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-xs pointer-events-none">
          🟢 Green circle = 5 km delivery zone
        </div>
      </div>

      {/* Real-time Distance & Eligibility Indicator */}
      <div
        className={`p-3.5 rounded-2xl border transition-all ${
          isEligible
            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
            : 'bg-red-50 dark:bg-red-950/60 border-red-300 dark:border-red-800 text-red-950 dark:text-red-200'
        }`}
      >
        <div className="flex items-start gap-3">
          {isEligible ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          )}

          <div className="flex-1">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <span className="text-xs font-black uppercase tracking-wider">
                {isEligible ? 'Eligible For Delivery' : 'Outside 5km Delivery Zone'}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/90 dark:bg-slate-900/90 shadow-2xs">
                Distance: <strong className={isEligible ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}>{distance} km</strong> / Max {maxRadiusKm} km
              </span>
            </div>

            <p className="text-xs mt-1 text-slate-600 dark:text-slate-300">
              {isEligible ? (
                <span>
                  Great! Your location is within our <strong className="text-emerald-800 dark:text-emerald-300">5 km delivery boundary</strong>. Our delivery partner can reach your doorstep.
                </span>
              ) : (
                <span className="text-red-700 dark:text-red-300 font-medium">
                  Sorry, we only deliver up to {maxRadiusKm} km of Yashi General Store. Please pick a closer delivery location within the green zone or contact the store directly.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
