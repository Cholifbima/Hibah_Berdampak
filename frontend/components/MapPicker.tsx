"use client";

import { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, MapPin, Loader2, X } from "lucide-react";

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
  onChange: (lat: number, lng: number, address?: string, addressDetails?: any) => void;
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
  const [searching, setSearching] = useState(false);
  const [reverseLoading, setReverseLoading] = useState(false);

  const defaultCenter: [number, number] = [-6.2, 106.8166];
  const center: [number, number] = lat && lng ? [lat, lng] : defaultCenter;
  const hasLocation = lat !== null && lng !== null;

  // Search on Enter key
  async function handleSearch() {
    if (!query.trim() || query.trim().length < 3) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=id&limit=1`,
        { headers: { "Accept": "application/json" } }
      );
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      if (data && data.length > 0) {
        const item = data[0];
        const newLat = parseFloat(item.lat);
        const newLng = parseFloat(item.lon);
        onChange(newLat, newLng, item.display_name, item.address);
      } else {
        alert("Alamat tidak ditemukan. Coba kata kunci lain.");
      }
    } catch {
      alert("Gagal mencari alamat. Coba lagi.");
    }
    setSearching(false);
  }

  // Reverse geocode - get address from coordinates
  async function reverseGeocode(lat: number, lng: number) {
    setReverseLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await res.json();
      if (data && data.display_name) {
        setQuery(data.display_name.split(",").slice(0, 3).join(",").trim());
        onChange(lat, lng, data.display_name, data.address);
        return data.display_name;
      }
    } catch { /* ignore */ }
    setReverseLoading(false);
    return null;
  }

  function handleDragEnd(newLat: number, newLng: number) {
    reverseGeocode(newLat, newLng);
  }

  function handleMapClick(clickLat: number, clickLng: number) {
    reverseGeocode(clickLat, clickLng);
  }

  return (
    <div className="space-y-3">
      {/* Search Bar - Press Enter to search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleSearch())}
            placeholder="Ketik alamat lalu tekan Enter..."
            autoComplete="off"
            className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-10 py-2.5 text-sm placeholder:text-gray-400 focus:border-[#163f73] focus:outline-none focus:ring-2 focus:ring-[#163f73]/10 transition-all"
          />
          {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />}
          {!searching && query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching || query.trim().length < 3}
          className="inline-flex items-center gap-2 rounded-lg bg-[#163f73] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1f67df] transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Cari
        </button>
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
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700 border border-emerald-200">
            <MapPin className="h-3 w-3" />
            {lat!.toFixed(6)}, {lng!.toFixed(6)}
          </span>
        </div>
      )}
    </div>
  );
}
