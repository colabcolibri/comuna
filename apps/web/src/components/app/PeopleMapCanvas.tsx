'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import './people-map.css';
import { parsePlace, placeLatLon, displayPlaceLocality } from '@community/places';
import { personInitials } from '@community/ui-member';
import { contentFromCatalog, pickContent } from '@community/identity';
import { useLocale } from '@/components/app/LocaleProvider';
import { PeopleMapHeightControl, usePeopleMapHeight } from '@/components/app/people-map-height';
import { uiCatalog } from '@/lang/catalog';
import type { PersonCard } from '@/lib/people/person-card';

const TILE = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

const HEIGHT_COPY = contentFromCatalog(uiCatalog, 'plugin_directory', {
  mapHeight: 'page.map_height',
  sm: 'page.map_height_sm',
  md: 'page.map_height_md',
  lg: 'page.map_height_lg',
  xl: 'page.map_height_xl',
});

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function photoSrc(url: string | null) {
  if (!url) {
    return null;
  }
  if (url.startsWith('/') || url.startsWith('https://') || url.startsWith('http://localhost')) {
    return url;
  }
  return null;
}

function faceIcon(row: PersonCard) {
  const initials = escapeHtml(personInitials(row.full_name));
  const src = photoSrc(row.avatar_url);
  const photo = src
    ? `<img src="${escapeHtml(src)}" alt="">`
    : `<span>${initials}</span>`;
  return L.divIcon({
    className: 'people-map-marker',
    html: `<div class="people-map-face">${photo}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

function clusterIcon(cluster: L.MarkerCluster) {
  const n = cluster.getChildCount();
  const size = n < 10 ? 40 : n < 40 ? 44 : 48;
  return L.divIcon({
    className: 'people-map-marker',
    html: `<div class="people-map-cluster">${n}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

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
  const clustersRef = useRef<L.MarkerClusterGroup | null>(null);
  const extrasRef = useRef<L.LayerGroup | null>(null);
  const onOpenRef = useRef(onOpen);
  onOpenRef.current = onOpen;
  const locale = useLocale();
  const copy = pickContent(HEIGHT_COPY, locale);
  const [frameSize, setFrameSize] = usePeopleMapHeight();

  useEffect(() => {
    const el = host.current;
    if (!el) {
      return;
    }
    const map = L.map(el, { scrollWheelZoom: true }).setView([20, 0], 2);
    L.tileLayer(TILE, { attribution: ATTRIBUTION }).addTo(map);
    extrasRef.current = L.layerGroup().addTo(map);
    clustersRef.current = L.markerClusterGroup({
      showCoverageOnHover: false,
      chunkedLoading: true,
      maxClusterRadius: 52,
      spiderfyOnMaxZoom: true,
      disableClusteringAtZoom: 15,
      iconCreateFunction: clusterIcon,
    }).addTo(map);
    mapRef.current = map;
    const resize = new ResizeObserver(() => {
      if (mapRef.current !== map) {
        return;
      }
      map.invalidateSize({ animate: false });
    });
    resize.observe(el);
    return () => {
      resize.disconnect();
      mapRef.current = null;
      clustersRef.current = null;
      extrasRef.current = null;
      map.remove();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const clusters = clustersRef.current;
    const extras = extrasRef.current;
    if (!map || !clusters || !extras) {
      return;
    }
    clusters.clearLayers();
    extras.clearLayers();
    const pins = rows.flatMap((row) => {
      const coords = placeLatLon(parsePlace(row.current_city));
      return coords ? [{ row, coords }] : [];
    });
    const bounds = L.latLngBounds([]);
    pins.forEach(({ row, coords }) => {
      const city = displayPlaceLocality(row.current_city, locale);
      const marker = L.marker([coords.lat, coords.lon], { icon: faceIcon(row) });
      marker.bindTooltip(
        `<div class="people-map-tip"><strong>${escapeHtml(row.full_name)}</strong>${
          city ? `<span>${escapeHtml(city)}</span>` : ''
        }</div>`,
        { direction: 'top', opacity: 1, className: 'people-map-tooltip' }
      );
      marker.on('click', () => onOpenRef.current(row));
      clusters.addLayer(marker);
      bounds.extend([coords.lat, coords.lon]);
    });
    if (near && radiusKm) {
      const circle = L.circle([near.lat, near.lon], {
        radius: radiusKm * 1000,
        color: '#1f3d38',
        fillOpacity: 0.06,
        weight: 1,
      });
      extras.addLayer(circle);
      bounds.extend(circle.getBounds());
    }
    if (mapRef.current !== map) {
      return;
    }
    if (bounds.isValid()) {
      map.fitBounds(bounds.pad(0.2));
    } else if (near) {
      map.setView([near.lat, near.lon], 10);
    } else {
      map.setView([20, 0], 2);
    }
  }, [rows, near, radiusKm, locale]);

  const located = rows.some((row) => placeLatLon(parsePlace(row.current_city)));

  return (
    <div className="min-w-0">
      <PeopleMapHeightControl
        size={frameSize}
        label={copy.mapHeight}
        labels={{ sm: copy.sm, md: copy.md, lg: copy.lg, xl: copy.xl }}
        onChange={setFrameSize}
      />
      <div
        ref={host}
        data-size={frameSize}
        className="people-map-host people-map-frame overflow-hidden rounded-2xl border border-border"
      />
      {located ? null : <p className="mt-3 text-sm text-muted-foreground">{emptyLabel}</p>}
    </div>
  );
}
