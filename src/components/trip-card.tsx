import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card, Pill } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTrips } from '@/data/trip-store';
import type { Trip } from '@/lib/types';

export function TripCard({ trip, showAuthor = false }: { trip: Trip; showAuthor?: boolean }) {
  const { userName, forkCounts, recentForks } = useTrips();
  const stops = trip.days.reduce((n, d) => n + d.stops.length, 0);
  const toBook = trip.days.flatMap((d) => d.stops).filter((s) => s.booking.status === 'to_book');
  const forks = forkCounts[trip.id] ?? 0;
  const recent = recentForks[trip.id] ?? 0;

  return (
    <Link href={{ pathname: '/trip/[id]', params: { id: trip.id } }} asChild>
      <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}>
        <Card style={styles.card}>
          <View style={styles.row}>
            <ThemedText style={styles.emoji}>{trip.coverEmoji}</ThemedText>
            <View style={styles.flex}>
              <ThemedText type="smallBold">{trip.title}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {trip.destination} · {trip.days.length} days · {stops} stops
              </ThemedText>
              {showAuthor ? (
                <ThemedText type="small" themeColor="textSecondary">
                  by {userName(trip.authorId)}
                </ThemedText>
              ) : null}
            </View>
          </View>
          <View style={styles.pills}>
            {trip.members.length > 1 ? <Pill label={`${trip.members.length} travelers`} /> : null}
            {toBook.length > 0 ? <Pill tone="warning" label={`${toBook.length} to book`} /> : null}
            {trip.event ? <Pill tone="warning" label={`${trip.event.name} · ${trip.event.when}`} /> : null}
            {recent >= 5 ? <Pill tone="success" label={`Trending · ${recent} this week`} /> : null}
            {trip.publishedAt ? <Pill tone="tint" label="Published" /> : null}
            {forks > 0 ? <Pill tone="tint" label={`${forks} forks`} /> : null}
            {trip.forkedFromId ? <Pill label="Forked" /> : null}
          </View>
        </Card>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: Spacing.three },
  row: { flexDirection: 'row', gap: Spacing.three, alignItems: 'center' },
  flex: { flex: 1 },
  emoji: { fontSize: 32, lineHeight: 40 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
});
