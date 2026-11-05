/**
 * iOS/Android map. Uses Apple Maps on iOS (free, no API key) through
 * react-native-maps; Android would need a Google Maps key.
 */
import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polygon, Polyline } from 'react-native-maps';

import { useTheme } from '@/hooks/use-theme';

import { AREA_COLORS, type TripMapProps } from './types';

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
  const ref = useRef<MapView>(null);
  const fitKey = markers.map((m) => m.id).join('|') + areas.map((a) => a.id).join('|');

  useEffect(() => {
    const coords = [...markers.map((m) => m.location), ...areas.flatMap((a) => a.points)].map(
      (p) => ({ latitude: p.lat, longitude: p.lng }),
    );
    if (coords.length > 0) {
      ref.current?.fitToCoordinates(coords, {
        edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
        animated: false,
      });
    }
    // Refit only when the set of things on the map changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey]);

  const delta = 360 / 2 ** initialZoom;

  return (
    <View style={[styles.box, { height, borderColor: theme.border }]}>
      <MapView
        ref={ref}
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: initialCenter.lat,
          longitude: initialCenter.lng,
          latitudeDelta: delta,
          longitudeDelta: delta,
        }}
        onPress={(e) =>
          onPress?.({
            lat: e.nativeEvent.coordinate.latitude,
            lng: e.nativeEvent.coordinate.longitude,
          })
        }>
        {areas.map((a, i) => (
          <Polygon
            key={a.id}
            coordinates={a.points.map((p) => ({ latitude: p.lat, longitude: p.lng }))}
            strokeColor={AREA_COLORS[i % AREA_COLORS.length]}
            fillColor={`${AREA_COLORS[i % AREA_COLORS.length]}33`}
            strokeWidth={2}
          />
        ))}
        {draft.length > 1 ? (
          <Polyline
            coordinates={draft.map((p) => ({ latitude: p.lat, longitude: p.lng }))}
            strokeColor={theme.tint}
            strokeWidth={2}
            lineDashPattern={[6, 4]}
          />
        ) : null}
        {draft.map((p, i) => (
          <Marker
            key={`draft-${i}`}
            coordinate={{ latitude: p.lat, longitude: p.lng }}
            anchor={{ x: 0.5, y: 0.5 }}>
            <View style={[styles.vertex, { borderColor: theme.tint }]} />
          </Marker>
        ))}
        {showRoute && markers.length > 1 ? (
          <Polyline
            coordinates={markers.map((m) => ({ latitude: m.location.lat, longitude: m.location.lng }))}
            strokeColor={theme.tint}
            strokeWidth={3}
          />
        ) : null}
        {markers.map((m) => (
          <Marker
            key={m.id}
            coordinate={{ latitude: m.location.lat, longitude: m.location.lng }}
            title={m.title}
            anchor={{ x: 0.5, y: 0.5 }}>
            <View style={[styles.pin, { backgroundColor: theme.tint, opacity: m.muted ? 0.4 : 1 }]}>
              <Text style={styles.pinText}>{m.label}</Text>
            </View>
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderRadius: 14, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth },
  pin: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  pinText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  vertex: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, backgroundColor: '#fff' },
});
