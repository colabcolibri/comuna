'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { parsePlace, placeLatLon } from '@community/places';
import type { PersonCard } from '@/lib/people/person-card';

const TILE = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

export function PeopleMapCanvas({
  rows,
  emptyLabel,
  near,
  radiusKm,
  onOpen,
}: {
  rows: PersonCard[];
  emptyLabel: string;
  near?: { lat: number; lon: number } | null;
  radiusKm?: number;
  onOpen: (profile: PersonCard) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const onOpenRef = useRef(onOpen);
  onOpenRef.current = onOpen;

  useEffect(() => {
    if (!host.current || mapRef.current) {
      return;
    }
    const map = L.map(host.current, { scrollWheelZoom: true }).setView([20, 0], 2);
    L.tileLayer(TILE, { attribution: ATTRIBUTION }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    requestAnimationFrame(() => map.invalidateSize());
    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) {
      return;
    }
    layer.clearLayers();
    const pins = rows.flatMap((row) => {
      const coords = placeLatLon(parsePlace(row.current_city));
      return coords ? [{ row, coords }] : [];
    });
    const bounds = L.latLngBounds([]);
    pins.forEach(({ row, coords }) => {
      const marker = L.circleMarker([coords.lat, coords.lon], {
        radius: 8,
        color: '#1f3d38',
        fillColor: '#1f3d38',
        fillOpacity: 0.9,
        weight: 1,
      });
      marker.bindTooltip(row.full_name);
      marker.on('click', () => onOpenRef.current(row));
      marker.addTo(layer);
      bounds.extend([coords.lat, coords.lon]);
    });
    if (near && radiusKm) {
      const circle = L.circle([near.lat, near.lon], {
        radius: radiusKm * 1000,
        color: '#1f3d38',
        fillOpacity: 0.06,
        weight: 1,
      });
      circle.addTo(layer);
      bounds.extend(circle.getBounds());
    }
    if (bounds.isValid()) {
      map.fitBounds(bounds.pad(0.2));
    } else if (near) {
      map.setView([near.lat, near.lon], 10);
    } else {
      map.setView([20, 0], 2);
    }
    requestAnimationFrame(() => map.invalidateSize());
  }, [rows, near, radiusKm]);

  const located = rows.some((row) => placeLatLon(parsePlace(row.current_city)));

  return (
    <div className="min-w-0">
      <div ref={host} className="h-[min(70vh,32rem)] w-full min-w-0 overflow-hidden rounded-2xl border border-border" />
      {located ? null : <p className="mt-3 text-sm text-muted-foreground">{emptyLabel}</p>}
    </div>
  );
}
