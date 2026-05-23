"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, MapPin, Loader2, X } from "lucide-react";

// Fix default marker icon
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number, address?: string) => void;
}

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

function DraggableMarker({ lat, lng, onDragEnd }: { lat: number; lng: number; onDragEnd: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState(L.latLng(lat, lng));

  const ref = useCallback((marker: L.Marker | null) => {
    if (marker) {
      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        setPosition(pos);
        onDragEnd(pos.lat, pos.lng);
      });
    }
  }, [onDragEnd]);

  return <Marker draggable position={position} ref={ref} />;
}

function MapController({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => { map.setView([lat, lng], 16); }, [lat, lng, map]);
  return null;
}

function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({ click(e) { onClick(e.latlng.lat, e.latlng.lng); } });
  return null;
}

export default function MapPicker({ lat, lng, onChange }: MapPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const [reverseLoading, setReverseLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const defaultCenter: [number, number] = [-6.2, 106.8166];
  const center: [number, number] = lat && lng ? [lat, lng] : defaultCenter;
  const hasLocation = lat !== null && lng !== null;

  // Search with debounce - autocomplete as you type
  function handleInputChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 3) { setResults([]); setShowResults(false); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        console.log("Searching:", value);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&countrycodes=id&limit=5&addressdetails=1`,
          { headers: { "Accept": "application/json" } }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        console.log("Search results:", data);
        setResults(data || []);
        setShowResults(true); // Always show if we have results
      } catch (err) {
        console.error("Search error:", err);
        setResults([]);
      }
      setSearching(false);
    }, 300);
  }

  // Auto-show dropdown when results available
  useEffect(() => {
    if (results.length > 0 && !searching) {
      setShowResults(true);
    }
  }, [results, searching]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest(".search-container")) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Select a search result
  function selectResult(item: SearchResult) {
    const newLat = parseFloat(item.lat);
    const newLng = parseFloat(item.lon);
    setQuery(item.display_name.split(",").slice(0, 3).join(",").trim());
    setShowResults(false);
    setResults([]);
    onChange(newLat, newLng, item.display_name);
  }

  // Reverse geocode - get address from lat/lng
  async function reverseGeocode(lat: number, lng: number) {
    setReverseLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await res.json();
      if (data && data.display_name) {
        setQuery(data.display_name.split(",").slice(0, 4).join(",").trim());
        onChange(lat, lng, data.display_name);
      }
    } catch { /* ignore */ }
    setReverseLoading(false);
  }

  // Handle marker drag end
  function handleDragEnd(newLat: number, newLng: number) {
    onChange(newLat, newLng);
    reverseGeocode(newLat, newLng);
  }

  // Handle map click
  function handleMapClick(clickLat: number, clickLng: number) {
    onChange(clickLat, clickLng);
    reverseGeocode(clickLat, clickLng);
  }

  return (
    <div className="space-y-3 search-container">
      {/* Search with Autocomplete */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={e => handleInputChange(e.target.value)}
              onFocus={() => setShowResults(results.length > 0)}
              placeholder="Cari alamat (contoh: Jl. Sudirman Jakarta...)"
              autoComplete="off"
              className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-10 py-2.5 text-sm placeholder:text-gray-400 focus:border-[#163f73] focus:outline-none focus:ring-2 focus:ring-[#163f73]/10 transition-all"
            />
            {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />}
            {!searching && query && (
              <button
                type="button"
                onClick={() => { setQuery(""); setResults([]); setShowResults(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Autocomplete Dropdown */}
        {(results.length > 0 || searching) && (
          <div className="absolute z-[100] mt-1 w-full rounded-lg bg-white shadow-xl ring-1 ring-gray-200 max-h-60 overflow-y-auto">
            {searching && (
              <div className="px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Mencari...
              </div>
            )}
            {results.map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => selectResult(item)}
                className="flex items-start gap-3 w-full px-4 py-3 text-left hover:bg-[#f0f7ff] transition-colors border-b border-gray-50 last:border-0"
              >
                <MapPin className="h-4 w-4 text-[#163f73] mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.display_name.split(",")[0]}</p>
                  <p className="text-xs text-gray-500 truncate">{item.display_name.split(",").slice(1, 4).join(",").trim()}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div className="rounded-xl overflow-hidden ring-1 ring-gray-200 shadow-sm">
        <MapContainer center={center} zoom={hasLocation ? 16 : 12} style={{ height: 300, width: "100%" }} scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {hasLocation && (
            <>
              <DraggableMarker lat={lat!} lng={lng!} onDragEnd={handleDragEnd} />
              <MapController lat={lat!} lng={lng!} />
            </>
          )}
          <ClickHandler onClick={handleMapClick} />
        </MapContainer>
      </div>

      {/* Info */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Klik peta atau geser pin untuk adjust titik lokasi
        </p>
        {reverseLoading && (
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Loader2 className="h-3 w-3 animate-spin" /> Membaca alamat...
          </span>
        )}
      </div>
      {hasLocation && (
        <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700 border border-emerald-200">
          <MapPin className="h-3 w-3" />
          {lat!.toFixed(6)}, {lng!.toFixed(6)}
        </div>
      )}
    </div>
  );
}
