/**
 * Web map. MapLibre GL with free OpenFreeMap tiles (no key, no account).
 * If the tile style can't be loaded (offline, blocked host), it falls back to a
 * plain background so pins and drawn areas still work.
 */
import 'maplibre-gl/dist/maplibre-gl.css';

import maplibregl, { type GeoJSONSource, type StyleSpecification } from 'maplibre-gl';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { bounds } from '@/lib/geo';
import type { LatLng } from '@/lib/types';

import { AREA_COLORS, type TripMapProps } from './types';

const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

const FALLBACK_STYLE: StyleSpecification = {
  version: 8,
  sources: {},
  layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#E8EDF1' } }],
};

let stylePromise: Promise<StyleSpecification | string> | null = null;
function loadStyle() {
  stylePromise ??= fetch(STYLE_URL, { signal: AbortSignal.timeout(5000) })
    .then((r) => (r.ok ? (r.json() as Promise<StyleSpecification>) : FALLBACK_STYLE))
    .catch(() => FALLBACK_STYLE);
  return stylePromise;
}

type FC = GeoJSON.FeatureCollection;
const fc = (features: GeoJSON.Feature[]): FC => ({ type: 'FeatureCollection', features });
const ring = (pts: LatLng[]) => [...pts, pts[0]].map((p) => [p.lng, p.lat]);

export function TripMap({
  markers = [],
  showRoute = false,
  areas = [],
  draft = [],
  onPress,
  height = 220,
  initialCenter = { lat: 38.72, lng: -9.14 },
  initialZoom = 4,
}: TripMapProps) {
  const theme = useTheme();
  const el = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const pins = useRef<maplibregl.Marker[]>([]);
  const onPressRef = useRef(onPress);
  const [ready, setReady] = useState(false);
  onPressRef.current = onPress;

  // Create the map once.
  useEffect(() => {
    let cancelled = false;
    loadStyle().then((style) => {
      if (cancelled || !el.current) return;
      const m = new maplibregl.Map({
        container: el.current,
        style,
        center: [initialCenter.lng, initialCenter.lat],
        zoom: initialZoom,
        attributionControl: { compact: true },
      });
      m.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
      m.on('click', (e) => onPressRef.current?.({ lat: e.lngLat.lat, lng: e.lngLat.lng }));
      m.on('load', () => {
        m.addSource('areas', { type: 'geojson', data: fc([]) });
        m.addSource('route', { type: 'geojson', data: fc([]) });
        m.addSource('draft', { type: 'geojson', data: fc([]) });
        m.addLayer({
          id: 'areas-fill',
          type: 'fill',
          source: 'areas',
          paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0.18 },
        });
        m.addLayer({
          id: 'areas-line',
          type: 'line',
          source: 'areas',
          paint: { 'line-color': ['get', 'color'], 'line-width': 2 },
        });
        m.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': theme.tint, 'line-width': 3, 'line-opacity': 0.8 },
        });
        m.addLayer({
          id: 'draft-line',
          type: 'line',
          source: 'draft',
          filter: ['==', '$type', 'LineString'],
          paint: { 'line-color': theme.tint, 'line-width': 2, 'line-dasharray': [2, 1.5] },
        });
        m.addLayer({
          id: 'draft-points',
          type: 'circle',
          source: 'draft',
          filter: ['==', '$type', 'Point'],
          paint: {
            'circle-radius': 5,
            'circle-color': '#fff',
            'circle-stroke-color': theme.tint,
            'circle-stroke-width': 2,
          },
        });
        setReady(true);
      });
      map.current = m;
    });
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
    };
    // Map instance is created once; later prop changes update its sources.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const m = map.current;
    if (!m || !ready) return;
    (m.getSource('areas') as GeoJSONSource).setData(
      fc(
        areas
          .filter((a) => a.points.length >= 3)
          .map((a, i) => ({
            type: 'Feature',
            properties: { color: AREA_COLORS[i % AREA_COLORS.length] },
            geometry: { type: 'Polygon', coordinates: [ring(a.points)] },
          })),
      ),
    );
    (m.getSource('route') as GeoJSONSource).setData(
      fc(
        showRoute && markers.length > 1
          ? [
              {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: markers.map((x) => [x.location.lng, x.location.lat]),
                },
              },
            ]
          : [],
      ),
    );
    (m.getSource('draft') as GeoJSONSource).setData(
      fc([
        ...(draft.length > 1
          ? [
              {
                type: 'Feature' as const,
                properties: {},
                geometry: {
                  type: 'LineString' as const,
                  coordinates: draft.map((p) => [p.lng, p.lat]),
                },
              },
            ]
          : []),
        ...draft.map((p) => ({
          type: 'Feature' as const,
          properties: {},
          geometry: { type: 'Point' as const, coordinates: [p.lng, p.lat] },
        })),
      ]),
    );

    pins.current.forEach((p) => p.remove());
    pins.current = markers.map((x) => {
      const dot = document.createElement('div');
      dot.textContent = x.label;
      dot.title = x.title;
      dot.setAttribute('aria-label', x.title);
      Object.assign(dot.style, {
        minWidth: '24px',
        height: '24px',
        padding: '0 6px',
        boxSizing: 'border-box',
        borderRadius: '12px',
        border: '2px solid #fff',
        background: theme.tint,
        color: '#fff',
        font: '700 12px system-ui, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,.3)',
        opacity: x.muted ? '0.45' : '1',
      });
      return new maplibregl.Marker({ element: dot })
        .setLngLat([x.location.lng, x.location.lat])
        .addTo(m);
    });
  }, [ready, markers, areas, draft, showRoute, theme.tint]);

  // Fit the view when the set of things on the map changes.
  const fitKey = markers.map((x) => x.id).join('|') + '/' + areas.map((a) => a.id).join('|');
  useEffect(() => {
    const m = map.current;
    if (!m || !ready) return;
    const pts = [...markers.map((x) => x.location), ...areas.flatMap((a) => a.points)];
    if (pts.length === 0) return;
    if (pts.length === 1) {
      m.jumpTo({ center: [pts[0].lng, pts[0].lat], zoom: 13 });
    } else {
      m.fitBounds(bounds(pts), { padding: 40, maxZoom: 14, duration: 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, fitKey]);

  return (
    <View style={[styles.box, { height, borderColor: theme.border }]}>
      <div ref={el} style={{ position: 'absolute', inset: 0 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderRadius: 14, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth },
});
