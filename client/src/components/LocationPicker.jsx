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
        className: 'custom-shop-pin',
        html: `<div style="background-color:#16a34a;color:white;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 4px 6px rgba(0,0,0,0.3);font-size:18px;">🏪</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      // Shop Marker
      L.marker([shopLat, shopLon], { icon: shopIcon })
        .addTo(map)
        .bindPopup(`<b>Yashi General Store (YGS)</b><br/>510, Elliot Lane, Mirpur Cantt, Kanpur<br/><b>5 km Delivery Zone Origin</b><br/><a href="https://maps.app.goo.gl/36DwR1dGU2bfv7KD9" target="_blank" rel="noopener noreferrer" style="color:#16a34a;font-weight:bold;text-decoration:underline;">Open in Google Maps &rarr;</a>`)
        .openPopup();

      // 5km Delivery Radius Circle
      const circle = L.circle([shopLat, shopLon], {
        color: '#16a34a',
        fillColor: '#22c55e',
        fillOpacity: 0.15,
        radius: maxRadiusKm * 1000 // Convert km to meters
      }).addTo(map);
      circleRef.current = circle;

      // Custom icon for User
      const userIcon = L.divIcon({
        className: 'custom-user-pin',
        html: `<div style="background-color:#ef4444;color:white;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 4px 6px rgba(0,0,0,0.3);font-size:16px;">📍</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      // User Marker (Draggable)
      const userMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
        draggable: true
      }).addTo(map);

      userMarker.bindPopup('<b>Your Delivery Location</b><br/>Drag or click anywhere on the map');

      userMarker.on('dragend', (event) => {
        const marker = event.target;
        const position = marker.getLatLng();
        setUserLocation({ lat: position.lat, lng: position.lng });
      });

      userMarkerRef.current = userMarker;

      // Click on map to place pin
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        setUserLocation({ lat, lng });
        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng([lat, lng]);
        }
      });
    } else {
      // Update markers if position changes externally
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      }
    }

    return () => {
      // cleanup on unmount
    };
  }, [shopLat, shopLon, maxRadiusKm]);

  // Update user marker position when userLocation changes
  useEffect(() => {
    if (userMarkerRef.current && userLocation) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    }
  }, [userLocation]);

  // Geolocation detection handler
  const handleDetectLocation = () => {
    setGeoError('');
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLocation({ lat, lng });

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 14, { duration: 1.5 });
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err);
        setGeoError('Could not retrieve GPS location automatically. You can tap anywhere on the map to set your address pin!');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const isEligible = distance <= maxRadiusKm;

  return (
    <div className="space-y-3">
      {/* Location Actions & Status */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span>Set Delivery Point (Shop has a strict 5km limit)</span>
        </div>

        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={isLocating}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition active:scale-95 disabled:opacity-50"
        >
          <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? 'Detecting GPS...' : '📍 Use My GPS Location'}</span>
        </button>
      </div>

      {geoError && (
        <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p>{geoError}</p>
        </div>
      )}

      {/* Map Canvas */}
      <div className="w-full h-56 sm:h-64 rounded-xl overflow-hidden border border-gray-200 relative shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full" />
        
        {/* Floating helper overlay */}
        <div className="absolute top-2 right-2 z-20 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[11px] font-semibold text-gray-700 border border-gray-200 shadow-xs pointer-events-none">
          🟢 Green circle = 5 km delivery zone
        </div>
      </div>

      {/* Real-time Distance & Eligibility Indicator */}
      <div
        className={`p-3.5 rounded-xl border transition-all ${
          isEligible
            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
            : 'bg-red-50 border-red-300 text-red-950'
        }`}
      >
        <div className="flex items-start gap-3">
          {isEligible ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}

          <div className="flex-1">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <span className="text-xs font-black uppercase tracking-wider">
                {isEligible ? 'Eligible For Delivery' : 'Outside 5km Delivery Zone'}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/80 shadow-2xs">
                Distance: <strong className={isEligible ? 'text-emerald-700' : 'text-red-700'}>{distance} km</strong> / Max {maxRadiusKm} km
              </span>
            </div>

            <p className="text-xs mt-1 text-gray-600">
              {isEligible ? (
                <span>
                  Great! Your location is within our <strong className="text-emerald-800">5 km delivery boundary</strong>. Our delivery partner can reach your doorstep.
                </span>
              ) : (
                <span className="text-red-700 font-medium">
                  Sorry, we only deliver up to {maxRadiusKm} km of Yashi General Store YGS. Please pick a closer delivery location within the green zone or contact the store directly.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
