import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

interface Location {
  lat: number;
  lng: number;
  range: number;
  ket: string;
  lokasi_id: number;
  satker_list?: string[];
}

interface MultiLocationMapProps {
  center: [number, number];
  zoom: number;
  locations: Location[];
  height?: string;
  width?: string;
}

const MultiLocationMap: React.FC<MultiLocationMapProps> = ({
  center,
  zoom,
  locations,
  height = '400px',
  width = '100%'
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<any>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [circles, setCircles] = useState<google.maps.Circle[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize Google Maps
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.error('Google Maps API key is missing');
      return;
    }

    const loader = new Loader({
      apiKey: apiKey,
      version: "weekly",
      libraries: ["places"],
      region: 'ID',
      language: 'id'
    });

    loader.load().then(async () => {
      if (mapRef.current && !map) {
        const newMap = new google.maps.Map(mapRef.current, {
          center: { lat: center[0], lng: center[1] },
          zoom: zoom,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER
          }
        });

        setMap(newMap);
        setIsLoaded(true);

        // Initialize autocomplete
        if (searchInputRef.current?.input) {
          const autocompleteInstance = new google.maps.places.Autocomplete(searchInputRef.current.input, {
            types: ['geocode', 'establishment'],
            fields: ['geometry', 'name', 'formatted_address'],
            componentRestrictions: { country: 'id' }
          });

          // Listen for place selection
          autocompleteInstance.addListener("place_changed", () => {
            const place = autocompleteInstance.getPlace();

            if (!place.geometry?.location) return;

            // Set map center to the selected place
            newMap.setCenter(place.geometry.location);
            newMap.setZoom(15);
          });
        }
      }
    }).catch(error => {
      console.error("Google Maps API failed to load:", error);
    });
  }, [center, zoom, map]);

  // Update markers and circles when locations change
  useEffect(() => {
    if (!map || !isLoaded || locations.length === 0) return;

    // Clear existing markers and circles
    markers.forEach(marker => marker.setMap(null));
    circles.forEach(circle => circle.setMap(null));

    const newMarkers: google.maps.Marker[] = [];
    const newCircles: google.maps.Circle[] = [];

    // Create markers and circles for each location
    locations.forEach((location, index) => {
      // Create marker
      const marker = new google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: map,
        title: location.ket,
        label: {
          text: `${index + 1}`,
          color: 'white',
          fontWeight: 'bold',
          fontSize: '12px'
        },
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="14" fill="${index === 0 ? '#1890ff' : '#52c41a'}" stroke="white" stroke-width="2"/>
              <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${index + 1}</text>
            </svg>
          `)}`,
          scaledSize: new google.maps.Size(32, 32),
          anchor: new google.maps.Point(16, 16)
        }
      });

      newMarkers.push(marker);

      // Create circle
      const circle = new google.maps.Circle({
        strokeColor: index === 0 ? "#1890ff" : "#52c41a",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: index === 0 ? "#1890ff" : "#52c41a",
        fillOpacity: 0.15,
        map: map,
        center: { lat: location.lat, lng: location.lng },
        radius: location.range,
      });

      newCircles.push(circle);

      // Add info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; min-width: 200px;">
            <h4 style="margin: 0 0 8px 0; color: #1890ff;">${location.ket}</h4>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">
              <strong>Koordinat:</strong> ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}
            </p>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">
              <strong>Radius:</strong> ${location.range}m
            </p>
           
          </div>
        `
      });

      marker.addListener("click", () => {
        infoWindow.open(map, marker);
      });
    });

    setMarkers(newMarkers);
    setCircles(newCircles);

    // Fit map to show all locations
    if (locations.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      locations.forEach(location => {
        bounds.extend(new google.maps.LatLng(location.lat, location.lng));
      });
      map.fitBounds(bounds);
    }

    // Cleanup function
    return () => {
      newMarkers.forEach(marker => marker.setMap(null));
      newCircles.forEach(circle => circle.setMap(null));
    };
  }, [map, isLoaded, locations]);

  return (
    <div style={{ position: 'relative', width, height }}>
      <div style={{ 
        position: 'absolute', 
        top: '16px', 
        left: '16px', 
        zIndex: 10, 
        width: '256px' 
      }}>
        <div style={{ position: 'relative' }}>
          <Input
            ref={searchInputRef}
            placeholder="Cari lokasi..."
            prefix={<SearchOutlined />}
            style={{ 
              width: '100%',
              backgroundColor: 'white',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
            }}
          />
        </div>
      </div>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default MultiLocationMap;
