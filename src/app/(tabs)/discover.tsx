import { Screen } from '@/components/screen';
import { TripCard } from '@/components/trip-card';
import { SectionTitle } from '@/components/ui';
import { useTrips } from '@/data/trip-store';

export default function DiscoverScreen() {
  const { trips, forkCounts } = useTrips();
  const published = trips
    .filter((t) => t.visibility === 'public' && t.publishedAt)
    .sort((a, b) => (forkCounts[b.id] ?? 0) - (forkCounts[a.id] ?? 0));

  return (
    <Screen title="Discover" subtitle="Real trips people took. Fork one to make it yours.">
      <SectionTitle>Most forked</SectionTitle>
      {published.map((t) => (
        <TripCard key={t.id} trip={t} showAuthor />
      ))}
    </Screen>
  );
}
