import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

interface MapProps {
  center: [number, number];
  zoom: number;
  onMapClick?: (lat: number, lng: number) => void;
  selectedLocation?: {
    lat: number;
    lng: number;
    range: number;
  };
  onRadiusChange?: (radius: number) => void;
  height?: string;
  width?: string;
}

const GoogleMap: React.FC<MapProps> = ({
  center,
  zoom,
  onMapClick,
  selectedLocation,
  onRadiusChange,
  height = '400px',
  width = '100%'
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<any>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [circle, setCircle] = useState<google.maps.Circle | null>(null);
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

        // Add click listener to map
        if (onMapClick) {
          newMap.addListener("click", (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
              const lat = e.latLng.lat();
              const lng = e.latLng.lng();
              onMapClick(lat, lng);
            }
          });
        }

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

            // Update marker and trigger click event
            if (onMapClick) {
              onMapClick(
                place.geometry.location.lat(),
                place.geometry.location.lng()
              );
            }
          });
        }
      }
    }).catch(error => {
      console.error("Google Maps API failed to load:", error);
    });
  }, [center, zoom, onMapClick, map]);

  // Update marker and circle when selectedLocation changes
  useEffect(() => {
    if (!map || !isLoaded || !selectedLocation) return;

    // Clear existing marker and circle
    if (marker) {
      marker.setMap(null);
    }
    if (circle) {
      circle.setMap(null);
    }

    // Create new marker
    const newMarker = new google.maps.Marker({
      position: { lat: selectedLocation.lat, lng: selectedLocation.lng },
      map: map,
      draggable: true,
      title: "Lokasi Presensi"
    });

    // Add drag listener to marker
    if (onMapClick) {
      newMarker.addListener("dragend", () => {
        const position = newMarker.getPosition();
        if (position) {
          onMapClick(position.lat(), position.lng());
        }
      });
    }

    setMarker(newMarker);

    // Create new circle
    const newCircle = new google.maps.Circle({
      strokeColor: "#1890ff",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#1890ff",
      fillOpacity: 0.2,
      map: map,
      center: { lat: selectedLocation.lat, lng: selectedLocation.lng },
      radius: selectedLocation.range,
      editable: true,
    });

    // Add radius change listener
    if (onRadiusChange) {
      newCircle.addListener("radius_changed", () => {
        onRadiusChange(newCircle.getRadius());
      });
    }

    setCircle(newCircle);

    // Center map on the new location
    map.setCenter({ lat: selectedLocation.lat, lng: selectedLocation.lng });

    // Cleanup function
    return () => {
      if (newMarker) newMarker.setMap(null);
      if (newCircle) newCircle.setMap(null);
    };
  }, [map, isLoaded, selectedLocation, onMapClick, onRadiusChange]);

  // Add radius control
  useEffect(() => {
    if (!map || !isLoaded || !selectedLocation || !onRadiusChange) return;

    // Remove existing radius control
    const existingControls = map.controls[google.maps.ControlPosition.TOP_RIGHT];
    for (let i = 0; i < existingControls.getLength(); i++) {
      const control = existingControls.getAt(i);
      if (control && (control as any).className === 'radius-control') {
        existingControls.removeAt(i);
        break;
      }
    }

    // Create radius control
    const radiusControlDiv = document.createElement("div");
    (radiusControlDiv as any).className = "radius-control";
    


    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(radiusControlDiv);

    // Add event listener to range input
    const rangeInput = radiusControlDiv.querySelector("input") as HTMLInputElement;
    if (rangeInput) {
      rangeInput.addEventListener("input", (e) => {
        const value = parseInt((e.target as HTMLInputElement).value);
        if (circle) {
          circle.setRadius(value);
        }
        onRadiusChange(value);
        
        // Update display
        const displaySpan = radiusControlDiv.querySelector("span:nth-child(2)");
        if (displaySpan) {
          displaySpan.textContent = `${value}m`;
        }
      });
    }
  }, [map, isLoaded, selectedLocation, onRadiusChange, circle]);

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

export default GoogleMap;