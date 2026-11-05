import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { TripCard } from '@/components/trip-card';
import { SectionTitle } from '@/components/ui';
import { useTrips } from '@/data/trip-store';

export default function TripsScreen() {
  const { trips, currentUserId } = useTrips();
  const mine = trips.filter((t) => t.members.some((m) => m.userId === currentUserId));
  const upcoming = mine.filter((t) => !t.publishedAt);
  const past = mine.filter((t) => t.publishedAt);

  return (
    <Screen title="Trips" subtitle="Plan with your group, then share the trip when you're back.">
      <SectionTitle>Upcoming</SectionTitle>
      {upcoming.length === 0 ? (
        <ThemedText themeColor="textSecondary">
          No trips yet. Fork one from Discover to get started.
        </ThemedText>
      ) : (
        upcoming.map((t) => <TripCard key={t.id} trip={t} />)
      )}
      {past.length > 0 ? (
        <>
          <SectionTitle>Published</SectionTitle>
          {past.map((t) => (
            <TripCard key={t.id} trip={t} />
          ))}
        </>
      ) : null}
    </Screen>
  );
}
