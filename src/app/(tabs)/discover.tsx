import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { TripCard } from '@/components/trip-card';
import { Pill, SectionTitle } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTrips } from '@/data/trip-store';
import type { EventKind } from '@/lib/types';

const EVENT_FILTERS: { id: EventKind | 'all'; label: string }[] = [
  { id: 'all', label: 'All events' },
  { id: 'festival', label: 'Festivals' },
  { id: 'music', label: 'Music' },
  { id: 'sports', label: 'Sports' },
  { id: 'cultural', label: 'Cultural' },
];

export default function DiscoverScreen() {
  const { trips, forkCounts, recentForks } = useTrips();
  const [kind, setKind] = useState<EventKind | 'all'>('all');
  const published = trips.filter((t) => t.visibility === 'public' && t.publishedAt);

  const trending = published
    .filter((t) => (recentForks[t.id] ?? 0) > 0)
    .sort((a, b) => (recentForks[b.id] ?? 0) - (recentForks[a.id] ?? 0))
    .slice(0, 3);
  const events = published.filter((t) => t.event && (kind === 'all' || t.event.kind === kind));
  const mostForked = [...published].sort((a, b) => (forkCounts[b.id] ?? 0) - (forkCounts[a.id] ?? 0));

  return (
    <Screen title="Discover" subtitle="Real trips people took. Fork one to make it yours.">
      <SectionTitle>Trending this week</SectionTitle>
      {trending.map((t) => (
        <TripCard key={t.id} trip={t} showAuthor />
      ))}

      <SectionTitle>Built around events</SectionTitle>
      <View style={styles.filters}>
        {EVENT_FILTERS.map((f) => (
          <Pressable
            key={f.id}
            accessibilityRole="radio"
            accessibilityState={{ checked: kind === f.id }}
            onPress={() => setKind(f.id)}>
            <Pill label={f.label} tone={kind === f.id ? 'tint' : 'neutral'} />
          </Pressable>
        ))}
      </View>
      {events.length === 0 ? (
        <ThemedText themeColor="textSecondary" style={styles.empty}>
          No trips for this kind of event yet.
        </ThemedText>
      ) : (
        events.map((t) => <TripCard key={t.id} trip={t} showAuthor />)
      )}

      <SectionTitle>Most forked of all time</SectionTitle>
      {mostForked.map((t) => (
        <TripCard key={t.id} trip={t} showAuthor />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginBottom: Spacing.three },
  empty: { marginBottom: Spacing.three },
});
