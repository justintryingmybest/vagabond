/**
 * Placeholder map: plots stops by lat/lng inside a box and numbers them in
 * order. Swap for Mapbox (@rnmapbox/maps on iOS, mapbox-gl on web) once a
 * development build and a token are set up.
 */
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import type { Stop } from '@/lib/types';

const DOT = 22;

export function RouteMap({ stops, height = 180 }: { stops: Stop[]; height?: number }) {
  const theme = useTheme();
  if (stops.length === 0) return null;

  const lats = stops.map((s) => s.location.lat);
  const lngs = stops.map((s) => s.location.lng);
  const [minLat, maxLat] = [Math.min(...lats), Math.max(...lats)];
  const [minLng, maxLng] = [Math.min(...lngs), Math.max(...lngs)];
  const pos = (s: Stop) => ({
    left: `${8 + ((s.location.lng - minLng) / (maxLng - minLng || 1)) * 84}%` as const,
    top: `${8 + ((maxLat - s.location.lat) / (maxLat - minLat || 1)) * 84}%` as const,
  });

  return (
    <View
      style={[styles.box, { height, backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
      accessibilityLabel={`Map of ${stops.length} stops`}>
      {stops.map((s, i) => (
        <View
          key={s.id}
          style={[styles.dot, pos(s), { backgroundColor: theme.tint }]}
          accessibilityLabel={`${i + 1}. ${s.title}`}>
          <ThemedText style={styles.dotText}>{i + 1}</ThemedText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  dot: {
    position: 'absolute',
    width: DOT,
    height: DOT,
    marginLeft: -DOT / 2,
    marginTop: -DOT / 2,
    borderRadius: DOT / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotText: { color: '#fff', fontSize: 12, lineHeight: 14, fontWeight: 700 },
});
